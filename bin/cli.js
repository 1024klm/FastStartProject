#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { simpleGit } from 'simple-git';
import { fileURLToPath } from 'url';
import { generateEditorconfig } from '../src/templates/editorconfig.js';
import { generateGitHubActions } from '../src/templates/github-actions.js';
import { generateDockerfiles } from '../src/templates/docker.js';
import { getStackConfig } from '../src/stacks/index.js';
import { createGitHubRepo } from '../src/utils/github.js';
import { detectPackageManager, getPackageManagerCommands } from '../src/utils/package-manager.js';
import { replaceTemplateVariables } from '../src/utils/template-vars.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

program
  .name('newproject')
  .description('⚡ Lightning fast project generator')
  .version(pkg.version || '1.0.0');

program
  .command('start [project-name]')
  .description('Start interactive project creation')
  .option('-js, --javascript', 'JavaScript project')
  .option('-ts, --typescript', 'TypeScript project')
  .option('-py, --python', 'Python project')
  .option('-ruby, --ruby', 'Ruby project')
  .option('-lamdera, --lamdera', 'Elm/Lamdera project')
  .option('-react, --react', 'React application')
  .option('-next, --next', 'Next.js application')
  .option('-fastapi, --fastapi', 'FastAPI backend')
  .option('-rails, --rails', 'Ruby on Rails')
  .option('--stack <name>', 'Stack name (javascript|typescript|python|ruby|lamdera|react|next|fastapi|rails)')
  .option('-d, --description <text>', 'Project description')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('--no-git', 'Skip git initialization')
  .option('--no-github', 'Skip GitHub repo creation')
  .option('--package-manager <pm>', 'Package manager (npm|yarn|pnpm)')
  .option('--dry-run', 'Preview files without creating them')
  .option('--license <type>', 'License type (MIT|Apache-2.0|GPL-3.0|ISC|BSD-3-Clause)')
  .option('--author <name>', 'Author name')
  .option('--profile <type>', 'Project profile (minimal|standard|full)')
  .option('--docker', 'Include Docker configuration')
  .option('--default-branch <branch>', 'Default git branch name (main|master)')
  .action(async (projectName, options) => {
    await createProject(projectName, options);
  });

// Si aucune commande, mode interactif
program
  .argument('[project-name]', 'Project name')
  .option('-js, --javascript', 'JavaScript project')
  .option('-ts, --typescript', 'TypeScript project')
  .option('-py, --python', 'Python project')
  .option('-ruby, --ruby', 'Ruby project')
  .option('-lamdera, --lamdera', 'Elm/Lamdera project')
  .option('-react, --react', 'React application')
  .option('-next, --next', 'Next.js application')
  .option('-fastapi, --fastapi', 'FastAPI backend')
  .option('-rails, --rails', 'Ruby on Rails')
  .option('--stack <name>', 'Stack name (javascript|typescript|python|ruby|lamdera|react|next|fastapi|rails)')
  .option('-d, --description <text>', 'Project description')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-f, --force', 'Overwrite target directory if it exists')
  .option('--no-git', 'Skip git initialization')
  .option('--no-github', 'Skip GitHub repo creation')
  .option('--package-manager <pm>', 'Package manager (npm|yarn|pnpm)')
  .option('--dry-run', 'Preview files without creating them')
  .option('--license <type>', 'License type (MIT|Apache-2.0|GPL-3.0|ISC|BSD-3-Clause)')
  .option('--author <name>', 'Author name')
  .option('--profile <type>', 'Project profile (minimal|standard|full)')
  .option('--docker', 'Include Docker configuration')
  .option('--default-branch <branch>', 'Default git branch name (main|master)')
  .action(async (projectName, options) => {
    if (!projectName && !process.argv.slice(2).length) {
      projectName = 'my-awesome-project';
    }
    await createProject(projectName, options);
  });

