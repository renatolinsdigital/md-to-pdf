# Architecture

## Overview

MD to PDF follows a layered architecture with clear separation of concerns:

```
┌──────────────────────────────────────────────┐
│                   Pages                       │
│          (Home, Converter, About)             │
├──────────────────────────────────────────────┤
│               Domain Layer                    │
│   Components │ Hooks │ Helpers                │
├──────────────────────────────────────────────┤
│             Shared Components                 │
│   Button │ Input │ Textarea │ Toast │ ...     │
├──────────────────────────────────────────────┤
│              Styles & Tokens                  │
│          theme.scss │ global-styles.scss       │
└──────────────────────────────────────────────┘
```

## Routing

Routes are defined in `src/routes/routeConfig.tsx` using React Router v7. All page components are **lazy-loaded** via `React.lazy()` for code splitting.

| Path         | Page      | Description                |
| ------------ | --------- | -------------------------- |
| `/`          | Home      | Landing page               |
| `/converter` | Converter | Main markdown editor + PDF |
| `/about`     | About     | Project info + contact     |

## Rendering Pipeline

The live preview and the downloaded file come from the same PDF, so the preview is exactly what you get:

```
Markdown string → parseMarkdown (unified: remark-parse → remark-gfm → remark-rehype → rehype-raw) → HAST
                                                                                                    ↓
                                    renderPdf service: resolveImages + rasterizePattern → PdfDocument
                                                                                                    ↓
                                                              hastToPdf walker → @react-pdf primitives → PDF blob
                                                                                                    ↓
                                 Live preview: useLivePdf (debounced) → PdfCanvasViewer (pdf.js page images)
                                 Download:     usePdfGenerator → file download
```

If a render fails (typically an image the renderer can't decode), `renderPdf` retries once without images.

The custom `hastToPdf` walker recursively converts HAST (Hypertext Abstract Syntax Tree) nodes into `@react-pdf/renderer` components, supporting:

- Headings (h1–h6) with scaled font sizes
- Paragraphs, bold, italic, strikethrough
- Ordered, unordered and task lists (with bullet/number/checkbox prefixes)
- Code blocks (syntax-highlighted with refractor, One Dark colours)
- Blockquotes (left border + indentation)
- Tables (header row + bordered cells)
- Links (blue, underlined)
- Images
- Inline colored text via `<span style="color:...">`
- Horizontal rules

## State Management

- **No global store** — state is managed via React hooks + context
- `useConverterSettings` — persists settings to localStorage
- `useMarkdownParser` — memoized HAST parsing
- `useLivePdf` — debounced PDF re-rendering for the live preview
- `usePdfGenerator` — renders the PDF and downloads it
- `useUndoRedo` — editor history and its keyboard shortcuts
- `useToast` (`shared/hooks`) — toast notification context

## Font Strategy

Roboto font (4 variants: regular, bold, italic, bold-italic) is registered via `@react-pdf/renderer`'s `Font.register()` from jsDelivr CDN. Courier (built-in) is used for code blocks.
