#!/usr/bin/env node

const { exec } = require('child_process');

const args = process.argv.slice(2).join(' ');

const command = `barrelsby ${args}`;
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});
