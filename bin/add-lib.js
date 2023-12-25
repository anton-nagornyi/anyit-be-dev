const path = require('path');
const fs = require('fs');
const {format} = require('prettier-package-json')

const replaceBeforeSlash = (str) => {
  const slashIndex = str.indexOf('/');

  if (slashIndex !== -1) {
    return str.substring(slashIndex + 1);
  }

  return str;
}

const copyDirectoryRecursively = (srcDir, destDir) => {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);

  for (const file of files) {
    const srcFilePath = path.join(srcDir, file);
    const destFilePath = path.join(destDir, file);
    const stat = fs.statSync(srcFilePath);

    if (stat.isDirectory()) {
      copyDirectoryRecursively(srcFilePath, destFilePath);
    } else {
      fs.copyFileSync(srcFilePath, destFilePath);
    }
  }
}

const setPackageJson = (args) => {
  const {repo, author, packagePath, dir} = args;

  const rootPackageJson = JSON.parse(fs.readFileSync(path.join(process.env.PROJECT_CWD, 'package.json'), 'utf-8'));
  const rootRepository = rootPackageJson.repository?.url?.replace('git+', '').replace('.git', '');

  const packageJsonPath = path.join(packagePath, 'package.json');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const {repository} = packageJson;
  const {url} = repository ?? {};
  const useRepo = rootRepository ?? (url ? url.replace('git+', '').replace('.git', '') : repo ?? '');

  Object.assign(packageJson, {
    author: author ?? 'Anton Nagornyi',
    license: 'MIT',
    homepage: `${useRepo}blob/main/packages/${dir}/README.md`,
    bugs: {
      url: `${useRepo}/issues`
    },
    repository: {
      type: 'git',
      url: `git+${useRepo}.git`
    },
  });

  const toolPackage = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

  packageJson.devDependencies['@anyit/be-dev'] = `^${toolPackage.version}`;
  packageJson.devDependencies.jest = toolPackage.dependencies.jest;
  fs.writeFileSync(packageJsonPath, format(packageJson));
  return useRepo;
}

const setReadMe = (args) => {
  const {name, packagePath} = args;

  fs.writeFileSync(path.join(packagePath, 'README.md'), `# ${name}`);
}

const setGithubWorkflow = (args) => {
  const {packagePath, packageName, dir, repoUrl} = args;

  const github = path.join(process.env.PROJECT_CWD, '.github');
  copyDirectoryRecursively(path.join(__dirname, '..', 'dist', 'github'), github);

  const workflows = path.join(github, 'workflows');

  if (!fs.existsSync(workflows)) {
    fs.mkdirSync(workflows);
  }

  const workflowTemplate = fs.readFileSync(path.join(__dirname, '..', 'dist', 'templates', 'github-publish-lib.yml'), 'utf8');

  const workflow = workflowTemplate
    .replace('PACKAGE_NAME', packageName.charAt(0).toUpperCase() + packageName.slice(1))
    .replace('PACKAGE_DIR', dir)
    .replace('REPO_NAME', replaceBeforeSlash(repoUrl.replace('https://', '')));

  fs.writeFileSync(path.join(workflows, `publish-${dir}.yml`), workflow);
}

const addLib = (args) => {
  const {name, dirName} = args;

  if (!name) {
    throw new Error('Package name must be provided');
  }

  const packagesPath = path.join(process.env.PROJECT_CWD, 'packages');
  if (!fs.existsSync(packagesPath)) {
    fs.mkdirSync(packagesPath);
  }

  const packageName = replaceBeforeSlash(name);
  const packageDirPath = dirName ?? packageName;
  const packagePath = path.join(packagesPath, packageDirPath);

  if (!fs.existsSync(packagePath)) {
    fs.mkdirSync(packagePath);
    copyDirectoryRecursively(path.join(__dirname, '..', 'dist', 'templates', 'lib'), packagePath);

    const useArgs = {...args, packagePath, packageName, dir: packageDirPath};
    const repoUrl = setPackageJson(useArgs);
    setReadMe(useArgs);
    setGithubWorkflow({...useArgs, repoUrl});
  }
}

const run = () => {
  const [,, ...restArgs] = process.argv;
  const args = Object.fromEntries(
    restArgs.filter(
      (arg) => arg.startsWith('--')
    ).map(
      (arg) => arg.split('=').map((arg) => arg.replace('--', ''))
    )
  );

  addLib({name: restArgs[0], ...args});
}

run();
