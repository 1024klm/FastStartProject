# Scripts Lamdera

## create-lamdera-app.sh

Script complet pour créer un projet Lamdera avec toutes les fonctionnalités.

### Utilisation

```bash
# Méthode 1: Via npm
npm run create-lamdera

# Méthode 2: Directement
./scripts/create-lamdera-app.sh [nom-du-projet]

# Méthode 3: Avec un nom de projet
./scripts/create-lamdera-app.sh mon-super-projet
```

### Fonctionnalités incluses

✅ **Configuration automatique complète**
- Initialisation Lamdera
- Configuration Tailwind CSS
- Tests avec lamdera-program-test
- Structure d'authentification
- Support i18n (EN/FR)
- Mode sombre/clair/système

✅ **Correction automatique des erreurs**
- Gestion des dépendances elm.json
- Configuration Git propre
- Scripts npm optimisés

✅ **Intégration GitHub**
- Création automatique du repository
- Push initial
- Configuration public/privé

### Prérequis

- `lamdera` - [Installation](https://lamdera.com)
- `npm` - Node.js package manager
- `git` - Version control
- `gh` - GitHub CLI (optionnel, pour créer le repo)

### Structure créée

```
mon-projet/
├── src/
│   ├── Frontend.elm
│   ├── Backend.elm
│   ├── Types.elm
│   ├── Pages/
│   │   ├── Login.elm
│   │   └── Register.elm
│   ├── Theme.elm
│   ├── I18n.elm
│   └── css/
│       └── input.css
├── tests/
│   └── Tests.elm
├── package.json
├── tailwind.config.js
├── elm.json
├── .gitignore
├── README.md
├── GOOGLE_ONE_TAP_SETUP.md
└── GITHUB_OAUTH_SETUP.md
```

### Commandes disponibles après installation

```bash
# Développement
npm run dev

# Tests
npm test

# Build production
npm run build
```

### Résolution des problèmes

**Erreur elm.json**: Le script corrige automatiquement les conflits de dépendances.

**Git commit échoué**: Normal si elm-format n'est pas installé. Le script continue.

**GitHub repo**: Nécessite `gh auth login` pour fonctionner.