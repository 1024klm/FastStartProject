export const typescriptStack = {
  files: {
    'package.json': `{
  "name": "PROJECT_NAME",
  "version": "0.1.0",
  "description": "A new TypeScript project",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "lint": "eslint src/"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}`,
    'src/index.ts': `// 🚀 PROJECT_NAME - TypeScript Edition

interface Config {
  name: string;
  version: string;
  debug: boolean;
}

const config: Config = {
  name: 'PROJECT_NAME',
  version: '0.1.0',
  debug: process.env.NODE_ENV !== 'production'
};

export function main(): void {
  console.log(\`🌍 Hello from \${config.name} v\${config.version}!\`);
  
  // Delete this and start coding.
  // Remember: Types help, but Ship > Perfect
}

// Run if called directly
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  main();
}`,
    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`,
    '.env.example': `# Environment variables
NODE_ENV=development
PORT=3000

# Add your env vars here
# API_KEY=your_api_key_here`,
    '.eslintrc.json': `{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": ["@typescript-eslint"],
  "env": {
    "node": true,
    "es2021": true
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/explicit-function-return-type": ["warn"],
    "@typescript-eslint/no-explicit-any": ["error"],
    "no-console": "off"
  }
}`
  },
  gitignore: `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
dist/
*.tsbuildinfo

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
    'npm run dev'
  ]
};