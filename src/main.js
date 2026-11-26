import { DOMAINS, DOMAIN_MAP } from './data/domains.js';
import { NODES, LINKS } from './data/knowledgeGraph.js';
import { BOOKSHELF } from './data/bookshelf.js';
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
  (l) =>
    nodeDomainById[l.source] &&
    nodeDomainById[l.target] &&
    nodeDomainById[l.source] !== nodeDomainById[l.target]
).length;
if (statNodes) statNodes.textContent = String(NODES.length);
if (statBridges) statBridges.textContent = String(crossBridgeCount);

let publishedEssays = [];
let activeCustomThesis = null;

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

// Bridge & Thesis Lab DOM elements
const bridgeStartEl = document.getElementById('bridge-start');
const bridgeEndEl = document.getElementById('bridge-end');
const bridgeRunBtn = document.getElementById('bridge-run');
const bridgeClearBtn = document.getElementById('bridge-clear');
const bridgeResultEl = document.getElementById('bridge-result');

const thesisForm = document.getElementById('thesis-drop-form');
const thesisInput = document.getElementById('thesis-input');
const thesisDomainSelect = document.getElementById('thesis-domain');
const thesisRemoveBtn = document.getElementById('thesis-remove');
const thesisStatusEl = document.getElementById('thesis-status');

