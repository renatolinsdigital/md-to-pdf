/**
 * Parse an inline CSS style string into a key-value object.
 * e.g. "color: red; background-color: blue" → { color: 'red', backgroundColor: 'blue' }
 */
export function parseInlineStyle(styleString: string | undefined): Record<string, string> {
  if (!styleString) return {};

  const result: Record<string, string> = {};

  styleString.split(';').forEach((declaration) => {
    const [property, ...valueParts] = declaration.split(':');
    if (property && valueParts.length > 0) {
      const prop = property.trim();
      const value = valueParts.join(':').trim();
      if (prop && value) {
        // Convert kebab-case to camelCase
        const camelProp = prop.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
        result[camelProp] = value;
      }
    }
  });

  return result;
}

/**
 * Convert mm to PDF points (1mm ≈ 2.835pt)
 */
export function mmToPt(mm: number): number {
  const val = Number(mm);
  if (Number.isNaN(val)) return 0;
  return val * 2.835;
}
