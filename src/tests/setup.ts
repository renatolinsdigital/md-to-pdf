import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement DOMMatrix, but pdfjs-dist references it at module
// load time. A no-op stub is enough since tests never exercise canvas transforms.
if (typeof globalThis.DOMMatrix === 'undefined') {
  class DOMMatrixStub {}
  globalThis.DOMMatrix = DOMMatrixStub as unknown as typeof DOMMatrix;
}
