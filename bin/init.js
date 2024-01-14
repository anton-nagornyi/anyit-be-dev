const path = require('path');
const fs = require('fs');
const {format} = require('prettier-package-json');
const xml2js = require('xml2js');

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

const setIdeaWorkspace = () => {
  const workspacePath = path.join(process.env.PROJECT_CWD, '.idea', 'workspace.xml');
  const workspace = fs.readFileSync(workspacePath, 'utf8');
  const eslint = path.join(process.env.PROJECT_CWD, '.yarn', 'sdks', 'eslint');
  const typescript = path.join(process.env.PROJECT_CWD, '.yarn', 'sdks', 'typescript', 'lib');

  fs.readFile(workspacePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the XML file:', err);
      return;
    }

    xml2js.parseString(data, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }

      const newProperties = {
        'node.js.detected.package.eslint': 'true',
        'node.js.selected.package.eslint': eslint,
        'nodejs_package_manager_path': 'yarn',
        'ts.external.directory.path': typescript
      };

      const propertiesComponent = result.project.component.find(comp => comp.$.name === 'PropertiesComponent');
      if (propertiesComponent) {
        let updatedProperties = {keyToString: {}};
        if (propertiesComponent._) {
          updatedProperties = JSON.parse(propertiesComponent._.replace('<![CDATA[', '').replace(']]>', ''));
        }

        updatedProperties.keyToString = {...updatedProperties.keyToString, ...newProperties};
        propertiesComponent._ = JSON.stringify(updatedProperties, null, 2);
      }

      const builder = new xml2js.Builder({ headless: true });
      const xml = builder.buildObject(result);

      fs.writeFile(workspacePath, xml, (err) => {
        if (err) {
          console.error('Error writing the XML file:', err);
          return;
        }
      });
    });
  });
}

const setEsLint = () => {
  const ideaPath = path.join(process.env.PROJECT_CWD, '.idea');

  if (!fs.existsSync(ideaPath)) {
    return;
  }

  const jsLintersPath = path.join(ideaPath, 'jsLinters');

  if (!fs.existsSync(jsLintersPath)) {
    fs.mkdirSync(jsLintersPath);
  }

  const eslintRcPath = path.join(__dirname, '..', 'dist', '.eslintrc.js');
  const eslintXmlPath = path.join(jsLintersPath, 'eslint.xml');
  if (!fs.existsSync(eslintXmlPath)) {
    const template = fs.readFileSync(path.join(__dirname, '..', 'dist', 'eslint.xml'), 'utf8').replace('${eslintrc.js}', eslintRcPath);
    fs.writeFileSync(eslintXmlPath, template);
  } else {
    const eslint = fs.readFileSync(eslintXmlPath, 'utf8');

    xml2js.parseString(eslint, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }
      const projectComponent = result.project.component.find(c => c.$?.name === 'EslintConfiguration');

      if (projectComponent) {
        let customConfig = projectComponent['custom-configuration-file'];
        if (customConfig) {
          customConfig[0].$.path = eslintRcPath;
        } else {
          projectComponent['custom-configuration-file'] = [{ '$': { used: 'true', path: eslintRcPath } }];
        }
      }

      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      fs.writeFile(eslintXmlPath, xml, (err) => {
        if (err) {
          console.error('Error writing the XML file:', err);
          return;
        }
      });
    });
  }

  const inspectionProfilesPath = path.join(ideaPath, 'inspectionProfiles');
  if (!fs.existsSync(inspectionProfilesPath)) {
    fs.mkdirSync(inspectionProfilesPath);
  }

  const profilePath = path.join(inspectionProfilesPath, 'Project_Default.xml');

  if (!fs.existsSync(profilePath)) {
    const template = fs.readFileSync(path.join(__dirname, '..', 'dist', 'Project_Default.xml'), 'utf8');
    fs.writeFileSync(profilePath, template);
  } else {
    const profile = fs.readFileSync(profilePath, 'utf8');
    xml2js.parseString(profile, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }

      const profile = result.component.profile[0];

      const inspectionToolExists = profile.inspection_tool && profile.inspection_tool.some(tool => tool.$?.class === 'Eslint');

      if (!inspectionToolExists) {
        const newInspectionTool = {
          $: {
            class: 'Eslint',
            enabled: 'true',
            level: 'WARNING',
            enabled_by_default: 'true'
          }
        };

        if (!profile.inspection_tool) {
          profile.inspection_tool = [];
        }
        profile.inspection_tool.push(newInspectionTool);
      }

      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      // Write the XML back to the file
      fs.writeFile(profilePath, xml, (err) => {
        if (err) {
          console.error('Error writing the XML file:', err);
          return;
        }
      });
    });
  }
}

