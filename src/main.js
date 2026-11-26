import { DOMAINS, DOMAIN_MAP } from './data/domains.js';
import { NODES, LINKS } from './data/knowledgeGraph.js';
import { loadEssays, getEssaysForNode } from './data/essays.js';
import { ObservatoryGraph } from './components/graphEngine.js';
import { initEssaysIndex } from './components/essaysUI.js';
import { initStressTester } from './components/stressTesterUI.js';
import { initBookshelf } from './components/bookshelfUI.js';

// Update hero stats dynamically from real data
const statNodes = document.getElementById('stat-nodes');
const statBridges = document.getElementById('stat-bridges');
const statEssays = document.getElementById('stat-essays');
const nodeMap = new Map(NODES.map((n) => [n.id, n]));
const nodeDomainById = Object.fromEntries(NODES.map((n) => [n.id, n.domain]));
const crossBridgeCount = LINKS.filter(
  (l) => nodeDomainById[l.source] && nodeDomainById[l.target] && nodeDomainById[l.source] !== nodeDomainById[l.target]
).length;
if (statNodes) statNodes.textContent = String(NODES.length);
if (statBridges) statBridges.textContent = String(crossBridgeCount);

let publishedEssays = [];

// DOM elements for Knowledge Graph
const canvas = document.getElementById('graph-canvas');
const tooltip = document.getElementById('graph-tooltip');
const drawer = document.getElementById('concept-drawer');
const drawerDomain = document.getElementById('drawer-domain');
const drawerCode = document.getElementById('drawer-code');
const drawerBody = document.getElementById('drawer-body');
const drawerClose = document.getElementById('drawer-close');
const filtersWrap = document.getElementById('domain-filters');
const searchInput = document.getElementById('graph-search');
const searchCount = document.getElementById('search-count');
const bookBanner = document.getElementById('active-book-banner');
const bookBannerText = document.getElementById('active-book-text');
const clearBookBtn = document.getElementById('clear-book-filter');

// Initialize Force-Directed Observatory Graph
const graph = new ObservatoryGraph(canvas, NODES, LINKS, {
  onHover(node, pos) {
    if (!node) {
      tooltip.hidden = true;
      return;
    }
    const dom = DOMAIN_MAP[node.domain];
    const nodeEssays = getEssaysForNode(publishedEssays, node.id);
    const essayMeta = nodeEssays.length > 0 ? ` &middot; ${nodeEssays.length} ${nodeEssays.length === 1 ? 'essay' : 'essays'}` : '';
    tooltip.innerHTML = `
      <div class="tt-top">
        <span style="color: ${dom.color}">${dom.name}</span>
        <span>${node.code}</span>
      </div>
      <div class="tt-title">${escapeHtml(node.title)}</div>
      <div class="tt-meta">${node.degree} links &middot; ${node.crossDegree} cross-domain bridges${essayMeta}</div>
    `;
    tooltip.hidden = false;

    const stageRect = canvas.parentElement.getBoundingClientRect();
    const ttW = 260;
    const left = pos.x + 18 + ttW > stageRect.width ? Math.max(12, pos.x - ttW - 14) : pos.x + 18;
    const top = Math.max(12, Math.min(stageRect.height - 96, pos.y - 16));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  },
  onSelect(node) {
    openDrawer(node);
  },
  onClearSelect() {
    closeDrawer();
  }
});

