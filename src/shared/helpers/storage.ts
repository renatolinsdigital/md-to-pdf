// localStorage throws when it is disabled (private mode, blocked cookies) or full.
// Persistence is a convenience, so these helpers degrade to "nothing stored" instead.

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Unavailable or full - the value simply won't survive a reload
  }
}
