# Mental Tree & Deep Research Atlas

An interactive static web application by Mohammed KM mapping 48 cross-domain mental models, a deterministic 4-lens first-principles startup stress-tester, and a 17-volume canonical bookshelf.

## Features

1. **Interactive Force-Directed Knowledge Graph**
   - 48 curated public-safe mental models across 6 domains: AI & Computing, Physics & Energy, Biology & Longevity, Economics & Strategy, Systems & Epistemology, and Character & Craft.
   - HiDPI HTML5 Canvas force simulation with smooth pan, zoom, node dragging, domain filtering, instant search (`/` shortcut), hover highlighting of cross-domain bridges, and a slide-over concept drawer (core principle, source book/research theme, practical application, and clickable connected nodes).

2. **4-Lens First-Principles Stress-Tester (100% Client-Side)**
   - Zero external API keys or network calls required.
   - Evaluates preset venture theses (AI Wrapper SaaS, EV Battery Swap Network, Longevity Clinic, Autonomous Robotics Fleet, Industrial Solar Microgrid) or any custom user-entered thesis across four lenses:
     - **David Deutsch** — Hard-to-Vary Test
     - **Nassim Taleb** — Fragility & Tail Risk
     - **Elon Musk** — 5-Step Deletion Algorithm
     - **Donella Meadows** — System Leverage Points
   - Interactive 16-point diagnostic rubric with live composite scoring, SVG radar breakdown, verdict classification, and Markdown brief export.

3. **Canonical Bookshelf Strip**
   - Clean visual index of 17 foundational volumes with one-line mental-model takeaways and one-click illumination of linked nodes inside the Observatory Graph.

## Architecture

- Built with Vite and modular vanilla ES modules (zero runtime framework bloat).
- Dark editorial observatory aesthetic (`#090b10` obsidian canvas, Caudex/Georgia serif headings, Inter body typography, JetBrains Mono telemetry, zero emojis).
- Strictly public-safe intellectual content with zero personal identifiers or private records.

## Development & Build

```bash
npm install
npm run dev      # local development server
npm run build    # outputs production bundle to ./dist
npm run preview  # preview production build locally
```
