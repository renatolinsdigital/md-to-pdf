/**
 * Parse an inline CSS style string into a key-value object.
 * e.g. "color: red; background-color: blue" → { color: 'red', backgroundColor: 'blue' }
 */
export function parseInlineStyle(styleString: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!styleString) return result;

  for (const declaration of styleString.split(';')) {
    const separator = declaration.indexOf(':');
    if (separator === -1) continue;

    const property = declaration.slice(0, separator).trim();
    const value = declaration.slice(separator + 1).trim();
    if (property && value) {
      const camelCaseProperty = property.replace(/-([a-z])/g, (_, letter: string) =>
        letter.toUpperCase(),
      );
      result[camelCaseProperty] = value;
    }
  }

  return result;
}
