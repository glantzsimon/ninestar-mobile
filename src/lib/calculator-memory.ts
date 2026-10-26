import type { CalculationDraft } from './calculation';

type Storage = { read: () => Promise<unknown>; write: (value: unknown) => Promise<void> };
const fields: (keyof CalculationDraft)[] = ['name', 'dateOfBirth', 'timeOfBirth', 'timeOfBirthKnown',
  'gender', 'birthTimeZoneId', 'userTimeZoneId', 'calculationMethod', 'calculatorType',
  'housesDisplay', 'invertNatal', 'invertCycles', 'selectedDate', 'selectedTime'];
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

function inputs(value: unknown): CalculationDraft | null {
  const raw = object(value);
  if (fields.some((field) => typeof raw[field] !== 'string' || (raw[field] as string).length > 200)) return null;
  // Explicit allowlist: never retain account data, credentials, results or access.
  return Object.fromEntries(fields.map((field) => [field, raw[field]])) as CalculationDraft;
}

export function createCalculatorMemory(storage: Storage) {
  let pending = Promise.resolve();
  async function entries() {
    try {
      const saved = object(await storage.read());
      return saved.version === 1 ? object(saved.entries) : {};
    } catch { return {}; }
  }
  const key = (environment: string, identity: string, calculator: string) => JSON.stringify([environment, identity, calculator]);
  return {
    async read(environment: string, identity: string, calculator: string): Promise<CalculationDraft | null> {
      await pending;
      return inputs((await entries())[key(environment, identity, calculator)]);
    },
    remember(environment: string, identity: string, calculator: string, draft: CalculationDraft): Promise<void> {
      const copy = inputs(draft);
      if (!identity || !copy) return Promise.resolve();
      // Serialize updates so fast edits or different calculators cannot overwrite
      // a newer write. Scope is captured before any asynchronous storage work.
      pending = pending.then(async () => {
        const saved = await entries();
        saved[key(environment, identity, calculator)] = copy;
        await storage.write({ version: 1, entries: saved });
      }).catch(() => {}); // Storage failure must not block the calculator.
      return pending;
    },
  };
}
