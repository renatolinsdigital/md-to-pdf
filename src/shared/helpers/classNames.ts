/** Joins class names, skipping falsy entries so conditional classes can be written inline. */
export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
