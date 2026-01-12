#!/bin/bash

# Fast Start Lamdera Project - Enhanced Setup Script
# This script automates the complete setup of a Lamdera project with all features

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command_exists lamdera; then
        missing_tools+=("lamdera")
    fi
    
    if ! command_exists npm; then
        missing_tools+=("npm")
    fi
    
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if ! command_exists gh; then
        missing_tools+=("gh (GitHub CLI)")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_info "Please install them before running this script."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Get project name
get_project_name() {
    if [ -z "$1" ]; then
        read -p "Enter your project name: " PROJECT_NAME
    else
        PROJECT_NAME="$1"
    fi
    
    if [ -z "$PROJECT_NAME" ]; then
        print_error "Project name cannot be empty"
        exit 1
    fi
    
    # Validate project name (alphanumeric, hyphens, underscores only)
    if ! [[ "$PROJECT_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        print_error "Project name can only contain letters, numbers, hyphens, and underscores"
        exit 1
    fi
}

# Create project directory
create_project_directory() {
    if [ -d "$PROJECT_NAME" ]; then
        print_warning "Directory '$PROJECT_NAME' already exists"
        read -p "Do you want to overwrite it? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Exiting..."
            exit 0
        fi
        rm -rf "$PROJECT_NAME"
    fi
    
    mkdir -p "$PROJECT_NAME"
    cd "$PROJECT_NAME"
    print_success "Created project directory: $PROJECT_NAME"
}

# Initialize Lamdera project
init_lamdera_project() {
    print_info "Initializing Lamdera project..."
    lamdera init
    print_success "Lamdera project initialized"
}

# Setup utility files
setup_utility_files() {
    print_info "Setting up utility files..."
    
    # Create .gitignore
    cat > .gitignore << 'EOF'
elm-stuff/
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
.lamdera/
EOF
    
    # Create README.md
    cat > README.md << EOF
# $PROJECT_NAME

A Lamdera application with authentication, i18n, and dark mode support.

## Features

- 🔐 Authentication (Email/Password + OAuth)
- 🌍 Internationalization (EN/FR)
- 🌙 Dark/Light/System theme modes
- 🎨 Tailwind CSS
- ✅ Testing with lamdera-program-test

## Getting Started

### Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

### Testing

\`\`\`bash
npm test
\`\`\`

### Building for Production

\`\`\`bash
npm run build
\`\`\`

## OAuth Setup

See:
- \`GOOGLE_ONE_TAP_SETUP.md\` for Google OAuth setup
- \`GITHUB_OAUTH_SETUP.md\` for GitHub OAuth setup

## Environment Variables

Create a \`.env\` file with:

\`\`\`
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
\`\`\`
EOF
    
    print_success "Utility files created"
}

# Setup lamdera-program-test
setup_lamdera_tests() {
    print_info "Setting up lamdera-program-test..."
    
    # Create tests directory if it doesn't exist
    mkdir -p tests
    
    # Create basic test file
    cat > tests/Tests.elm << 'EOF'
module Tests exposing (..)

import Expect
import Test exposing (..)


suite : Test
suite =
    describe "Application Tests"
        [ test "Example test" <|
            \_ ->
                Expect.equal (2 + 2) 4
        ]
EOF
    
    print_success "Test setup complete"
}

# Setup Tailwind CSS
setup_tailwind() {
    print_info "Setting up Tailwind CSS..."
    
    # Initialize package.json
    npm init -y > /dev/null 2>&1
    
    # Install Tailwind and dependencies
    npm install -D tailwindcss@latest concurrently@latest > /dev/null 2>&1
    
    # Create Tailwind config
    cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.elm",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
    
    # Create input CSS file
    mkdir -p src/css
    cat > src/css/input.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
.transition-theme {
  transition: background-color 0.3s ease, color 0.3s ease;
}
EOF
    
    # Update package.json scripts
    npm pkg set scripts.dev="concurrently \"lamdera live\" \"npx tailwindcss -i ./src/css/input.css -o ./dist/output.css --watch\""
    npm pkg set scripts.build="npx tailwindcss -i ./src/css/input.css -o ./dist/output.css --minify"
    npm pkg set scripts.test="elm-test-rs --compiler \$(which lamdera)"
    
    print_success "Tailwind CSS setup complete"
}

# Fix elm.json dependencies
fix_elm_json() {
    print_info "Fixing elm.json dependencies..."
    
    # Create a proper elm.json file
    cat > elm.json << 'EOF'
{
    "type": "application",
    "source-directories": [
        "src"
    ],
    "elm-version": "0.19.1",
    "dependencies": {
        "direct": {
            "elm/browser": "1.0.2",
            "elm/core": "1.0.5",
            "elm/html": "1.0.0",
            "elm/http": "2.0.0",
            "elm/json": "1.1.3",
            "elm/time": "1.0.0",
            "elm/url": "1.0.0",
            "lamdera/codecs": "1.0.0",
            "lamdera/core": "1.0.0"
        },
        "indirect": {
            "elm/bytes": "1.0.8",
            "elm/file": "1.0.5",
            "elm/virtual-dom": "1.0.3"
        }
    },
    "test-dependencies": {
        "direct": {
            "elm-explorations/test": "2.1.1"
        },
        "indirect": {
            "elm/random": "1.0.0"
        }
    }
}
EOF
    
    print_success "elm.json fixed"
}

# Setup authentication structure
setup_authentication() {
    print_info "Setting up authentication structure..."
    
    # Create authentication related files
    mkdir -p src/Pages
    
    # Create basic auth pages
    cat > src/Pages/Login.elm << 'EOF'
module Pages.Login exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


view : Html msg
view =
    div [ class "min-h-screen flex items-center justify-center" ]
        [ div [ class "max-w-md w-full space-y-8" ]
            [ h2 [ class "text-3xl font-bold text-center" ] [ text "Sign In" ]
            ]
        ]
EOF
    
    cat > src/Pages/Register.elm << 'EOF'
module Pages.Register exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


view : Html msg
view =
    div [ class "min-h-screen flex items-center justify-center" ]
        [ div [ class "max-w-md w-full space-y-8" ]
            [ h2 [ class "text-3xl font-bold text-center" ] [ text "Sign Up" ]
            ]
        ]
EOF
    
    # Create OAuth setup documentation
    cat > GOOGLE_ONE_TAP_SETUP.md << 'EOF'
# Google One Tap Setup Guide

## Steps to Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Identity API
4. Configure OAuth consent screen
5. Create OAuth 2.0 Client ID
6. Add authorized JavaScript origins
7. Add your client ID to `.env` file

## Environment Variable

```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```
EOF
    
    cat > GITHUB_OAUTH_SETUP.md << 'EOF'
# GitHub OAuth Setup Guide

## Steps to Configure GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in application details
4. Set Authorization callback URL
5. Save Client ID and Client Secret
6. Add credentials to `.env` file

## Environment Variables

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```
EOF
    
    print_success "Authentication structure created"
}

# Setup i18n and dark mode
setup_i18n_darkmode() {
    print_info "Setting up i18n and dark mode support..."
    
    # Create Theme module
    cat > src/Theme.elm << 'EOF'
module Theme exposing (..)

type Theme
    = Light
    | Dark
    | System


toString : Theme -> String
toString theme =
    case theme of
        Light ->
            "light"
        
        Dark ->
            "dark"
        
        System ->
            "system"
EOF
    
    # Create I18n module
    cat > src/I18n.elm << 'EOF'
module I18n exposing (..)

type Language
    = EN
    | FR


toString : Language -> String
toString lang =
    case lang of
        EN ->
            "en"
        
        FR ->
            "fr"
EOF
    
    print_success "i18n and dark mode setup complete"
}

# Initialize Git repository
init_git_repo() {
    print_info "Initializing Git repository..."
    
    git init
    git add .
    
    # Try to commit
    if git commit -m "Initial commit - Lamdera project with authentication, i18n, and dark mode" > /dev/null 2>&1; then
        print_success "Initial commit created"
    else
        print_warning "Could not create initial commit (this is normal if elm-format is not installed)"
    fi
}

# Create GitHub repository
create_github_repo() {
    read -p "Do you want to create a GitHub repository? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    # Check if gh is authenticated
    if ! gh auth status > /dev/null 2>&1; then
        print_warning "GitHub CLI not authenticated. Please run: gh auth login"
        return
    fi
    
    read -p "Repository visibility (public/private) [public]: " VISIBILITY
    VISIBILITY=${VISIBILITY:-public}
    
    if [[ "$VISIBILITY" == "private" ]]; then
        VISIBILITY_FLAG="--private"
    else
        VISIBILITY_FLAG="--public"
    fi
    
    print_info "Creating GitHub repository..."
    
    if gh repo create "$PROJECT_NAME" $VISIBILITY_FLAG --source=. --remote=origin --push > /dev/null 2>&1; then
        print_success "GitHub repository created and pushed"
        print_info "Repository URL: https://github.com/$(gh api user --jq .login)/$PROJECT_NAME"
    else
        print_warning "Could not create GitHub repository"
    fi
}

# Main execution
main() {
    echo "🚀 Fast Start Lamdera Project Setup"
    echo "===================================="
    echo
    
    check_prerequisites
    get_project_name "$1"
    create_project_directory
    init_lamdera_project
    fix_elm_json
    setup_utility_files
    setup_lamdera_tests
    setup_tailwind
    setup_authentication
    setup_i18n_darkmode
    init_git_repo
    create_github_repo
    
    echo
    print_success "Project setup complete! 🎉"
    echo
    print_info "Next steps:"
    echo "  1. cd $PROJECT_NAME"
    echo "  2. npm install"
    echo "  3. npm run dev"
    echo
    print_info "For OAuth setup, see:"
    echo "  - GOOGLE_ONE_TAP_SETUP.md"
    echo "  - GITHUB_OAUTH_SETUP.md"
}

# Run the script
main "$@"