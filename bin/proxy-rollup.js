#!/usr/bin/env node

const {existsSync} = require(`fs`);
const {createRequire} = require(`module`);
const {resolve} = require(`path`);

const relPnpApiPath = "../../../../.pnp.cjs";

const absPnpApiPath = resolve(__dirname, relPnpApiPath);


if (existsSync(absPnpApiPath)) {
  if (!process.versions.pnp) {
    // Setup the environment to be able to require eslint
    require(absPnpApiPath).setup();
  }
}

const absRequire = createRequire(absPnpApiPath);

const beDevDir = absRequire.resolve(`@anyit/be-dev/package.json`);
const beDevRequire = createRequire(beDevDir);

beDevRequire('rollup/dist/bin/rollup');
