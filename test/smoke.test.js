#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, '..', 'bin', 'cli.js');

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds
const TEMP_DIR = path.join(os.tmpdir(), 'faststart-test-' + Date.now());

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanup() {
  try {
    await fs.remove(TEMP_DIR);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

async function testProjectGeneration(stack, projectName) {
  const projectPath = path.join(TEMP_DIR, projectName);
  
  try {
    // Run the CLI command
    const command = `node ${CLI_PATH} ${projectName} --${stack} --no-git --no-github --yes --force`;
    log(`  Running: ${command}`, 'blue');
    
    execSync(command, {
      cwd: TEMP_DIR,
      timeout: TEST_TIMEOUT,
      stdio: 'pipe',
    });
    
    // Check if project directory was created
    if (!await fs.pathExists(projectPath)) {
      throw new Error(`Project directory not created: ${projectPath}`);
    }
    
    // Check essential files
    const essentialFiles = [
      '.ai/rules.md',
      '.cursorrules',
      '.claude_rules',
      'README.md',
      '.gitignore',
    ];
    
    // Stack-specific files
    const stackFiles = {
      javascript: ['package.json', 'src/index.js'],
      typescript: ['package.json', 'tsconfig.json', 'src/index.ts'],
      python: ['requirements.txt', 'src/main.py'],
      fastapi: ['requirements.txt', 'main.py', 'app/__init__.py'],
      ruby: ['Gemfile', 'src/main.rb'],
      rails: ['Gemfile', 'config/routes.rb'],
      react: ['package.json', 'index.html', 'src/App.jsx'],
      next: ['package.json', 'next.config.js'],
      lamdera: ['elm.json', 'src/Main.elm'],
    };
    
    const filesToCheck = [...essentialFiles, ...(stackFiles[stack] || [])];
    
    for (const file of filesToCheck) {
      const filePath = path.join(projectPath, file);
      if (!await fs.pathExists(filePath)) {
        throw new Error(`Missing file: ${file}`);
      }
    }
    
    log(`  ✅ ${stack} project created successfully`, 'green');
    return true;
  } catch (error) {
    log(`  ❌ ${stack} project failed: ${error.message}`, 'red');
    return false;
  }
}

async function testDryRun() {
  try {
    const command = `node ${CLI_PATH} test-dry-run --javascript --dry-run`;
    const output = execSync(command, {
      cwd: TEMP_DIR,
      timeout: TEST_TIMEOUT,
      encoding: 'utf8',
    });
    
    if (!output.includes('Dry-run')) {
      throw new Error('Dry-run mode not working');
    }
    
    // Check that no files were created
    const projectPath = path.join(TEMP_DIR, 'test-dry-run');
    if (await fs.pathExists(projectPath)) {
      throw new Error('Dry-run created files');
    }
    
    log('  ✅ Dry-run test passed', 'green');
    return true;
  } catch (error) {
    log(`  ❌ Dry-run test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testScopedPackageName() {
  try {
    const command = `node ${CLI_PATH} @myorg/mypackage --javascript --no-git --no-github --yes --force`;
    execSync(command, {
      cwd: TEMP_DIR,
      timeout: TEST_TIMEOUT,
      stdio: 'pipe',
    });
    
    // Check that directory uses base name only
    const projectPath = path.join(TEMP_DIR, 'mypackage');
    if (!await fs.pathExists(projectPath)) {
      throw new Error('Scoped package directory not created correctly');
    }
    
    // Check package.json has scoped name
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
    if (packageJson.name !== '@myorg/mypackage') {
      throw new Error(`Package name incorrect: ${packageJson.name}`);
    }
    
    log('  ✅ Scoped package name test passed', 'green');
    return true;
  } catch (error) {
    log(`  ❌ Scoped package name test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testProfiles() {
  const profiles = ['minimal', 'standard', 'full'];
  
  for (const profile of profiles) {
    try {
      const projectName = `test-${profile}`;
      const command = `node ${CLI_PATH} ${projectName} --javascript --profile ${profile} --no-git --no-github --yes --force`;
      
      execSync(command, {
        cwd: TEMP_DIR,
        timeout: TEST_TIMEOUT,
        stdio: 'pipe',
      });
      
      const projectPath = path.join(TEMP_DIR, projectName);
      
      // Check profile-specific files
      if (profile === 'minimal') {
        // Should NOT have linting/testing files
        if (await fs.pathExists(path.join(projectPath, '.eslintrc.json'))) {
          throw new Error('Minimal profile has ESLint config');
        }
      } else if (profile === 'full') {
        // Should have CI/CD files
        if (!await fs.pathExists(path.join(projectPath, '.github/workflows/ci.yml'))) {
          throw new Error('Full profile missing GitHub Actions');
        }
      }
      
      log(`  ✅ Profile ${profile} test passed`, 'green');
    } catch (error) {
      log(`  ❌ Profile ${profile} test failed: ${error.message}`, 'red');
      return false;
    }
  }
  
  return true;
}

async function runTests() {
  log('\n🧪 FastStartProject Smoke Tests\n', 'yellow');
  
  // Setup
  await fs.ensureDir(TEMP_DIR);
  log(`📁 Test directory: ${TEMP_DIR}\n`, 'blue');
  
  const tests = [
    { name: 'Dry Run', fn: testDryRun },
    { name: 'JavaScript Project', fn: () => testProjectGeneration('javascript', 'test-js') },
    { name: 'TypeScript Project', fn: () => testProjectGeneration('typescript', 'test-ts') },
    { name: 'Python Project', fn: () => testProjectGeneration('python', 'test-py') },
    { name: 'FastAPI Project', fn: () => testProjectGeneration('fastapi', 'test-fastapi') },
    { name: 'React Project', fn: () => testProjectGeneration('react', 'test-react') },
    { name: 'Scoped Package Name', fn: testScopedPackageName },
    { name: 'Profiles', fn: testProfiles },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    log(`\n📋 ${test.name}:`, 'yellow');
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Cleanup
  await cleanup();
  
  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log(`\n📊 Results: ${passed} passed, ${failed} failed\n`, failed > 0 ? 'red' : 'green');
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  cleanup();
  process.exit(1);
});