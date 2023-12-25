const {join} = require(`path`);
const {dts} = require('rollup-plugin-dts');
const autoExternal= require('rollup-plugin-auto-external');
const typescript = require('rollup-plugin-typescript2');

const currentLib = process.env.INIT_CWD;

module.exports = [
  {
    input: './index.ts',
    output: {
      dir: './dist',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      autoExternal(),
      typescript({
        tsconfig: join(__dirname, 'tsconfig.build.json'),
        tsconfigOverride: {
          include: [join(currentLib, 'src')],
          compilerOptions: {
            declarationDir: join(currentLib, 'dist/@types'),
            outDir: join(currentLib, 'dist')
          }
        },
        useTsconfigDeclarationDir: true,
        cacheRoot: join(currentLib, 'dist', 'cache'),
        clean: true
      }),
    ],
  },
  {
    input: join(currentLib, 'dist/@types/index.d.ts'),
    output: [{ file: join(currentLib, 'dist/index.d.ts'), format: 'es' }],
    plugins: [autoExternal(), dts()],
  },
];
