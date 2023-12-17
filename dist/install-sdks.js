const fs = require('fs');
const path = require('path');

function isParentProject() {
  fs.writeFileSync(process.env.PROJECT_CWD + '/.test.log', JSON.stringify(process.env, null, 2), 'utf-8');
  return process.env.npm_package_name !== '@anyit/be-dev';
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function performPostInstallTasks() {
  const libSdkPath = path.join(__dirname, 'dist', 'sdks');
  const parentYarnPath = path.join(process.env.PROJECT_CWD, '.yarn');
  const parentSdkPath = path.join(parentYarnPath, 'sdks');

  fs.writeFileSync(process.env.PROJECT_CWD + '/.test.log', libSdkPath, 'utf-8');
  fs.writeFileSync(process.env.PROJECT_CWD + '/.test.log', parentYarnPath, 'utf-8');
  fs.writeFileSync(process.env.PROJECT_CWD + '/.test.log', parentSdkPath, 'utf-8');

  if (!fs.existsSync(parentYarnPath)) {
    fs.mkdirSync(parentYarnPath);
  }

  if (!fs.existsSync(parentSdkPath)) {
    copyDir(libSdkPath, parentSdkPath);
  } else {
    const sdks = ['eslint', 'typescript', 'prettier'];

    sdks.forEach((sdk) => {
      const libSdk = path.join(libSdkPath, sdk);
      const parentSdk = path.join(parentSdkPath, sdk);
      if (!fs.existsSync(parentSdk)) {
        copyDir(libSdk, parentSdk);
      } else {
        console.log(`SDK is already present in ${parentSdk}`);
      }
    });
  }
}

fs.writeFileSync(process.env.PROJECT_CWD + '/.test.log', 'Setting SDKs...', 'utf-8');
console.log('Setting SDKs...');
if (isParentProject()) {
  fs.writeFileSync(process.env.PROJECT_CWD + '/.test.log', 'Is parent', 'utf-8');
  performPostInstallTasks();
}
