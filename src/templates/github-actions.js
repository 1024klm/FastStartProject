export function generateGitHubActions(stack, packageManager) {
  const workflows = {
    javascript: getJSWorkflow(packageManager),
    typescript: getTSWorkflow(packageManager),
    react: getReactWorkflow(packageManager),
    next: getNextWorkflow(packageManager),
    python: getPythonWorkflow(),
    fastapi: getFastAPIWorkflow(),
    ruby: getRubyWorkflow(),
    rails: getRailsWorkflow(),
    lamdera: getElmWorkflow(),
  };
  
  return workflows[stack] || null;
}

function getJSWorkflow(packageManager) {
  const pmInstall = packageManager === 'yarn' ? 'yarn' : `${packageManager} ci || ${packageManager} install`;
  const pmRun = packageManager === 'npm' ? 'npm run' : packageManager;
  
  return {
    '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: '${packageManager}'
      
      - name: Install dependencies
        run: ${pmInstall}
      
      - name: Run linter
        run: ${pmRun} lint
      
      - name: Run tests
        run: ${pmRun} test
      
      - name: Build
        run: ${pmRun} build
`
  };
}

function getTSWorkflow(packageManager) {
  const pmInstall = packageManager === 'yarn' ? 'yarn' : `${packageManager} ci || ${packageManager} install`;
  const pmRun = packageManager === 'npm' ? 'npm run' : packageManager;
  
  return {
    '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: '${packageManager}'
      
      - name: Install dependencies
        run: ${pmInstall}
      
      - name: Type check
        run: ${pmRun} type-check
      
      - name: Run linter
        run: ${pmRun} lint
      
      - name: Run tests
        run: ${pmRun} test
      
      - name: Build
        run: ${pmRun} build
`
  };
}

function getReactWorkflow(packageManager) {
  return getTSWorkflow(packageManager);
}

function getNextWorkflow(packageManager) {
  return getTSWorkflow(packageManager);
}

function getPythonWorkflow() {
  return {
    '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Lint with flake8
        run: |
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          flake8 . --count --exit-zero --max-complexity=10 --max-line-length=88 --statistics
      
      - name: Format with black
        run: black --check .
      
      - name: Sort imports with isort
        run: isort --check-only .
      
      - name: Type check with mypy
        run: mypy .
      
      - name: Test with pytest
        run: pytest --cov=./ --cov-report=xml
`
  };
}

function getFastAPIWorkflow() {
  return {
    '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Lint with flake8
        run: flake8 . --max-line-length=88 --extend-ignore=E203
      
      - name: Format with black
        run: black --check .
      
      - name: Sort imports with isort
        run: isort --check-only .
      
      - name: Type check with mypy
        run: mypy app
      
      - name: Test with pytest
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
        run: pytest --cov=app --cov-report=xml
`
  };
}

function getRubyWorkflow() {
  return {
    '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        ruby-version: ['3.0', '3.1', '3.2', '3.3']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: \${{ matrix.ruby-version }}
          bundler-cache: true
      
      - name: Run RuboCop
        run: bundle exec rubocop
      
      - name: Run tests
        run: bundle exec rspec
`
  };
}

function getRailsWorkflow() {
  return {
    '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: rails
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    strategy:
      matrix:
        ruby-version: ['3.1', '3.2', '3.3']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: \${{ matrix.ruby-version }}
          bundler-cache: true
      
      - name: Setup database
        env:
          DATABASE_URL: postgres://rails:password@localhost:5432/test
          RAILS_ENV: test
        run: |
          bundle exec rails db:create
          bundle exec rails db:schema:load
      
      - name: Run RuboCop
        run: bundle exec rubocop
      
      - name: Run tests
        env:
          DATABASE_URL: postgres://rails:password@localhost:5432/test
          RAILS_ENV: test
        run: bundle exec rspec
`
  };
}

function getElmWorkflow() {
  return {
    '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Elm
        uses: jorelali/setup-elm@v5
        with:
          elm-version: 0.19.1
      
      - name: Install dependencies
        run: |
          npm install -g elm-test elm-format elm-review
      
      - name: Format check
        run: elm-format --validate src/
      
      - name: Build
        run: elm make src/Main.elm --output=main.js
      
      - name: Run tests
        run: elm-test
      
      - name: Review
        run: elm-review
`
  };
}