const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

module.exports = function library(globals = {}) {
  const cache = new Map();
  function load(name) {
    const filename = path.resolve(__dirname, '../src/lib', `${name}.ts`);
    if (cache.has(filename)) return cache.get(filename);
    const exports = {};
    cache.set(filename, exports);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(compiled, { exports, AbortController, setTimeout, clearTimeout,
      ...globals, require: (relative) => load(relative.replace(/^\.\//, '')) }, { filename });
    return exports;
  }
  return load;
};
