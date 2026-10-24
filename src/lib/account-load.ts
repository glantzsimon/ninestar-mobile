// Hold the screen's loading guard until all sibling requests have settled.
// Promise.all alone releases it early on failure, allowing overlapping retries.
export async function settleAccountLoad<A, B, C>(requests: [Promise<A>, Promise<B>, Promise<C>]): Promise<[A, B, C]> {
  const results = await Promise.allSettled(requests);
  for (const result of results) if (result.status === 'rejected') throw result.reason;
  return results.map((result) => (result as PromiseFulfilledResult<unknown>).value) as [A, B, C];
}
