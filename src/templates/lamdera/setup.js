/**
 * Lamdera Project Setup Functions
 */

import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

/**
 * Check if all Lamdera prerequisites are installed
 */
export async function checkPrerequisites() {
  const spinner = ora('Checking Lamdera prerequisites...').start();
  const missing = [];
  
  const tools = [
    { cmd: 'lamdera', name: 'Lamdera', install: 'Visit https://lamdera.com/start' },
    { cmd: 'elm-format', name: 'elm-format', install: 'npm install -g elm-format' },
    { cmd: 'elm-test-rs', name: 'elm-test-rs', install: 'npm install -g elm-test-rs' }
  ];
  
  for (const tool of tools) {
    try {
      await execAsync(`which ${tool.cmd}`);
    } catch {
      missing.push(tool);
    }
  }
  
  if (missing.length > 0) {
    spinner.fail('Missing required tools');
    console.log('\n' + chalk.yellow('Please install the following tools:'));
    missing.forEach(tool => {
      console.log(`  ${chalk.red('✗')} ${tool.name}: ${chalk.cyan(tool.install)}`);
    });
    return false;
  }
  
  spinner.succeed('All prerequisites installed');
  return true;
}

/**
 * Initialize Lamdera project
 */
export async function initializeLamdera(projectPath) {
  const spinner = ora('Initializing Lamdera project...').start();
  
  try {
    await execAsync(`cd ${projectPath} && lamdera init`);
    spinner.succeed('Lamdera project initialized');
  } catch (error) {
    spinner.fail('Failed to initialize Lamdera');
    throw error;
  }
}

/**
 * Create valid elm.json without duplicate dependencies
 */
export async function createElmJson(projectPath) {
  const elmJson = {
    "type": "application",
    "source-directories": ["src"],
    "elm-version": "0.19.1",
    "dependencies": {
      "direct": {
        "elm/browser": "1.0.2",
        "elm/core": "1.0.5",
        "elm/html": "1.0.0",
        "elm/http": "2.0.0",
        "elm/json": "1.1.3",
        "elm/time": "1.0.0",
        "elm/url": "1.0.0",
        "lamdera/codecs": "1.0.0",
        "lamdera/core": "1.0.0"
      },
      "indirect": {
        "elm/bytes": "1.0.8",
        "elm/file": "1.0.5",
        "elm/virtual-dom": "1.0.3"
      }
    },
    "test-dependencies": {
      "direct": {
        "elm-explorations/test": "2.1.1",
        "lamdera/program-test": "3.0.0"
      },
      "indirect": {
        "elm/random": "1.0.0"
      }
    }
  };
  
  await fs.writeJson(
    path.join(projectPath, 'elm.json'),
    elmJson,
    { spaces: 4 }
  );
}

/**
 * Install Elm dependencies using lamdera install
 */
export async function installElmDependencies(projectPath, dependencies) {
  const spinner = ora('Installing Elm dependencies...').start();
  
  for (const dep of dependencies) {
    try {
      spinner.text = `Installing ${dep}...`;
      await execAsync(`cd ${projectPath} && yes | lamdera install ${dep}`);
    } catch (error) {
      // Some dependencies might already be installed
      console.log(chalk.yellow(`  Note: ${dep} might already be installed`));
    }
  }
  
  spinner.succeed('Elm dependencies installed');
}

/**
 * Setup Tailwind CSS
 */
