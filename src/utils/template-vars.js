export function replaceTemplateVariables(content, variables) {
  const {
    projectName,
    description,
    author,
    year,
    license,
    packageManager,
    gitHubUsername,
  } = variables;
  
  let result = content;
  
  // Replace all template variables
  result = result.replace(/PROJECT_NAME/g, projectName);
  result = result.replace(/PROJECT_DESCRIPTION/g, description);
  result = result.replace(/AUTHOR_NAME/g, author);
  result = result.replace(/CURRENT_YEAR/g, year);
  result = result.replace(/LICENSE_TYPE/g, license);
  result = result.replace(/PACKAGE_MANAGER/g, packageManager);
  result = result.replace(/GITHUB_USERNAME/g, gitHubUsername || 'yourusername');
  
  // Replace package manager specific commands
  const pmCommands = getPackageManagerReplacements(packageManager);
  Object.entries(pmCommands).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, 'g'), value);
  });
  
  return result;
}

function getPackageManagerReplacements(packageManager) {
  const replacements = {
    npm: {
      'PM_INSTALL': 'npm install',
      'PM_RUN': 'npm run',
      'PM_EXEC': 'npx',
      'PM_ADD': 'npm install',
      'PM_ADD_DEV': 'npm install --save-dev',
    },
    yarn: {
      'PM_INSTALL': 'yarn',
      'PM_RUN': 'yarn',
      'PM_EXEC': 'yarn dlx',
      'PM_ADD': 'yarn add',
      'PM_ADD_DEV': 'yarn add --dev',
    },
    pnpm: {
      'PM_INSTALL': 'pnpm install',
      'PM_RUN': 'pnpm',
      'PM_EXEC': 'pnpm dlx',
      'PM_ADD': 'pnpm add',
      'PM_ADD_DEV': 'pnpm add --save-dev',
    },
  };
  
  return replacements[packageManager] || replacements.npm;
}

export function getTemplateVariables(options) {
  const currentYear = new Date().getFullYear().toString();
  
  return {
    projectName: options.projectName,
    description: options.description,
    author: options.author,
    year: currentYear,
    license: options.license || 'MIT',
    packageManager: options.packageManager || 'npm',
    gitHubUsername: options.gitHubUsername,
  };
}