// Initialize Force-Directed Observatory Graph
const graph = new ObservatoryGraph(canvas, NODES, LINKS, {
  onHover(node, pos) {
    if (!node) {
      tooltip.hidden = true;
      return;
    }
    const dom = DOMAIN_MAP[node.domain];
    const nodeEssays = getEssaysForNode(publishedEssays, node.id);
    const essayMeta =
      nodeEssays.length > 0
        ? ` &middot; ${nodeEssays.length} ${nodeEssays.length === 1 ? 'essay' : 'essays'}`
        : '';
    tooltip.innerHTML = `
      <div class="tt-top">
        <span style="color: ${node.isCustom ? '#1d4ed8' : dom.color}">${
      node.isCustom ? 'Custom Thesis' : dom.name
    }</span>
        <span>${node.code}</span>
      </div>
      <div class="tt-title">${escapeHtml(node.title)}</div>
      <div class="tt-meta">${node.degree} links &middot; ${node.crossDegree} cross-domain${essayMeta}</div>
    `;
    tooltip.hidden = false;

    const stageRect = canvas.parentElement.getBoundingClientRect();
    const ttW = Math.min(260, stageRect.width - 24);
    const left =
      pos.x + 18 + ttW > stageRect.width ? Math.max(12, pos.x - ttW - 14) : pos.x + 18;
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

// Populate Thesis Domain Select
for (const d of DOMAINS) {
  const opt = document.createElement('option');
  opt.value = d.id;
  opt.textContent = `Domain: ${d.short}`;
  thesisDomainSelect.appendChild(opt);
}

// Populate Shortest-Path Bridge Selects
function populateBridgeSelects(preserveSelection = true) {
  const prevStart = preserveSelection ? bridgeStartEl.value : 'quantum-simulation';
  const prevEnd = preserveSelection ? bridgeEndEl.value : 'dopamine-homeostasis';

  const buildOptions = () => {
    let html = '';
    if (activeCustomThesis) {
      html += `
        <optgroup label="Custom Thesis (Live)">
          <option value="custom-thesis">${escapeHtml(activeCustomThesis.title)}</option>
        </optgroup>
      `;
    }
    for (const dom of DOMAINS) {
      const domNodes = NODES.filter((n) => n.domain === dom.id);
      html += `
        <optgroup label="${escapeHtml(dom.name)}">
          ${domNodes
            .map((n) => `<option value="${n.id}">${escapeHtml(n.title)}</option>`)
            .join('')}
        </optgroup>
      `;
    }
    return html;
  };

  const optsHtml = buildOptions();
  bridgeStartEl.innerHTML = optsHtml;
  bridgeEndEl.innerHTML = optsHtml;

  const hasStart = graph.nodeMap.has(prevStart);
  const hasEnd = graph.nodeMap.has(prevEnd);
  bridgeStartEl.value = hasStart ? prevStart : 'quantum-simulation';
  bridgeEndEl.value = hasEnd ? prevEnd : 'dopamine-homeostasis';
}

populateBridgeSelects(false);

// Shortest-Path Concept Bridge Runner
function runConceptBridge(startId, endId) {
  if (!startId || !endId) return;
  bridgeStartEl.value = startId;
  bridgeEndEl.value = endId;

  bookBanner.hidden = true;
  searchInput.value = '';
  renderDomainFilters('all');
  closeDrawer();

  const path = graph.setBridgePath(startId, endId);
  if (!path) {
    bridgeResultEl.hidden = false;
    bridgeClearBtn.hidden = false;
    bridgeResultEl.innerHTML = `<p class="bridge-empty">No path found between these two concepts.</p>`;
    return;
  }

  bridgeClearBtn.hidden = false;
  bridgeResultEl.hidden = false;
  searchCount.textContent = `${path.nodeIds.length} path nodes`;

  // Collect matching essays & books touched along the shortest path
  const pathNodeSet = path.nodeSet;
  const touchedEssays = publishedEssays.filter((e) =>
    e.nodeIds.some((id) => pathNodeSet.has(id))
  );
  const touchedBooks = BOOKSHELF.filter((b) => b.nodeIds.some((id) => pathNodeSet.has(id)));

  const hopsHtml = path.nodeIds
    .map((id, idx) => {
      const node = graph.nodeMap.get(id);
      const dom = DOMAIN_MAP[node.domain];
      const edge = idx > 0 ? path.edges[idx - 1] : null;
      return `
        ${
          edge
            ? `<span class="bridge-hop-edge" title="${escapeHtml(edge.relation)}">&rarr;<em>${escapeHtml(
                edge.relation
              )}</em>&rarr;</span>`
            : ''
        }
        <button type="button" class="bridge-hop-node" data-bridge-focus="${node.id}">
          <span class="bridge-step-num">${idx + 1}</span>
          <span class="dot" style="background: ${node.isCustom ? '#1d4ed8' : dom.color}"></span>
          <span>${escapeHtml(node.title)}</span>
        </button>
      `;
    })
    .join('');

  const essaysHtml =
    touchedEssays.length > 0
      ? `
        <div class="bridge-artifacts-group">
          <span class="bridge-artifacts-label">Essays on this bridge (${touchedEssays.length}):</span>
          <div class="bridge-artifacts-chips">
            ${touchedEssays
              .slice(0, 6)
              .map(
                (e) =>
                  `<a href="${escapeHtml(e.url)}" target="_blank" rel="noopener noreferrer" class="bridge-artifact-link">${escapeHtml(
                    e.title
                  )} &rarr;</a>`
              )
              .join('')}
          </div>
        </div>
      `
      : '';

  const booksHtml =
    touchedBooks.length > 0
      ? `
        <div class="bridge-artifacts-group">
          <span class="bridge-artifacts-label">Books on this bridge (${touchedBooks.length}):</span>
          <div class="bridge-artifacts-chips">
            ${touchedBooks
              .slice(0, 5)
              .map(
                (b) =>
                  `<button type="button" class="bridge-artifact-btn" data-bridge-book="${b.id}">${escapeHtml(
                    b.title
                  )}</button>`
              )
              .join('')}
          </div>
        </div>
      `
      : '';

  bridgeResultEl.innerHTML = `
    <div class="bridge-summary-line">
      <strong>${path.edges.length} ${path.edges.length === 1 ? 'hop' : 'hops'}</strong>
      across ${new Set(path.nodeIds.map((id) => graph.nodeMap.get(id)?.domain)).size} domains
    </div>
    <div class="bridge-chain">${hopsHtml}</div>
    ${essaysHtml || booksHtml ? `<div class="bridge-artifacts">${essaysHtml}${booksHtml}</div>` : ''}
  `;

  bridgeResultEl.querySelectorAll('[data-bridge-focus]').forEach((btn) => {
    btn.addEventListener('click', () => {
      graph.focusNode(btn.dataset.bridgeFocus);
    });
  });

  bridgeResultEl.querySelectorAll('[data-bridge-book]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const book = BOOKSHELF.find((b) => b.id === btn.dataset.bridgeBook);
      if (book) highlightBook(book);
    });
  });
}

function clearConceptBridge(refit = true) {
  graph.clearBridgePath();
  bridgeResultEl.hidden = true;
  bridgeResultEl.innerHTML = '';
  bridgeClearBtn.hidden = true;
  searchCount.textContent = `${graph.nodes.length} nodes`;
  if (refit) graph.fitToView(true);
}

bridgeRunBtn.addEventListener('click', () => {
  runConceptBridge(bridgeStartEl.value, bridgeEndEl.value);
});

bridgeClearBtn.addEventListener('click', () => {
  clearConceptBridge(true);
});

document.querySelectorAll('[data-bridge-start]').forEach((btn) => {
  btn.addEventListener('click', () => {
    runConceptBridge(btn.dataset.bridgeStart, btn.dataset.bridgeEnd);
  });
});

// Client-Side Custom Thesis Node Matcher & Dropper
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'about',
  'have', 'will', 'more', 'than', 'over', 'when', 'where', 'what', 'which',
  'their', 'there', 'using', 'based', 'built', 'small', 'large', 'system', 'systems'
]);

