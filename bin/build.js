#!/usr/bin/env node

const { execSync } = require('child_process');

const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    process.exit(1);
  }
};

runCommand('rimraf dist');
runCommand('barrelsby -c ./barrelsby.json');
runCommand('rollup -c');
runCommand('rimraf ./dist/@types');
