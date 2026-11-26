import { DOMAINS, DOMAIN_MAP } from '../data/domains.js';

function edgeKey(a, b) {
  return a < b ? `${a}::${b}` : `${b}::${a}`;
}

export class ObservatoryGraph {
  constructor(canvas, nodesData, linksData, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    this.width = 900;
    this.height = 600;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Camera state
    this.cam = { x: 0, y: 0, scale: 1 };
    this.targetCam = null;

    // Interaction state
    this.activeDomain = 'all';
    this.searchQuery = '';
    this.crossDomainOnly = false;
    this.showAllLabels = false;
    this.highlightedBookNodeIds = null;
    this.bridgePath = null; // { nodeIds, nodeSet, edgeKeys, edges }
    this.customNodeId = null;

    this.hoveredNode = null;
    this.selectedNode = null;
    this.draggedNode = null;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0, camX: 0, camY: 0 };
    this.pointerMoved = false;
    this.pointerDownPos = { x: 0, y: 0 };

    // Build simulation nodes with deterministic seeded initial positions around domain anchors
    const clusterRadius = 235;
    const domainCounts = {};
    this.nodes = nodesData.map((n, idx) => {
      const dom = DOMAIN_MAP[n.domain];
      const count = domainCounts[n.domain] || 0;
      domainCounts[n.domain] = count + 1;

      const localAngle = (count / 8) * Math.PI * 2 + (idx % 3) * 0.25;
      const localR = 52 + (count % 3) * 32;
      const anchorX = Math.cos(dom.angle) * clusterRadius;
      const anchorY = Math.sin(dom.angle) * clusterRadius;

      return {
        ...n,
        color: dom.color,
        glow: dom.glow,
        anchorX,
        anchorY,
        x: anchorX + Math.cos(localAngle) * localR,
        y: anchorY + Math.sin(localAngle) * localR,
        vx: 0,
        vy: 0,
        radius: 6.5 + (n.weight - 1) * 8.5,
        degree: 0,
        crossDegree: 0,
        isCustom: false
      };
    });

    this.nodeMap = new Map(this.nodes.map((n) => [n.id, n]));

    this.links = linksData
      .map((l) => {
        const s = this.nodeMap.get(l.source);
        const t = this.nodeMap.get(l.target);
        if (!s || !t) return null;
        return {
          source: s,
          target: t,
          relation: l.relation,
          isCross: s.domain !== t.domain,
          isCustomLink: false
        };
      })
      .filter(Boolean);

    this.rebuildAdjacency();

    // Warm-start layout so graph appears composed on first frame
    for (let i = 0; i < 160; i++) {
      this.stepPhysics(0.85);
    }

    this.alpha = 0.35;
    this.time = 0;
    this.rafId = null;

