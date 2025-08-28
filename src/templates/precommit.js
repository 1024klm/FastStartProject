export function generatePreCommitConfig(stack, packageManager) {
  const configs = {
    javascript: getJSPreCommit(packageManager),
    typescript: getTSPreCommit(packageManager),
    react: getReactPreCommit(packageManager),
    next: getNextPreCommit(packageManager),
    python: getPythonPreCommit(),
    fastapi: getPythonPreCommit(),
    ruby: getRubyPreCommit(),
    rails: getRubyPreCommit(),
    lamdera: getElmPreCommit(),
  };
  
  return configs[stack] || null;
}

function getJSPreCommit(packageManager) {
  return `# Pre-commit hooks for JavaScript
# Install: PM_EXEC pre-commit install
repos:
  - repo: local
    hooks:
      - id: eslint
        name: ESLint
        entry: PM_EXEC eslint
        language: system
        files: \\.(js|jsx)$
        args: [--fix]
      
      - id: prettier
        name: Prettier
        entry: PM_EXEC prettier
        language: system
        files: \\.(js|jsx|json|css|md)$
        args: [--write]
`;
}

function getTSPreCommit(packageManager) {
  return `# Pre-commit hooks for TypeScript
# Install: PM_EXEC pre-commit install
repos:
  - repo: local
    hooks:
      - id: typescript
        name: TypeScript Check
        entry: PM_EXEC tsc
        language: system
        pass_filenames: false
        args: [--noEmit]
      
      - id: eslint
        name: ESLint
        entry: PM_EXEC eslint
        language: system
        files: \\.(ts|tsx|js|jsx)$
        args: [--fix]
      
      - id: prettier
        name: Prettier
        entry: PM_EXEC prettier
        language: system
        files: \\.(ts|tsx|js|jsx|json|css|md)$
        args: [--write]
`;
}

function getReactPreCommit(packageManager) {
  return getTSPreCommit(packageManager);
}

function getNextPreCommit(packageManager) {
  return getTSPreCommit(packageManager);
}

function getPythonPreCommit() {
  return `# Pre-commit hooks for Python
# Install: pip install pre-commit && pre-commit install
repos:
  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3
        args: [--line-length=88]
  
  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort
        args: [--profile=black]
  
  - repo: https://github.com/pycqa/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=88, --extend-ignore=E203]
  
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
`;
}

function getRubyPreCommit() {
  return `# Pre-commit hooks for Ruby
# Install: gem install pre-commit && pre-commit install
repos:
  - repo: https://github.com/pre-commit/mirrors-rubocop
    rev: v1.59.0
    hooks:
      - id: rubocop
        args: [--auto-correct]
  
  - repo: local
    hooks:
      - id: rspec
        name: RSpec Tests
        entry: bundle exec rspec
        language: system
        pass_filenames: false
        always_run: true
`;
}

function getElmPreCommit() {
  return `# Pre-commit hooks for Elm
# Install: pre-commit install
repos:
  - repo: local
    hooks:
      - id: elm-format
        name: elm-format
        entry: elm-format
        language: system
        files: \\.elm$
        args: [--yes]
      
      - id: elm-review
        name: elm-review
        entry: elm-review
        language: system
        pass_filenames: false
`;
}

export function generateHuskyConfig(packageManager) {
  const pmRun = packageManager === 'npm' ? 'npm run' : packageManager;
  
  return {
    '.husky/pre-commit': `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${pmRun} lint-staged
`,
    '.lintstagedrc.json': JSON.stringify({
      '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
      '*.{json,css,md}': 'prettier --write',
    }, null, 2),
  };
}