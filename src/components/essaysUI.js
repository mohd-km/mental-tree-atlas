import { DOMAINS, DOMAIN_MAP } from '../data/domains.js';

export function initEssaysIndex(rootEl, essays, nodeMap, onSelectNode) {
  let activeDomain = 'all';
  let searchQuery = '';
  let showAll = false;
  const DEFAULT_LIMIT = 8;

  function getFilteredEssays() {
    const q = searchQuery.trim().toLowerCase();
    return essays.filter((essay) => {
      if (activeDomain !== 'all' && essay.domain !== activeDomain) return false;
      if (!q) return true;
      const nodeTitles = essay.nodeIds.map((id) => nodeMap.get(id)?.title || '').join(' ');
      const hay = `${essay.title} ${essay.rawTitle} ${essay.excerpt} ${nodeTitles}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function render() {
    const counts = {};
    for (const e of essays) counts[e.domain] = (counts[e.domain] || 0) + 1;

    const filtered = getFilteredEssays();
    const isFiltering = activeDomain !== 'all' || searchQuery.trim().length > 0;
    const visible = isFiltering || showAll ? filtered : filtered.slice(0, DEFAULT_LIMIT);
    const hiddenCount = filtered.length - visible.length;

    rootEl.innerHTML = `
      <div class="essays-toolbar">
        <div class="essays-filter-pills" role="group" aria-label="Filter essays by topic">
          <button
            type="button"
            class="filter-pill ${activeDomain === 'all' ? 'is-active' : ''}"
            data-essay-dom="all"
          >
            All (${essays.length})
          </button>
          ${DOMAINS.map((d) => {
            const count = counts[d.id] || 0;
            if (count === 0) return '';
            return `
              <button
                type="button"
                class="filter-pill ${activeDomain === d.id ? 'is-active' : ''}"
                data-essay-dom="${d.id}"
              >
                <span class="dot" style="background: ${d.color}"></span>
                ${d.short} (${count})
              </button>
            `;
          }).join('')}
        </div>

        <div class="essays-search-wrap">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <input
            type="search"
            id="essays-search"
            class="graph-search"
            placeholder="Search ${essays.length} essays..."
            value="${escapeHtml(searchQuery)}"
            autocomplete="off"
            aria-label="Search essays"
          />
          <span class="search-count">${filtered.length}</span>
        </div>
      </div>

      ${
        visible.length === 0
          ? `<div class="essays-empty">No essays match "${escapeHtml(searchQuery)}".</div>`
          : `<div class="essays-compact-list">
              ${visible
                .map((essay) => {
                  const dom = DOMAIN_MAP[essay.domain];
                  const linkedNodes = essay.nodeIds.map((id) => nodeMap.get(id)).filter(Boolean);
                  return `
                    <article class="essay-row">
                      <div class="essay-row-main">
                        <span class="dot" style="background: ${dom.color}" title="${escapeHtml(dom.name)}"></span>
                        <a
                          href="${escapeHtml(essay.url)}"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="essay-row-title"
                        >
                          ${escapeHtml(essay.title)} &rarr;
                        </a>
                        <span class="essay-row-dom">${escapeHtml(dom.short)}</span>
                      </div>
                      <div class="essay-row-chips">
                        ${linkedNodes
                          .map(
                            (n) => `
                          <button
                            type="button"
                            class="essay-node-chip"
                            data-essay-jump-node="${n.id}"
                            title="Show ${escapeHtml(n.title)} on the map"
                          >
                            ${escapeHtml(n.title)}
                          </button>
                        `
                          )
                          .join('')}
                      </div>
                      ${
                        linkedNodes.length > 0
                          ? `<details class="essay-excerpt-details">
                               <summary>The idea in one line</summary>
                               <p>${escapeHtml(linkedNodes[0].aphorism)}</p>
                             </details>`
                          : ''
                      }
                    </article>
                  `;
                })
                .join('')}
            </div>`
      }

      ${
        !isFiltering && filtered.length > DEFAULT_LIMIT
          ? `
        <div class="essays-more-row">
          <button type="button" class="btn-ghost" id="essays-toggle-all">
            ${showAll ? 'Show fewer' : `Show all ${filtered.length} essays (+${hiddenCount} more)`}
          </button>
        </div>
      `
          : ''
      }
    `;

    rootEl.querySelectorAll('[data-essay-dom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeDomain = btn.dataset.essayDom;
        render();
      });
    });

    const searchEl = rootEl.querySelector('#essays-search');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        const cursorPos = e.target.selectionStart;
        searchQuery = e.target.value;
        render();
        const nextInput = rootEl.querySelector('#essays-search');
        if (nextInput) {
          nextInput.focus();
          if (typeof cursorPos === 'number') nextInput.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }

    rootEl.querySelectorAll('[data-essay-jump-node]').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (onSelectNode) onSelectNode(chip.dataset.essayJumpNode);
      });
    });

    const toggleAllBtn = rootEl.querySelector('#essays-toggle-all');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        showAll = !showAll;
        render();
      });
    }
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
