const path = require('path');
const fs = require('fs');
const {format} = require('prettier-package-json')

const setPackageJson = (args) => {
  const packageJsonPath = path.join(process.env.PROJECT_CWD, 'package.json');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const {repo, author} = args;

  const {repository} = packageJson;
  const {url} = repository ?? {}
  const useRepo = url ? url.replace('git+', '').replace('.git', '') : repo ?? '';

  Object.assign(packageJson, {
    private: true,
    workspaces: {
      packages: [
        'packages/**/*'
      ]
    },
    author: author ?? 'Anton Nagornyi',
    license: 'MIT',
    homepage: `${useRepo}#readme`,
    bugs: {
      url: `${useRepo}/issues`
    },
    repository: {
      type: 'git',
      url: `git+${useRepo}.git`
    },
  });

  fs.writeFileSync(packageJsonPath, format(packageJson));
}

const setPackageManager = () => {
  const workspacePath = path.join(process.env.PROJECT_CWD, '.idea', 'workspace.xml');
  const workspace = fs.readFileSync(workspacePath, 'utf8');

  fs.writeFileSync(
    workspacePath,
    workspace
      .replace('"nodejs_package_manager_path": "npm"', '"nodejs_package_manager_path": "yarn"')
      .replace('&quot;nodejs_package_manager_path&quot;: &quot;npm&quot;', '&quot;nodejs_package_manager_path&quot;: &quot;yarn&quot;'),
  );
}

const setGitAttributes = () => {
  //* text=auto eol=lf
  const gitattributesPath = path.join(process.env.PROJECT_CWD, '.gitattributes');

  if (fs.existsSync(gitattributesPath)) {
    const gitattributes = fs.readFileSync(gitattributesPath, 'utf8');
    fs.writeFileSync(
      gitattributesPath,
      `* text=auto eol=lf\n${gitattributes
        .replace('* text=auto eol=lf\n', '')
        .replace('* text=auto eol=lf', '')}`
    );
  } else {
    fs.writeFileSync(gitattributesPath, '* text=auto eol=lf\n');
  }
}

const init = () => {
  const [,, ...restArgs] = process.argv;
  const args = Object.fromEntries(
    restArgs.filter(
      (arg) => arg.startsWith('--')
    ).map(
      (arg) => arg.split('=').map((arg) => arg.replace('--', ''))
    )
  );
  setPackageJson(args);
  setPackageManager();
  setGitAttributes();
}

init();
