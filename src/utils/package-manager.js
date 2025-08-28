import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export async function detectPackageManager() {
  // Check for lock files in current directory
  const cwd = process.cwd();
  
  if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  if (await fs.pathExists(path.join(cwd, 'package-lock.json'))) {
    return 'npm';
  }
  
  // Check if commands are available
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {}
  
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch {}
  
  return 'npm'; // Default fallback
}

export function getPackageManagerCommands(packageManager) {
  const commands = {
    npm: {
      install: 'npm install',
      installDev: 'npm install --save-dev',
      run: 'npm run',
      exec: 'npx',
      init: 'npm init -y',
      test: 'npm test',
      build: 'npm run build',
      lint: 'npm run lint',
      format: 'npm run format',
    },
    yarn: {
      install: 'yarn',
      installDev: 'yarn add --dev',
      run: 'yarn',
      exec: 'yarn dlx',
      init: 'yarn init -y',
      test: 'yarn test',
      build: 'yarn build',
      lint: 'yarn lint',
      format: 'yarn format',
    },
    pnpm: {
      install: 'pnpm install',
      installDev: 'pnpm add --save-dev',
      run: 'pnpm',
      exec: 'pnpm dlx',
      init: 'pnpm init',
      test: 'pnpm test',
      build: 'pnpm build',
      lint: 'pnpm lint',
      format: 'pnpm format',
    },
  };
  
  return commands[packageManager] || commands.npm;
}

export function generatePackageJson(projectName, description, author, license, packageManager, scripts = {}) {
  return {
    name: projectName,
    version: '1.0.0',
    description,
    main: 'src/index.js',
    type: 'module',
    scripts: {
      start: 'node src/index.js',
      dev: 'node --watch src/index.js',
      ...scripts,
    },
    keywords: [],
    author,
    license,
    engines: {
      node: '>=16.0.0',
    },
  };
}