function matchThesisToNodes(text, domainOverride = 'auto') {
  const clean = text.toLowerCase();
  const tokens = clean
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  const scored = NODES.map((n) => {
    let score = 0;
    const titleL = n.title.toLowerCase();
    const tagsL = n.tags.join(' ').toLowerCase();
    const bodyL = `${n.aphorism} ${n.principle} ${n.application} ${n.source}`.toLowerCase();

    for (const tok of tokens) {
      if (titleL.includes(tok)) score += 6;
      if (tagsL.includes(tok)) score += 5;
      if (bodyL.includes(tok)) score += 2;
    }

    if (domainOverride !== 'auto' && n.domain === domainOverride) {
      score += 3;
    }

    return { node: n, score };
  });

  scored.sort((a, b) => b.score - a.score || b.node.weight - a.node.weight);

  // Pick top 4 matches (ensure cross-domain diversity if scores are tied)
  const chosen = scored.slice(0, 4).map((s) => s.node);
  const inferredDomain =
    domainOverride !== 'auto' ? domainOverride : chosen[0]?.domain || 'systems-epistemology';

  return {
    domain: inferredDomain,
    linkedNodeIds: chosen.map((n) => n.id),
    linkedNodes: chosen
  };
}

function dropCustomThesis({ title, thesis, domainOverride = 'auto' }) {
  const cleanThesis = (thesis || title || '').trim();
  if (!cleanThesis) return;
  const shortTitle =
    title && title.trim()
      ? title.trim()
      : cleanThesis.length > 38
      ? `${cleanThesis.slice(0, 36)}...`
      : cleanThesis;

  const { domain, linkedNodeIds, linkedNodes } = matchThesisToNodes(cleanThesis, domainOverride);
  clearConceptBridge(false);
  bookBanner.hidden = true;
  searchInput.value = '';
  renderDomainFilters('all');

  const { node } = graph.addCustomThesisNode({
    title: shortTitle,
    thesis: cleanThesis,
    domain,
    linkedNodeIds
  });

  activeCustomThesis = node;
  populateBridgeSelects(true);
  bridgeStartEl.value = 'custom-thesis';
  thesisRemoveBtn.hidden = false;
  thesisStatusEl.hidden = false;
  searchCount.textContent = `${graph.nodes.length} nodes`;

  thesisStatusEl.innerHTML = `
    <span class="thesis-status-label">Linked to:</span>
    ${linkedNodes
      .map(
        (n) =>
          `<button type="button" class="thesis-match-chip" data-thesis-focus="${n.id}">${escapeHtml(
            n.title
          )}</button>`
      )
      .join('')}
  `;

  thesisStatusEl.querySelectorAll('[data-thesis-focus]').forEach((btn) => {
    btn.addEventListener('click', () => graph.focusNode(btn.dataset.thesisFocus));
  });
}

thesisForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = thesisInput.value.trim();
  if (!val) return;
  dropCustomThesis({
    title: val.length > 38 ? `${val.slice(0, 36)}...` : val,
    thesis: val,
    domainOverride: thesisDomainSelect.value
  });
});

thesisRemoveBtn.addEventListener('click', () => {
  graph.removeCustomThesisNode(true);
  activeCustomThesis = null;
  thesisRemoveBtn.hidden = true;
  thesisStatusEl.hidden = true;
  thesisStatusEl.innerHTML = '';
  populateBridgeSelects(false);
  searchCount.textContent = `${graph.nodes.length} nodes`;
});

