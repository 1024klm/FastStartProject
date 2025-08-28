export function generateDockerfiles(stack, packageManager) {
  const dockerConfigs = {
    javascript: getJSDocker(packageManager),
    typescript: getTSDocker(packageManager),
    react: getReactDocker(packageManager),
    next: getNextDocker(packageManager),
    python: getPythonDocker(),
    fastapi: getFastAPIDocker(),
    ruby: getRubyDocker(),
    rails: getRailsDocker(),
    lamdera: getElmDocker(),
  };
  
  return dockerConfigs[stack] || null;
}

function getJSDocker(packageManager) {
  return {
    'Dockerfile': `FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
${packageManager === 'yarn' ? 'COPY yarn.lock* ./' : ''}
${packageManager === 'pnpm' ? 'COPY pnpm-lock.yaml* ./' : ''}

# Install dependencies
RUN ${packageManager === 'yarn' ? 'yarn --frozen-lockfile' : packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm i --frozen-lockfile' : 'npm ci'}

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3000

CMD ["node", "src/index.js"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules
`
  };
}

function getTSDocker(packageManager) {
  return {
    'Dockerfile': `FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
${packageManager === 'yarn' ? 'COPY yarn.lock* ./' : ''}
${packageManager === 'pnpm' ? 'COPY pnpm-lock.yaml* ./' : ''}
COPY tsconfig.json ./

# Install dependencies
RUN ${packageManager === 'yarn' ? 'yarn --frozen-lockfile' : packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm i --frozen-lockfile' : 'npm ci'}

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN ${packageManager} run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules
`
  };
}

function getReactDocker(packageManager) {
  return {
    'Dockerfile': `FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
${packageManager === 'yarn' ? 'COPY yarn.lock* ./' : ''}
${packageManager === 'pnpm' ? 'COPY pnpm-lock.yaml* ./' : ''}

RUN ${packageManager === 'yarn' ? 'yarn --frozen-lockfile' : packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm i --frozen-lockfile' : 'npm ci'}

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN ${packageManager} run build

# Production image with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
    'nginx.conf': `server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
`
  };
}

function getNextDocker(packageManager) {
  return {
    'Dockerfile': `FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
${packageManager === 'yarn' ? 'COPY yarn.lock* ./' : ''}
${packageManager === 'pnpm' ? 'COPY pnpm-lock.yaml* ./' : ''}

RUN ${packageManager === 'yarn' ? 'yarn --frozen-lockfile' : packageManager === 'pnpm' ? 'corepack enable pnpm && pnpm i --frozen-lockfile' : 'npm ci'}

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN ${packageManager} run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

USER nodejs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
`
  };
}

function getPythonDocker() {
  return {
    'Dockerfile': `FROM python:3.11-slim AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

CMD ["python", "src/main.py"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - .:/app
`
  };
}

function getFastAPIDocker() {
  return {
    'Dockerfile': `FROM python:3.11-slim AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
    depends_on:
      - db
    volumes:
      - .:/app
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
`
  };
}

function getRubyDocker() {
  return {
    'Dockerfile': `FROM ruby:3.2-slim AS base

WORKDIR /app

# Install dependencies
RUN apt-get update -qq && apt-get install -y build-essential

COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -s /bin/bash appuser
USER appuser

CMD ["ruby", "src/main.rb"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - bundle:/usr/local/bundle
    
volumes:
  bundle:
`
  };
}

function getRailsDocker() {
  return {
    'Dockerfile': `FROM ruby:3.2 AS base

WORKDIR /app

# Install dependencies
RUN apt-get update -qq && apt-get install -y \\
    build-essential \\
    libpq-dev \\
    nodejs \\
    yarn

# Install gems
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy application
COPY . .

# Precompile assets
RUN bundle exec rails assets:precompile

# Create non-root user
RUN useradd -m -s /bin/bash appuser
USER appuser

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://rails:password@db:5432/myapp_development
      - RAILS_ENV=development
    depends_on:
      - db
    volumes:
      - .:/app
      - bundle:/usr/local/bundle
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=rails
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp_development
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  bundle:
  postgres_data:
`
  };
}

function getElmDocker() {
  return {
    'Dockerfile': `FROM node:20-alpine AS builder

WORKDIR /app

# Install Elm
RUN npm install -g elm

# Copy elm.json first for better caching
COPY elm.json .
RUN elm make --output=/dev/null || true

# Copy source and build
COPY src ./src
RUN elm make src/Main.elm --optimize --output=main.js

# Production image with nginx
FROM nginx:alpine
COPY --from=builder /app/main.js /usr/share/nginx/html/
COPY index.html /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
    'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:80"
`
  };
}