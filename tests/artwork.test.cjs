const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-library.cjs')();
const { createArtworkClient, resolveArtwork, parseArtwork } = load('artwork-catalogue');
const hash = 'a'.repeat(64);
const variant = (url) => ({ url, revision: hash, contentType: 'image/png', width: 64, height: 64 });
const catalogue = (host = 'one') => ({ version: hash, assets: {
  energy: { group: 'test', variants: { default: variant(`https://${host}/default?v=${hash}`), dark: variant(`https://${host}/dark?v=${hash}`) } },
  shared: { group: 'test', variants: { default: variant(`https://${host}/default?v=${hash}`) } },
} });
const response = (status, data = catalogue()) => ({ status, headers: { get: () => 'W/"tag"' },
  json: async () => ({ success: true, data }) });
function fixture(replies, saved = null) {
  let time = 1000000;
  const calls = [], disk = new Map(saved ? [['https://api', saved]] : []);
  const client = createArtworkClient({ now: () => time, storage: {
    read: async (key) => disk.get(key), write: async (key, value) => { disk.set(key, value); },
  }, fetcher: async (url, options) => {
    calls.push({ url, options });
    const next = replies.shift();
    if (next instanceof Error) throw next;
    if (!next) throw new Error('Unexpected fetch');
    return next;
  } });
  return { client, calls, disk, expire: () => { time += 300001; } };
}
test('first load is public, stored with validator, fresh calls reuse and expired calls conditionally reuse 304', async () => {
  const f = fixture([response(200), response(304)]);
  const first = await f.client.refresh('https://api');
  assert.equal(f.calls[0].options.credentials, 'omit');
  assert.equal(f.calls[0].options.headers['If-None-Match'], undefined);
  assert.equal(await f.client.refresh('https://api'), first);
  assert.equal(f.calls.length, 1);
  f.expire();
  assert.equal(await f.client.refresh('https://api'), first);
  assert.equal(f.calls[1].options.headers['If-None-Match'], 'W/"tag"');
});
test('unexpected 304 without body retries once unconditionally', async () => {
  const f = fixture([response(304), response(200)]);
  assert.ok(await f.client.refresh('https://api'));
  assert.equal(f.calls.length, 2);
  assert.ok(f.calls.every((call) => !call.options.headers['If-None-Match']));
});
test('changed host replaces catalogue and image cache key', async () => {
  const changed = catalogue('two'); changed.version = 'b'.repeat(64);
  const f = fixture([response(200), response(200, changed)]);
  const first = await f.client.refresh('https://api'); f.expire();
  const next = await f.client.refresh('https://api');
  assert.notEqual(first.version, next.version);
  assert.notEqual(resolveArtwork(first, 'energy', true).cacheKey, resolveArtwork(next, 'energy', true).cacheKey);
});
test('refresh failure retains last good data; cold failures return null and are throttled', async () => {
  const f = fixture([response(200), new Error('offline')]);
  const first = await f.client.refresh('https://api'); f.expire();
  assert.equal(await f.client.refresh('https://api'), first);
  const cold = fixture([new Error('offline')]);
  assert.equal(await cold.client.refresh('https://api'), null);
  assert.equal(await cold.client.refresh('https://api'), null);
  assert.equal(cold.calls.length, 1);
});
test('persisted body and ETag restore together; environments never share validators', async () => {
  const f = fixture([response(304), response(200)], { catalogue: catalogue(), etag: 'W/"saved"', checkedAt: 1 });
  assert.ok(await f.client.refresh('https://api'));
  assert.equal(f.calls[0].options.headers['If-None-Match'], 'W/"saved"');
  await f.client.refresh('https://other');
  assert.equal(f.calls[1].options.headers['If-None-Match'], undefined);
  assert.equal(f.disk.size, 2);
});
test('concurrent consumers share one request', async () => {
  const f = fixture([response(200)]);
  await Promise.all([f.client.refresh('https://api'), f.client.refresh('https://api')]);
  assert.equal(f.calls.length, 1);
});
test('dark/default selection, missing IDs and identical-content URL sharing', () => {
  const c = catalogue();
  assert.match(resolveArtwork(c, 'energy', true).uri, /dark/);
  assert.equal(resolveArtwork(c, 'shared', true).uri, resolveArtwork(c, 'energy', false).uri);
  assert.equal(resolveArtwork(c, 'shared', true).cacheKey, resolveArtwork(c, 'energy', false).cacheKey);
  assert.equal(resolveArtwork(c, 'missing', true), undefined);
  assert.equal(resolveArtwork(null, 'energy', true), undefined);
});
test('invalid cache body cannot send its orphaned ETag', async () => {
  const f = fixture([response(200)], { catalogue: {}, etag: 'bad', checkedAt: 1 });
  await f.client.refresh('https://api');
  assert.equal(f.calls[0].options.headers['If-None-Match'], undefined);
  assert.throws(() => parseArtwork({ version: hash, assets: { bad: { group: 'x', variants: { default: variant('javascript:bad') } } } }));
});
test('deadline bounds a fetch that ignores abort', async () => {
  const c = createArtworkClient({ storage: { read: async () => null, write: async () => {} },
    fetcher: () => new Promise(() => {}), timeoutMs: 5 });
  assert.equal(await c.refresh('https://api'), null);
});
