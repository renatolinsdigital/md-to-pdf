# Design System

## Design Tokens

All design tokens are defined in `src/styles/theme.scss` and automatically available to every SCSS module.

### Color Palette

| Token                | Value     | Usage           |
| -------------------- | --------- | --------------- |
| `$color-primary-600` | `#4f46e5` | Primary actions |
| `$color-primary-700` | `#4338ca` | Primary hover   |
| `$color-neutral-0`   | `#ffffff` | Backgrounds     |
| `$color-neutral-900` | `#111827` | Primary text    |
| `$color-success`     | `#10b981` | Success states  |
| `$color-error`       | `#ef4444` | Error states    |
| `$color-warning`     | `#f59e0b` | Warning states  |
| `$color-info`        | `#3b82f6` | Info states     |

### Typography

| Token               | Value                |
| ------------------- | -------------------- |
| `$font-family-sans` | Inter, system stack  |
| `$font-family-mono` | Fira Code, monospace |
| `$font-size-base`   | 1rem (16px)          |
| `$font-size-lg`     | 1.125rem             |
| `$font-size-2xl`    | 1.5rem               |
| `$font-size-4xl`    | 2.25rem              |

### Spacing Scale

Uses an 8px-based system: `$spacing-1` (0.25rem) through `$spacing-16` (4rem).

### Breakpoints

| Mixin                | Width    |
| -------------------- | -------- |
| `@include mobile`    | ≤ 640px  |
| `@include tablet`    | ≤ 768px  |
| `@include tablet-up` | ≥ 769px  |
| `@include desktop`   | ≥ 1024px |
| `@include wide`      | ≥ 1280px |

## Component Library

### Button

Variants: `primary`, `secondary`, `ghost`, `danger`  
Sizes: `sm`, `md`, `lg`  
Props: `fullWidth`, `disabled`

### Input / Textarea

Standard form controls with `label`, `error`, `fullWidth` props. Textarea adds a `mono` prop for monospace font.

### Toast

4 types: `success`, `error`, `warning`, `info`  
Auto-dismisses after 3 seconds with animated progress bar.

### ColorPicker

Click-to-open popover with `react-colorful` HexColorPicker and hex text input. Click-outside-to-close.

### Slider

Range input with label, value display, and optional unit suffix.

### Select

Styled `<select>` with custom chevron icon.
