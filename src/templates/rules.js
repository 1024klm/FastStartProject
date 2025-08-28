export function generateRules(description, stack) {
  return `# Règles de Développement - ${description}

## 🎯 MINDSET GÉNÉRAL

### SOIS DIRECT
- ❌ "C'est une excellente idée, mais..."
- ✅ "Non, mauvaise approche. Voici pourquoi: [raison]. Fais plutôt: [solution]"

### CRITIQUE OBLIGATOIRE
- Si le code est mauvais, dis-le
- Si l'architecture est bancale, explique
- Si une lib existe déjà, montre-la
- Évalue: Maintenabilité, Performance, Sécurité

### PENSE AVANT DE CODER
1. COMPRENDRE le problème
2. CHALLENGER la nécessité
3. PLANIFIER l'approche
4. CODER simple
5. OPTIMISER si nécessaire

## 💭 ANTI-BULLSHIT

- Pas de comments inutiles
- Lisible > Intelligent
- YAGNI jusqu'à preuve du contraire
- Pas d'abstraction avant 3 utilisations
- Ship > Perfect

## 🔥 STACK: ${stack.toUpperCase()}

${getStackSpecificRules(stack)}

## ⚠️ REALITY CHECK

- 90% des projets meurent d'over-engineering
- Le code parfait n'existe pas
- Les users s'en foutent de l'architecture
- Si t'as pas de users, t'as pas de problème de perf

## 🚀 RÈGLES DE SHIPPING

1. MVP en 1 semaine max
2. Pas de refactor avant v1
3. Pas de scale avant 100 users
4. Tests sur le critique uniquement
5. README + comments dans le complexe = suffisant

## 📝 WORKFLOW

### Début de session
- Lis ces règles
- Check le contexte existant
- Demande clarification si flou

### Pendant le dev
- Une feature = une branche
- Commit atomiques avec messages clairs
- Push régulier (au moins 1x/jour)

### Fin de session
- Résume ce qui est fait
- Liste ce qui reste
- Note les blockers

---
CES RÈGLES SONT NON-NÉGOCIABLES.
Ton job: me faire SHIP du code qui MARCHE.`;
}

function getStackSpecificRules(stack) {
  const rules = {
    javascript: `
### JavaScript Rules
- Async/await > Callbacks
- Fonctions > Classes (sauf si vraiment nécessaire)
- ES6+ modules
- Pas de var, que const/let
- Destructuring quand possible
- Template literals pour les strings
- Array methods (map, filter, reduce) > loops
- Optional chaining (?.) et nullish coalescing (??)
- Pas de == , toujours ===`,
    
    typescript: `
### TypeScript Rules
- Types explicites pour les fonctions publiques
- Interfaces > Types (pour les objects)
- Strict mode ON dans tsconfig
- Pas de any sauf absolument nécessaire
- Enums pour les constantes groupées
- Generics pour la réutilisabilité
- Union types plutôt que any
- Type guards pour le narrowing
- Readonly arrays et objects quand possible`,
    
    python: `
### Python Rules
- PEP 8 compliant
- Type hints pour les fonctions publiques
- Virtualenv obligatoire (venv ou poetry)
- requirements.txt ou pyproject.toml à jour
- f-strings pour le formatting
- List comprehensions (avec modération)
- Context managers (with) pour les resources
- Docstrings Google style
- Black pour le formatting
- Pytest > unittest`,
    
    ruby: `
### Ruby Rules
- 2 espaces d'indentation
- Snake_case pour tout
- Gemfile.lock versionné
- Rubocop config simple
- Guard clauses > nested ifs
- Symbols > strings pour les keys
- Blocks pour les fonctionnels
- attr_reader/writer/accessor
- RSpec pour les tests
- Semantic versioning des gems`,
    
    lamdera: `
### Elm/Lamdera Rules
- Elm format obligatoire
- Types customs explicites
- Pas de ports si évitable
- Model simple, messages clairs
- Pattern matching exhaustif
- Pipeline operator (|>) pour la composition
- Maybe et Result pour les erreurs
- Decoder/Encoder explicites
- Éviter les tuples > 2 éléments
- Tests avec elm-test`,
    
    react: `
### React Rules
- Functional components only
- Hooks > Classes
- Props destructuring
- Lazy loading des routes
- useState pour le state local
- useContext pour le state global
- useEffect avec cleanup
- Custom hooks pour la logique réutilisable
- Memoization (React.memo, useMemo) si nécessaire
- PropTypes ou TypeScript pour le typing
- CSS Modules ou styled-components
- Tests avec React Testing Library`,
    
    next: `
### Next.js Rules
- App Router (pas Pages)
- Server Components par défaut
- Client Components si interactivité
- Static > SSR > CSR
- Image optimization avec next/image
- Font optimization avec next/font
- Metadata API pour le SEO
- Parallel routes pour les layouts complexes
- Error boundaries
- Loading states
- Route handlers pour les APIs
- Edge runtime si possible`,
    
    fastapi: `
### FastAPI Rules
- Pydantic pour validation
- Async endpoints quand possible
- Dependency injection
- OpenAPI auto-documenté
- Response models explicites
- Status codes appropriés
- Background tasks pour l'async
- Middleware pour le cross-cutting
- CORS configuré proprement
- Settings avec pydantic-settings
- Alembic pour les migrations
- SQLModel ou SQLAlchemy`,
    
    rails: `
### Rails Rules
- Convention over Configuration
- RESTful routes
- Slim controllers, fat models
- N+1 queries = interdit
- Strong parameters
- Concerns pour le code partagé
- ActiveRecord scopes
- Service objects pour la business logic
- Background jobs avec Sidekiq
- Rails cache pour la performance
- Turbo pour l'interactivité
- RSpec ou Minitest pour les tests`
  };
  
  return rules[stack] || '';
}