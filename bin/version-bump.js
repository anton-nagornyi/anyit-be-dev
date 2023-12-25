#!/usr/bin/env node

const { execSync } = require('child_process');
const {join} = require('path');

const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit', cwd: process.env.INIT_CWD });
  } catch (error) {
    process.exit(1);
  }
};

runCommand(`yarn version patch`);
