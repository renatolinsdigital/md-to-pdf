# Code Quality

## Linting

ESLint 9 with flat config (`eslint.config.js`):

- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules
- `eslint-plugin-react-hooks` for hooks rules
- `eslint-plugin-react-refresh` for HMR compatibility
- `eslint-config-prettier` to avoid conflicts with Prettier

Run manually:

```bash
npm run lint
```

## Formatting

Prettier with the following settings (`.prettierrc`):

| Setting         | Value  |
| --------------- | ------ |
| `singleQuote`   | `true` |
| `semi`          | `true` |
| `trailingComma` | `all`  |
| `printWidth`    | `100`  |
| `tabWidth`      | `2`    |
| `endOfLine`     | `auto` |

Run manually:

```bash
npm run format        # fix
npm run format:check  # check only
```

## Testing

Vitest with Testing Library and jsdom environment.

- **Setup file**: `src/tests/setup.ts` (imports `@testing-library/jest-dom/vitest`)
- **Config**: in `vite.config.ts` under `test` block
- **CSS**: enabled (`css: true`) so SCSS module classnames are available in tests

```bash
npm test              # single run
npm run test:watch    # watch mode
```

## Git Hooks

Husky v9 with lint-staged:

- **pre-commit**: runs `lint-staged`
  - TypeScript files → ESLint fix + Prettier
  - Style/config/docs files → Prettier

## Type Checking

TypeScript strict mode with `noEmit` for type-only checking:

```bash
npx tsc --noEmit
```

Build also runs type checking: `tsc -b && vite build`.