// Build Domain Filter Pills
function renderDomainFilters(activeId = 'all') {
  const counts = {};
  for (const n of NODES) counts[n.domain] = (counts[n.domain] || 0) + 1;

  filtersWrap.innerHTML = `
    <button type="button" class="filter-pill ${activeId === 'all' ? 'is-active' : ''}" data-dom="all">
      All (${NODES.length})
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
      clearConceptBridge(false);
      searchInput.value = '';
      graph.setSearchQuery('');
      graph.setDomainFilter(domId);
      renderDomainFilters(domId);
      const visible = domId === 'all' ? graph.nodes.length : counts[domId] || 0;
      searchCount.textContent = `${visible} nodes`;
    });
  });
}

renderDomainFilters('all');

// Instant Search
searchInput.addEventListener('input', () => {
  bookBanner.hidden = true;
  clearConceptBridge(false);
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
  clearConceptBridge(false);
  graph.clearBookHighlight();
  graph.setDomainFilter('all');
  searchInput.value = '';
  graph.setSearchQuery('');
  renderDomainFilters('all');
  searchCount.textContent = `${graph.nodes.length} nodes`;
});

clearBookBtn.addEventListener('click', () => {
  bookBanner.hidden = true;
  graph.clearBookHighlight();
  graph.fitToView(true);
  searchCount.textContent = `${graph.nodes.length} nodes`;
});

function highlightBook(book) {
  clearConceptBridge(false);
  renderDomainFilters('all');
  searchInput.value = '';
  bookBannerText.textContent = `Highlighting ${book.nodeIds.length} mental models from "${book.title}" by ${book.author}.`;
  bookBanner.hidden = false;
  searchCount.textContent = `${book.nodeIds.length} volume nodes`;
  graph.highlightBookNodes(book.nodeIds);
  document.getElementById('observatory').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Concept Drawer
function openDrawer(node) {
  const dom = DOMAIN_MAP[node.domain];
  drawerDomain.textContent = node.isCustom ? 'Custom Thesis' : dom.name;
  drawerDomain.style.color = node.isCustom ? '#1d4ed8' : dom.color;
  drawerCode.textContent = node.code;

  const connected = graph.getAllLinksForNode(node.id);
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
              <span class="dot" style="background: ${item.other.isCustom ? '#1d4ed8' : otherDom.color}"></span>
              <span>${escapeHtml(item.other.title)}</span>
            </span>
            <span class="drawer-link-rel">${escapeHtml(item.relation)}</span>
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
            <span class="drawer-essay-title">${escapeHtml(essay.title)} &rarr;</span>
          </a>
        `
      )
      .join('');

  drawerBody.innerHTML = `
    <div>
      <h3 class="drawer-title">${escapeHtml(node.title)}</h3>
    </div>
    <p class="drawer-aphorism">${escapeHtml(node.aphorism)}</p>

    <div class="drawer-quick-actions">
      <button type="button" class="btn-mini" id="drawer-bridge-from">Bridge from here &rarr;</button>
      ${
        node.isCustom
          ? `<button type="button" class="btn-mini" id="drawer-remove-custom">Remove Thesis</button>`
          : ''
      }
    </div>

    ${
      relatedEssays.length > 0
        ? `
      <div class="drawer-block">
        <h4>Published Essays (${relatedEssays.length})</h4>
        <div class="drawer-essays-list">${renderEssayList(relatedEssays)}</div>
      </div>
    `
        : ''
    }

    <details class="drawer-details">
      <summary>Core Principle &amp; Application</summary>
      <div class="drawer-details-body">
        <p>${escapeHtml(node.principle)}</p>
        <p><strong>Application:</strong> ${escapeHtml(node.application)}</p>
        <div class="drawer-source">${escapeHtml(node.source)}</div>
      </div>
    </details>

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
        <h4>Within ${escapeHtml(dom.short)} (${sameLinks.length})</h4>
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

  drawerBody.querySelector('#drawer-bridge-from')?.addEventListener('click', () => {
    bridgeStartEl.value = node.id;
    if (bridgeEndEl.value === node.id) {
      const distant = NODES.find((n) => n.domain !== node.domain);
      if (distant) bridgeEndEl.value = distant.id;
    }
    runConceptBridge(bridgeStartEl.value, bridgeEndEl.value);
    document.getElementById('bridge-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  drawerBody.querySelector('#drawer-remove-custom')?.addEventListener('click', () => {
    thesisRemoveBtn.click();
  });

  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  if (window.innerWidth <= 768) {
    document.body.classList.add('drawer-open-mobile');
  }
}

function closeDrawer() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open-mobile');
}

drawerClose.addEventListener('click', () => {
  graph.selectedNode = null;
  closeDrawer();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (
    e.key === '/' &&
    document.activeElement.tagName !== 'INPUT' &&
    document.activeElement.tagName !== 'TEXTAREA' &&
    document.activeElement.tagName !== 'SELECT'
  ) {
    e.preventDefault();
    searchInput.focus();
  } else if (e.key === 'Escape') {
    graph.selectedNode = null;
    closeDrawer();
  }
});

// Load Published Essays from public/data/articles.json
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
        clearConceptBridge(false);
        graph.clearBookHighlight();
        graph.setDomainFilter('all');
        searchInput.value = '';
        graph.setSearchQuery('');
        renderDomainFilters('all');
        searchCount.textContent = `${graph.nodes.length} nodes`;
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

// Initialize 4-Lens Stress-Tester (wired to drop thesis directly onto the graph)
initStressTester(document.getElementById('stress-tester-root'), ({ title, thesis }) => {
  thesisInput.value = thesis;
  dropCustomThesis({ title, thesis, domainOverride: 'auto' });
  document.getElementById('observatory').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Initialize Compact Canonical Bookshelf
initBookshelf(document.getElementById('bookshelf-root'), (book) => {
  highlightBook(book);
});

// Header nav active state
const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (navLinks.length > 0 && 'IntersectionObserver' in window) {
  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) setActiveNav(visible[0].target.id);
    },
    { rootMargin: '-18% 0px -65% 0px', threshold: 0.01 }
  );
  trackedSections.forEach((sec) => observer.observe(sec));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
