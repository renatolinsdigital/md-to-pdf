# Getting Started

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

## Installation

```bash
git clone <repo-url>
cd md-to-pdf
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

Output is written to the `dist/` directory. Preview the production build:

```bash
npm run preview
```

## Running Tests

```bash
# Single run
npm test

# Watch mode
npm run test:watch
```

## Project Configuration

### Path Aliases

The project uses TypeScript path aliases for clean imports:

| Alias          | Path                     |
| -------------- | ------------------------ |
| `@/`           | `src/`                   |
| `@components/` | `src/shared/components/` |
| `@shared/`     | `src/shared/`            |
| `@styles/`     | `src/styles/`            |
| `@domain/`     | `src/domain/`            |
| `@pages/`      | `src/pages/`             |
| `@routes/`     | `src/routes/`            |

These are configured in both `vite.config.ts` (for bundling) and `tsconfig.json` (for TypeScript).

### SCSS Theme

Every SCSS module automatically has access to design tokens from `src/styles/theme.scss` via Vite's `css.preprocessorOptions.scss.additionalData`. No manual imports are needed.

### Environment

No `.env` files are required for basic development. The app runs entirely client-side.
