const {join} = require(`path`);
const {dts} = require('rollup-plugin-dts');
const autoExternal= require('rollup-plugin-auto-external');

const currentLib = process.env.INIT_CWD;

module.exports = [
  {
    input: join(currentLib, 'dist/@types/index.d.ts'),
    output: [{ file: join(currentLib, 'dist/index.d.ts'), format: 'es' }],
    plugins: [autoExternal(), dts()],
  },
];
