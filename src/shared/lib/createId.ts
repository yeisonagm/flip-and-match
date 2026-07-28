// crypto.randomUUID() is undefined outside secure contexts — exactly what happens when
// the web build is served over plain HTTP on a school LAN.
export const createId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
