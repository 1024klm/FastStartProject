export function generateReadme(projectName, description, stack) {
  const stackEmoji = getStackEmoji(stack);
  const stackName = getStackName(stack);
  
  return `# ${projectName}

${description}

## 🚀 Stack

${stackEmoji} **${stackName}**

## 📦 Installation

\`\`\`bash
# Cloner le projet
git clone https://github.com/yourusername/${projectName}.git
cd ${projectName}

${getInstallCommand(stack)}
\`\`\`

## 🏃 Démarrage

\`\`\`bash
${getStartCommand(stack)}
\`\`\`

## 🤖 Optimisé pour l'IA

Ce projet contient des règles spécifiques pour les assistants IA dans:
- \`.ai/rules.md\` - Règles complètes pour le développement
- \`.cursorrules\` - Configuration pour Cursor IDE
- \`.claude_rules\` - Configuration pour Claude

Ces fichiers permettent aux assistants IA de comprendre:
- La philosophie du projet
- Les conventions de code
- Les patterns à suivre
- Les anti-patterns à éviter

## 📂 Structure

\`\`\`
${projectName}/
├── .ai/
│   └── rules.md        # Règles pour les IA
├── src/
│   └── ${getMainFile(stack)}
├── ${getConfigFile(stack)}
├── .gitignore
├── .cursorrules        # Config Cursor
├── .claude_rules       # Config Claude
└── README.md
\`\`\`

## 🛠️ Développement

${getDevelopmentSection(stack)}

## 📝 Conventions

- **Code Style**: ${getCodeStyle(stack)}
- **Testing**: ${getTestingFramework(stack)}
- **Formatting**: ${getFormatter(stack)}

## 🎯 Philosophie

1. **Simple > Complexe** - Commence simple, complexifie si nécessaire
2. **Ship > Perfect** - Livre rapidement, itère souvent
3. **YAGNI** - Tu n'en auras pas besoin (jusqu'à preuve du contraire)
4. **DRY** - Ne te répète pas (après 3 utilisations)
5. **KISS** - Keep It Simple, Stupid

## 📜 License

MIT

---

*Généré avec [FastStartProject](https://github.com/yourusername/faststartproject) - Lightning fast AI-optimized project generator*
`;
}

function getStackEmoji(stack) {
  const emojis = {
    javascript: '⚡',
    typescript: '🔷',
    python: '🐍',
    ruby: '💎',
    lamdera: '🌳',
    react: '⚛️',
    next: '▲',
    fastapi: '🚀',
    rails: '🛤️'
  };
  return emojis[stack] || '📦';
}

function getStackName(stack) {
  const names = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    ruby: 'Ruby',
    lamdera: 'Elm/Lamdera',
    react: 'React',
    next: 'Next.js',
    fastapi: 'FastAPI',
    rails: 'Ruby on Rails'
  };
  return names[stack] || 'Unknown';
}

function getInstallCommand(stack) {
  const commands = {
    javascript: '# Installer les dépendances\nnpm install',
    typescript: '# Installer les dépendances\nnpm install',
    python: '# Créer un environnement virtuel\npython -m venv venv\nsource venv/bin/activate  # Sur Windows: venv\\Scripts\\activate\n\n# Installer les dépendances\npip install -r requirements.txt',
    ruby: '# Installer les gems\nbundle install',
    lamdera: '# Installer Lamdera\nnpm install -g lamdera',
    react: '# Installer les dépendances\nnpm install',
    next: '# Installer les dépendances\nnpm install',
    fastapi: '# Créer un environnement virtuel\npython -m venv venv\nsource venv/bin/activate  # Sur Windows: venv\\Scripts\\activate\n\n# Installer les dépendances\npip install -r requirements.txt',
    rails: '# Installer les gems\nbundle install\n\n# Setup de la base de données\nrails db:create db:migrate'
  };
  return commands[stack] || 'npm install';
}

function getStartCommand(stack) {
  const commands = {
    javascript: 'npm start',
    typescript: 'npm run dev',
    python: 'python main.py',
    ruby: 'ruby main.rb',
    lamdera: 'lamdera live',
    react: 'npm run dev',
    next: 'npm run dev',
    fastapi: 'uvicorn main:app --reload',
    rails: 'rails server'
  };
  return commands[stack] || 'npm start';
}