export async function setupTailwind(projectPath) {
  const spinner = ora('Setting up Tailwind CSS...').start();
  
  // Create Tailwind config
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.elm",
    "./index.html",
    "./*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}`;
  
  await fs.writeFile(
    path.join(projectPath, 'tailwind.config.js'),
    tailwindConfig
  );
  
  // Create CSS input file
  const cssInput = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles for Lamdera app */
.transition-theme {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.auth-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors;
}`;
  
  await fs.ensureDir(path.join(projectPath, 'src/css'));
  await fs.writeFile(
    path.join(projectPath, 'src/css/input.css'),
    cssInput
  );
  
  spinner.succeed('Tailwind CSS configured');
}

/**
 * Setup Git hooks for Lamdera project
 */
export async function setupGitHooks(projectPath) {
  const spinner = ora('Setting up Git hooks...').start();
  
  const preCommitHook = `#!/bin/bash

# Lamdera Pre-commit Hook
# Ensures code quality before committing

set -e

echo "🔍 Running pre-commit checks..."

# Format Elm code
if command -v elm-format &> /dev/null; then
  echo "🎨 Running elm-format..."
  elm-format src tests --yes
fi

# Check compilation
echo "📦 Checking compilation..."
if ! lamdera make src/Backend.elm src/Frontend.elm; then
  echo "❌ Compilation failed! Please fix errors before committing."
  exit 1
fi

# Run tests if available
if [ -f "elm-test-rs.json" ] && command -v elm-test-rs &> /dev/null; then
  echo "🧪 Running tests..."
  if ! elm-test-rs --compiler $(which lamdera); then
    echo "❌ Tests failed! Please fix failing tests before committing."
    exit 1
  fi
fi

echo "✅ All checks passed!"`;
  
  const hooksDir = path.join(projectPath, '.githooks');
  await fs.ensureDir(hooksDir);
  await fs.writeFile(
    path.join(hooksDir, 'pre-commit'),
    preCommitHook,
    { mode: 0o755 }
  );
  
  // Configure Git to use the hooks
  try {
    await execAsync(`cd ${projectPath} && git config core.hooksPath .githooks`);
    spinner.succeed('Git hooks configured');
  } catch {
    spinner.warn('Git hooks created but not configured (no git repo)');
  }
}

/**
 * Create development scripts
 */
export async function createDevScripts(projectPath) {
  const devWatchScript = `#!/bin/bash

# Lamdera Development Watch Script
# Auto-restarts on JS interop changes

LAMDERA_PID=""
LAMDERA_PORT=8000

cleanup() {
  if [ ! -z "$LAMDERA_PID" ]; then
    echo "Stopping Lamdera..."
    kill $LAMDERA_PID 2>/dev/null
  fi
  exit 0
}

trap cleanup EXIT INT TERM

start_lamdera() {
  echo "🚀 Starting Lamdera on port $LAMDERA_PORT..."
  lamdera live &
  LAMDERA_PID=$!
  
  # Wait for port to be available
  while ! nc -z localhost $LAMDERA_PORT 2>/dev/null; do
    sleep 1
  done
  
  echo "✅ Lamdera running on http://localhost:$LAMDERA_PORT"
}

# Initial start
start_lamdera

# Watch for changes
if command -v inotifywait &> /dev/null; then
  echo "👁️ Watching for JS interop changes..."
  while inotifywait -r -e modify elm-pkg-js/ 2>/dev/null; do
    echo "🔄 JS files changed, restarting..."
    kill $LAMDERA_PID
    wait $LAMDERA_PID 2>/dev/null
    start_lamdera
  done
else
  echo "ℹ️ Install inotify-tools for auto-restart on JS changes"
  wait $LAMDERA_PID
fi`;
  
  await fs.writeFile(
    path.join(projectPath, 'lamdera-dev-watch.sh'),
    devWatchScript,
    { mode: 0o755 }
  );
}

/**
 * Main setup function for Lamdera project
 */
export async function setupLamderaProject(projectPath, options = {}) {
  const {
    profile = 'standard',
    auth = false,
    i18n = true,
    darkMode = true,
    testing = true,
    aiRules = true,
    gitHooks = false
  } = options;
  
  console.log(chalk.blue('\n🚀 Setting up Lamdera project...\n'));
  
  // Check prerequisites
  if (!await checkPrerequisites()) {
    throw new Error('Missing prerequisites. Please install required tools.');
  }
  
  // Initialize Lamdera
  await initializeLamdera(projectPath);
  
  // Create valid elm.json
  await createElmJson(projectPath);
  
  // Setup Tailwind
  if (profile !== 'minimal') {
    await setupTailwind(projectPath);
  }
  
  // Setup features based on profile
  if (testing) {
    await createTestStructure(projectPath);
  }
  
  if (aiRules) {
    await createAIRules(projectPath);
  }
  
  if (gitHooks) {
    await setupGitHooks(projectPath);
  }
  
  // Create dev scripts
  await createDevScripts(projectPath);
  
  console.log(chalk.green('\n✨ Lamdera project setup complete!\n'));
  console.log(chalk.cyan('Next steps:'));
  console.log(`  1. cd ${path.basename(projectPath)}`);
  console.log('  2. npm install');
  console.log('  3. npm run dev');
  console.log('\n');
}

/**
 * Create test structure
 */
async function createTestStructure(projectPath) {
  const elmTestConfig = {
    "root": "./",
    "globs": ["tests/**/*.elm"]
  };
  
  await fs.writeJson(
    path.join(projectPath, 'elm-test-rs.json'),
    elmTestConfig,
    { spaces: 2 }
  );
}

/**
 * Create AI assistant rules
 */
async function createAIRules(projectPath) {
  // These would be populated from your template files
  const cursorRules = `# Lamdera Project Rules for Cursor

## Structure
- Models: Always define BackendModel and FrontendModel in src/Types.elm
- Messages: User actions are FrontendMsg, backend communication uses ToBackend/ToFrontend
- Compilation: Use \`lamdera make src/Frontend.elm src/Backend.elm\`

## Best Practices
- Use \`yes | lamdera install\` for dependencies
- Never manually edit elm.json
- Keep Frontend and Backend models separate
- Use Effect.* modules for testing compatibility`;
  
  await fs.writeFile(
    path.join(projectPath, '.cursorrules'),
    cursorRules
  );
}