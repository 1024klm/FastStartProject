export const pythonStack = {
  files: {
    'main.py': `#!/usr/bin/env python3
"""
PROJECT_NAME - A new Python project
"""

from typing import Optional
import os
import sys
from dataclasses import dataclass


@dataclass
class Config:
    """Application configuration"""
    name: str = "PROJECT_NAME"
    version: str = "0.1.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"


def main() -> None:
    """Main entry point"""
    config = Config()
    print(f"🚀 {config.name} v{config.version} - Ready to ship!")
    
    # Delete this and start coding
    # Remember: Ship > Perfect


if __name__ == "__main__":
    main()`,
    'requirements.txt': `# Core dependencies
python-dotenv>=1.0.0

# Dev dependencies (uncomment as needed)
# pytest>=7.0.0
# black>=23.0.0
# flake8>=6.0.0
# mypy>=1.0.0
# pre-commit>=3.0.0

# Common libraries (uncomment as needed)
# requests>=2.31.0
# pandas>=2.0.0
# numpy>=1.24.0
# fastapi>=0.100.0
# uvicorn>=0.23.0
# sqlalchemy>=2.0.0
# pydantic>=2.0.0`,
    'pyproject.toml': `[tool.black]
line-length = 88
target-version = ['py39', 'py310', 'py311']

[tool.mypy]
python_version = "3.9"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]

[tool.ruff]
target-version = "py39"
line-length = 88
select = ["E", "F", "W", "B", "I", "C90"]`,
    '.env.example': `# Environment variables
DEBUG=false
LOG_LEVEL=INFO

# Add your env vars here
# API_KEY=your_api_key_here
# DATABASE_URL=sqlite:///./data.db`,
    'src/__init__.py': `"""PROJECT_NAME package"""

__version__ = "0.1.0"`,
    'tests/__init__.py': `"""Test package for PROJECT_NAME"""`,
    'tests/test_main.py': `"""Tests for main module"""

import pytest
from main import Config


def test_config():
    """Test configuration dataclass"""
    config = Config()
    assert config.name == "PROJECT_NAME"
    assert config.version == "0.1.0"
    assert isinstance(config.debug, bool)


# Add more tests as you develop`
  },
  gitignore: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
.venv

# Distribution
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/
.hypothesis/

# Type checking
.mypy_cache/
.dmypy.json
dmypy.json

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
.spyderproject
.spyproject
.ropeproject

# OS
.DS_Store
Thumbs.db

# Jupyter
.ipynb_checkpoints
*.ipynb

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log
logs/`,
  commands: [
    'python -m venv venv',
    'source venv/bin/activate',
    'pip install -r requirements.txt',
    'python main.py'
  ]
};