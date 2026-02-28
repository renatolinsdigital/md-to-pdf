# MD to PDF

A production-grade Markdown-to-PDF converter built with React, Vite, TypeScript, and SCSS Modules.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Live Preview** — See your Markdown rendered in real-time as you type
- **Rich Formatting Toolbar** — Bold, italic, headings, lists, code blocks, links, images and more
- **Colored Text** — Apply text colors via inline `<span style="color:...">` HTML
- **Vector PDF Export** — Generates true vector PDFs with selectable text via `@react-pdf/renderer`
- **Custom Styling** — Configure background color, text color, page margins, and page size
- **Page Numbering** — Automatic "Page X of Y" footers with configurable labels
- **GFM Support** — Tables, strikethrough, task lists via `remark-gfm`
- **Responsive Design** — Works on desktop and mobile

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start Vite dev server                |
| `npm run build`      | Type-check and build for production  |
| `npm run preview`    | Preview the production build locally |
| `npm test`           | Run unit tests (Vitest)              |
| `npm run test:watch` | Run tests in watch mode              |
| `npm run lint`       | Lint with ESLint                     |
| `npm run format`     | Format with Prettier                 |

## Project Structure

```
src/
├── app/              # App shell (App.tsx, App.module.scss)
├── domain/           # Business logic
│   ├── components/   # Domain-specific components (FormattingToolbar, MarkdownPreview, etc.)
│   ├── helpers/      # Pure functions (hastToPdf, parseInlineStyle, fontRegistration)
│   └── hooks/        # Custom hooks (useConverterSettings, useMarkdownParser, usePdfGenerator)
├── pages/            # Route pages (Home, Converter, About)
├── routes/           # Route configuration with lazy loading
├── shared/           # Reusable UI components (Button, Input, Textarea, Toast, etc.)
├── styles/           # Global styles and design tokens (theme.scss)
└── tests/            # Test setup
```

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: SCSS Modules with design token system
- **PDF Generation**: @react-pdf/renderer (vector PDF)
- **Markdown Parsing**: unified + remark-parse + remark-gfm + remark-rehype + rehype-raw
- **Preview**: react-markdown + react-syntax-highlighter
- **Routing**: React Router v7 (lazy-loaded routes)
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint 9 (flat config) + Prettier + Husky + lint-staged

## Documentation

- [Getting Started](docs/getting_started.md)
- [Architecture](docs/architecture.md)
- [Design System](docs/design.md)
- [Contributing](docs/contributing.md)
- [Code Quality](docs/code_quality.md)

## License

MIT
