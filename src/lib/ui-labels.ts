import { uiLabelBootstrap } from './ui-label-bootstrap';
import { API_BASE_URL } from './api-environment';

type Catalogue = typeof uiLabelBootstrap;
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

// Validate the complete approved schema before publishing. Never merge partial
// languages or replace a good catalogue with an incomplete response.
function matches(value: unknown, sample: unknown): boolean {
  if (typeof sample === 'string') return typeof value === 'string' && (sample === '' || value.trim().length > 0);
  if (typeof sample === 'number') return value === sample;
  if (Array.isArray(sample)) return Array.isArray(value) && value.length === sample.length &&
    sample.every((entry, index) => matches(value[index], entry));
  return object(sample) && object(value) && Object.keys(sample).every(key => matches(value[key], sample[key]));
}

export function parseUiLabels(value: unknown): Catalogue | null {
  if (!object(value) || value.version !== 1 || typeof value.culture !== 'string') return null;
  const calculator = object(value.shared) && object(value.shared.calculator) ? value.shared.calculator : null;
  const periods = calculator?.displayDataForPeriods;
  if (!Array.isArray(periods) || periods.length !== 2 || !object(periods[0]) || !object(periods[1]) ||
    periods[0].value !== 'Now' || periods[0].number !== 0 || periods[1].value !== 'SelectedDate' || periods[1].number !== 1) return null;
  // Culture is authoritative and may be empty under invariant .NET culture.
  return matches({ ...value, culture: uiLabelBootstrap.culture }, uiLabelBootstrap) ? value as Catalogue : null;
}

export function createUiLabelStore(environment: string) {
  let active: Catalogue = uiLabelBootstrap;
  let revision = 0;
  const catalogues = new Map<string, Catalogue>();
  const listeners = new Set<() => void>();
  const key = (data: Catalogue) => JSON.stringify([environment, data.culture, data.version]);
  catalogues.set(key(active), active);
  return {
    getSnapshot: () => revision,
    getCatalogue: () => active,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    accept(value: unknown) {
      const next = parseUiLabels(value);
      if (!next) return false;
      // Capture validated public data; callers cannot mutate live labels later.
      const copy = JSON.parse(JSON.stringify(next)) as Catalogue;
      catalogues.set(key(copy), copy);
      active = copy;
      revision++;
      listeners.forEach(listener => listener());
      return true;
    },
  };
}

// The runtime environment is explicit. Other environments get separate stores.
export const uiLabelStore = createUiLabelStore(API_BASE_URL);
export function uiLabel(path: string): string {
  const value = path.split('.').reduce<unknown>((current, key) => object(current) ? current[key] : undefined,
    uiLabelStore.getCatalogue());
  return typeof value === 'string' ? value : '';
}
