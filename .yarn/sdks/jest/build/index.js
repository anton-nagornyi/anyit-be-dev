'use strict';

const {existsSync} = require(`fs`);
const {createRequire} = require(`module`);
const {resolve} = require(`path`);

const relPnpApiPath = "../../../../.pnp.cjs";

const absPnpApiPath = resolve(__dirname, relPnpApiPath);
const absRequire = createRequire(absPnpApiPath);

if (existsSync(absPnpApiPath)) {
  if (!process.versions.pnp) {
    // Setup the environment to be able to require typescript/lib/tsc.js
    require(absPnpApiPath).setup();
  }
}

// Resolve the TypeScript binary from @anyit/be-dev's dependencies
const beDevDir = absRequire.resolve(`@anyit/be-dev/package.json`);
const beDevRequire = createRequire(beDevDir);

Object.defineProperty(exports, '__esModule', {
  value: true
});
Object.defineProperty(exports, 'SearchSource', {
  enumerable: true,
  get: function () {
    return _core().SearchSource;
  }
});
Object.defineProperty(exports, 'createTestScheduler', {
  enumerable: true,
  get: function () {
    return _core().createTestScheduler;
  }
});
Object.defineProperty(exports, 'getVersion', {
  enumerable: true,
  get: function () {
    return _core().getVersion;
  }
});
Object.defineProperty(exports, 'run', {
  enumerable: true,
  get: function () {
    return _jestCli().run;
  }
});
Object.defineProperty(exports, 'runCLI', {
  enumerable: true,
  get: function () {
    return _core().runCLI;
  }
});
function _core() {
  const data = beDevRequire('@jest/core');
  _core = function () {
    return data;
  };
  return data;
}
function _jestCli() {
  const data = beDevRequire('jest-cli');
  _jestCli = function () {
    return data;
  };
  return data;
}
