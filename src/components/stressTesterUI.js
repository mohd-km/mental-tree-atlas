import {
  LENS_META,
  SAMPLE_THESES,
  analyzeCustomThesis,
  computeVerdict
} from '../data/stressTester.js';

export function initStressTester(rootEl) {
  let activePresetId = SAMPLE_THESES[0].id;
  let currentThesis = SAMPLE_THESES[0].thesis;
  let currentTitle = SAMPLE_THESES[0].label;
  let currentAnalysis = cloneAnalysis(SAMPLE_THESES[0].presetAnalysis);

  function cloneAnalysis(a) {
    return JSON.parse(JSON.stringify(a));
  }

  function computeScores() {
    const lensScores = {};
    let total = 0;
    for (const meta of LENS_META) {
      const checks = currentAnalysis[meta.id].checks;
      const passed = checks.filter((c) => c.pass).length;
      const score = Math.round((passed / checks.length) * 25);
      lensScores[meta.id] = { score, passed, total: checks.length };
      total += score;
    }
    return { lensScores, total };
  }

  function renderRadarSvg(lensScores) {
    const cx = 140;
    const cy = 120;
    const maxR = 76;
    const axes = [
      { id: 'deutsch', label: 'Deutsch', angle: -Math.PI / 2, color: '#38bdf8' },
      { id: 'taleb', label: 'Taleb', angle: 0, color: '#fb923c' },
      { id: 'musk', label: 'Musk', angle: Math.PI / 2, color: '#eab308' },
      { id: 'meadows', label: 'Meadows', angle: Math.PI, color: '#2dd4bf' }
    ];

    const rings = [0.25, 0.5, 0.75, 1]
      .map((f) => {
        const pts = axes
          .map((a) => `${(cx + Math.cos(a.angle) * maxR * f).toFixed(1)},${(cy + Math.sin(a.angle) * maxR * f).toFixed(1)}`)
          .join(' ');
        return `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />`;
      })
      .join('');

    const spokes = axes
      .map((a) => {
        const x2 = (cx + Math.cos(a.angle) * maxR).toFixed(1);
        const y2 = (cy + Math.sin(a.angle) * maxR).toFixed(1);
        return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
      })
      .join('');

    const dataPts = axes
      .map((a) => {
        const ratio = Math.max(0.12, lensScores[a.id].score / 25);
        return `${(cx + Math.cos(a.angle) * maxR * ratio).toFixed(1)},${(cy + Math.sin(a.angle) * maxR * ratio).toFixed(1)}`;
      })
      .join(' ');

    const dots = axes
      .map((a) => {
        const ratio = Math.max(0.12, lensScores[a.id].score / 25);
        const x = (cx + Math.cos(a.angle) * maxR * ratio).toFixed(1);
        const y = (cy + Math.sin(a.angle) * maxR * ratio).toFixed(1);
        return `<circle cx="${x}" cy="${y}" r="4" fill="${a.color}" stroke="#090b10" stroke-width="1.5" />`;
      })
      .join('');

    const labels = axes
      .map((a) => {
        const lx = cx + Math.cos(a.angle) * (maxR + 14);
        const ly = cy + Math.sin(a.angle) * (maxR + 15);
        const anchor = a.angle === 0 ? 'start' : a.angle === Math.PI ? 'end' : 'middle';
        return `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}" fill="${a.color}" font-size="11" font-family="Inter, sans-serif" font-weight="600">${a.label}</text>`;
      })
      .join('');

    return `
      <svg viewBox="0 0 280 240" class="radar-svg" role="img" aria-label="Four-lens diagnostic score radar">
        ${rings}
        ${spokes}
        <polygon points="${dataPts}" fill="rgba(129, 140, 248, 0.22)" stroke="#818cf8" stroke-width="1.8" />
        ${dots}
        ${labels}
      </svg>
    `;
  }

  function buildMarkdownBrief() {
    const { lensScores, total } = computeScores();
    const verdict = computeVerdict(total);
    const lines = [
      `# 4-Lens First-Principles Stress Test`,
      `**Thesis:** ${currentThesis}`,
      `**Composite Score:** ${total}/100 — ${verdict.band}`,
      '',
      ...LENS_META.flatMap((meta) => {
        const item = currentAnalysis[meta.id];
        const sc = lensScores[meta.id];
        return [
          `## ${meta.thinker} — ${meta.framework} (${sc.score}/25)`,
          `- Assessment: ${item.summary}`,
          item.leverageLevel ? `- Leverage Point: ${item.leverageLevel}` : null,
          `- Primary Failure Mode: ${item.failureMode}`,
          `- Action Directive: ${item.directive}`,
          ...item.checks.map((c) => `  - [${c.pass ? 'x' : ' '}] ${c.label}`),
          ''
        ].filter(Boolean);
      })
    ];
    return lines.join('\n');
  }

  function render() {
    const { lensScores, total } = computeScores();
    const verdict = computeVerdict(total);

    rootEl.innerHTML = `
      <div class="st-controls">
        <div class="st-presets" role="group" aria-label="Sample startup theses">
          <span class="st-presets-label">Sample Theses</span>
          <div class="st-chip-row">
            ${SAMPLE_THESES.map(
              (s) => `
              <button
                type="button"
                class="st-chip ${activePresetId === s.id ? 'is-active' : ''}"
                data-preset="${s.id}"
              >
                <span class="st-chip-title">${s.label}</span>
                <span class="st-chip-tag">${s.tag}</span>
              </button>
            `
            ).join('')}
          </div>
        </div>

        <form class="st-input-form" id="st-form">
          <label for="st-textarea" class="st-input-label">
            Startup Thesis, Product Claim, or Strategic Bet
            <span class="st-deterministic-badge">100% Client-Side Deterministic Rubric</span>
          </label>
          <div class="st-input-row">
            <textarea
              id="st-textarea"
              class="st-textarea"
              rows="2"
              placeholder="Enter any startup thesis or claim (e.g., Autonomous solar-powered cold-chain micro-hubs for rural agricultural cooperatives...)"
            >${escapeHtml(currentThesis)}</textarea>
            <button type="submit" class="btn-primary st-run-btn">Run 4-Lens Audit</button>
          </div>
        </form>
      </div>

      <div class="st-summary-strip">
        <div class="st-score-block">
          <div class="st-score-meta">
            <span class="st-eyebrow">Composite Resilience Index</span>
            <div class="st-score-number">
              <span class="st-score-val">${total}</span><span class="st-score-den">/100</span>
            </div>
            <div class="st-verdict-badge tone-${verdict.tone}">${verdict.band}</div>
          </div>
          <p class="st-verdict-copy">${verdict.summary}</p>
          <div class="st-bars">
            ${LENS_META.map((m) => {
              const sc = lensScores[m.id];
              const pct = Math.round((sc.score / 25) * 100);
              return `
                <div class="st-bar-row">
                  <span class="st-bar-name" style="color: ${m.color}">${m.thinker}</span>
                  <div class="st-bar-track">
                    <div class="st-bar-fill" style="width: ${pct}%; background: ${m.color}"></div>
                  </div>
                  <span class="st-bar-score">${sc.score}/25</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="st-summary-actions">
            <button type="button" class="btn-ghost" id="st-copy-btn">Copy Markdown Brief</button>
            <span class="st-interactive-hint">Toggle any diagnostic criterion below to stress-test your assumptions live.</span>
          </div>
        </div>
        <div class="st-radar-block">
          ${renderRadarSvg(lensScores)}
        </div>
      </div>

      <div class="st-lenses-grid">
        ${LENS_META.map((meta) => {
          const data = currentAnalysis[meta.id];
          const sc = lensScores[meta.id];
          return `
            <article class="st-lens-card" style="--lens-color: ${meta.color}">
              <header class="st-lens-head">
                <div>
                  <span class="st-lens-domain">${meta.domain}</span>
                  <h3 class="st-lens-title">${meta.thinker}</h3>
                  <p class="st-lens-framework">${meta.framework}</p>
                </div>
                <div class="st-lens-score">
                  <span>${sc.score}</span><small>/25</small>
                </div>
              </header>

              <p class="st-lens-question">${meta.question}</p>
              <p class="st-lens-summary">${escapeHtml(data.summary)}</p>

              ${
                data.leverageLevel
                  ? `<div class="st-leverage-pill"><span>Detected Leverage Point</span><strong>${escapeHtml(data.leverageLevel)}</strong></div>`
                  : ''
              }

              <div class="st-diagnostic-blocks">
                <div class="st-diag-box is-risk">
                  <span class="st-diag-label">Primary Failure Mode</span>
                  <p>${escapeHtml(data.failureMode)}</p>
                </div>
                <div class="st-diag-box is-action">
                  <span class="st-diag-label">First-Principles Directive</span>
                  <p>${escapeHtml(data.directive)}</p>
                </div>
              </div>

              <div class="st-checklist">
                <span class="st-checklist-title">Interactive Diagnostic Rubric (${sc.passed}/${sc.total} passed)</span>
                ${data.checks
                  .map(
                    (c, idx) => `
                  <label class="st-check-item ${c.pass ? 'is-pass' : 'is-fail'}">
                    <input
                      type="checkbox"
                      data-lens="${meta.id}"
                      data-idx="${idx}"
                      ${c.pass ? 'checked' : ''}
                    />
                    <span class="st-check-box" aria-hidden="true"></span>
                    <span class="st-check-text">${escapeHtml(c.label)}</span>
                  </label>
                `
                  )
                  .join('')}
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    // Bind preset chips
    rootEl.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = SAMPLE_THESES.find((s) => s.id === btn.dataset.preset);
        if (!preset) return;
        activePresetId = preset.id;
        currentTitle = preset.label;
        currentThesis = preset.thesis;
        currentAnalysis = cloneAnalysis(preset.presetAnalysis);
        render();
      });
    });

    // Bind custom form submit
    const form = rootEl.querySelector('#st-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = rootEl.querySelector('#st-textarea').value.trim();
      if (!val) return;
      const matchedPreset = SAMPLE_THESES.find((s) => s.thesis.trim().toLowerCase() === val.toLowerCase());
      if (matchedPreset) {
        activePresetId = matchedPreset.id;
        currentTitle = matchedPreset.label;
        currentThesis = matchedPreset.thesis;
        currentAnalysis = cloneAnalysis(matchedPreset.presetAnalysis);
      } else {
        activePresetId = null;
        currentTitle = 'Custom Thesis';
        currentThesis = val;
        currentAnalysis = analyzeCustomThesis(val);
      }
      render();
    });

    // Bind interactive checklist toggles
    rootEl.querySelectorAll('.st-check-item input[type="checkbox"]').forEach((input) => {
      input.addEventListener('change', () => {
        const lensId = input.dataset.lens;
        const idx = Number(input.dataset.idx);
        currentAnalysis[lensId].checks[idx].pass = input.checked;
        render();
      });
    });

    // Bind copy markdown brief
    const copyBtn = rootEl.querySelector('#st-copy-btn');
    copyBtn.addEventListener('click', async () => {
      const md = buildMarkdownBrief();
      try {
        await navigator.clipboard.writeText(md);
        copyBtn.textContent = 'Copied Brief to Clipboard';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Markdown Brief';
        }, 2000);
      } catch {
        copyBtn.textContent = 'Brief Ready (Clipboard Restricted)';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Markdown Brief';
        }, 2000);
      }
    });
  }

  render();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
