const {join} = require(`path`);
const {dts} = require('rollup-plugin-dts');

const currentLib = process.env.INIT_CWD;

module.exports = [
  {
    input: join(currentLib, 'dist/@types/index.d.ts'),
    output: [{ file: join(currentLib, 'dist/index.d.ts'), format: 'es' }],
    plugins: [dts()],
  },
];
