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

test('UI artwork uses exact default URLs in both themes, while diagram dark variants remain supported', () => {
  const c = catalogue();
  const url = 'https://media.example/gold.png?v=server-revision&size=original';
  c.assets['ui.constitution'] = { group: 'ui', variants: {
    default: variant(url), dark: variant('https://media.example/unused-dark.png') } };
  for (const dark of [false, true]) {
    assert.equal(resolveArtwork(c, 'ui.constitution', dark).uri, url);
    assert.equal(resolveArtwork(c, 'ui.constitution', dark).cacheKey, url);
  }
  assert.match(resolveArtwork(c, 'energy', true).uri, /dark/);
  assert.equal(resolveArtwork(c, 'ui.unregistered', true), undefined);
});

test('old catalogues retain UI fallbacks, then prefer deployed canonical assets without constructing URLs', () => {
  const c = catalogue();
  c.assets['ui.solar-nature'] = { group: 'ui', variants: { default: variant('https://old/solar.png?v=old') } };
  c.assets['ui.lunar-nature'] = { group: 'ui', variants: { default: variant('https://old/lunar.png?v=old') } };
  c.assets['company.logo-notext'] = { group: 'company', variants: { default: variant('https://old/logo.png?v=old') } };
  assert.equal(resolveArtwork(c, 'ui.constitution', true).uri, 'https://old/solar.png?v=old');
  assert.equal(resolveArtwork(c, 'ui.character', true).uri, 'https://old/lunar.png?v=old');
  assert.equal(resolveArtwork(c, 'ui.origins', true).uri, 'https://old/logo.png?v=old');
  c.assets['ui.constitution'] = { group: 'ui', variants: { default: variant('https://new/constitution.png?v=new') } };
  assert.equal(resolveArtwork(c, 'ui.constitution', true).uri, 'https://new/constitution.png?v=new');
  assert.equal(resolveArtwork(null, 'ui.constitution', true), undefined);
});

test('explicit post-deployment refresh retains the ETag and switches revision-bearing image cache keys', async () => {
  const first = catalogue(), next = catalogue();
  first.assets['ui.personal-chart'] = { group: 'ui', variants: { default: variant('https://media/chart.png?v=old') } };
  next.version = 'b'.repeat(64);
  next.assets['ui.personal-chart'] = { group: 'ui', variants: { default: variant('https://media/chart.png?v=new') } };
  const f = fixture([response(200, first), response(200, next), response(304, next)]);
  const old = await f.client.refresh('https://api');
  const refreshed = await f.client.refresh('https://api', true);
  assert.equal(f.calls[1].options.headers['If-None-Match'], 'W/"tag"');
  assert.equal(f.calls[1].options.credentials, 'omit');
  assert.notEqual(resolveArtwork(old, 'ui.personal-chart', true).cacheKey,
    resolveArtwork(refreshed, 'ui.personal-chart', true).cacheKey);
  assert.equal(await f.client.refresh('https://api', true), refreshed);
  assert.equal(f.calls[2].options.headers['If-None-Match'], 'W/"tag"');
});
