#!/usr/bin/env node
const { Barrelsby } = require('barrelsby/bin/index');
const { join } = require('path');
const { existsSync } = require('fs');

const currentLib = process.env.INIT_CWD;

const args = {
  name: 'index',
  directory: currentLib,
  singleQuotes: true,
  delete: true,
  exclude: ['tests', 'dist'],
  noHeader: false
}

const configPath = join(currentLib, 'barrelsby.json');
if (existsSync(configPath)) {
  const config = require(configPath);
  Object.assign(args, config);
  args.exclude = [...args.exclude, 'tests', 'dist'];
}

try {
  Barrelsby(args);
} catch (e) {
  console.error(e)
}
