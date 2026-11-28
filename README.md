# Mental Tree & Deep Research Atlas

An interactive static web application by Mohammed KM mapping 53 ideas drawn only from his own essays and notes, a four-question idea check, and his 33 published essays.

## Features

1. **Interactive Force-Directed Knowledge Graph**
   - 53 ideas, each sourced from his own essays or notes, across 6 domains: AI & Computing, Physics & Energy, Biology & Longevity, Economics & Strategy, Systems & Epistemology, and Character & Craft.
   - HiDPI HTML5 Canvas force simulation with smooth pan, zoom, node dragging, domain filtering, instant search (`/` shortcut), hover highlighting of cross-domain bridges, and a slide-over concept drawer (core principle, source essay or notes topic, practical application, and clickable connected nodes).

2. **4-Lens First-Principles Stress-Tester (100% Client-Side)**
   - Zero external API keys or network calls required.
   - Evaluates preset venture theses (AI Wrapper SaaS, EV Battery Swap Network, Longevity Clinic, Autonomous Robotics Fleet, Industrial Solar Microgrid) or any custom user-entered thesis across four lenses:
     - **Reason** — is the reason solid? (good explanation test)
     - **Risk** — what could break it? (risk and fragility)
     - **Simplicity** — what can you cut? (first principles, delete before automating)
     - **Systems** — does it change the rules, not just the numbers? (systems thinking)
   - Interactive 16-point diagnostic rubric with live composite scoring, SVG radar breakdown, verdict classification, and Markdown brief export.

3. **Essays**
   - His 33 published essays from mohammed-km.in, grouped by topic, each linked to the ideas on the map it explains.

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
