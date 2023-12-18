const {existsSync, readFileSync} = require(`fs`);
const {createRequire} = require(`module`);
const {resolve, join, dirname} = require(`path`);
const typescript = require('@rollup/plugin-typescript');
const {dts} = require('rollup-plugin-dts');

function findFileInParentDirs(filename, startDir) {
  let currentDir = startDir;

  while (true) {
    const filePath = join(currentDir, filename);

    if (existsSync(filePath)) {
      return filePath; // Return the path if file is found
    }

    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.workspaces) {
        return null;
      }
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return null;
}

const tsconfigPath = findFileInParentDirs('tsconfig.build.json', __dirname);
console.log('Using ', tsconfigPath);

module.exports = [
  {
    input: './index.ts',
    output: {
      dir: './dist',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['util'],
    plugins: [
      typescript({
        tsconfig: tsconfigPath
      }),
    ],
  },
  {
    input: 'dist/@types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    external: ['util'],
    plugins: [dts()],
  },
];
