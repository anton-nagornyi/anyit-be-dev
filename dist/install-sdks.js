const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

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

function copyJestTemplate() {
  const jestConfigPath = path.join(__dirname, 'jest.config.cjs');
  const template = fs.readFileSync(path.join(__dirname, 'Template Jest.run.xml'), 'utf8').replace('${jest.config.js}', jestConfigPath);
  const runDir = path.join(process.env.PROJECT_CWD, '.run');

  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir);
  }

  const templatePath = path.join(runDir, 'Template Jest.run.xml');
  fs.writeFileSync(templatePath, template);
}

function setEsLint() {
  const ideaPath = path.join(process.env.PROJECT_CWD, '.idea');

  if (!fs.existsSync(ideaPath)) {
    return;
  }

  const jsLintersPath = path.join(ideaPath, 'jsLinters');

  if (!fs.existsSync(jsLintersPath)) {
    fs.mkdirSync(jsLintersPath);
  }

  const eslintRcPath = path.join(__dirname, '.eslintrc.js');
  const eslintXmlPath = path.join(jsLintersPath, 'eslint.xml');
  if (!fs.existsSync(eslintXmlPath)) {
    const template = fs.readFileSync(path.join(__dirname, 'eslint.xml'), 'utf8').replace('${eslintrc.js}', eslintRcPath);
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
        console.log('XML file successfully updated');
      });
    });
  }

  const inspectionProfilesPath = path.join(ideaPath, 'inspectionProfiles');
  if (!fs.existsSync(inspectionProfilesPath)) {
    fs.mkdirSync(inspectionProfilesPath);
  }

  const profilePath = path.join(inspectionProfilesPath, 'Project_Default.xml');

  if (!fs.existsSync(profilePath)) {
    const template = fs.readFileSync(path.join(__dirname, 'Project_Default.xml'), 'utf8');
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
        console.log('XML file successfully updated');
      });
    });
  }
}

function setTypescript() {
  const ideaPath = path.join(process.env.PROJECT_CWD, '.idea');

  if (!fs.existsSync(ideaPath)) {
    return;
  }

  const compilerPath = path.join(ideaPath, 'compiler.xml');

  if (!fs.existsSync(compilerPath)) {
    const template = fs.readFileSync(path.join(__dirname, 'compiler.xml'), 'utf8');
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
        console.log('XML file successfully updated');
      });
    });
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

  try {
    copyJestTemplate();
    setEsLint();
    setTypescript();
  } catch (e) {
    console.error(e);
    fs.writeFileSync(path.join(__dirname, 'error.log'), e, 'utf8')
  }
}

console.log('Setting SDKs...');
if (isParentProject()) {
  performPostInstallTasks();
}
