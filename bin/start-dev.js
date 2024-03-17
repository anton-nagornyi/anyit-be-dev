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

const tsConfig = join(__filename, '..', '..', 'dist', 'tsconfig.json')

runCommand(`nest start:dev --path "${tsConfig}" --watch`);

