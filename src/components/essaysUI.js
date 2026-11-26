import { DOMAINS, DOMAIN_MAP } from '../data/domains.js';
import { groupEssaysByDomain } from '../data/essays.js';

export function initEssaysIndex(rootEl, essays, nodeMap, onSelectNode) {
  let activeDomain = 'all';
  let searchQuery = '';

  function getFilteredEssays() {
    const q = searchQuery.trim().toLowerCase();
    return essays.filter((essay) => {
      if (activeDomain !== 'all' && essay.domain !== activeDomain) return false;
      if (!q) return true;
      const nodeTitles = essay.nodeIds
        .map((id) => nodeMap.get(id)?.title || '')
        .join(' ');
      const hay = `${essay.title} ${essay.rawTitle} ${essay.excerpt} ${nodeTitles}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function render() {
    const counts = {};
    for (const e of essays) {
      counts[e.domain] = (counts[e.domain] || 0) + 1;
    }

    const filtered = getFilteredEssays();
    const groups = groupEssaysByDomain(filtered);

    rootEl.innerHTML = `
      <div class="essays-toolbar">
        <div class="essays-filter-pills" role="group" aria-label="Filter essays by domain">
          <button
            type="button"
            class="filter-pill ${activeDomain === 'all' ? 'is-active' : ''}"
            data-essay-dom="all"
          >
            All Domains (${essays.length})
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
            placeholder="Filter essays by title, idea, or node..."
            value="${escapeHtml(searchQuery)}"
            autocomplete="off"
            aria-label="Filter published essays"
          />
          <span class="search-count">${filtered.length} ${filtered.length === 1 ? 'essay' : 'essays'}</span>
        </div>
      </div>

      ${
        groups.length === 0
          ? `<div class="essays-empty">No published essays match "${escapeHtml(searchQuery)}". Clear the search or select another domain.</div>`
          : `<div class="essays-groups">
              ${groups
                .map(({ domain, essays: domainEssays }) => {
                  return `
                    <div class="essay-domain-group">
                      <div class="essay-domain-head">
                        <div class="essay-domain-title-row">
                          <span class="dot" style="background: ${domain.color}"></span>
                          <h3>${escapeHtml(domain.name)}</h3>
                          <span class="essay-domain-count">${domainEssays.length} ${domainEssays.length === 1 ? 'essay' : 'essays'}</span>
                        </div>
                        <p class="essay-domain-desc">${escapeHtml(domain.description)}</p>
                      </div>

                      <div class="essays-grid">
                        ${domainEssays
                          .map((essay) => {
                            const dom = DOMAIN_MAP[essay.domain];
                            const linkedNodes = essay.nodeIds
                              .map((id) => nodeMap.get(id))
                              .filter(Boolean);

                            return `
                              <article class="essay-card" style="--essay-accent: ${dom.color}">
                                <div class="essay-card-top">
                                  <span class="essay-card-domain" style="color: ${dom.color}">${escapeHtml(dom.short)}</span>
                                  <span class="essay-card-host">mohammed-km.in</span>
                                </div>
                                <h4 class="essay-card-title">
                                  <a href="${escapeHtml(essay.url)}" target="_blank" rel="noopener noreferrer">
                                    ${escapeHtml(essay.title)}
                                  </a>
                                </h4>
                                <p class="essay-card-excerpt">${escapeHtml(essay.excerpt)}</p>
                                ${
                                  linkedNodes.length > 0
                                    ? `
                                  <div class="essay-node-chips" aria-label="Linked knowledge graph concepts">
                                    ${linkedNodes
                                      .map(
                                        (n) => `
                                      <button
                                        type="button"
                                        class="essay-node-chip"
                                        data-essay-jump-node="${n.id}"
                                        title="Inspect ${escapeHtml(n.title)} in Knowledge Graph"
                                      >
                                        <span class="dot" style="background: ${DOMAIN_MAP[n.domain].color}"></span>
                                        ${escapeHtml(n.title)}
                                      </button>
                                    `
                                      )
                                      .join('')}
                                  </div>
                                `
                                    : ''
                                }
                                <div class="essay-card-footer">
                                  <a
                                    href="${escapeHtml(essay.url)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="essay-read-link"
                                  >
                                    Read Mohammed's Essay &rarr;
                                  </a>
                                </div>
                              </article>
                            `;
                          })
                          .join('')}
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>`
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
          if (typeof cursorPos === 'number') {
            nextInput.setSelectionRange(cursorPos, cursorPos);
          }
        }
      });
    }

    rootEl.querySelectorAll('[data-essay-jump-node]').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (onSelectNode) {
          onSelectNode(chip.dataset.essayJumpNode);
        }
      });
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
