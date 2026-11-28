# Mental Tree & Idea Atlas

Live: [explore.mohammed-km.in](https://explore.mohammed-km.in/)

A map of 53 ideas taken only from Mohammed KM's own essays and notes, a four-question check for any business idea, and his 33 published essays. Everything runs in the browser.

## What is on the page

1. **Idea map**
   - 53 ideas in 6 topics: AI & Computers, Physics & Energy, Biology & Health, Business & Money, Thinking & Knowing, and Character & Habits. Each idea names the essay or notes topic it came from.
   - A canvas force layout (dots push apart, links pull together). You can pan, zoom, drag dots, filter by topic and search (press `/`). Clicking a dot opens a side drawer with the idea in one line, the longer explanation, where it came from, how to use it, and its linked ideas.
   - "Connect two ideas" finds the shortest chain of links between any two dots. "Add your own idea" drops a temporary dot that links to the ideas sharing the most words with it.

2. **Idea check (no server, no API keys)**
   - Five worked examples (AI paperwork tool, battery swap stations, Longevity Clinic, warehouse robots, factory solar and batteries), or type your own idea.
   - Four questions, each worth 25 points:
     - **Reason:** is the reason solid? (the good explanation test)
     - **Risk:** what could break it? (risk and fragility)
     - **Simplicity:** what can you cut? (first principles: delete steps before automating)
     - **Systems:** does it change the rules, or only the numbers? (systems thinking)
   - 16 checklist items in total. Ticking a box updates the score, the radar chart and the verdict at once, and the summary can be copied as Markdown.

3. **Essays**
   - The 33 essays from [mohammed-km.in](https://www.mohammed-km.in/), grouped by topic. Each one links to the ideas on the map it explains.

## How it is built

- Vite with plain ES modules, no UI framework.
- Light editorial look: Caudex serif headings, Inter body text, JetBrains Mono for numbers. No emojis.
- Public content only. No personal records or identifiers.

## Run it locally

```bash
npm install
npm run dev      # local dev server
npm run build    # production bundle in ./dist
npm run preview  # serve the built bundle
```
