// Field identities are internal paths, never display labels or API parameters.
export class FieldValidationError extends Error {
  constructor(public readonly field: string, message: string) { super(message); }
}
export type FieldErrors = Record<string, string>;

export function withFieldPrefix<T>(prefix: string, operation: () => T): T {
  try { return operation(); }
  catch (error) {
    if (error instanceof FieldValidationError) throw new FieldValidationError(`${prefix}.${error.field}`, error.message);
    throw error;
  }
}
