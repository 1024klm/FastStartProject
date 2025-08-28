export function getProfileConfig(profile) {
  const profiles = {
    minimal: {
      includeTests: false,
      includeLinting: false,
      includeFormatting: false,
      includePreCommit: false,
      includeGitHubActions: false,
      includeDocker: false,
      includeEditorconfig: false,
    },
    standard: {
      includeTests: true,
      includeLinting: true,
      includeFormatting: true,
      includePreCommit: true,
      includeGitHubActions: false,
      includeDocker: false,
      includeEditorconfig: true,
    },
    full: {
      includeTests: true,
      includeLinting: true,
      includeFormatting: true,
      includePreCommit: true,
      includeGitHubActions: true,
      includeDocker: true,
      includeEditorconfig: true,
    },
  };
  
  return profiles[profile] || profiles.standard;
}

export function applyProfileToStack(stackConfig, profile) {
  const profileConfig = getProfileConfig(profile);
  
  if (profile === 'minimal') {
    // Remove dev dependencies and scripts for minimal profile
    if (stackConfig.files['package.json']) {
      const pkg = JSON.parse(stackConfig.files['package.json']);
      delete pkg.devDependencies;
      delete pkg.scripts.lint;
      delete pkg.scripts.format;
      delete pkg.scripts.test;
      delete pkg.scripts['type-check'];
      stackConfig.files['package.json'] = JSON.stringify(pkg, null, 2);
    }
    
    if (stackConfig.files['requirements-dev.txt']) {
      delete stackConfig.files['requirements-dev.txt'];
    }
    
    // Remove config files
    delete stackConfig.files['.eslintrc.json'];
    delete stackConfig.files['.prettierrc'];
    delete stackConfig.files['tsconfig.json'];
    delete stackConfig.files['jest.config.js'];
    delete stackConfig.files['pytest.ini'];
    delete stackConfig.files['.rubocop.yml'];
  }
  
  return stackConfig;
}