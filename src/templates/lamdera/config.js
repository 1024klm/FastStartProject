/**
 * Lamdera Template Configuration
 * Full-stack Elm application with authentication, i18n, and dark mode
 */

export const lamderaConfig = {
  name: 'lamdera',
  displayName: 'Lamdera (Full-Stack Elm)',
  description: 'Full-stack Elm application with real-time synchronization',
  
  prerequisites: [
    { command: 'lamdera', name: 'Lamdera', installUrl: 'https://lamdera.com/start' },
    { command: 'elm-format', name: 'elm-format', installCmd: 'npm install -g elm-format' },
    { command: 'elm-test-rs', name: 'elm-test-rs', installCmd: 'npm install -g elm-test-rs' }
  ],
  
  features: {
    authentication: {
      name: 'Authentication',
      description: 'Email/password and OAuth authentication',
      files: [
        'src/Auth.elm',
        'src/Password.elm',
        'src/GoogleOneTap.elm',
        'src/Email.elm',
        'src/Pages/Login.elm',
        'src/Pages/Register.elm',
        'src/Pages/Admin.elm'
      ]
    },
    
    i18n: {
      name: 'Internationalization',
      description: 'Multi-language support (EN/FR)',
      files: ['src/I18n.elm'],
      enabled: true
    },
    
    darkMode: {
      name: 'Dark Mode',
      description: 'Dark/Light/System theme support',
      files: ['src/Theme.elm'],
      enabled: true
    },
    
    localStorage: {
      name: 'Local Storage',
      description: 'Browser storage for user preferences',
      files: [
        'src/LocalStorage.elm',
        'elm-pkg-js/localStorage.js',
        'elm-pkg-js-includes.js'
      ],
      enabled: true
    },
    
    testing: {
      name: 'Testing',
      description: 'lamdera-program-test integration',
      files: [
        'tests/Tests.elm',
        'tests/TestsRunner.elm',
        'elm-test-rs.json',
        'HOW_TO_WRITE_TESTS.md'
      ],
      enabled: true
    },
    
    aiRules: {
      name: 'AI Assistant Rules',
      description: 'Cursor and Claude configuration',
      files: [
        '.cursorrules',
        'CLAUDE.md',
        'openEditor.sh'
      ],
      enabled: true
    }
  },
  
  profiles: {
    minimal: {
      features: ['localStorage'],
      scripts: {
        'dev': 'lamdera live',
        'build': 'lamdera build'
      }
    },
    
    standard: {
      features: ['i18n', 'darkMode', 'localStorage', 'testing'],
      scripts: {
        'dev': 'concurrently "lamdera live" "npx tailwindcss -i ./src/css/input.css -o ./public/styles.css --watch"',
        'build': 'npx tailwindcss -i ./src/css/input.css -o ./public/styles.css --minify && lamdera build',
        'test': 'elm-test-rs --compiler $(which lamdera)'
      }
    },
    
    comprehensive: {
      features: ['authentication', 'i18n', 'darkMode', 'localStorage', 'testing', 'aiRules'],
      scripts: {
        'dev': 'concurrently "lamdera live" "npx tailwindcss -i ./src/css/input.css -o ./public/styles.css --watch"',
        'build': 'npx tailwindcss -i ./src/css/input.css -o ./public/styles.css --minify && lamdera build',
        'test': 'elm-test-rs --compiler $(which lamdera)',
        'test:watch': 'elm-test-rs --watch --compiler $(which lamdera)',
        'format': 'elm-format src tests --yes',
        'check': 'lamdera check',
        'deploy': 'lamdera deploy'
      },
      gitHooks: true
    }
  },
  
  dependencies: {
    production: {},
    development: {
      'tailwindcss': '^3.4.0',
      'concurrently': '^8.2.0'
    }
  },
  
  elmDependencies: [
    'elm/browser',
    'elm/core',
    'elm/html',
    'elm/http',
    'elm/json',
    'elm/time',
    'elm/url',
    'lamdera/codecs',
    'lamdera/core'
  ],
  
  testDependencies: [
    'elm-explorations/test',
    'lamdera/program-test'
  ]
};