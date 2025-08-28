import { simpleGit } from 'simple-git';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Initialize a Git repository
 * @param {string} projectPath - Path to the project
 * @returns {Promise<boolean>} - Success status
 */
export async function initGitRepo(projectPath) {
  try {
    const git = simpleGit(projectPath);
    await git.init();
    await git.add('.');
    await git.commit('🚀 Initial commit - AI-optimized project');
    return true;
  } catch (error) {
    console.error(chalk.red('Error initializing Git repository:'), error.message);
    return false;
  }
}

/**
 * Create GitHub repository using GitHub CLI
 * @param {string} projectName - Name of the project
 * @param {string} visibility - 'public' or 'private'
 * @param {string} projectPath - Path to the project
 * @returns {Promise<boolean>} - Success status
 */
export async function createGitHubRepo(projectName, visibility, projectPath) {
  const spinner = ora('Creating GitHub repository...').start();
  
  try {
    const git = simpleGit(projectPath);
    
    // Check if gh CLI is installed
    try {
      await git.raw(['--version']);
    } catch {
      spinner.fail(chalk.yellow('GitHub CLI (gh) not installed'));
      console.log(chalk.cyan('\n📝 To install GitHub CLI:'));
      console.log(chalk.white('  macOS:   ') + chalk.gray('brew install gh'));
      console.log(chalk.white('  Windows: ') + chalk.gray('winget install GitHub.cli'));
      console.log(chalk.white('  Linux:   ') + chalk.gray('See https://cli.github.com/'));
      
      console.log(chalk.cyan('\n📝 Then create the repo manually:'));
      console.log(chalk.white(`  gh auth login`));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white(`  gh repo create ${projectName} --${visibility} --source=. --remote=origin --push`));
      
      return false;
    }
    
    spinner.succeed(chalk.green('GitHub repo instructions ready'));
    
    console.log(chalk.cyan('\n📝 To create the GitHub repository:'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white(`  gh repo create ${projectName} --${visibility} --source=. --remote=origin --push`));
    
    return true;
  } catch (error) {
    spinner.fail(chalk.red('Error preparing GitHub repository'));
    console.error(error.message);
    return false;
  }
}

/**
 * Check if git is installed
 * @returns {Promise<boolean>} - True if git is installed
 */
export async function isGitInstalled() {
  try {
    const git = simpleGit();
    await git.raw(['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get git user info
 * @returns {Promise<{name: string, email: string}|null>} - Git user info or null
 */
export async function getGitUserInfo() {
  try {
    const git = simpleGit();
    const name = await git.raw(['config', 'user.name']);
    const email = await git.raw(['config', 'user.email']);
    
    return {
      name: name.trim(),
      email: email.trim()
    };
  } catch {
    return null;
  }
}