const setTypescript = () => {
  const ideaPath = path.join(process.env.PROJECT_CWD, '.idea');

  if (!fs.existsSync(ideaPath)) {
    return;
  }

  const compilerPath = path.join(ideaPath, 'compiler.xml');

  if (!fs.existsSync(compilerPath)) {
    const template = fs.readFileSync(path.join(__dirname, '..', 'dist', 'compiler.xml'), 'utf8');
    fs.writeFileSync(compilerPath, template);
  } else {
    const compiler = fs.readFileSync(compilerPath, 'utf8');
    xml2js.parseString(compiler, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err);
        return;
      }

      let tsCompilerExists = false;
      let tsServiceDirExists = false;

      // Check if TypeScriptCompiler component exists
      if (result.project.component) {
        result.project.component.forEach(component => {
          if (component.$.name === 'TypeScriptCompiler') {
            tsCompilerExists = true;
            // Check if typeScriptServiceDirectory option exists
            component.option.forEach(option => {
              if (option.$.name === 'typeScriptServiceDirectory') {
                tsServiceDirExists = true;
              }
            });
          }
        });
      }

      if (!tsCompilerExists) {
        const tsCompilerComponent = {
          $: { name: 'TypeScriptCompiler' },
          option: [{ $: { name: 'typeScriptServiceDirectory', value: '$PROJECT_DIR$/.yarn/sdks/typescript' }},
            { $: { name: 'versionType', value: 'SERVICE_DIRECTORY' }}]
        };

        if (!result.project.component) {
          result.project.component = [];
        }

        result.project.component.push(tsCompilerComponent);
      } else if (!tsServiceDirExists) {
        const tsCompilerComponent = result.project.component.find(component => component.$.name === 'TypeScriptCompiler');
        tsCompilerComponent.option.push({ $: { name: 'typeScriptServiceDirectory', value: '$PROJECT_DIR$/.yarn/sdks/typescript' }});
      }

      const builder = new xml2js.Builder();
      const xml = builder.buildObject(result);

      fs.writeFile(compilerPath, xml, (err) => {
        if (err) {
          console.error('Error writing the XML file:', err);
          return;
        }
      });
    });
  }

  const config = {
    compilerOptions: {
      target: 'esnext',
      moduleResolution: 'node',
      esModuleInterop: true,
      experimentalDecorators: true
    }
  }

  const tsPath = path.join(process.env.PROJECT_CWD, 'tsconfig.json');

  if (fs.existsSync(tsPath)) {
    const tsConf = JSON.parse(fs.readFileSync(tsPath, 'utf8'));

    const compilerOptions = tsConf.compilerOptions ?? {};

    tsConf.compilerOptions = {...compilerOptions, ...config.compilerOptions};
    fs.writeFileSync(tsPath, JSON.stringify(tsConf, null, 2));
  } else {
    fs.writeFileSync(tsPath, JSON.stringify(config, null, 2));
  }
}

const copyJestTemplate = () => {
  const jestConfigPath = path.join(__dirname, '..', 'dist', 'jest.config.cjs');
  const template = fs.readFileSync(path.join(__dirname, '..', 'dist', 'Template Jest.run.xml'), 'utf8').replace('${jest.config.js}', jestConfigPath);
  const runDir = path.join(process.env.PROJECT_CWD, '.run');

  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir);
  }

  const templatePath = path.join(runDir, 'Template Jest.run.xml');
  fs.writeFileSync(templatePath, template);
}

const setYarn = () => {
  const yarnDir = path.join(process.env.PROJECT_CWD, '.yarn');
  const yarnReleasesDir = path.join(yarnDir, 'releases');
  const yarnDestRelease = path.join(yarnReleasesDir, 'yarn-4.0.2.cjs');

  const yarnConfigPath = path.join(__dirname, '..', 'dist', '.yarnrc.yml');
  const yarnDestConfigPath = path.join(process.env.PROJECT_CWD, '.yarnrc.yml');

  if (!fs.existsSync(yarnDestConfigPath)) {
    fs.copyFileSync(yarnConfigPath, yarnDestConfigPath);
  }

  if (!fs.existsSync(yarnDir)) {
    fs.mkdirSync(yarnDir);
  }

  if (!fs.existsSync(yarnReleasesDir)) {
    fs.mkdirSync(yarnReleasesDir);
  }

  if (!fs.existsSync(yarnDestRelease)) {
    const yarnRelease = path.join(__dirname, '..', 'dist', 'yarn-4.0.2.cjs');
    fs.copyFileSync(yarnRelease, yarnDestRelease);
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
  setIdeaWorkspace();
  setEsLint();
  setTypescript();
  copyJestTemplate();
  setYarn();
}

init();
