# Xixiang Nie PhD Research Plan

An interactive, week-by-week Gantt chart for the 2026–2029 doctoral research plan on the social roles of object-based urban AI robots.

## Live website

[Open the interactive Gantt chart](https://a1denxx1.github.io/Research-Plan-Gantt-chart/)

The public GitHub Pages version is view-only: visitors can explore years, open task details, browse the timeline and export it as PDF. Owner editing remains available in the local/Sites development version because it relies on a private server-side database.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

## Builds

```bash
npm run build
npm run build:github
```

- `npm run build` validates the full Sites version.
- `npm run build:github` creates the static GitHub Pages site in `github-dist/`.

Every push to `main` automatically publishes the static site through GitHub Actions.
