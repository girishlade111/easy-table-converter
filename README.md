# Easy Table Converter

A free, client-side web tool that converts tabular data between popular formats. Paste a table (or load sample data), pick a target format, and copy or download the converted output — all in the browser, with no sign-up and no server.

## What it does

- **Input:** paste tabular data, type it in an editable grid, or load built-in sample data.
- **Convert:** one click transforms the table into the selected output format.
- **Output:** live preview, copy-to-clipboard, and download of the converted text.
- **Guided flow:** step bar (Input → Convert → Output) plus a How-to-Use panel.
- **Multi-language UI:** English and Japanese (i18n toggle in `lib/i18n/translations.ts`).
- **Table history:** recently converted tables are remembered via `useTableHistory`.
- Cell selection helpers for copying ranges (`useTableSelection`).

## Supported formats

| Format     | Extension(s) | Notes                          |
|------------|--------------|--------------------------------|
| CSV        | `.csv`       | comma-separated                |
| TSV        | `.tsv`       | tab-separated                  |
| Markdown   | `.md`        | GitHub-style tables            |
| HTML       | `.html`      | full `<table>` markup          |
| JSON       | `.json`      | array of row objects           |
| SQL        | `.sql`       | `INSERT INTO sample_table …`   |
| YAML       | `.yml` / `.yaml` |                            |
| XML        | `.xml`       |                                |
| LaTeX      | `.tex`       | tabular environment            |
| ASCII      | `.txt`       | plain-text table               |
| Excel      | —            | Excel-pasteable format         |

Parsing input and generating output is pure client-side code in `lib/formatGenerators.ts` and the `useTableParsers` hook — nothing ever leaves the browser.

## Features

- Editable input grid with live conversion preview
- Copy and download output in one click
- Input parsers for pasted spreadsheets / delimited text
- Conversion history (localStorage-backed)
- Japanese + English UI
- Dark/light theme (next-themes)
- Responsive layout, shadcn/ui components

## Tech stack

| Layer        | Technology                                |
|--------------|-------------------------------------------|
| Framework    | Next.js 15.2.4 (App Router)               |
| UI library   | React 19                                  |
| Styling      | Tailwind CSS 3.4, `tailwindcss-animate`   |
| Components   | Radix UI + shadcn/ui                      |
| Theming      | next-themes                               |
| Fonts        | Geist (via `geist` package)               |
| Analytics    | `@vercel/analytics`                       |
| Language     | TypeScript                                |

## Quick start

```bash
npm install --legacy-peer-deps
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Project structure

```
.
├── app/
│   ├── page.tsx              # main converter page
│   ├── layout.tsx            # root layout
│   ├── loading.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx            # app header + language toggle
│   ├── StepBar.tsx           # Input → Convert → Output steps
│   ├── InputPanel.tsx        # paste/type/sample-data input
│   ├── OutputPanel.tsx       # format picker + converted output
│   ├── PreviewPanel.tsx      # live table preview
│   ├── TableView.tsx         # editable data grid
│   ├── HowToUse.tsx          # usage guide
│   ├── theme-provider.tsx
│   └── ui/                   # shadcn/ui primitives
├── hooks/
│   ├── useTableParsers.ts    # input parsing logic
│   ├── useTableHistory.ts    # conversion history
│   ├── useTableSelection.ts  # cell selection
│   ├── useLanguage.ts        # i18n state
│   └── use-toast.ts
├── lib/
│   ├── formatGenerators.ts   # all output-format generators
│   ├── i18n/translations.ts  # English + Japanese strings
│   ├── constants/            # format list, sample data
│   └── types.ts
├── public/
└── next.config.mjs           # `output: "export"` + unoptimized images
```

## Environment variables

None required.

## Deployment notes

- **Fully static** — no API routes, no server actions, no secrets. Host anywhere.
- `next.config.mjs` sets `output: "export"` and `images.unoptimized: true`; `npm run build` emits a static site in `out/`.
- This repo is deployed to GitHub Pages: https://girishlade111.github.io/easy-table-converter/
- Note: `basePath: "/easy-table-converter"` is set so assets resolve under the GitHub Pages subpath. Remove it from `next.config.mjs` if you deploy to a domain root / Vercel instead.

---

Built by Girish Lade · [ladestack.in](https://ladestack.in)
