import { BOOKSHELF } from '../data/bookshelf.js';
import { DOMAIN_MAP } from '../data/domains.js';

export function initBookshelf(rootEl, onSelectBook) {
  let activeDomain = 'all';

  function render() {
    const books =
      activeDomain === 'all'
        ? BOOKSHELF
        : BOOKSHELF.filter((b) => b.domain === activeDomain);

    const uniqueDomains = ['all', ...new Set(BOOKSHELF.map((b) => b.domain))];

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
        <span class="bs-hint">Click any volume to illuminate its mental models in the Observatory Graph.</span>
      </div>

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
