const {existsSync} = require(`fs`);
const {createRequire} = require(`module`);
const {resolve, join} = require(`path`);

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
const tsJestDir = jestDevRequire.resolve(`ts-jest/package.json`);
const presetPath = join(tsJestDir, '..', 'dist', 'index.js');

module.exports = {
	preset: presetPath,
	testEnvironment: 'node',
};