function getMainFile(stack) {
  const files = {
    javascript: 'index.js',
    typescript: 'index.ts',
    python: 'main.py',
    ruby: 'main.rb',
    lamdera: 'Main.elm',
    react: 'App.jsx',
    next: 'app/page.tsx',
    fastapi: 'main.py',
    rails: 'app/'
  };
  return files[stack] || 'index.js';
}

function getConfigFile(stack) {
  const files = {
    javascript: 'package.json',
    typescript: 'tsconfig.json',
    python: 'requirements.txt',
    ruby: 'Gemfile',
    lamdera: 'elm.json',
    react: 'package.json',
    next: 'next.config.js',
    fastapi: 'pyproject.toml',
    rails: 'Gemfile'
  };
  return files[stack] || 'package.json';
}

function getDevelopmentSection(stack) {
  const sections = {
    javascript: `### Scripts disponibles

- \`npm start\` - Démarre l'application
- \`npm run dev\` - Mode développement avec watch
- \`npm test\` - Lance les tests
- \`npm run lint\` - Vérifie le code`,
    
    typescript: `### Scripts disponibles

- \`npm run dev\` - Mode développement avec watch
- \`npm run build\` - Compile le TypeScript
- \`npm run type-check\` - Vérifie les types
- \`npm test\` - Lance les tests
- \`npm run lint\` - Vérifie le code`,
    
    python: `### Commandes utiles

- \`python main.py\` - Lance l'application
- \`pytest\` - Lance les tests
- \`black .\` - Formate le code
- \`flake8 .\` - Vérifie le style
- \`mypy .\` - Vérifie les types`,
    
    ruby: `### Commandes utiles

- \`ruby main.rb\` - Lance l'application
- \`rspec\` - Lance les tests
- \`rubocop\` - Vérifie le style
- \`bundle exec guard\` - Mode watch`,
    
    lamdera: `### Commandes utiles

- \`lamdera live\` - Mode développement
- \`lamdera deploy\` - Déploie en production
- \`elm-format\` - Formate le code
- \`elm-test\` - Lance les tests`,
    
    react: `### Scripts disponibles

- \`npm run dev\` - Mode développement
- \`npm run build\` - Build de production
- \`npm test\` - Lance les tests
- \`npm run lint\` - Vérifie le code
- \`npm run preview\` - Preview du build`,
    
    next: `### Scripts disponibles

- \`npm run dev\` - Mode développement
- \`npm run build\` - Build de production
- \`npm run start\` - Lance la production
- \`npm test\` - Lance les tests
- \`npm run lint\` - Vérifie le code`,
    
    fastapi: `### Commandes utiles

- \`uvicorn main:app --reload\` - Mode développement
- \`pytest\` - Lance les tests
- \`black .\` - Formate le code
- \`alembic upgrade head\` - Migrations DB`,
    
    rails: `### Commandes utiles

- \`rails server\` - Lance le serveur
- \`rails console\` - Console interactive
- \`rails db:migrate\` - Migrations
- \`rails test\` - Lance les tests
- \`rails routes\` - Liste les routes`
  };
  
  return sections[stack] || '### Commandes\n\nVoir package.json pour les scripts disponibles.';
}

function getCodeStyle(stack) {
  const styles = {
    javascript: 'Standard JS ou Airbnb',
    typescript: 'TypeScript ESLint',
    python: 'PEP 8',
    ruby: 'Ruby Style Guide',
    lamdera: 'Elm Format',
    react: 'Airbnb React',
    next: 'Next.js conventions',
    fastapi: 'PEP 8 + Type hints',
    rails: 'Rails conventions'
  };
  return styles[stack] || 'Standard';
}

function getTestingFramework(stack) {
  const frameworks = {
    javascript: 'Jest ou Mocha',
    typescript: 'Jest + ts-jest',
    python: 'pytest',
    ruby: 'RSpec',
    lamdera: 'elm-test',
    react: 'React Testing Library',
    next: 'Jest + React Testing Library',
    fastapi: 'pytest + httpx',
    rails: 'RSpec ou Minitest'
  };
  return frameworks[stack] || 'Jest';
}

function getFormatter(stack) {
  const formatters = {
    javascript: 'Prettier',
    typescript: 'Prettier + ESLint',
    python: 'Black',
    ruby: 'RuboCop',
    lamdera: 'elm-format',
    react: 'Prettier',
    next: 'Prettier + ESLint',
    fastapi: 'Black + isort',
    rails: 'RuboCop'
  };
  return formatters[stack] || 'Prettier';
}
