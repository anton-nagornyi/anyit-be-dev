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

runCommand(`eslint --config="${join(__dirname, '..', 'dist', 'eslintrc.js')}" --fix "{src,tests}/**/*.ts"`);
