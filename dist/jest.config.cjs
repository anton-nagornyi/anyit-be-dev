const {existsSync} = require(`fs`);
const {createRequire} = require(`module`);
const {resolve, join} = require(`path`);

const relPnpApiPath = "../../../../.pnp.cjs";

const absPnpApiPath = resolve(__dirname, relPnpApiPath);
const absRequire = createRequire(absPnpApiPath);

if (existsSync(absPnpApiPath)) {
  if (!process.versions.pnp) {
    require(absPnpApiPath).setup();
  }
}

const beDevDir = absRequire.resolve(`@anyit/be-dev/package.json`);
const beDevRequire = createRequire(beDevDir);

beDevRequire('ts-jest');

const jestDevDir = beDevRequire.resolve(`jest/package.json`);
const jestDevRequire = createRequire(jestDevDir);
const tsJestDir = beDevRequire.resolve(`ts-jest/package.json`);
const tsJestRequire = createRequire(tsJestDir);
const transformerPath = join(beDevDir, '..', 'dist', 'ts-transformer.js');

module.exports = {
  testEnvironment: 'node',
  testMatch: [`**/tests/*.test.ts`],
  verbose: true,
  transform: {
    '\\.(ts|tsx)$': transformerPath
  },
  rootDir: join(process.env.npm_package_json, '..')
};
