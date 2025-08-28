# FastStartProject

Générateur de projets ultra-rapide optimisé pour les assistants IA (Claude, Cursor, Copilot).

## Installation

```bash
# Global
npm install -g faststartproject

# Ou avec npx
npx faststartproject@latest my-app
```

## Utilisation

```bash
# Mode interactif
faststart

# Création directe
faststart my-app -react
faststart my-api -fastapi
faststart my-backend -rails
```

## Options disponibles

| Stack | Flag | Description |
|-------|------|-------------|
| JavaScript | `-js` | Node.js ES modules |
| TypeScript | `-ts` | TypeScript strict |
| Python | `-py` | Python 3.9+ |
| Ruby | `-ruby` | Ruby 3.0+ |
| React | `-react` | Vite + React 18 |
| Next.js | `-next` | Next.js 14 App Router |
| FastAPI | `-fastapi` | FastAPI + Pydantic |
| Rails | `-rails` | Rails 7 API |
| Lamdera | `-lamdera` | Elm/Lamdera |

## Ce qui est généré

```
my-project/
├── .ai/rules.md          # Règles pour l'IA
├── .cursorrules          # Config Cursor
├── .claude_rules         # Config Claude  
├── src/                  # Code source
├── package.json          # Pour JS/TS
├── requirements.txt      # Pour Python
├── Gemfile              # Pour Ruby
└── .gitignore           # Fichiers ignorés
```

## Commandes CLI

```bash
faststart [project-name] [options]

Options:
  -js, --javascript    JavaScript
  -ts, --typescript    TypeScript
  -py, --python        Python
  -ruby                Ruby
  -react               React
  -next                Next.js
  -fastapi             FastAPI
  -rails               Rails
  -lamdera             Lamdera
  --no-git             Sans git
  --no-github          Sans GitHub
  -h, --help           Aide
  -v, --version        Version
```

## Philosophie

1. **Simple > Complexe**
2. **Ship > Perfect**
3. **YAGNI** (You Ain't Gonna Need It)
4. **Pas d'over-engineering**

## License

MIT