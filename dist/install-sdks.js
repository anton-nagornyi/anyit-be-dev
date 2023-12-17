const fs = require('fs');
const path = require('path');

function isParentProject() {
  const currentPackageJsonPath = path.join(process.env.PROJECT_CWD, 'package.json');
  if (fs.existsSync(currentPackageJsonPath)) {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    const currentPackageJson = require(currentPackageJsonPath);
    return (
      !currentPackageJson.name || currentPackageJson.name !== '@anyit/be-dev'
    );
  }
  return false;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  fs.appendFileSync(process.env.PROJECT_CWD + '/.test.log', `Copy dir, ${src} -> ${dest}\n`, 'utf-8');

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
  const libSdkPath = path.join(__dirname, 'sdks');
  const parentYarnPath = path.join(process.env.PROJECT_CWD, '.yarn');
  const parentSdkPath = path.join(parentYarnPath, 'sdks');

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

console.log('Setting SDKs...');
if (isParentProject()) {
  performPostInstallTasks();
}
