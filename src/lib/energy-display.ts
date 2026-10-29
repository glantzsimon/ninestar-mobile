export type EnergyDisplay = 'Graphical' | 'MagicSquare';
export function createEnergyDisplay() {
  let mode: EnergyDisplay = 'Graphical';
  const listeners = new Set<() => void>();
  function set(value: string) {
    if ((value !== 'Graphical' && value !== 'MagicSquare') || value === mode) return;
    mode = value; listeners.forEach(listener => listener());
  }
  return { get: () => mode, set, reset: () => set('Graphical'),
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; } };
}
