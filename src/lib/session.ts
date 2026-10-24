import type { Entitlements } from './entitlements';

type Session = {
  generation: number; identity: string | null;
  status: 'unknown' | 'changing' | 'signed-in' | 'signed-out';
  entitlements: Entitlements | null;
};

export function createSessionStore() {
  let state: Session = { generation: 0, identity: null, status: 'unknown', entitlements: null };
  let read = 0;
  let applied = 0;
  const listeners = new Set<() => void>();
  function publish(next: Session) { state = next; listeners.forEach((listener) => listener()); }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    beginRead: () => ({ generation: state.generation, read: ++read }),
    change(status: 'changing' | 'signed-out' = 'signed-out') {
      if (status === 'signed-out' && state.status === status) return;
      publish({ generation: state.generation + 1, identity: null, entitlements: null, status });
    },
    signedOut(generation: number) {
      if (generation === state.generation) publish({ ...state, identity: null, entitlements: null, status: 'signed-out' });
    },
    clearEntitlements(generation: number, request = ++read) {
      if (generation === state.generation && request >= applied) {
        applied = request;
        publish({ ...state, entitlements: null });
      }
    },
    acceptAccount(ticket: { generation: number; read: number }, identity: string, entitlements: Entitlements, login = false) {
      if (ticket.generation !== state.generation || ticket.read < applied ||
        (!login && (state.status === 'changing' || state.status === 'signed-out'))) return false;
      applied = ticket.read;
      // Email is only a session-change marker; the server owns identity and permissions.
      const changed = state.identity !== null && identity !== state.identity;
      publish({ generation: state.generation + (changed ? 1 : 0), identity, entitlements, status: 'signed-in' });
      return true;
    },
    acceptEntitlements(ticket: { generation: number; read: number }, entitlements: Entitlements) {
      if (ticket.generation !== state.generation || ticket.read < applied || state.status !== 'signed-in') return false;
      applied = ticket.read;
      publish({ ...state, entitlements });
      return true;
    },
  };
}

// Memory only: never persist access, cookies, profile drafts or provider evidence.
export const session = createSessionStore();
