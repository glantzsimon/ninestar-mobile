export type RequestDiagnostic = {
  id: number; endpoint: string; generation: number; method: string;
  startedAt: number; elapsedMs?: number; status?: number;
  phase: 'headers' | 'body' | 'done'; outcome: string;
};
let rows: RequestDiagnostic[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
function publish() { listeners.forEach((listener) => listener()); }
export const requestDiagnostics = {
  getSnapshot: () => rows,
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  start(endpoint: string, method: string, generation: number) {
    const row: RequestDiagnostic = { id: ++nextId, endpoint, method, generation,
      startedAt: Date.now(), phase: 'headers', outcome: 'pending' };
    rows = [...rows.filter((item) => item.outcome === 'pending' || item.id > nextId - 30), row];
    publish();
    return row.id;
  },
  update(id: number, values: Partial<RequestDiagnostic>) {
    rows = rows.map((row) => row.id === id ? { ...row, ...values } : row);
    publish();
  },
};
