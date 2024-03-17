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

const extractOrganizationFromGitHubURL = (url) => {
  const regex = /^(?:https:\/\/github\.com\/|git@github\.com:)([^\/]+)\/[^\/]+(?:\.git)?$/;
  const match = url.match(regex);

  return match ? match[1] : 'unknown-org';
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
    homepage: `${useRepo}/blob/main/services/${dir}/README.md`,
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

  const workflowTemplate = fs.readFileSync(path.join(__dirname, '..', 'dist', 'templates', 'github-build-service.yml'), 'utf8');

  const workflow = workflowTemplate
    .replaceAll('SERVICE_NAME', (packageName.charAt(0).toUpperCase() + packageName.slice(1)).replace('-', ' '))
    .replaceAll('SERVICE_DIR', dir)
    .replaceAll('REPO_NAME', replaceBeforeSlash(repoUrl.replace('https://', '')))
    .replaceAll('GITHUB_ORGANIZATION', extractOrganizationFromGitHubURL(repoUrl));

  fs.writeFileSync(path.join(workflows, `staging-build-${dir}.yml`), workflow);
}

const setEnvs = (servicePath, serviceName) => {
  const denv = fs.readFileSync(path.join(servicePath, 'envs/.env'), 'utf8');

  denv.replaceAll('SERVICE_NAME', serviceName);
  const denvLocal = fs.readFileSync(path.join(servicePath, 'envs/.env.local'), 'utf8');

  denv.replaceAll('SERVICE_NAME', serviceName);

  fs.writeFileSync(path.join(servicePath, 'envs/.env'), denv);
  fs.writeFileSync(path.join(servicePath, 'envs/.env.local'), denvLocal);
}

const addService = (args) => {
  const {name, dirName} = args;

  if (!name) {
    throw new Error('Service name must be provided');
  }

  const servicesPath = path.join(process.env.PROJECT_CWD, 'services');
  if (!fs.existsSync(servicesPath)) {
    fs.mkdirSync(servicesPath);
  }

  const serviceName = replaceBeforeSlash(name);
  const serviceDirPath = dirName ?? serviceName;
  const servicePath = path.join(servicesPath, serviceDirPath);

  if (!fs.existsSync(servicePath)) {
    fs.mkdirSync(servicePath);
    copyDirectoryRecursively(path.join(__dirname, '..', 'dist', 'templates', 'service'), servicePath);

    const useArgs = {...args, packagePath: servicePath, packageName: serviceName, dir: serviceDirPath};
    const repoUrl = setPackageJson(useArgs);
    setReadMe(useArgs);
    setGithubWorkflow({...useArgs, repoUrl});
    setEnvs(servicePath, serviceName);
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

  addService({name: restArgs[0], ...args});
}

run();
