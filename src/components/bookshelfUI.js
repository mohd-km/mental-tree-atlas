import { BOOKSHELF } from '../data/bookshelf.js';
import { DOMAIN_MAP } from '../data/domains.js';

export function initBookshelf(rootEl, onSelectBook) {
  let activeDomain = 'all';
  let isExpanded = false;

  function render() {
    const books =
      activeDomain === 'all'
        ? BOOKSHELF
        : BOOKSHELF.filter((b) => b.domain === activeDomain);

    const uniqueDomains = ['all', ...new Set(BOOKSHELF.map((b) => b.domain))];

    if (!isExpanded) {
      rootEl.innerHTML = `
        <div class="bs-collapsed-bar">
          <div class="bs-collapsed-copy">
            <p class="bs-collapsed-title">17 foundational volumes across ${uniqueDomains.length - 1} disciplines</p>
            <p class="bs-collapsed-sub">
              Epistemology, physics, computing, biology, markets, systems dynamics, and character craft. Expand to filter by domain and illuminate any volume's linked mental models in the graph.
            </p>
          </div>
          <button
            type="button"
            class="btn-ghost bs-expand-btn"
            id="bs-toggle-expand"
            aria-expanded="false"
          >
            Show all ${BOOKSHELF.length} volumes
          </button>
        </div>
      `;

      const toggleBtn = rootEl.querySelector('#bs-toggle-expand');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          isExpanded = true;
          render();
        });
      }
      return;
    }

    rootEl.innerHTML = `
      <div class="bs-filter-bar">
        <div class="bs-filter-pills">
          ${uniqueDomains
            .map((domId) => {
              if (domId === 'all') {
                return `<button type="button" class="bs-pill ${activeDomain === 'all' ? 'is-active' : ''}" data-bs-dom="all">All 17 Canonical Texts</button>`;
              }
              const d = DOMAIN_MAP[domId];
              return `
                <button type="button" class="bs-pill ${activeDomain === domId ? 'is-active' : ''}" data-bs-dom="${domId}">
                  <span class="dot" style="background: ${d.color}"></span>${d.short}
                </button>
              `;
            })
            .join('')}
        </div>
        <button
          type="button"
          class="btn-ghost bs-collapse-btn"
          id="bs-toggle-collapse"
          aria-expanded="true"
        >
          Collapse bookshelf
        </button>
      </div>

      <p class="bs-hint">Select any volume to highlight its linked mental models in the Knowledge Graph.</p>

      <div class="bs-grid">
        ${books
          .map((book) => {
            const dom = DOMAIN_MAP[book.domain];
            return `
              <button
                type="button"
                class="bs-card"
                data-book-id="${book.id}"
                style="--spine-color: ${dom.color}"
              >
                <div class="bs-spine" aria-hidden="true"></div>
                <div class="bs-body">
                  <div class="bs-top-row">
                    <span class="bs-index">${book.index}</span>
                    <span class="bs-domain" style="color: ${dom.color}">${dom.short}</span>
                  </div>
                  <h3 class="bs-title">${book.title}</h3>
                  <p class="bs-author">${book.author}</p>
                  <p class="bs-takeaway">${book.takeaway}</p>
                  <span class="bs-cta">Inspect ${book.nodeIds.length} linked nodes &rarr;</span>
                </div>
              </button>
            `;
          })
          .join('')}
      </div>
    `;

    const collapseBtn = rootEl.querySelector('#bs-toggle-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        isExpanded = false;
        render();
      });
    }

    rootEl.querySelectorAll('[data-bs-dom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeDomain = btn.dataset.bsDom;
        render();
      });
    });

    rootEl.querySelectorAll('[data-book-id]').forEach((card) => {
      card.addEventListener('click', () => {
        const book = BOOKSHELF.find((b) => b.id === card.dataset.bookId);
        if (book && onSelectBook) {
          onSelectBook(book);
        }
      });
    });
  }

  render();
}
