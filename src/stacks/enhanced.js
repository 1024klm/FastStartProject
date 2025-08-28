// Enhanced stack configurations with standardized scripts

export function enhanceStackConfig(stackConfig, stack, packageManager, profile) {
  const isJS = ['javascript', 'typescript', 'react', 'next'].includes(stack);
  const isTS = ['typescript', 'react', 'next'].includes(stack);
  const isPython = ['python', 'fastapi'].includes(stack);
  const isRuby = ['ruby', 'rails'].includes(stack);
  
  // Add standardized scripts for JS/TS projects
  if (isJS && stackConfig.files['package.json']) {
    const pkg = JSON.parse(stackConfig.files['package.json']);
    
    // Standard scripts
    pkg.scripts = pkg.scripts || {};
    
    // Development scripts
    if (!pkg.scripts.dev) {
      if (stack === 'react' || stack === 'next') {
        pkg.scripts.dev = packageManager === 'npm' ? 'npm run start' : `${packageManager} start`;
      } else if (isTS) {
        pkg.scripts.dev = 'tsx watch src/index.ts';
      } else {
        pkg.scripts.dev = 'node --watch src/index.js';
      }
    }
    
    // Build scripts
    if (isTS && !pkg.scripts.build) {
      pkg.scripts.build = 'tsc';
    }
    
    // Type checking
    if (isTS && !pkg.scripts['type-check']) {
      pkg.scripts['type-check'] = 'tsc --noEmit';
    }
    
    // Linting
    if (profile !== 'minimal') {
      pkg.scripts.lint = pkg.scripts.lint || 'eslint . --ext .js,.jsx,.ts,.tsx';
      pkg.scripts['lint:fix'] = 'eslint . --ext .js,.jsx,.ts,.tsx --fix';
    }
    
    // Formatting
    if (profile !== 'minimal') {
      pkg.scripts.format = 'prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"';
      pkg.scripts['format:check'] = 'prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"';
    }
    
    // Testing
    if (profile !== 'minimal' && !pkg.scripts.test) {
      if (stack === 'react') {
        pkg.scripts.test = 'vitest';
        pkg.scripts['test:watch'] = 'vitest --watch';
        pkg.scripts['test:coverage'] = 'vitest --coverage';
      } else if (stack === 'next') {
        pkg.scripts.test = 'jest';
        pkg.scripts['test:watch'] = 'jest --watch';
        pkg.scripts['test:coverage'] = 'jest --coverage';
      } else {
        pkg.scripts.test = 'node --test';
        pkg.scripts['test:watch'] = 'node --test --watch';
      }
    }
    
    // Pre-commit
    if (profile === 'full') {
      pkg.scripts['pre-commit'] = 'lint-staged';
      pkg.scripts.prepare = 'husky install';
    }
    
    // Clean script
    pkg.scripts.clean = 'rm -rf dist node_modules coverage .next .cache';
    
    // Update devDependencies
    if (profile !== 'minimal') {
      pkg.devDependencies = pkg.devDependencies || {};
      
      // Linting deps
      if (!pkg.devDependencies.eslint) {
        pkg.devDependencies.eslint = '^8.50.0';
      }
      
      // Formatting deps
      if (!pkg.devDependencies.prettier) {
        pkg.devDependencies.prettier = '^3.1.0';
      }
      
      // Testing deps for React
      if (stack === 'react' && !pkg.devDependencies.vitest) {
        pkg.devDependencies.vitest = '^1.0.0';
        pkg.devDependencies['@testing-library/react'] = '^14.0.0';
        pkg.devDependencies['@testing-library/jest-dom'] = '^6.0.0';
        pkg.devDependencies.jsdom = '^23.0.0';
      }
      
      // Testing deps for Next.js
      if (stack === 'next' && !pkg.devDependencies.jest) {
        pkg.devDependencies.jest = '^29.7.0';
        pkg.devDependencies['@testing-library/react'] = '^14.0.0';
        pkg.devDependencies['@testing-library/jest-dom'] = '^6.0.0';
      }
      
      // Pre-commit deps
      if (profile === 'full') {
        pkg.devDependencies['lint-staged'] = '^15.0.0';
        pkg.devDependencies.husky = '^8.0.0';
      }
    }
    
    // Author and license
    pkg.author = pkg.author || 'AUTHOR_NAME';
    pkg.license = pkg.license || 'LICENSE_TYPE';
    
    stackConfig.files['package.json'] = JSON.stringify(pkg, null, 2);
  }
  
  // Add Makefile for Python projects
  if (isPython && profile !== 'minimal') {
    stackConfig.files['Makefile'] = `# PROJECT_NAME Makefile

.PHONY: help install dev test lint format clean

help:
	@echo "Available commands:"
	@echo "  make install    Install dependencies"
	@echo "  make dev        Run development server"
	@echo "  make test       Run tests"
	@echo "  make lint       Run linters"
	@echo "  make format     Format code"
	@echo "  make clean      Clean cache files"

install:
	pip install -r requirements.txt
	${profile !== 'minimal' ? 'pip install -r requirements-dev.txt' : ''}

dev:
	${stack === 'fastapi' ? 'uvicorn main:app --reload' : 'python src/main.py'}

test:
	pytest -v --cov=. --cov-report=term-missing

lint:
	flake8 . --max-line-length=88 --extend-ignore=E203
	mypy .
	isort --check-only .
	black --check .

format:
	isort .
	black .

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .mypy_cache .coverage htmlcov dist build *.egg-info
`;
    
    // Add requirements-dev.txt if not minimal
    if (profile !== 'minimal' && !stackConfig.files['requirements-dev.txt']) {
      stackConfig.files['requirements-dev.txt'] = `# Development dependencies
pytest>=7.4.0
pytest-cov>=4.1.0
pytest-asyncio>=0.21.0
black>=23.0.0
flake8>=6.0.0
mypy>=1.4.0
isort>=5.12.0
pre-commit>=3.3.0
`;
    }
  }
  
  // Add Rakefile for Ruby projects
  if (isRuby && profile !== 'minimal') {
    stackConfig.files['Rakefile'] = `# PROJECT_NAME Rakefile

require 'rake'

desc "Install dependencies"
task :install do
  sh "bundle install"
end

desc "Run development server"
task :dev do
  ${stack === 'rails' ? 'sh "bundle exec rails server"' : 'sh "ruby src/main.rb"'}
end

desc "Run tests"
task :test do
  sh "bundle exec rspec"
end

desc "Run linter"
task :lint do
  sh "bundle exec rubocop"
end

desc "Auto-correct linting issues"
task :format do
  sh "bundle exec rubocop -A"
end

desc "Clean temporary files"
task :clean do
  sh "rm -rf coverage/ tmp/ log/"
end

task default: :test
`;
  }
  
  return stackConfig;
}