async function createProject(projectName, options) {
  console.log(chalk.cyan.bold('\n⚡ FastStart Project Generator\n'));

  // Détermine le stack
  let stack = null;
  const stacks = ['javascript', 'typescript', 'python', 'ruby', 'lamdera', 'react', 'next', 'fastapi', 'rails'];
  const explicitFlags = stacks.filter((s) => options[s]);
  const requested = options.stack ? [options.stack] : [];
  const candidates = [...new Set([...explicitFlags, ...requested])];
  if (candidates.length > 1) {
    console.log(chalk.red('Veuillez sélectionner un seul stack.')); 
    console.log(chalk.gray(`Reçus: ${candidates.join(', ')}`));
    process.exit(1);
  }
  if (candidates.length === 1) {
    const c = candidates[0];
    if (!stacks.includes(c)) {
      console.log(chalk.red(`Stack inconnu: ${c}`));
      console.log(chalk.gray(`Stacks supportés: ${stacks.join(', ')}`));
      process.exit(1);
    }
    stack = c;
  }

  // Mode non interactif (CI/TTY absent ou --yes)
  const nonInteractive = options.yes || !process.stdout.isTTY || process.env.CI === 'true' || process.env.CI === '1';

  // Questions minimales
  const questions = [];
  
  if (!projectName) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Nom du projet:',
      default: 'my-awesome-project',
      validate: (input) => /^[a-z0-9-_]+$/.test(input) || 'Utilisez seulement des lettres minuscules, chiffres, - et _'
    });
  }
  
  if (!options.description && !nonInteractive) {
    questions.push({
      type: 'input',
      name: 'description',
      message: 'Description courte (pour l\'IA):',
      default: 'A new awesome project'
    });
  }
  
  if (!stack && !nonInteractive) {
    questions.push({
      type: 'list',
      name: 'stack',
      message: 'Stack:',
      choices: [
        { name: '⚡ JavaScript (Simple & Rapide)', value: 'javascript' },
        { name: '🔷 TypeScript (Type-safe)', value: 'typescript' },
        { name: '🐍 Python (Data/AI/Backend)', value: 'python' },
        { name: '💎 Ruby (Web/Scripts)', value: 'ruby' },
        { name: '🌳 Elm/Lamdera (Functional)', value: 'lamdera' },
        { name: '⚛️ React (UI Components)', value: 'react' },
        { name: '▲ Next.js (Full-stack React)', value: 'next' },
        { name: '🚀 FastAPI (Python API)', value: 'fastapi' },
        { name: '🛤️ Rails (Ruby Full-stack)', value: 'rails' }
      ]
    });
  }
  
  if (options.github !== false && !nonInteractive) {
    questions.push({
      type: 'confirm',
      name: 'github',
      message: 'Créer un repo GitHub?',
      default: false
    });
    
    questions.push({
      type: 'list',
      name: 'visibility',
      message: 'Visibilité du repo:',
      choices: ['private', 'public'],
      when: (answers) => answers.github
    });
  }

  const answers = questions.length ? await inquirer.prompt(questions) : {};

  // Utilise le stack des options ou celui des réponses
  const finalStack = stack || answers.stack || 'javascript';
  // Sanitize project name (support scoped packages)
  let rawName = projectName || answers.projectName || 'my-awesome-project';
  let scopedName = null;
  let baseName = rawName;
  
  // Check for scoped package name
  if (rawName.startsWith('@') && rawName.includes('/')) {
    const parts = rawName.split('/');
    scopedName = parts[0];
    baseName = parts[1];
  }
  
  const sanitized = baseName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
  
  let finalProjectName = sanitized || 'my-awesome-project';
  if (scopedName) {
    finalProjectName = `${scopedName}/${finalProjectName}`;
  }
  
  if (rawName !== finalProjectName) {
    console.log(chalk.yellow(`Nom de projet ajusté: '${rawName}' => '${finalProjectName}'`));
  }
  const finalDescription = options.description || answers.description || 'A new awesome project';
  const finalAuthor = options.author || answers.author || process.env.USER || 'Your Name';
  const finalLicense = options.license || answers.license || 'MIT';
  const finalProfile = options.profile || answers.profile || 'standard';
  const packageManager = options.packageManager || answers.packageManager || await detectPackageManager();
  const defaultBranch = options.defaultBranch || 'main';
  const includeDocker = options.docker || answers.docker || false;
  const dryRun = options.dryRun || false;
  
  // Use base name for directory (without scope)
  const dirName = scopedName ? finalProjectName.split('/')[1] : finalProjectName;
  const projectPath = path.join(process.cwd(), dirName);

  // Vérifie si le dossier existe déjà
  if (await fs.pathExists(projectPath)) {
    if (options.force || nonInteractive) {
      await fs.remove(projectPath);
    } else {
      const overwrite = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: `Le dossier ${finalProjectName} existe déjà. Écraser?`,
        default: false
      }]);
      
      if (!overwrite.overwrite) {
        console.log(chalk.yellow('Création annulée.'));
        process.exit(0);
      }
      
      await fs.remove(projectPath);
    }
  }

  // Import utilities
  const { getProfileConfig, applyProfileToStack } = await import('../src/utils/profiles.js');
  const { getTemplateVariables } = await import('../src/utils/template-vars.js');
  const { getPrettierConfig, getESLintConfig, getBlackConfig, getIsortConfig, getRuboCopConfig } = await import('../src/templates/formatters.js');
  
  // Prepare template variables
  const templateVars = getTemplateVariables({
    projectName: finalProjectName,
    description: finalDescription,
    author: finalAuthor,
    license: finalLicense,
    packageManager,
  });
  
  // Get profile configuration
  const profileConfig = getProfileConfig(finalProfile);
  
  // Dry run mode
  if (dryRun) {
    console.log(chalk.cyan.bold('\n🔍 Mode Dry-Run - Aperçu des fichiers à créer:\n'));
    console.log(chalk.white('📁 Structure du projet:'));
    console.log(chalk.gray(`  ${dirName}/
    ├── .editorconfig
    ├── .gitignore
    └── src/`));

    if (profileConfig.includeGitHubActions) {
      console.log(chalk.gray(`    └── .github/workflows/ci.yml`));
    }
    if (includeDocker) {
      console.log(chalk.gray(`    ├── Dockerfile
    └── docker-compose.yml`));
    }

    console.log(chalk.cyan('\n✅ Dry-run terminé. Utilisez sans --dry-run pour créer le projet.'));
    process.exit(0);
  }
  
  // Spinner pour la création
  const spinner = ora('Création du projet...').start();

  try {
    // Créer le dossier du projet
    await fs.ensureDir(projectPath);

    // Créer la structure de base
    await fs.ensureDir(path.join(projectPath, 'src'));

    // Generate .editorconfig
    if (profileConfig.includeEditorconfig) {
      const editorconfigContent = generateEditorconfig(finalStack);
      await fs.writeFile(path.join(projectPath, '.editorconfig'), editorconfigContent);
    }

    // Générer les fichiers spécifiques au stack
    let stackConfig = getStackConfig(finalStack);
    stackConfig = applyProfileToStack(stackConfig, finalProfile);
    
    // Enhance stack with standardized scripts
    const { enhanceStackConfig } = await import('../src/stacks/enhanced.js');
    stackConfig = enhanceStackConfig(stackConfig, finalStack, packageManager, finalProfile);
    
    // Add formatter configs for JS/TS stacks
    if (['javascript', 'typescript', 'react', 'next'].includes(finalStack) && profileConfig.includeFormatting) {
      stackConfig.files['.prettierrc'] = JSON.stringify(getPrettierConfig(finalStack), null, 2);
      if (profileConfig.includeLinting) {
        const isTS = ['typescript', 'react', 'next'].includes(finalStack);
        stackConfig.files['.eslintrc.json'] = JSON.stringify(getESLintConfig(finalStack, isTS), null, 2);
      }
    }
    
    // Add Python formatter configs
    if (['python', 'fastapi'].includes(finalStack) && profileConfig.includeFormatting) {
      if (!stackConfig.files['pyproject.toml']) {
        stackConfig.files['pyproject.toml'] = '';
      }
      stackConfig.files['pyproject.toml'] += '\n' + getBlackConfig() + '\n' + getIsortConfig();
    }
    
    // Add Ruby formatter configs
    if (['ruby', 'rails'].includes(finalStack) && profileConfig.includeLinting) {
      stackConfig.files['.rubocop.yml'] = getRuboCopConfig();
    }
    
    // Créer les fichiers de config du stack
    for (const [filename, content] of Object.entries(stackConfig.files)) {
      const filePath = path.join(projectPath, filename);
      const fileDir = path.dirname(filePath);
      
      // Créer le répertoire si nécessaire
      await fs.ensureDir(fileDir);
      
      // Replace template variables
      const finalContent = replaceTemplateVariables(content, templateVars);
      await fs.writeFile(filePath, finalContent);
    }
    
    // Generate GitHub Actions
    if (profileConfig.includeGitHubActions) {
      const ghActions = generateGitHubActions(finalStack, packageManager);
      if (ghActions) {
        for (const [filename, content] of Object.entries(ghActions)) {
          const filePath = path.join(projectPath, filename);
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, replaceTemplateVariables(content, templateVars));
        }
      }
    }
    
    // Generate Docker files
    if (includeDocker) {
      const dockerFiles = generateDockerfiles(finalStack, packageManager);
      if (dockerFiles) {
        for (const [filename, content] of Object.entries(dockerFiles)) {
          const filePath = path.join(projectPath, filename);
          await fs.writeFile(filePath, replaceTemplateVariables(content, templateVars));
        }
      }
    }

    // .gitignore
    await fs.writeFile(path.join(projectPath, '.gitignore'), stackConfig.gitignore);

    spinner.succeed(chalk.green('Projet créé!'));

    // Git init
    if (options.git !== false) {
      const gitSpinner = ora('Initialisation Git...').start();
      const git = simpleGit(projectPath);
      await git.init(defaultBranch ? ['--initial-branch', defaultBranch] : []);
      await git.add('.');
      await git.commit('🚀 Initial commit');
      gitSpinner.succeed(chalk.green('Git initialisé!'));

      // GitHub repo (ne pas déclencher auto en mode non-interactif)
      if (!nonInteractive && answers.github) {
        await createGitHubRepo(finalProjectName, answers.visibility, projectPath, {
          description: finalDescription,
          topics: [finalStack, 'faststart'],
          enableIssues: true,
          protectMain: finalProfile === 'full'
        });
      }
    }

    // Instructions finales
    console.log(chalk.cyan.bold('\n✨ Projet créé avec succès!\n'));
    console.log(chalk.white('📁 Dossier: ') + chalk.yellow(projectPath));
    console.log(chalk.white('📦 Package Manager: ') + chalk.yellow(packageManager));
    console.log(chalk.white('⚙️  Profil: ') + chalk.yellow(finalProfile));
    console.log(chalk.white('\n🚀 Pour commencer:\n'));
    console.log(chalk.gray(`  cd ${dirName}`));
    
    // Package manager specific commands
    const pmCommands = getPackageManagerCommands(packageManager);
    
    // Stack specific commands with proper package manager
    if (['javascript', 'typescript', 'react', 'next'].includes(finalStack)) {
      console.log(chalk.gray(`  ${pmCommands.install}`));
      if (profileConfig.includeLinting) console.log(chalk.gray(`  ${pmCommands.run} lint`));
      if (profileConfig.includeFormatting) console.log(chalk.gray(`  ${pmCommands.run} format`));
      if (profileConfig.includeTests) console.log(chalk.gray(`  ${pmCommands.run} test`));
      console.log(chalk.gray(`  ${pmCommands.run} dev`));
    } else if (['python', 'fastapi'].includes(finalStack)) {
      const isWindows = process.platform === 'win32';
      console.log(chalk.gray('  python -m venv venv'));
      if (isWindows) {
        console.log(chalk.gray('  # Windows PowerShell:'));
        console.log(chalk.gray('  .\\venv\\Scripts\\Activate.ps1'));
        console.log(chalk.gray('  # Windows Command Prompt:'));
        console.log(chalk.gray('  venv\\Scripts\\activate.bat'));
      } else {
        console.log(chalk.gray('  source venv/bin/activate'));
      }
      console.log(chalk.gray('  pip install -r requirements.txt'));
      if (profileConfig.includeLinting) console.log(chalk.gray('  black . && isort . && flake8'));
      if (profileConfig.includeTests) console.log(chalk.gray('  pytest'));
      if (finalStack === 'fastapi') {
        console.log(chalk.gray('  uvicorn main:app --reload'));
      } else {
        console.log(chalk.gray('  python src/main.py'));
      }
    } else if (['ruby', 'rails'].includes(finalStack)) {
      console.log(chalk.gray('  bundle install'));
      if (profileConfig.includeLinting) console.log(chalk.gray('  bundle exec rubocop'));
      if (profileConfig.includeTests) console.log(chalk.gray('  bundle exec rspec'));
      if (finalStack === 'rails') {
        console.log(chalk.gray('  bundle exec rails db:create'));
        console.log(chalk.gray('  bundle exec rails server'));
      } else {
        console.log(chalk.gray('  ruby src/main.rb'));
      }
    }
    
    if (includeDocker) {
      console.log(chalk.cyan('\n🐳 Docker:'));
      console.log(chalk.gray('  docker-compose up'));
    }

    console.log('');

  } catch (error) {
    spinner.fail(chalk.red('Erreur lors de la création'));
    console.error(error);
    process.exit(1);
  }
}

program.parse();
