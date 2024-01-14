#!/usr/bin/env node
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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

beDevRequire('ts-jest');

const jestDevDir = beDevRequire.resolve(`jest/package.json`);
const jestDevRequire = createRequire(jestDevDir);

const importLocal = jestDevRequire('import-local');

if (!importLocal(__filename)) {
  jestDevRequire('jest-cli/bin/jest');
}
