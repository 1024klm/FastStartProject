# ⚡ AI Project Init

Lightning fast project generator optimized for AI coding assistants (Claude, Cursor, Copilot, ChatGPT).

Generate production-ready project structures with AI-specific rules in **10 seconds**.

## 🚀 Features

- **9 Popular Stacks**: JavaScript, TypeScript, Python, Ruby, React, Next.js, FastAPI, Rails, Elm/Lamdera
- **AI-Optimized Rules**: Preconfigured `.cursorrules`, `.claude_rules`, and `.ai/rules.md`
- **Zero Config**: Smart defaults for immediate productivity
- **Interactive CLI**: 3 questions max, then you're coding
- **Git Ready**: Auto-init with proper .gitignore
- **Best Practices**: Linting, testing, and formatting pre-configured

## 📦 Installation

```bash
# Install globally
npm install -g ai-project-init

# Or use directly with npx (recommended)
npx ai-project-init@latest my-app
```

## 🎯 Usage

### Quick Start (One Command)

```bash
# JavaScript project
npx ai-project-init my-app -js

# TypeScript project
npx ai-project-init my-app -ts

# Python/FastAPI
npx ai-project-init my-api -fastapi

# React app
npx ai-project-init my-frontend -react

# Next.js app
npx ai-project-init my-fullstack -next

# Rails API
npx ai-project-init my-backend -rails
```

### Interactive Mode

```bash
# Let the CLI guide you
npx ai-project-init

# Or with a project name
npx ai-project-init my-awesome-project
```

## 🤖 AI Rules

Every project includes AI assistant rules in three formats:
- `.cursorrules` - For Cursor IDE
- `.claude_rules` - For Claude
- `.ai/rules.md` - Universal rules for any AI

These rules ensure AI assistants:
- Understand your project philosophy
- Follow consistent code style
- Avoid over-engineering
- Focus on shipping fast

## 📚 Available Stacks

| Stack | Flag | Description |
|-------|------|-------------|
| JavaScript | `-js` | Node.js with ES modules |
| TypeScript | `-ts` | Strict TypeScript setup |
| Python | `-py` | Python 3.9+ with type hints |
| Ruby | `-ruby` | Ruby 3.0+ with RuboCop |
| React | `-react` | Vite + React 18 |
| Next.js | `-next` | Next.js 14 with App Router |
| FastAPI | `-fastapi` | FastAPI + Pydantic |
| Rails | `-rails` | Rails 7 API mode |
| Elm/Lamdera | `-lamdera` | Functional web apps |

## 🛠️ What Gets Generated

```
my-project/
├── .ai/
│   └── rules.md          # AI assistant rules
├── .cursorrules          # Cursor IDE config
├── .claude_rules         # Claude config  
├── src/                  # Source code
│   └── index.{js|ts|py|rb|elm}
├── package.json          # For JS/TS projects
├── requirements.txt      # For Python projects
├── Gemfile              # For Ruby projects
├── .gitignore           # Stack-specific ignores
├── .env.example         # Environment template
└── README.md            # Project documentation
```

## 🏃 After Generation

```bash
cd my-project

# JavaScript/TypeScript/React/Next.js
npm install
npm run dev

# Python/FastAPI
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py  # or: uvicorn main:app --reload

# Ruby/Rails
bundle install
ruby main.rb  # or: rails server

# Elm/Lamdera
lamdera live
```

## 💡 Philosophy

The generated rules enforce:
1. **Simple > Complex** - Start simple, complexify if needed
2. **Ship > Perfect** - Deploy early, iterate often
3. **YAGNI** - You Ain't Gonna Need It (until proven)
4. **No Bullshit** - Direct feedback, no fluff
5. **Reality Check** - 90% of projects die from over-engineering

## 🔧 CLI Options

```bash
ai-project-init [project-name] [options]

Options:
  -js, --javascript    JavaScript project
  -ts, --typescript    TypeScript project
  -py, --python        Python project
  -ruby                Ruby project
  -react               React application
  -next                Next.js application
  -fastapi             FastAPI backend
  -rails               Ruby on Rails
  -lamdera             Elm/Lamdera project
  --no-git             Skip git initialization
  --no-github          Skip GitHub repo creation
  -h, --help           Display help
  -v, --version        Display version
```

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

```bash
# Clone the repo
git clone https://github.com/yourusername/ai-project-init.git

# Install dependencies
cd ai-project-init
npm install

# Test locally
npm link
ai-project-init test-project -js

# Run tests
npm test
```

## 📜 License

MIT © 2024

## 🙏 Credits

Built with ❤️ for developers who ship fast.

Inspired by the need for AI-optimized project structures that avoid over-engineering.

## 🐛 Issues

Found a bug? Have a suggestion? [Open an issue](https://github.com/yourusername/ai-project-init/issues).

## ⭐ Support

If this tool helps you ship faster, consider:
- Starring the repo ⭐
- Sharing with your team
- Contributing new stack templates

---

**Remember**: The best code is code that ships. 🚀