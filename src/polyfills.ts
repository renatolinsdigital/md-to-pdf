// @react-pdf/renderer expects Node's Buffer global, which browsers don't provide
import { Buffer } from 'buffer';

const globals = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
globals.Buffer ??= Buffer;
