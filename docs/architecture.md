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

## Dual Rendering Architecture

The converter uses two independent rendering pipelines from the same markdown source:

### Browser Preview (react-markdown)

```
Markdown string → react-markdown → remark-gfm → rehype-raw → React DOM
```

This renders a live preview using standard HTML elements with SCSS styling.

### PDF Generation (@react-pdf/renderer)

```
Markdown string → unified → remark-parse → remark-gfm → remark-rehype → rehype-raw → HAST
                                                                                        ↓
                                                                              hastToPdf walker
                                                                                        ↓
                                                                        @react-pdf primitives
                                                                    (Document, Page, View, Text, Link, Image)
```

The custom `hastToPdf` walker recursively converts HAST (Hypertext Abstract Syntax Tree) nodes into `@react-pdf/renderer` components, supporting:

- Headings (h1–h6) with scaled font sizes
- Paragraphs, bold, italic, strikethrough
- Ordered and unordered lists (with bullet/number prefixes)
- Code blocks (monospace font, grey background)
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
- `usePdfGenerator` — handles PDF blob generation + download
- `useToast` — toast notification context

## Font Strategy

Roboto font (4 variants: regular, bold, italic, bold-italic) is registered via `@react-pdf/renderer`'s `Font.register()` from jsDelivr CDN. Courier (built-in) is used for code blocks.
