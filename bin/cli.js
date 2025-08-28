#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { simpleGit } from 'simple-git';
import { fileURLToPath } from 'url';
import { generateRules } from '../src/templates/rules.js';
import { generateReadme } from '../src/templates/readme.js';
import { getStackConfig } from '../src/stacks/index.js';
import { createGitHubRepo } from '../src/utils/github.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

program
  .name('newproject')
  .description('⚡ Lightning fast AI-optimized project generator')
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
  .action(async (projectName, options) => {
    if (!projectName && !process.argv.slice(2).length) {
      projectName = 'my-awesome-project';
    }
    await createProject(projectName, options);
  });

async function createProject(projectName, options) {
  console.log(chalk.cyan.bold('\n⚡ AI Project Generator\n'));

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
  // Sanitize project name
  let rawName = projectName || answers.projectName || 'my-awesome-project';
  const sanitized = rawName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
  if (sanitized !== rawName) {
    console.log(chalk.yellow(`Nom de projet ajusté: '${rawName}' => '${sanitized}'`));
  }
  const finalProjectName = sanitized || 'my-awesome-project';
  const finalDescription = options.description || answers.description || 'A new awesome project';
  const projectPath = path.join(process.cwd(), finalProjectName);

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

  // Spinner pour la création
  const spinner = ora('Création du projet...').start();

  try {
    // Créer le dossier du projet
    await fs.ensureDir(projectPath);

    // Créer la structure de base
    await fs.ensureDir(path.join(projectPath, '.ai'));
    await fs.ensureDir(path.join(projectPath, 'src'));

    // Générer les règles IA
    const rulesContent = generateRules(finalDescription, finalStack);
    await fs.writeFile(path.join(projectPath, '.ai', 'rules.md'), rulesContent);
    await fs.writeFile(path.join(projectPath, '.cursorrules'), rulesContent);
    await fs.writeFile(path.join(projectPath, '.claude_rules'), rulesContent);

    // Générer le README
    const readmeContent = generateReadme(finalProjectName, finalDescription, finalStack);
    await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);

    // Générer les fichiers spécifiques au stack
    const stackConfig = getStackConfig(finalStack);
    
    // Créer les fichiers de config du stack
    for (const [filename, content] of Object.entries(stackConfig.files)) {
      const filePath = path.join(projectPath, filename);
      const fileDir = path.dirname(filePath);
      
      // Créer le répertoire si nécessaire
      await fs.ensureDir(fileDir);
      
      // Remplacer PROJECT_NAME par le vrai nom
      const finalContent = content.replace(/PROJECT_NAME/g, finalProjectName);
      await fs.writeFile(filePath, finalContent);
    }

    // .gitignore
    await fs.writeFile(path.join(projectPath, '.gitignore'), stackConfig.gitignore);

    spinner.succeed(chalk.green('Projet créé!'));

    // Git init
    if (options.git !== false) {
      const gitSpinner = ora('Initialisation Git...').start();
      const git = simpleGit(projectPath);
      await git.init();
      await git.add('.');
      await git.commit('🚀 Initial commit - AI-optimized project');
      gitSpinner.succeed(chalk.green('Git initialisé!'));

      // GitHub repo (ne pas déclencher auto en mode non-interactif)
      if (!nonInteractive && answers.github) {
        await createGitHubRepo(finalProjectName, answers.visibility, projectPath);
      }
    }

    // Instructions finales
    console.log(chalk.cyan.bold('\n✨ Projet créé avec succès!\n'));
    console.log(chalk.white('📁 Dossier: ') + chalk.yellow(projectPath));
    console.log(chalk.white('\n🚀 Pour commencer:\n'));
    console.log(chalk.gray(`  cd ${finalProjectName}`));
    
    // Commandes spécifiques au stack
    if (stackConfig.commands) {
      stackConfig.commands.forEach(cmd => {
        console.log(chalk.gray(`  ${cmd}`));
      });
    }

    console.log(chalk.cyan('\n💡 Les règles IA sont dans:'));
    console.log(chalk.gray('   - .ai/rules.md (dossier principal)'));
    console.log(chalk.gray('   - .cursorrules (pour Cursor)'));
    console.log(chalk.gray('   - .claude_rules (pour Claude)'));
    console.log(chalk.cyan('\n🤖 Compatible avec: Claude, Cursor, Copilot, ChatGPT\n'));

  } catch (error) {
    spinner.fail(chalk.red('Erreur lors de la création'));
    console.error(error);
    process.exit(1);
  }
}

program.parse();
