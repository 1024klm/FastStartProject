export function getPrettierConfig(stack) {
  const base = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',
  };
  
  const configs = {
    javascript: base,
    typescript: base,
    react: {
      ...base,
      jsxSingleQuote: false,
      bracketSameLine: false,
    },
    next: {
      ...base,
      jsxSingleQuote: false,
      bracketSameLine: false,
    },
  };
  
  return configs[stack] || base;
}

export function getESLintConfig(stack, isTypeScript = false) {
  const baseConfig = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  };
  
  if (isTypeScript) {
    baseConfig.parser = '@typescript-eslint/parser';
    baseConfig.extends.push('plugin:@typescript-eslint/recommended');
    baseConfig.plugins = ['@typescript-eslint'];
    baseConfig.rules['@typescript-eslint/no-unused-vars'] = ['error', { argsIgnorePattern: '^_' }];
    delete baseConfig.rules['no-unused-vars'];
  }
  
  if (stack === 'react' || stack === 'next') {
    baseConfig.extends.push('plugin:react/recommended', 'plugin:react-hooks/recommended');
    baseConfig.plugins = baseConfig.plugins || [];
    baseConfig.plugins.push('react', 'react-hooks');
    baseConfig.settings = {
      react: {
        version: 'detect',
      },
    };
    baseConfig.parserOptions.ecmaFeatures = {
      jsx: true,
    };
    baseConfig.rules['react/react-in-jsx-scope'] = 'off';
    baseConfig.rules['react/prop-types'] = 'off';
  }
  
  if (stack === 'next') {
    baseConfig.extends.push('next/core-web-vitals');
  }
  
  return baseConfig;
}

export function getBlackConfig() {
  return `[tool.black]
line-length = 88
target-version = ['py39', 'py310', 'py311']
include = '\\.pyi?$'
extend-exclude = '''
/(
  # directories
  \\.eggs
  | \\.git
  | \\.hg
  | \\.mypy_cache
  | \\.tox
  | \\.venv
  | build
  | dist
)/
'''
`;
}

export function getIsortConfig() {
  return `[tool.isort]
profile = "black"
line_length = 88
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true
`;
}

export function getRuboCopConfig() {
  return `AllCops:
  NewCops: enable
  TargetRubyVersion: 3.0
  Exclude:
    - 'vendor/**/*'
    - 'db/**/*'
    - 'config/**/*'
    - 'script/**/*'
    - 'bin/*'
    - 'node_modules/**/*'

Style/Documentation:
  Enabled: false

Style/FrozenStringLiteralComment:
  Enabled: false

Metrics/MethodLength:
  Max: 20

Metrics/BlockLength:
  Exclude:
    - 'spec/**/*'
    - 'test/**/*'

Layout/LineLength:
  Max: 120
`;
}