const {join, sep} = require(`path`);
const {dts} = require('rollup-plugin-dts');
const autoExternal= require('rollup-plugin-auto-external');
const fs = require('fs');

const currentLib = process.env.INIT_CWD;

const inputPath = join(currentLib, 'dist/@types/index.d.ts');

function moveFiles(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let files = fs.readdirSync(srcDir);

  files.forEach(file => {
    let srcPath = join(srcDir, file);
    let destPath = join(destDir, file);

    if (fs.statSync(srcPath).isDirectory()) {
      moveFiles(srcPath, destPath);
    } else {
      fs.renameSync(srcPath, destPath);
    }
  });
}

function getWeirdPath(basePath, relativePath) {
  let fullPath = join(basePath, relativePath);

  if (fs.existsSync(fullPath)) {
    return fullPath;
  }

  const parts = fullPath.split(sep);

  for (let i = 0; i < parts.length; ++i) {
    let subPath = parts.slice(i).join(sep);

    if (fs.existsSync(subPath)) {
      return subPath;
    }
  }

  return '';
}

if (!fs.existsSync(inputPath)) {
  const weirdInputPath = getWeirdPath(join(currentLib, 'dist/@types'), process.env.INIT_CWD.replace(process.env.PROJECT_CWD, ''));
  moveFiles(weirdInputPath, join(currentLib, 'dist/@types'));
}

module.exports = [
  {
    input: join(currentLib, 'dist/@types/index.d.ts'),
    output: [{ file: join(currentLib, 'dist/index.d.ts'), format: 'es' }],
    plugins: [autoExternal(), dts()],
  },
];