    this.resize();
    this.fitToView(false);
    this.bindEvents();
    this.start();
  }

  rebuildAdjacency() {
    this.nodeMap = new Map(this.nodes.map((n) => [n.id, n]));
    this.neighbors = new Map();
    for (const n of this.nodes) {
      n.degree = 0;
      n.crossDegree = 0;
      this.neighbors.set(n.id, new Set([n.id]));
    }
    for (const l of this.links) {
      l.isCross = l.source.domain !== l.target.domain;
      l.source.degree += 1;
      l.target.degree += 1;
      if (l.isCross) {
        l.source.crossDegree += 1;
        l.target.crossDegree += 1;
      }
      this.neighbors.get(l.source.id).add(l.target.id);
      this.neighbors.get(l.target.id).add(l.source.id);
    }
  }

  getAllLinksForNode(nodeId) {
    return this.links
      .filter((l) => l.source.id === nodeId || l.target.id === nodeId)
      .map((l) => {
        const other = l.source.id === nodeId ? l.target : l.source;
        return { other, relation: l.relation, isCross: other.domain !== this.nodeMap.get(nodeId)?.domain };
      });
  }

  // Shortest-Path Concept Bridge (BFS across all active nodes & links)
  findShortestPath(startId, endId) {
    if (!startId || !endId || !this.nodeMap.has(startId) || !this.nodeMap.has(endId)) {
      return null;
    }
    if (startId === endId) {
      return {
        nodeIds: [startId],
        nodeSet: new Set([startId]),
        edgeKeys: new Set(),
        edges: []
      };
    }

    const adj = new Map();
    for (const n of this.nodes) adj.set(n.id, []);
    for (const l of this.links) {
      adj.get(l.source.id).push({ to: l.target.id, link: l });
      adj.get(l.target.id).push({ to: l.source.id, link: l });
    }

    const queue = [startId];
    const visited = new Set([startId]);
    const parent = new Map();

    let found = false;
    while (queue.length > 0) {
      const curr = queue.shift();
      if (curr === endId) {
        found = true;
        break;
      }
      for (const { to, link } of adj.get(curr) || []) {
        if (!visited.has(to)) {
          visited.add(to);
          parent.set(to, { prev: curr, link });
          queue.push(to);
        }
      }
    }

    if (!found) return null;

    const nodeIds = [];
    const edges = [];
    let curr = endId;
    while (curr !== startId) {
      nodeIds.push(curr);
      const step = parent.get(curr);
      edges.push({
        from: step.prev,
        to: curr,
        relation: step.link.relation,
        isCross: step.link.isCross
      });
      curr = step.prev;
    }
    nodeIds.push(startId);
    nodeIds.reverse();
    edges.reverse();

    const edgeKeys = new Set(edges.map((e) => edgeKey(e.from, e.to)));
    return {
      nodeIds,
      nodeSet: new Set(nodeIds),
      edgeKeys,
      edges
    };
  }

  setBridgePath(startId, endId) {
    const path = this.findShortestPath(startId, endId);
    this.bridgePath = path;
    if (path && path.nodeIds.length > 0) {
      this.activeDomain = 'all';
      this.searchQuery = '';
      this.highlightedBookNodeIds = null;
      this.selectedNode = null;
      this.fitNodesToView(path.nodeIds.map((id) => this.nodeMap.get(id)).filter(Boolean), true);
    }
    return path;
  }

  clearBridgePath() {
    this.bridgePath = null;
  }

  // Drop or replace a temporary custom thesis node onto the graph
  addCustomThesisNode({ title, thesis, domain, linkedNodeIds }) {
    this.removeCustomThesisNode(false);

    const dom = DOMAIN_MAP[domain] || DOMAINS[0];
    const targets = linkedNodeIds.map((id) => this.nodeMap.get(id)).filter(Boolean);

    let startX = Math.cos(dom.angle) * 140;
    let startY = Math.sin(dom.angle) * 140;
    if (targets.length > 0) {
      startX = targets.reduce((sum, n) => sum + n.x, 0) / targets.length + 18;
      startY = targets.reduce((sum, n) => sum + n.y, 0) / targets.length - 18;
    }

    const customNode = {
      id: 'custom-thesis',
      code: 'CUSTOM',
      title,
      domain: dom.id,
      aphorism: thesis,
      principle: 'Temporary custom thesis node dropped live onto the graph and wired client-side by keyword & domain overlap.',
      source: 'Your live custom thesis (temporary, client-side only)',
      bookId: null,
      application: 'Drag this node to test layout tension, inspect its auto-matched bridges, or pick it in the Shortest-Path Concept Bridge.',
      tags: ['custom', 'thesis'],
      weight: 1.35,
      color: '#1d4ed8',
      glow: 'rgba(29, 78, 216, 0.16)',
      anchorX: startX,
      anchorY: startY,
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      radius: 11,
      degree: 0,
      crossDegree: 0,
      isCustom: true
    };

    this.nodes.push(customNode);
    this.customNodeId = customNode.id;

    for (const target of targets) {
      this.links.push({
        source: customNode,
        target,
        relation: 'thesis match',
        isCross: customNode.domain !== target.domain,
        isCustomLink: true
      });
    }

    this.rebuildAdjacency();
    this.alpha = 0.45;
    this.activeDomain = 'all';
    this.searchQuery = '';
    this.highlightedBookNodeIds = null;
    this.bridgePath = null;
    this.focusNode(customNode.id);

    return { node: customNode, targets };
  }

  removeCustomThesisNode(refit = true) {
    if (!this.customNodeId) return false;
    const id = this.customNodeId;
    this.nodes = this.nodes.filter((n) => n.id !== id);
    this.links = this.links.filter((l) => l.source.id !== id && l.target.id !== id);
    this.customNodeId = null;
    if (this.selectedNode && this.selectedNode.id === id) {
      this.selectedNode = null;
      if (this.callbacks.onClearSelect) this.callbacks.onClearSelect();
    }
    if (this.hoveredNode && this.hoveredNode.id === id) {
      this.hoveredNode = null;
    }
    if (this.bridgePath && this.bridgePath.nodeSet.has(id)) {
      this.bridgePath = null;
    }
    this.rebuildAdjacency();
    this.alpha = 0.25;
    if (refit) this.fitToView(true);
    return true;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const fallbackRect = this.canvas.parentElement.getBoundingClientRect();
    this.width = Math.max(240, Math.floor(rect.width || fallbackRect.width));
    this.height = Math.max(300, Math.floor(rect.height || fallbackRect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.width / 2 - this.cam.x) / this.cam.scale,
      y: (sy - this.height / 2 - this.cam.y) / this.cam.scale
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.cam.scale + this.width / 2 + this.cam.x,
      y: wy * this.cam.scale + this.height / 2 + this.cam.y
    };
  }

  getNodeAt(sx, sy) {
    const { x, y } = this.screenToWorld(sx, sy);
    let closest = null;
    let bestDist = Infinity;
    const hitPad = (this.width < 768 ? 18 : 11) / this.cam.scale;
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dx = x - n.x;
      const dy = y - n.y;
      const d = Math.hypot(dx, dy);
      if (d <= n.radius + hitPad && d < bestDist) {
        bestDist = d;
        closest = n;
      }
    }
    return closest;
  }

  nodeMatchesFilter(node) {
    if (this.bridgePath) {
      return this.bridgePath.nodeSet.has(node.id);
    }
    if (this.highlightedBookNodeIds && this.highlightedBookNodeIds.size > 0) {
      return this.highlightedBookNodeIds.has(node.id);
    }
    if (this.activeDomain !== 'all' && node.domain !== this.activeDomain) {
      return false;
    }
    if (this.searchQuery) {
      const q = this.searchQuery;
      const hay = `${node.title} ${node.code} ${node.source} ${node.aphorism} ${node.principle} ${node.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    }
    return true;
  }

  setDomainFilter(domainId) {
    this.highlightedBookNodeIds = null;
    this.bridgePath = null;
    this.activeDomain = domainId;
    this.alpha = Math.max(this.alpha, 0.12);
    if (domainId !== 'all') {
      const dom = DOMAIN_MAP[domainId];
      if (dom) {
        const scale = Math.min(1.22, Math.max(0.88, this.width / 820));
        this.targetCam = {
          x: -Math.cos(dom.angle) * 205 * scale,
          y: -Math.sin(dom.angle) * 205 * scale,
          scale
        };
      }
    } else {
      this.fitToView(true);
    }
  }

  setSearchQuery(q) {
    this.highlightedBookNodeIds = null;
    this.bridgePath = null;
    this.searchQuery = (q || '').trim().toLowerCase();
    return this.nodes.filter((n) => this.nodeMatchesFilter(n));
  }

  highlightBookNodes(nodeIds) {
    this.activeDomain = 'all';
    this.searchQuery = '';
    this.bridgePath = null;
    this.highlightedBookNodeIds = new Set(nodeIds);
    const matched = this.nodes.filter((n) => this.highlightedBookNodeIds.has(n.id));
    if (matched.length > 0) {
      this.fitNodesToView(matched, true);
      this.selectNode(matched[0]);
    }
  }

  clearBookHighlight() {
    this.highlightedBookNodeIds = null;
  }

  setCrossDomainOnly(flag) {
    this.crossDomainOnly = flag;
  }

  setShowAllLabels(flag) {
    this.showAllLabels = flag;
  }

  selectNode(node) {
    this.selectedNode = node;
    if (node && this.callbacks.onSelect) {
      this.callbacks.onSelect(node);
    }
  }

  focusNode(nodeId) {
    const node = this.nodeMap.get(nodeId);
    if (!node) return;
    this.selectedNode = node;
    const scale = Math.max(1.12, Math.min(1.45, this.cam.scale));
    this.targetCam = {
      x: -node.x * scale,
      y: -node.y * scale,
      scale
    };
    if (this.callbacks.onSelect) {
      this.callbacks.onSelect(node);
    }
  }

  zoomBy(factor) {
    const nextScale = Math.max(0.26, Math.min(2.6, this.cam.scale * factor));
    const ratio = nextScale / this.cam.scale;
    this.targetCam = {
      x: this.cam.x * ratio,
      y: this.cam.y * ratio,
      scale: nextScale
    };
  }

  fitNodesToView(targetNodes, animate = true) {
    if (!targetNodes || targetNodes.length === 0) {
      this.fitToView(animate);
      return;
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of targetNodes) {
      if (n.x - 75 < minX) minX = n.x - 75;
      if (n.x + 75 > maxX) maxX = n.x + 75;
      if (n.y - 60 < minY) minY = n.y - 60;
      if (n.y + 60 > maxY) maxY = n.y + 60;
    }
    const padX = this.width < 640 ? 28 : 70;
    const padTop = 44;
    const padBottom = 76;
    const availW = Math.max(180, this.width - padX * 2);
    const availH = Math.max(200, this.height - padTop - padBottom);
    const spanX = Math.max(260, maxX - minX);
    const spanY = Math.max(220, maxY - minY);
    const scale = Math.max(0.42, Math.min(1.35, Math.min(availW / spanX, availH / spanY)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const yBias = (padTop - padBottom) / 2;
    const goal = { x: -cx * scale, y: -cy * scale + yBias, scale };
    if (animate) {
      this.targetCam = goal;
    } else {
      this.cam = goal;
      this.targetCam = null;
    }
  }

  fitToView(animate = true) {
    const isMobile = this.width < 640;
    const labelR = 315;
    const labelHalfW = isMobile ? 105 : 135;
    const labelPadY = 32;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of this.nodes) {
      if (n.x - 40 < minX) minX = n.x - 40;
      if (n.x + 40 > maxX) maxX = n.x + 40;
      if (n.y - 40 < minY) minY = n.y - 40;
      if (n.y + 40 > maxY) maxY = n.y + 40;
    }

    for (const dom of DOMAINS) {
      const lx = Math.cos(dom.angle) * labelR;
      const ly = Math.sin(dom.angle) * labelR;
      if (lx - labelHalfW < minX) minX = lx - labelHalfW;
      if (lx + labelHalfW > maxX) maxX = lx + labelHalfW;
      if (ly - labelPadY < minY) minY = ly - labelPadY;
      if (ly + labelPadY > maxY) maxY = ly + labelPadY;
    }

    const padX = isMobile ? 20 : 48;
    const padTop = isMobile ? 22 : 34;
    const padBottom = isMobile ? 54 : 68;
    const availW = Math.max(180, this.width - padX * 2);
    const availH = Math.max(200, this.height - padTop - padBottom);

    const spanX = Math.max(480, maxX - minX);
    const spanY = Math.max(440, maxY - minY);
    const minScale = isMobile ? 0.28 : 0.48;
    const scale = Math.max(minScale, Math.min(1.08, Math.min(availW / spanX, availH / spanY)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const yBias = (padTop - padBottom) / 2;
    const goal = { x: -cx * scale, y: -cy * scale + yBias, scale };
    if (animate) {
      this.targetCam = goal;
    } else {
      this.cam = goal;
      this.targetCam = null;
    }
  }

  stepPhysics(energy) {
    const nodes = this.nodes;
    const nLen = nodes.length;

    // 1. Repulsion (Coulomb)
    const repulsion = 2100;
    for (let i = 0; i < nLen; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nLen; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 16) distSq = 16;
        const dist = Math.sqrt(distSq);
        const minDist = a.radius + b.radius + 32;
        const force = repulsion / distSq + (dist < minDist ? (minDist - dist) * 0.25 : 0);
        const fx = (dx / dist) * force * energy;
        const fy = (dy / dist) * force * energy;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // 2. Spring edges (Hooke)
    for (const l of this.links) {
      const dx = l.target.x - l.source.x;
      const dy = l.target.y - l.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ideal = l.isCustomLink ? 120 : l.isCross ? 195 : 88;
      const stiffness = l.isCustomLink ? 0.018 : l.isCross ? 0.0045 : 0.022;
      const diff = (dist - ideal) * stiffness * energy;
      const fx = (dx / dist) * diff;
      const fy = (dy / dist) * diff;
      l.source.vx += fx;
      l.source.vy += fy;
      l.target.vx -= fx;
      l.target.vy -= fy;
    }

    // 3. Domain cluster gravity wells
    for (let i = 0; i < nLen; i++) {
      const n = nodes[i];
      const pull = n.isCustom ? 0.004 : 0.015;
      n.vx += (n.anchorX - n.x) * pull * energy;
      n.vy += (n.anchorY - n.y) * pull * energy;

      if (n !== this.draggedNode) {
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
      } else {
        n.vx = 0;
        n.vy = 0;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Clean warm paper editorial surface
    ctx.fillStyle = '#fafaf9';
    ctx.fillRect(0, 0, this.width, this.height);

    // Transform into world coordinates
    ctx.translate(this.width / 2 + this.cam.x, this.height / 2 + this.cam.y);
    ctx.scale(this.cam.scale, this.cam.scale);

    // Subtle architectural coordinate rings & crosshairs
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 1 / this.cam.scale;
    for (const r of [140, 255, 380]) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Soft editorial cluster washes & domain labels
    const isMobile = this.width < 640;
    const labelR = 315;
    for (const dom of DOMAINS) {
      const ax = Math.cos(dom.angle) * 235;
      const ay = Math.sin(dom.angle) * 235;
      const dimmed =
        (this.activeDomain !== 'all' && this.activeDomain !== dom.id) || Boolean(this.bridgePath);
      const halo = ctx.createRadialGradient(ax, ay, 12, ax, ay, 150);
      halo.addColorStop(0, dimmed ? 'rgba(0,0,0,0.012)' : dom.glow.replace('0.14', '0.075'));
      halo.addColorStop(1, 'rgba(250, 250, 249, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(ax, ay, 150, 0, Math.PI * 2);
      ctx.fill();

      // Cluster title clamped inside viewport
      const fontSize = isMobile
        ? Math.max(10, 10.5 / Math.sqrt(this.cam.scale))
        : Math.max(10.5, 11 / Math.sqrt(this.cam.scale));
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = dimmed ? '#a8a29e' : dom.color;
      ctx.globalAlpha = dimmed ? 0.45 : 0.88;
      const labelText = isMobile ? dom.short.toUpperCase() : dom.name.toUpperCase();
      let lx = Math.cos(dom.angle) * labelR;
      let ly = Math.sin(dom.angle) * labelR;
      const halfTextW = ctx.measureText(labelText).width / 2;
      const padWorld = 16 / this.cam.scale;
      const leftBound = (-this.width / 2 - this.cam.x) / this.cam.scale + halfTextW + padWorld;
      const rightBound = (this.width / 2 - this.cam.x) / this.cam.scale - halfTextW - padWorld;
      const topBound = (-this.height / 2 - this.cam.y) / this.cam.scale + fontSize + padWorld;
      const bottomBound = (this.height / 2 - this.cam.y) / this.cam.scale - fontSize - padWorld;
      if (leftBound < rightBound) lx = Math.max(leftBound, Math.min(rightBound, lx));
      if (topBound < bottomBound) ly = Math.max(topBound, Math.min(bottomBound, ly));
      ctx.fillText(labelText, lx, ly);
      ctx.globalAlpha = 1;
    }

    const focus = this.hoveredNode || this.selectedNode;
    const focusNeighbors = focus ? this.neighbors.get(focus.id) : null;
    const hasFilter =
      Boolean(this.bridgePath) ||
      this.activeDomain !== 'all' ||
      Boolean(this.searchQuery) ||
      Boolean(this.highlightedBookNodeIds && this.highlightedBookNodeIds.size > 0);

    // Draw edges
    for (const l of this.links) {
      const key = edgeKey(l.source.id, l.target.id);
      const isBridgeEdge = this.bridgePath && this.bridgePath.edgeKeys.has(key);

      if (this.crossDomainOnly && !l.isCross && !isBridgeEdge && !l.isCustomLink) continue;

      const sMatch = this.nodeMatchesFilter(l.source);
      const tMatch = this.nodeMatchesFilter(l.target);
      const touchesFocus = focus && (l.source.id === focus.id || l.target.id === focus.id);

      let alpha = l.isCustomLink ? 0.65 : l.isCross ? 0.22 : 0.28;
      let width = l.isCustomLink ? 1.5 : l.isCross ? 1.05 : 0.95;

      if (hasFilter) {
        if (isBridgeEdge) {
          alpha = 1;
          width = 2.8;
        } else if (this.bridgePath) {
          alpha = 0.06;
        } else if (sMatch && tMatch) {
          alpha = 0.45;
        } else if (sMatch || tMatch) {
          alpha = 0.1;
        } else {
          alpha = 0.04;
        }
      }

      if (focus && !isBridgeEdge) {
        if (touchesFocus) {
          alpha = l.isCross ? 0.85 : 0.65;
          width = l.isCross ? 2.0 : 1.5;
        } else if (!this.bridgePath) {
          alpha = Math.min(alpha, 0.06);
        }
      }

      ctx.beginPath();
      let ctrlX = null;
      let ctrlY = null;
      if (l.isCross) {
        const mx = (l.source.x + l.target.x) / 2;
        const my = (l.source.y + l.target.y) / 2;
        const dx = l.target.x - l.source.x;
        const dy = l.target.y - l.source.y;
        ctrlX = mx - dy * 0.12;
        ctrlY = my + dx * 0.12;
        ctx.moveTo(l.source.x, l.source.y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, l.target.x, l.target.y);
      } else {
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
      }

      if (isBridgeEdge) {
        ctx.strokeStyle = '#1d4ed8';
      } else if (l.isCustomLink) {
        ctx.setLineDash([5 / Math.sqrt(this.cam.scale), 4 / Math.sqrt(this.cam.scale)]);
        ctx.strokeStyle = `rgba(29, 78, 216, ${alpha})`;
      } else if (touchesFocus && l.isCross) {
        const grad = ctx.createLinearGradient(l.source.x, l.source.y, l.target.x, l.target.y);
        grad.addColorStop(0, l.source.color);
        grad.addColorStop(1, l.target.color);
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = l.isCross
          ? `rgba(82, 82, 91, ${alpha})`
          : `rgba(120, 113, 108, ${alpha})`;
      }

      ctx.lineWidth = width / Math.sqrt(this.cam.scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Animated pulse traveling along the Shortest-Path Concept Bridge
    if (this.bridgePath && this.bridgePath.edges.length > 0) {
      const totalHops = this.bridgePath.edges.length;
      const cycle = (this.time * 0.55) % totalHops;
      const hopIdx = Math.floor(cycle);
      const t = cycle - hopIdx;
      const edge = this.bridgePath.edges[hopIdx];
      const s = this.nodeMap.get(edge.from);
      const e = this.nodeMap.get(edge.to);
      if (s && e) {
        let px;
        let py;
        if (edge.isCross) {
          // Match quadratic curve direction (stored on link source->target; approximate smoothly)
          const linkObj = this.links.find(
            (l) =>
              (l.source.id === s.id && l.target.id === e.id) ||
              (l.source.id === e.id && l.target.id === s.id)
          );
          const a = linkObj ? linkObj.source : s;
          const b = linkObj ? linkObj.target : e;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const cx = mx - (b.y - a.y) * 0.12;
          const cy = my + (b.x - a.x) * 0.12;
          const u = linkObj && linkObj.source.id === s.id ? t : 1 - t;
          const inv = 1 - u;
          px = inv * inv * a.x + 2 * inv * u * cx + u * u * b.x;
          py = inv * inv * a.y + 2 * inv * u * cy + u * u * b.y;
        } else {
          px = s.x + (e.x - s.x) * t;
          py = s.y + (e.y - s.y) * t;
        }
        ctx.beginPath();
        ctx.arc(px, py, 4.5 / Math.sqrt(this.cam.scale), 0, Math.PI * 2);
        ctx.fillStyle = '#1d4ed8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6 / Math.sqrt(this.cam.scale);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const n of this.nodes) {
      const matches = this.nodeMatchesFilter(n);
      const isFocused = focus && n.id === focus.id;
      const isNeighbor = focusNeighbors && focusNeighbors.has(n.id);
      const isSelected = this.selectedNode && n.id === this.selectedNode.id;
      const bridgeIdx = this.bridgePath ? this.bridgePath.nodeIds.indexOf(n.id) : -1;
      const isOnBridge = bridgeIdx !== -1;

      let nodeAlpha = 0.94;
      if (hasFilter && !matches) nodeAlpha = 0.18;
      if (focus && !isNeighbor && !isOnBridge) nodeAlpha = 0.16;
      if (isFocused || isSelected || isOnBridge || n.isCustom) nodeAlpha = 1;

      const r = n.radius * (isFocused || isOnBridge ? 1.2 : 1);

      ctx.globalAlpha = nodeAlpha;

      if (n.isCustom) {
        // Distinct diamond shape for temporary custom thesis node
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.25);
        ctx.lineTo(r * 1.25, 0);
        ctx.lineTo(0, r * 1.25);
        ctx.lineTo(-r * 1.25, 0);
        ctx.closePath();
        ctx.fillStyle = '#1d4ed8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / Math.sqrt(this.cam.scale);
        ctx.stroke();

        // Outer dashed ring
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.75, 0, Math.PI * 2);
        ctx.setLineDash([4 / Math.sqrt(this.cam.scale), 3 / Math.sqrt(this.cam.scale)]);
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 1.3 / Math.sqrt(this.cam.scale);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } else {
        // Soft subtle editorial ring for selected, focused, or bridge nodes
        if (isSelected || isFocused || isOnBridge) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4.5, 0, Math.PI * 2);
          ctx.fillStyle = isOnBridge ? 'rgba(29, 78, 216, 0.14)' : n.glow;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isOnBridge ? '#1d4ed8' : n.color;
        ctx.fill();

        // Crisp white rim
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected || isFocused ? '#111111' : '#ffffff';
        ctx.lineWidth = (isSelected || isFocused ? 2 : 1.5) / Math.sqrt(this.cam.scale);
        ctx.stroke();
      }

      // Bridge step number badge (1, 2, 3...)
      if (isOnBridge) {
        const badgeR = 8.5 / Math.sqrt(this.cam.scale);
        const bx = n.x + r * 0.95;
        const by = n.y - r * 0.95;
        ctx.beginPath();
        ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
        ctx.fillStyle = '#111111';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2 / Math.sqrt(this.cam.scale);
        ctx.stroke();

        ctx.font = `600 ${Math.max(8.5, 9.5 / Math.sqrt(this.cam.scale))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(String(bridgeIdx + 1), bx, by + 0.5);
      }

      // Labels — clean dark ink with paper halo for effortless legibility
      const showLabel = isMobile
        ? this.showAllLabels ||
          isFocused ||
          isSelected ||
          isOnBridge ||
          n.isCustom ||
          (focus && isNeighbor) ||
          (hasFilter && matches)
        : this.showAllLabels ||
          isFocused ||
          isSelected ||
          isOnBridge ||
          n.isCustom ||
          (focus && isNeighbor) ||
          (hasFilter && matches) ||
          (this.cam.scale >= 1.08 && n.weight >= 1.15) ||
          n.weight >= 1.3;

      if (showLabel && nodeAlpha > 0.28) {
        const fontSize = Math.max(
          9.5,
          (isFocused || isSelected || isOnBridge || n.isCustom ? 11.8 : 10.2) / Math.sqrt(this.cam.scale)
        );
        ctx.font = `${isFocused || isSelected || isOnBridge || n.isCustom ? 600 : 500} ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const labelY = n.y + r + 5;

        ctx.lineWidth = 3.2 / Math.sqrt(this.cam.scale);
        ctx.strokeStyle = 'rgba(250, 250, 249, 0.94)';
        ctx.strokeText(n.title, n.x, labelY);

        ctx.fillStyle = isOnBridge || n.isCustom ? '#1d4ed8' : isFocused || isSelected ? '#111111' : '#292524';
        ctx.fillText(n.title, n.x, labelY);
      }

      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  start() {
    const tick = () => {
      this.time += 0.016;
      if (this.alpha > 0.004) {
        this.stepPhysics(this.alpha);
        this.alpha *= 0.985;
      } else if (this.draggedNode) {
        this.stepPhysics(0.08);
      }

      if (this.targetCam) {
        this.cam.x += (this.targetCam.x - this.cam.x) * 0.14;
        this.cam.y += (this.targetCam.y - this.cam.y) * 0.14;
        this.cam.scale += (this.targetCam.scale - this.cam.scale) * 0.14;
        if (
          Math.abs(this.targetCam.x - this.cam.x) < 0.4 &&
          Math.abs(this.targetCam.y - this.cam.y) < 0.4 &&
          Math.abs(this.targetCam.scale - this.cam.scale) < 0.002
        ) {
          this.cam = { ...this.targetCam };
          this.targetCam = null;
        }
      }

      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      const pos = getPos(e);
      this.pointerDownPos = pos;
      this.pointerMoved = false;
      this.targetCam = null;

      const hit = this.getNodeAt(pos.x, pos.y);
      if (hit) {
        this.draggedNode = hit;
        this.canvas.setPointerCapture(e.pointerId);
      } else {
        this.isPanning = true;
        this.panStart = { x: pos.x, y: pos.y, camX: this.cam.x, camY: this.cam.y };
        this.canvas.setPointerCapture(e.pointerId);
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const pos = getPos(e);
      const moveDist = Math.hypot(pos.x - this.pointerDownPos.x, pos.y - this.pointerDownPos.y);
      if (moveDist > 4) this.pointerMoved = true;

      if (this.draggedNode) {
        const w = this.screenToWorld(pos.x, pos.y);
        this.draggedNode.x = w.x;
        this.draggedNode.y = w.y;
        this.alpha = Math.max(this.alpha, 0.1);
        this.canvas.style.cursor = 'grabbing';
        if (this.callbacks.onHover) this.callbacks.onHover(null, pos);
        return;
      }

      if (this.isPanning) {
        this.cam.x = this.panStart.camX + (pos.x - this.panStart.x);
        this.cam.y = this.panStart.camY + (pos.y - this.panStart.y);
        this.canvas.style.cursor = 'grabbing';
        if (this.callbacks.onHover) this.callbacks.onHover(null, pos);
        return;
      }

      const hit = this.getNodeAt(pos.x, pos.y);
      this.hoveredNode = hit;
      this.canvas.style.cursor = hit ? 'pointer' : 'grab';
      if (this.callbacks.onHover) {
        this.callbacks.onHover(hit, pos);
      }
    });

    const endPointer = (e) => {
      const pos = getPos(e);
      if (this.draggedNode && !this.pointerMoved) {
        this.selectNode(this.draggedNode);
      } else if (this.isPanning && !this.pointerMoved) {
        const hit = this.getNodeAt(pos.x, pos.y);
        if (!hit && this.callbacks.onClearSelect) {
          this.selectedNode = null;
          this.callbacks.onClearSelect();
        }
      }
      this.draggedNode = null;
      this.isPanning = false;
      this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
    };

    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);
    this.canvas.addEventListener('pointerleave', () => {
      if (!this.draggedNode && !this.isPanning) {
        this.hoveredNode = null;
        if (this.callbacks.onHover) this.callbacks.onHover(null, { x: 0, y: 0 });
      }
    });

    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.targetCam = null;
        const pos = getPos(e);
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        const nextScale = Math.max(0.26, Math.min(2.6, this.cam.scale * factor));
        const wx = (pos.x - this.width / 2 - this.cam.x) / this.cam.scale;
        const wy = (pos.y - this.height / 2 - this.cam.y) / this.cam.scale;
        this.cam.scale = nextScale;
        this.cam.x = pos.x - this.width / 2 - wx * nextScale;
        this.cam.y = pos.y - this.height / 2 - wy * nextScale;
      },
      { passive: false }
    );

    window.addEventListener('resize', () => {
      const prevW = this.width;
      this.resize();
      if (Math.abs(this.width - prevW) > 24 && !this.selectedNode && !this.bridgePath) {
        this.fitToView(false);
      }
    });
  }
}
