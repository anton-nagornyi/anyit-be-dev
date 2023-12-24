#!/usr/bin/env node

const { execSync } = require('child_process');
const {join} = require('path');

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

const rollupConfig = join(__filename, '..', '..', 'dist', 'rollup.config.js');

runCommand(`rollup -c "${rollupConfig}"`);
runCommand(`rimraf "${join(currentLib, 'dist/@types')}"`);
