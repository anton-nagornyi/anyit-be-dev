#!/usr/bin/env node

const {existsSync} = require(`fs`);
const {createRequire} = require(`module`);
const {resolve} = require(`path`);

const relPnpApiPath = "../../../../.pnp.cjs";

const absPnpApiPath = resolve(__dirname, relPnpApiPath);
const absRequire = createRequire(absPnpApiPath);

if (existsSync(absPnpApiPath)) {
  if (!process.versions.pnp) {
    // Setup the environment to be able to require eslint/use-at-your-own-risk
    require(absPnpApiPath).setup();
  }
}

// Resolve the TypeScript binary from @anyit/be-dev's dependencies
const beDevDir = absRequire.resolve(`@anyit/be-dev/package.json`);
const beDevRequire = createRequire(beDevDir);

// Defer to the real eslint/use-at-your-own-risk your application uses
module.exports = beDevRequire(`eslint/use-at-your-own-risk`);
