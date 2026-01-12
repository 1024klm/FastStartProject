/**
 * Pre-commit hook for Lamdera projects
 * Comprehensive checks for code quality
 */

export const generatePreCommitHook = () => `#!/bin/bash
# ============================================
# Lamdera Pre-commit Hook
# Professional code quality checks
# ============================================

set -e

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

echo -e "\${BLUE}🔍 Running pre-commit checks...\${NC}"
echo "================================"

# Track if any check fails
FAILED=0

# ============================================
# 1. Check for debugging code
# ============================================
echo -e "\\n\${BLUE}📝 Checking for debug code...\${NC}"

# Check for Debug.log, Debug.todo, or console.log
if grep -r "Debug\\.log\\|Debug\\.todo\\|console\\.log" src/ --include="*.elm" --include="*.js" 2>/dev/null; then
  echo -e "\${RED}✗ Found debug code! Please remove before committing.\${NC}"
  FAILED=1
else
  echo -e "\${GREEN}✓ No debug code found\${NC}"
fi

# ============================================
# 2. Format Elm code
# ============================================
if command -v elm-format &> /dev/null; then
  echo -e "\\n\${BLUE}🎨 Formatting Elm code...\${NC}"
  elm-format src/ tests/ --yes
  echo -e "\${GREEN}✓ Elm code formatted\${NC}"
else
  echo -e "\${YELLOW}⚠ elm-format not found, skipping formatting\${NC}"
fi

# ============================================
# 3. Validate CSS classes
# ============================================
echo -e "\\n\${BLUE}🎨 Validating CSS classes...\${NC}"

# Check for undefined Tailwind classes (basic check)
INVALID_CLASSES=$(grep -oE 'class\\s*=\\s*"[^"]*"' src/**/*.elm 2>/dev/null | \
  grep -oE '(bg|text|border|hover:|focus:)-[a-z]+-[0-9]{4,}' || true)

if [ ! -z "$INVALID_CLASSES" ]; then
  echo -e "\${YELLOW}⚠ Found potentially invalid Tailwind classes:\${NC}"
  echo "$INVALID_CLASSES"
  echo -e "\${YELLOW}  Please verify these are valid Tailwind utilities\${NC}"
fi

# Check for consistent CSS naming conventions
if grep -r 'class.*[A-Z]' src/ --include="*.elm" 2>/dev/null | grep -v "Html.Attributes"; then
  echo -e "\${YELLOW}⚠ Found uppercase in CSS classes (should use kebab-case)\${NC}"
fi

echo -e "\${GREEN}✓ CSS validation complete\${NC}"

# ============================================
# 4. Check Elm compilation
# ============================================
echo -e "\\n\${BLUE}📦 Checking Elm compilation...\${NC}"

# Try to compile the main files
if ! lamdera make src/Backend.elm src/Frontend.elm 2>/dev/null; then
  echo -e "\${RED}✗ Compilation failed! Please fix errors before committing.\${NC}"
  echo -e "\${YELLOW}  Run 'lamdera make src/Backend.elm src/Frontend.elm' to see errors\${NC}"
  FAILED=1
else
  echo -e "\${GREEN}✓ Elm code compiles successfully\${NC}"
fi

# ============================================
# 5. Run tests
# ============================================
if [ -f "elm-test-rs.json" ] && command -v elm-test-rs &> /dev/null; then
  echo -e "\\n\${BLUE}🧪 Running tests...\${NC}"
  
  if ! elm-test-rs --compiler $(which lamdera) 2>/dev/null; then
    echo -e "\${RED}✗ Tests failed! Please fix failing tests before committing.\${NC}"
    FAILED=1
  else
    echo -e "\${GREEN}✓ All tests passed\${NC}"
  fi
else
  echo -e "\${YELLOW}⚠ Tests not configured or elm-test-rs not found\${NC}"
fi

# ============================================
# 6. Check for large files
# ============================================
echo -e "\\n\${BLUE}📏 Checking file sizes...\${NC}"

# Find files larger than 1MB
LARGE_FILES=$(find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./elm-stuff/*" 2>/dev/null)

if [ ! -z "$LARGE_FILES" ]; then
  echo -e "\${YELLOW}⚠ Found large files (>1MB):\${NC}"
  echo "$LARGE_FILES"
  echo -e "\${YELLOW}  Consider using Git LFS for large files\${NC}"
fi

echo -e "\${GREEN}✓ File size check complete\${NC}"

# ============================================
# 7. Check for sensitive data
# ============================================
echo -e "\\n\${BLUE}🔒 Checking for sensitive data...\${NC}"

# Check for potential secrets
PATTERNS=(
  "api[_-]?key"
  "secret"
  "password"
  "token"
  "private[_-]?key"
  "AWS_"
  "GITHUB_"
  "DATABASE_URL"
)

for pattern in "\${PATTERNS[@]}"; do
  if grep -ri "$pattern" src/ --include="*.elm" --include="*.js" --include="*.json" 2>/dev/null | \
     grep -v "// OK TO COMMIT" | \
     grep -v "type Password" | \
     grep -v "password.*placeholder"; then
    echo -e "\${RED}✗ Found potential sensitive data (pattern: $pattern)\${NC}"
    echo -e "\${YELLOW}  If this is safe, add comment: // OK TO COMMIT\${NC}"
    FAILED=1
  fi
done

if [ $FAILED -eq 0 ]; then
  echo -e "\${GREEN}✓ No sensitive data found\${NC}"
fi

# ============================================
# 8. Validate package.json (if modified)
# ============================================
if git diff --cached --name-only | grep -q "package.json"; then
  echo -e "\\n\${BLUE}📦 Validating package.json...\${NC}"
  
  if ! node -e "JSON.parse(require('fs').readFileSync('package.json'))" 2>/dev/null; then
    echo -e "\${RED}✗ package.json is not valid JSON!\${NC}"
    FAILED=1
  else
    echo -e "\${GREEN}✓ package.json is valid\${NC}"
  fi
fi

# ============================================
# 9. Check CSS build
# ============================================
if [ -f "tailwind.config.js" ]; then
  echo -e "\\n\${BLUE}🎨 Building CSS...\${NC}"
  
  if npm run build:css 2>/dev/null || npx tailwindcss -i ./src/css/input.css -o ./public/styles.css --minify 2>/dev/null; then
    echo -e "\${GREEN}✓ CSS build successful\${NC}"
    # Add the built CSS to the commit
    git add public/styles.css 2>/dev/null || true
  else
    echo -e "\${YELLOW}⚠ Could not build CSS\${NC}"
  fi
fi

# ============================================
# 10. Run custom project hooks
# ============================================
if [ -f ".githooks/custom-checks.sh" ]; then
  echo -e "\\n\${BLUE}🔧 Running custom checks...\${NC}"
  source .githooks/custom-checks.sh
fi

# ============================================
# Final result
# ============================================
echo ""
echo "================================"

if [ $FAILED -eq 1 ]; then
  echo -e "\${RED}✗ Pre-commit checks failed!\${NC}"
  echo -e "\${YELLOW}Please fix the issues above before committing.\${NC}"
  exit 1
else
  echo -e "\${GREEN}✅ All pre-commit checks passed!\${NC}"
  echo -e "\${BLUE}Proceeding with commit...\${NC}"
fi
`;