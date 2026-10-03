const POINTS_PER_MM = 72 / 25.4;

/** Converts millimetres to PDF points. Non-numeric input (e.g. corrupted saved settings) yields 0. */
export function mmToPt(mm: number): number {
  const value = Number(mm);
  return Number.isNaN(value) ? 0 : value * POINTS_PER_MM;
}
