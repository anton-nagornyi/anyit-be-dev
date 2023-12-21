#!/usr/bin/env node

const { execSync } = require('child_process');
const {join} = require('path');
const {existsSync} = require('fs');
const {createRequire} = require(`module`);
const {resolve} = require(`path`);

const relPnpApiPath = '../../../../.pnp.cjs';

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
const tsPath = beDevRequire.resolve('typescript/package.json');
const tscPath = join(tsPath, '..', 'lib/tsc.js');

const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
};

const currentLib = process.env.INIT_CWD;

runCommand(`rimraf "${join(currentLib, 'dist')}"`);
runCommand('barrelsby');

const configPath = join(currentLib, 'esbuild.json');
const args = {
  entryPoints: ['index.ts'],
  bundle: true,
  outfile: join(currentLib, 'dist/index.js'),
  platform: 'node',
  target: 'esnext',
  format: 'cjs',
  sourcemap: false,
  external: [],
}

if (existsSync(configPath)) {
  const config = require(configPath);
  Object.assign(args, config);
}

const esbuild = require('esbuild');
esbuild.build(args).catch((error) => {
  console.error(error);
  process.exit(1)
});

runCommand(`node ${tscPath} --declaration --emitDeclarationOnly`);
const rollupConfig = join(__filename, '..', '..', 'dist', 'rollup.config.js');

runCommand(`rollup -c "${rollupConfig}"`);
runCommand(`rimraf "${join(currentLib, 'dist/@types')}"`);
