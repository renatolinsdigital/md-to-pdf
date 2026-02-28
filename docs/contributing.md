# Contributing

## Development Workflow

1. Create a feature branch from `main`
2. Make changes following the code guidelines below
3. Run tests: `npm test`
4. Run lint: `npm run lint`
5. Commit — Husky will run lint-staged automatically
6. Open a pull request

## Code Guidelines

### Component Rules

- One component per file
- Use **SCSS Modules** (`.module.scss`) for styling — no inline styles, no CSS-in-JS
- Use **named exports** (no default exports)
- Co-locate component, styles, and tests in the same folder:
  ```
  Button/
  ├── Button.tsx
  ├── Button.module.scss
  └── Button.test.tsx
  ```

### TypeScript

- Strict mode is enabled
- Use `interface` for component props (not `type`)
- Use path aliases (`@/`, `@shared/`, `@domain/`, etc.) for imports
- No `any` types — use `unknown` if the type is genuinely unknown

### Styling

- Design tokens from `theme.scss` are auto-imported — use variables like `$color-primary-600`
- Use responsive mixins: `@include mobile { ... }`, `@include desktop { ... }`
- Prefer `color.adjust()` over deprecated `darken()`/`lighten()`

### Testing

- Test files live next to the source: `Component.test.tsx`
- Use Vitest + Testing Library
- Test user-visible behavior, not implementation details
- Aim for meaningful coverage, not 100% line coverage

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add page size selection
fix: correct margin calculation in PDF
docs: update architecture diagram
test: add Button variant tests
```

## Pre-commit Hooks

Husky + lint-staged runs automatically on `git commit`:

- `*.{ts,tsx}` → ESLint fix + Prettier format
- `*.{scss,css,json,md}` → Prettier format
