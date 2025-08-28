import { simpleGit } from 'simple-git';
import { execSync } from 'child_process';
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
 * @param {Object} options - Additional options
 * @returns {Promise<boolean>} - Success status
 */
export async function createGitHubRepo(projectName, visibility = 'private', projectPath, options = {}) {
  const spinner = ora('Creating GitHub repository...').start();
  
  try {
    const git = simpleGit(projectPath);
    
    // Check if gh CLI is installed
    try {
      execSync('gh --version', { stdio: 'ignore' });
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
    
    // Check if authenticated
    try {
      execSync('gh auth status', { stdio: 'ignore' });
    } catch {
      spinner.fail(chalk.yellow('Not authenticated with GitHub'));
      console.log(chalk.cyan('\n📝 To authenticate:'));
      console.log(chalk.white('  gh auth login'));
      return false;
    }
    
    spinner.text = 'Creating GitHub repository...';
    
    // Build gh repo create command
    const args = [
      'repo', 'create', projectName,
      `--${visibility}`,
      '--source=.',
      '--remote=origin'
    ];
    
    // Add optional parameters
    if (options.description) {
      args.push('--description', `"${options.description}"`);
    }
    
    if (options.topics && options.topics.length > 0) {
      // Add topics after creation
    }
    
    if (options.push !== false) {
      args.push('--push');
    }
    
    // Create the repository
    try {
      const command = `gh ${args.join(' ')}`;
      execSync(command, { cwd: projectPath, stdio: 'pipe' });
      spinner.succeed(chalk.green('GitHub repository created successfully!'));
      
      // Add topics if provided
      if (options.topics && options.topics.length > 0) {
        const topicsCommand = `gh repo edit ${projectName} --add-topic "${options.topics.join(',')}"`;
        execSync(topicsCommand, { cwd: projectPath, stdio: 'pipe' });
        console.log(chalk.green('✓ Topics added: ') + chalk.gray(options.topics.join(', ')));
      }
      
      // Enable features if requested
      if (options.enableIssues) {
        execSync(`gh repo edit ${projectName} --enable-issues`, { cwd: projectPath, stdio: 'pipe' });
      }
      
      if (options.enableWiki) {
        execSync(`gh repo edit ${projectName} --enable-wiki`, { cwd: projectPath, stdio: 'pipe' });
      }
      
      // Set up branch protection if requested
      if (options.protectMain) {
        try {
          execSync(`gh api repos/:owner/${projectName}/branches/main/protection -X PUT -f required_status_checks='{"strict":true,"contexts":["continuous-integration"]}' -f enforce_admins=false -f required_pull_request_reviews='{"required_approving_review_count":1}'`, 
            { cwd: projectPath, stdio: 'pipe' });
          console.log(chalk.green('✓ Branch protection enabled for main'));
        } catch {
          // Branch protection might require higher permissions
        }
      }
      
      // Get the repo URL
      const repoUrl = execSync('gh repo view --json url -q .url', { cwd: projectPath, encoding: 'utf8' }).trim();
      console.log(chalk.cyan('\n🎉 Repository created: ') + chalk.blue.underline(repoUrl));
      
      return true;
    } catch (error) {
      if (error.message.includes('already exists')) {
        spinner.fail(chalk.yellow('Repository already exists'));
        console.log(chalk.cyan('\n📝 To use the existing repo:'));
        console.log(chalk.white(`  cd ${projectName}`));
        console.log(chalk.white(`  git remote add origin git@github.com:USERNAME/${projectName}.git`));
        console.log(chalk.white(`  git push -u origin main`));
      } else {
        spinner.fail(chalk.red('Failed to create GitHub repository'));
        console.error(error.message);
      }
      return false;
    }
  } catch (error) {
    spinner.fail(chalk.red('Error creating GitHub repository'));
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
