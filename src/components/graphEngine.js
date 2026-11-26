import { DOMAINS, DOMAIN_MAP } from '../data/domains.js';

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

    this.hoveredNode = null;
    this.selectedNode = null;
    this.draggedNode = null;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0, camX: 0, camY: 0 };
    this.pointerMoved = false;
    this.pointerDownPos = { x: 0, y: 0 };

    // Build simulation nodes with deterministic seeded initial positions around domain anchors
    const clusterRadius = 240;
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
        crossDegree: 0
      };
    });

    this.nodeMap = new Map(this.nodes.map((n) => [n.id, n]));

    this.links = linksData
      .map((l) => {
        const s = this.nodeMap.get(l.source);
        const t = this.nodeMap.get(l.target);
        if (!s || !t) return null;
        const isCross = s.domain !== t.domain;
        s.degree += 1;
        t.degree += 1;
        if (isCross) {
          s.crossDegree += 1;
          t.crossDegree += 1;
        }
        return {
          source: s,
          target: t,
          relation: l.relation,
          isCross
        };
      })
      .filter(Boolean);

    // Build adjacency map for fast hover lookup
    this.neighbors = new Map();
    for (const n of this.nodes) {
      this.neighbors.set(n.id, new Set([n.id]));
    }
    for (const l of this.links) {
      this.neighbors.get(l.source.id).add(l.target.id);
      this.neighbors.get(l.target.id).add(l.source.id);
    }

    // Ambient starfield dots (deterministic)
    this.stars = Array.from({ length: 110 }, (_, i) => {
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const rx = seed1 - Math.floor(seed1);
      const ry = seed2 - Math.floor(seed2);
      return {
        x: (rx - 0.5) * 1800,
        y: (ry - 0.5) * 1400,
        r: 0.6 + (i % 3) * 0.45,
        a: 0.08 + (i % 5) * 0.045
      };
    });

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
    const hitPad = (this.width < 768 ? 18 : 10) / this.cam.scale;
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
    this.activeDomain = domainId;
    this.alpha = Math.max(this.alpha, 0.12);
    if (domainId !== 'all') {
      const dom = DOMAIN_MAP[domainId];
      if (dom) {
        const scale = Math.min(1.25, Math.max(0.9, this.width / 820));
        this.targetCam = {
          x: -Math.cos(dom.angle) * 210 * scale,
          y: -Math.sin(dom.angle) * 210 * scale,
          scale
        };
      }
    } else {
      this.fitToView(true);
    }
  }

  setSearchQuery(q) {
    this.highlightedBookNodeIds = null;
    this.searchQuery = (q || '').trim().toLowerCase();
    return this.nodes.filter((n) => this.nodeMatchesFilter(n));
  }

  highlightBookNodes(nodeIds) {
    this.activeDomain = 'all';
    this.searchQuery = '';
    this.highlightedBookNodeIds = new Set(nodeIds);
    const matched = this.nodes.filter((n) => this.highlightedBookNodeIds.has(n.id));
    if (matched.length > 0) {
      const cx = matched.reduce((acc, n) => acc + n.x, 0) / matched.length;
      const cy = matched.reduce((acc, n) => acc + n.y, 0) / matched.length;
      const scale = Math.min(1.25, Math.max(0.9, this.width / 840));
      this.targetCam = { x: -cx * scale, y: -cy * scale, scale };
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
    const scale = Math.max(1.15, Math.min(1.5, this.cam.scale));
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
    const nextScale = Math.max(0.45, Math.min(2.6, this.cam.scale * factor));
    const ratio = nextScale / this.cam.scale;
    this.targetCam = {
      x: this.cam.x * ratio,
      y: this.cam.y * ratio,
      scale: nextScale
    };
  }

  fitToView(animate = true) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of this.nodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }
    const spanX = Math.max(400, maxX - minX + 180);
    const spanY = Math.max(360, maxY - minY + 180);
    const minScale = this.width < 640 ? 0.36 : 0.55;
    const scale = Math.max(minScale, Math.min(1.15, Math.min(this.width / spanX, this.height / spanY)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const goal = { x: -cx * scale, y: -cy * scale, scale };
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
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 16) distSq = 16;
        const dist = Math.sqrt(distSq);
        const minDist = a.radius + b.radius + 32;
        const force = (repulsion / distSq) + (dist < minDist ? (minDist - dist) * 0.25 : 0);
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
      const ideal = l.isCross ? 195 : 88;
      const stiffness = l.isCross ? 0.0045 : 0.022;
      const diff = (dist - ideal) * stiffness * energy;
      const fx = (dx / dist) * diff;
      const fy = (dy / dist) * diff;
      l.source.vx += fx;
      l.source.vy += fy;
      l.target.vx -= fx;
      l.target.vy -= fy;
    }

    // 3. Domain cluster gravity wells + soft centering
    for (let i = 0; i < nLen; i++) {
      const n = nodes[i];
      n.vx += (n.anchorX - n.x) * 0.015 * energy;
      n.vy += (n.anchorY - n.y) * 0.015 * energy;

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

    // Deep obsidian background
    ctx.fillStyle = '#090b10';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle radial observatory vignette
    const bgGrad = ctx.createRadialGradient(
      this.width * 0.5,
      this.height * 0.48,
      30,
      this.width * 0.5,
      this.height * 0.5,
      Math.max(this.width, this.height) * 0.72
    );
    bgGrad.addColorStop(0, 'rgba(26, 33, 56, 0.28)');
    bgGrad.addColorStop(0.55, 'rgba(13, 17, 28, 0.12)');
    bgGrad.addColorStop(1, 'rgba(9, 11, 16, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Transform into world coordinates
    ctx.translate(this.width / 2 + this.cam.x, this.height / 2 + this.cam.y);
    ctx.scale(this.cam.scale, this.cam.scale);

    // Subtle celestial coordinate rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.028)';
    ctx.lineWidth = 1 / this.cam.scale;
    for (const r of [140, 260, 390]) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Subtle background starfield
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(210, 224, 255, ${s.a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r / Math.sqrt(this.cam.scale), 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft cluster nebula halos & domain watermark labels
    for (const dom of DOMAINS) {
      const ax = Math.cos(dom.angle) * 240;
      const ay = Math.sin(dom.angle) * 240;
      const dimmed = this.activeDomain !== 'all' && this.activeDomain !== dom.id;
      const halo = ctx.createRadialGradient(ax, ay, 8, ax, ay, 165);
      halo.addColorStop(0, dimmed ? 'rgba(255,255,255,0.008)' : dom.glow.replace('0.3', '0.11'));
      halo.addColorStop(1, 'rgba(9, 11, 16, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(ax, ay, 165, 0, Math.PI * 2);
      ctx.fill();

      // Cluster title
      ctx.font = `600 ${Math.max(10, 11 / Math.sqrt(this.cam.scale))}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = dimmed ? 'rgba(148, 163, 184, 0.16)' : dom.color;
      ctx.globalAlpha = dimmed ? 0.3 : 0.65;
      const labelR = 355;
      ctx.fillText(
        dom.name.toUpperCase(),
        Math.cos(dom.angle) * labelR,
        Math.sin(dom.angle) * labelR
      );
      ctx.globalAlpha = 1;
    }

    const focus = this.hoveredNode || this.selectedNode;
    const focusNeighbors = focus ? this.neighbors.get(focus.id) : null;
    const hasFilter =
      this.activeDomain !== 'all' ||
      Boolean(this.searchQuery) ||
      Boolean(this.highlightedBookNodeIds && this.highlightedBookNodeIds.size > 0);

    // Draw edges
    for (const l of this.links) {
      if (this.crossDomainOnly && !l.isCross) continue;

      const sMatch = this.nodeMatchesFilter(l.source);
      const tMatch = this.nodeMatchesFilter(l.target);
      const touchesFocus = focus && (l.source.id === focus.id || l.target.id === focus.id);

      let alpha = l.isCross ? 0.14 : 0.2;
      let width = l.isCross ? 1.0 : 0.9;

      if (hasFilter) {
        if (sMatch && tMatch) {
          alpha = l.isCross ? 0.34 : 0.32;
        } else if (sMatch || tMatch) {
          alpha = 0.08;
        } else {
          alpha = 0.025;
        }
      }

      if (focus) {
        if (touchesFocus) {
          alpha = l.isCross ? 0.88 : 0.62;
          width = l.isCross ? 2.0 : 1.45;
        } else {
          alpha = Math.min(alpha, 0.04);
        }
      }

      ctx.beginPath();
      if (l.isCross) {
        // Gentle curved arc for cross-domain bridges so they read distinctly
        const mx = (l.source.x + l.target.x) / 2;
        const my = (l.source.y + l.target.y) / 2;
        const dx = l.target.x - l.source.x;
        const dy = l.target.y - l.source.y;
        const cx = mx - dy * 0.12;
        const cy = my + dx * 0.12;
        ctx.moveTo(l.source.x, l.source.y);
        ctx.quadraticCurveTo(cx, cy, l.target.x, l.target.y);
      } else {
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
      }

      if (touchesFocus && l.isCross) {
        const grad = ctx.createLinearGradient(l.source.x, l.source.y, l.target.x, l.target.y);
        grad.addColorStop(0, l.source.color);
        grad.addColorStop(1, l.target.color);
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = l.isCross
          ? `rgba(203, 213, 225, ${alpha})`
          : `rgba(148, 163, 184, ${alpha})`;
      }

      ctx.globalAlpha = touchesFocus && l.isCross ? 0.9 : 1;
      ctx.lineWidth = width / Math.sqrt(this.cam.scale);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    for (const n of this.nodes) {
      const matches = this.nodeMatchesFilter(n);
      const isFocused = focus && n.id === focus.id;
      const isNeighbor = focusNeighbors && focusNeighbors.has(n.id);
      const isSelected = this.selectedNode && n.id === this.selectedNode.id;

      let nodeAlpha = 0.92;
      if (hasFilter && !matches) nodeAlpha = 0.15;
      if (focus && !isNeighbor) nodeAlpha = 0.14;
      if (isFocused || isSelected) nodeAlpha = 1;

      const r = n.radius * (isFocused ? 1.24 : 1);

      // Luminous outer aura on active/important nodes
      if (isFocused || isSelected || (nodeAlpha > 0.7 && n.weight >= 1.25)) {
        const glowR = r * (isFocused ? 3.4 : 2.3);
        const grad = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, glowR);
        grad.addColorStop(0, n.glow);
        grad.addColorStop(1, 'rgba(9, 11, 16, 0)');
        ctx.fillStyle = grad;
        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node core
      ctx.globalAlpha = nodeAlpha;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isFocused || isSelected ? '#f8fafc' : n.color;
      ctx.fill();

      // Ring around selected or high-weight nodes
      if (isSelected || isFocused) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1.6 / Math.sqrt(this.cam.scale);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(9, 11, 16, 0.75)';
        ctx.lineWidth = 1 / Math.sqrt(this.cam.scale);
        ctx.stroke();
      }

      // Labels
      const showLabel =
        this.showAllLabels ||
        isFocused ||
        isSelected ||
        (focus && isNeighbor) ||
        (hasFilter && matches) ||
        (this.cam.scale >= 1.1 && n.weight >= 1.15) ||
        n.weight >= 1.3;

      if (showLabel && nodeAlpha > 0.25) {
        const fontSize = Math.max(9.5, (isFocused || isSelected ? 12 : 10.5) / Math.sqrt(this.cam.scale));
        ctx.font = `${isFocused || isSelected ? 600 : 500} ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const labelY = n.y + r + 5.5;

        // Subtle dark text shadow for crisp legibility
        ctx.fillStyle = 'rgba(9, 11, 16, 0.88)';
        ctx.fillText(n.title, n.x + 0.8, labelY + 0.8);

        ctx.fillStyle = isFocused || isSelected ? '#ffffff' : 'rgba(226, 232, 240, 0.9)';
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

      // Smooth camera interpolation
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
        const nextScale = Math.max(0.45, Math.min(2.6, this.cam.scale * factor));
        const wx = (pos.x - this.width / 2 - this.cam.x) / this.cam.scale;
        const wy = (pos.y - this.height / 2 - this.cam.y) / this.cam.scale;
        this.cam.scale = nextScale;
        this.cam.x = pos.x - this.width / 2 - wx * nextScale;
        this.cam.y = pos.y - this.height / 2 - wy * nextScale;
      },
      { passive: false }
    );

    window.addEventListener('resize', () => {
      this.resize();
    });
  }
}
