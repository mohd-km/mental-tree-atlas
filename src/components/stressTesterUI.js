import {
  LENS_META,
  SAMPLE_THESES,
  analyzeCustomThesis,
  computeVerdict
} from '../data/stressTester.js';

export function initStressTester(rootEl, onDropThesisOnGraph) {
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
      const hasWeights = checks.every((c) => typeof c.weight === 'number');
      let score;
      if (hasWeights) {
        const maxWeight = checks.reduce((sum, c) => sum + c.weight, 0) || 25;
        const earned = checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0);
        score = Math.round((earned / maxWeight) * 25);
      } else {
        score = Math.round((passed / checks.length) * 25);
      }
      lensScores[meta.id] = { score, passed, total: checks.length };
      total += score;
    }
    return { lensScores, total };
  }

  function renderRadarSvg(lensScores) {
    const cx = 140;
    const cy = 118;
    const maxR = 76;
    const axes = [
      { id: 'deutsch', label: 'Deutsch', angle: -Math.PI / 2, color: '#0369a1' },
      { id: 'taleb', label: 'Taleb', angle: 0, color: '#c2410c' },
      { id: 'musk', label: 'Musk', angle: Math.PI / 2, color: '#b45309' },
      { id: 'meadows', label: 'Meadows', angle: Math.PI, color: '#0f766e' }
    ];

    const rings = [0.25, 0.5, 0.75, 1]
      .map((f) => {
        const pts = axes
          .map(
            (a) =>
              `${(cx + Math.cos(a.angle) * maxR * f).toFixed(1)},${(
                cy +
                Math.sin(a.angle) * maxR * f
              ).toFixed(1)}`
          )
          .join(' ');
        return `<polygon points="${pts}" fill="none" stroke="#e5e5e3" stroke-width="1" />`;
      })
      .join('');

    const spokes = axes
      .map((a) => {
        const x2 = (cx + Math.cos(a.angle) * maxR).toFixed(1);
        const y2 = (cy + Math.sin(a.angle) * maxR).toFixed(1);
        return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#d6d3d1" stroke-width="1" />`;
      })
      .join('');

    const dataPts = axes
      .map((a) => {
        const ratio = Math.max(0.12, lensScores[a.id].score / 25);
        return `${(cx + Math.cos(a.angle) * maxR * ratio).toFixed(1)},${(
          cy +
          Math.sin(a.angle) * maxR * ratio
        ).toFixed(1)}`;
      })
      .join(' ');

    const dots = axes
      .map((a) => {
        const ratio = Math.max(0.12, lensScores[a.id].score / 25);
        const x = (cx + Math.cos(a.angle) * maxR * ratio).toFixed(1);
        const y = (cy + Math.sin(a.angle) * maxR * ratio).toFixed(1);
        return `<circle cx="${x}" cy="${y}" r="4.5" fill="${a.color}" stroke="#ffffff" stroke-width="1.8" />`;
      })
      .join('');

    const labels = axes
      .map((a) => {
        const lx = cx + Math.cos(a.angle) * (maxR + 15);
        const ly = cy + Math.sin(a.angle) * (maxR + 15);
        const anchor = a.angle === 0 ? 'start' : a.angle === Math.PI ? 'end' : 'middle';
        return `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(
          1
        )}" text-anchor="${anchor}" fill="${a.color}" font-size="12" font-family="Inter, sans-serif" font-weight="600">${
          a.label
        }</text>`;
      })
      .join('');

    return `
      <svg viewBox="0 0 280 236" class="radar-svg" role="img" aria-label="Four-lens diagnostic score radar">
        ${rings}
        ${spokes}
        <polygon points="${dataPts}" fill="rgba(29, 78, 216, 0.14)" stroke="#1d4ed8" stroke-width="2" />
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
        <div class="st-chip-row" role="group" aria-label="Sample startup theses">
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

        <form class="st-input-form" id="st-form">
          <div class="st-input-row">
            <input
              type="text"
              id="st-textarea"
              class="st-text-input"
              value="${escapeHtml(currentThesis)}"
              placeholder="Enter any startup thesis or claim to audit across 4 lenses..."
              aria-label="Startup thesis or strategic claim"
            />
            <button type="submit" class="btn-primary st-run-btn">Run Audit</button>
          </div>
        </form>
      </div>

      <div class="st-summary-strip">
        <div class="st-radar-block">
          ${renderRadarSvg(lensScores)}
        </div>

        <div class="st-score-block">
          <div class="st-score-meta">
            <div class="st-score-number">
              <span class="st-score-val">${total}</span><span class="st-score-den">/100</span>
            </div>
            <span class="st-verdict-badge tone-${verdict.tone}">${verdict.band}</span>
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
            <button type="button" class="btn-primary" id="st-drop-graph-btn">Drop Thesis onto Graph &uarr;</button>
            <button type="button" class="btn-ghost" id="st-copy-btn">Copy Markdown Brief</button>
          </div>
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
                  <span class="st-lens-domain">${meta.domain} &middot; ${meta.framework}</span>
                  <h3 class="st-lens-title">${meta.thinker}</h3>
                </div>
                <div class="st-lens-score">
                  <span>${sc.score}</span><small>/25</small>
                </div>
              </header>

              <p class="st-lens-summary">${escapeHtml(data.summary)}</p>

              <details class="st-lens-details">
                <summary class="st-lens-details-toggle">
                  Rubric &amp; failure modes (${sc.passed}/${sc.total} passed)
                </summary>
                <div class="st-lens-details-body">
                  <p class="st-lens-question">${meta.question}</p>

                  ${
                    data.leverageLevel
                      ? `<div class="st-leverage-pill"><span>Leverage Point</span><strong>${escapeHtml(
                          data.leverageLevel
                        )}</strong></div>`
                      : ''
                  }

                  <div class="st-diagnostic-blocks">
                    <div class="st-diag-box is-risk">
                      <span class="st-diag-label">Failure Mode</span>
                      <p>${escapeHtml(data.failureMode)}</p>
                    </div>
                    <div class="st-diag-box is-action">
                      <span class="st-diag-label">Directive</span>
                      <p>${escapeHtml(data.directive)}</p>
                    </div>
                  </div>

                  <div class="st-checklist">
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
                </div>
              </details>
            </article>
          `;
        }).join('')}
      </div>
    `;

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

    const form = rootEl.querySelector('#st-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = rootEl.querySelector('#st-textarea').value.trim();
      if (!val) return;
      const matchedPreset = SAMPLE_THESES.find(
        (s) => s.thesis.trim().toLowerCase() === val.toLowerCase()
      );
      if (matchedPreset) {
        activePresetId = matchedPreset.id;
        currentTitle = matchedPreset.label;
        currentThesis = matchedPreset.thesis;
        currentAnalysis = cloneAnalysis(matchedPreset.presetAnalysis);
      } else {
        activePresetId = null;
        currentTitle = val.length > 42 ? `${val.slice(0, 40)}...` : val;
        currentThesis = val;
        currentAnalysis = analyzeCustomThesis(val);
      }
      render();
    });

    rootEl.querySelectorAll('.st-check-item input[type="checkbox"]').forEach((input) => {
      input.addEventListener('change', () => {
        const lensId = input.dataset.lens;
        const idx = Number(input.dataset.idx);
        currentAnalysis[lensId].checks[idx].pass = input.checked;
        // Preserve open state on details for the edited lens
        const openLenses = new Set();
        rootEl.querySelectorAll('.st-lens-card').forEach((card, i) => {
          if (card.querySelector('details')?.open) openLenses.add(i);
        });
        render();
        rootEl.querySelectorAll('.st-lens-card').forEach((card, i) => {
          if (openLenses.has(i)) {
            const det = card.querySelector('details');
            if (det) det.open = true;
          }
        });
      });
    });

    const dropBtn = rootEl.querySelector('#st-drop-graph-btn');
    if (dropBtn && onDropThesisOnGraph) {
      dropBtn.addEventListener('click', () => {
        onDropThesisOnGraph({ title: currentTitle, thesis: currentThesis });
      });
    }

    const copyBtn = rootEl.querySelector('#st-copy-btn');
    copyBtn.addEventListener('click', async () => {
      const md = buildMarkdownBrief();
      try {
        await navigator.clipboard.writeText(md);
        copyBtn.textContent = 'Copied Brief';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Markdown Brief';
        }, 1800);
      } catch {
        copyBtn.textContent = 'Clipboard Restricted';
        setTimeout(() => {
          copyBtn.textContent = 'Copy Markdown Brief';
        }, 1800);
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