// Build Domain Filter Pills
function renderDomainFilters(activeId = 'all') {
  const counts = {};
  for (const n of NODES) counts[n.domain] = (counts[n.domain] || 0) + 1;

  filtersWrap.innerHTML = `
    <button type="button" class="filter-pill ${activeId === 'all' ? 'is-active' : ''}" data-dom="all">
      All Domains (${NODES.length})
    </button>
    ${DOMAINS.map(
      (d) => `
      <button type="button" class="filter-pill ${activeId === d.id ? 'is-active' : ''}" data-dom="${d.id}">
        <span class="dot" style="background: ${d.color}"></span>
        ${d.short} (${counts[d.id] || 0})
      </button>
    `
    ).join('')}
  `;

  filtersWrap.querySelectorAll('[data-dom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const domId = btn.dataset.dom;
      bookBanner.hidden = true;
      searchInput.value = '';
      graph.setSearchQuery('');
      graph.setDomainFilter(domId);
      renderDomainFilters(domId);
      const visible = domId === 'all' ? NODES.length : counts[domId] || 0;
      searchCount.textContent = `${visible} nodes`;
    });
  });
}

renderDomainFilters('all');

// Instant Search
searchInput.addEventListener('input', () => {
  bookBanner.hidden = true;
  const matched = graph.setSearchQuery(searchInput.value);
  searchCount.textContent = `${matched.length} ${matched.length === 1 ? 'match' : 'matches'}`;
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const matched = graph.setSearchQuery(searchInput.value);
    if (matched.length > 0) {
      graph.focusNode(matched[0].id);
    }
  }
});

// HUD Controls
const crossOnlyBtn = document.getElementById('toggle-cross-only');
crossOnlyBtn.addEventListener('click', () => {
  const next = crossOnlyBtn.getAttribute('aria-pressed') !== 'true';
  crossOnlyBtn.setAttribute('aria-pressed', String(next));
  graph.setCrossDomainOnly(next);
});

const labelsBtn = document.getElementById('toggle-labels');
labelsBtn.addEventListener('click', () => {
  const next = labelsBtn.getAttribute('aria-pressed') !== 'true';
  labelsBtn.setAttribute('aria-pressed', String(next));
  graph.setShowAllLabels(next);
});

document.getElementById('zoom-in').addEventListener('click', () => graph.zoomBy(1.24));
document.getElementById('zoom-out').addEventListener('click', () => graph.zoomBy(0.8));
document.getElementById('zoom-reset').addEventListener('click', () => {
  bookBanner.hidden = true;
  graph.clearBookHighlight();
  graph.setDomainFilter('all');
  searchInput.value = '';
  graph.setSearchQuery('');
  renderDomainFilters('all');
  searchCount.textContent = `${NODES.length} nodes`;
});

clearBookBtn.addEventListener('click', () => {
  bookBanner.hidden = true;
  graph.clearBookHighlight();
  graph.fitToView(true);
  searchCount.textContent = `${NODES.length} nodes`;
});

