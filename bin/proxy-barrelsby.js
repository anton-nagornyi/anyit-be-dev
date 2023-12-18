#!/usr/bin/env node
const { Barrelsby } = require('barrelsby/bin/index');

const args = {
  'directory': './',
  'singleQuotes': true,
  'delete': true,
  'exclude': ['tests']
}

try {
  Barrelsby(args);
} catch (e) {
  console.error(e)
}
