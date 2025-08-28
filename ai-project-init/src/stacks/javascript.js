export const javascriptStack = {
  files: {
    'package.json': `{
  "name": "PROJECT_NAME",
  "version": "0.1.0",
  "description": "A new JavaScript project",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "lint": "eslint src/"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0"
  }
}`,
    'src/index.js': `// 🚀 PROJECT_NAME - Ready to ship!

console.log('Hello, World! 🌍');

// Delete this and start coding.
// Remember: Ship > Perfect

export function main() {
  // Your code here
}

// Run if called directly
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  main();
}`,
    '.env.example': `# Environment variables
NODE_ENV=development
PORT=3000

# Add your env vars here
# API_KEY=your_api_key_here`,
    '.eslintrc.json': `{
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": "off"
  }
}`
  },
  gitignore: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Logs
logs/
*.log

# Tests
coverage/
.nyc_output/

# Misc
.npm
.eslintcache
.node_repl_history`,
  commands: [
    'npm install',
    'npm start'
  ]
};