// Concept Drawer
function openDrawer(node) {
  const dom = DOMAIN_MAP[node.domain];
  drawerDomain.textContent = dom.name;
  drawerDomain.style.color = dom.color;
  drawerCode.textContent = node.code;

  const connected = LINKS.filter((l) => l.source === node.id || l.target === node.id).map((l) => {
    const otherId = l.source === node.id ? l.target : l.source;
    const other = NODES.find((n) => n.id === otherId);
    return { other, relation: l.relation, isCross: other.domain !== node.domain };
  });

  const crossLinks = connected.filter((c) => c.isCross);
  const sameLinks = connected.filter((c) => !c.isCross);
  const relatedEssays = getEssaysForNode(publishedEssays, node.id);

  const renderLinkList = (items) =>
    items
      .map((item) => {
        const otherDom = DOMAIN_MAP[item.other.domain];
        return `
          <button type="button" class="drawer-link-btn" data-jump-node="${item.other.id}">
            <span class="drawer-link-left">
              <span class="dot" style="background: ${otherDom.color}"></span>
              <span>${escapeHtml(item.other.title)}</span>
            </span>
            <span class="drawer-link-rel">${item.relation}</span>
          </button>
        `;
      })
      .join('');

  const renderEssayList = (items) =>
    items
      .map(
        (essay) => `
          <a
            href="${escapeHtml(essay.url)}"
            target="_blank"
            rel="noopener noreferrer"
            class="drawer-essay-card"
          >
            <span class="drawer-essay-title">${escapeHtml(essay.title)}</span>
            <span class="drawer-essay-excerpt">${escapeHtml(essay.excerpt)}</span>
            <span class="drawer-essay-cta">Read Mohammed's Essay &rarr;</span>
          </a>
        `
      )
      .join('');

  drawerBody.innerHTML = `
    <div>
      <h3 class="drawer-title">${escapeHtml(node.title)}</h3>
    </div>
    <p class="drawer-aphorism">${escapeHtml(node.aphorism)}</p>

    <div class="drawer-block">
      <h4>Core Principle</h4>
      <p>${escapeHtml(node.principle)}</p>
    </div>

    ${
      relatedEssays.length > 0
        ? `
      <div class="drawer-block">
        <h4>Published Essays by Mohammed KM (${relatedEssays.length})</h4>
        <div class="drawer-essays-list">${renderEssayList(relatedEssays)}</div>
      </div>
    `
        : ''
    }

    <div class="drawer-block">
      <h4>Source Book / Research Theme</h4>
      <div class="drawer-source">${escapeHtml(node.source)}</div>
    </div>

    <div class="drawer-block">
      <h4>Practical Application</h4>
      <p>${escapeHtml(node.application)}</p>
    </div>

    ${
      crossLinks.length > 0
        ? `
      <div class="drawer-block">
        <h4>Cross-Domain Bridges (${crossLinks.length})</h4>
        <div class="drawer-links-list">${renderLinkList(crossLinks)}</div>
      </div>
    `
        : ''
    }

    ${
      sameLinks.length > 0
        ? `
      <div class="drawer-block">
        <h4>Within ${dom.short} (${sameLinks.length})</h4>
        <div class="drawer-links-list">${renderLinkList(sameLinks)}</div>
      </div>
    `
        : ''
    }
  `;

  drawerBody.querySelectorAll('[data-jump-node]').forEach((btn) => {
    btn.addEventListener('click', () => {
      graph.focusNode(btn.dataset.jumpNode);
    });
  });

  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
}

drawerClose.addEventListener('click', () => {
  graph.selectedNode = null;
  closeDrawer();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    searchInput.focus();
  } else if (e.key === 'Escape') {
    graph.selectedNode = null;
    closeDrawer();
  }
});

// Load Published Essays from public/data/articles.json and initialize Published Essays Index
const essaysRoot = document.getElementById('essays-root');
loadEssays()
  .then((loaded) => {
    publishedEssays = loaded;
    if (statEssays) statEssays.textContent = String(publishedEssays.length);
    if (graph.selectedNode) {
      openDrawer(graph.selectedNode);
    }
    if (essaysRoot) {
      initEssaysIndex(essaysRoot, publishedEssays, nodeMap, (nodeId) => {
        bookBanner.hidden = true;
        graph.clearBookHighlight();
        graph.setDomainFilter('all');
        searchInput.value = '';
        graph.setSearchQuery('');
        renderDomainFilters('all');
        searchCount.textContent = `${NODES.length} nodes`;
        graph.focusNode(nodeId);
        document.getElementById('observatory').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  })
  .catch(() => {
    if (essaysRoot) {
      essaysRoot.innerHTML =
        '<div class="essays-empty">Unable to load published essays index from data/articles.json.</div>';
    }
  });

// Initialize 4-Lens Stress-Tester
initStressTester(document.getElementById('stress-tester-root'));

// Initialize Canonical Bookshelf Strip
initBookshelf(document.getElementById('bookshelf-root'), (book) => {
  renderDomainFilters('all');
  searchInput.value = '';
  bookBannerText.textContent = `Illuminating ${book.nodeIds.length} mental models from "${book.title}" by ${book.author}.`;
  bookBanner.hidden = false;
  searchCount.textContent = `${book.nodeIds.length} volume nodes`;
  graph.highlightBookNodes(book.nodeIds);
  document.getElementById('observatory').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
