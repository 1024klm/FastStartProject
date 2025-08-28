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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

program
  .name('newproject')
  .description('⚡ Lightning fast AI-optimized project generator')
  .version('1.0.0');

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
  for (const s of stacks) {
    if (options[s]) {
      stack = s;
      break;
    }
  }

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
  
  questions.push({
    type: 'input',
    name: 'description',
    message: 'Description courte (pour l\'IA):',
    default: 'A new awesome project'
  });
  
  if (!stack) {
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
  
  if (options.github !== false) {
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

  const answers = await inquirer.prompt(questions);

  // Utilise le stack des options ou celui des réponses
  const finalStack = stack || answers.stack;
  const finalProjectName = projectName || answers.projectName;
  const projectPath = path.join(process.cwd(), finalProjectName);

  // Vérifie si le dossier existe déjà
  if (await fs.pathExists(projectPath)) {
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

  // Spinner pour la création
  const spinner = ora('Création du projet...').start();

  try {
    // Créer le dossier du projet
    await fs.ensureDir(projectPath);

    // Créer la structure de base
    await fs.ensureDir(path.join(projectPath, '.ai'));
    await fs.ensureDir(path.join(projectPath, 'src'));

    // Générer les règles IA
    const rulesContent = generateRules(answers.description, finalStack);
    await fs.writeFile(path.join(projectPath, '.ai', 'rules.md'), rulesContent);
    await fs.writeFile(path.join(projectPath, '.cursorrules'), rulesContent);
    await fs.writeFile(path.join(projectPath, '.claude_rules'), rulesContent);

    // Générer le README
    const readmeContent = generateReadme(finalProjectName, answers.description, finalStack);
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

      // GitHub repo
      if (answers.github) {
        console.log(chalk.yellow('\n📝 Pour créer le repo GitHub:'));
        console.log(chalk.white(`gh repo create ${finalProjectName} --${answers.visibility} --source=. --remote=origin --push`));
        console.log(chalk.gray('(Nécessite GitHub CLI: brew install gh)'));
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