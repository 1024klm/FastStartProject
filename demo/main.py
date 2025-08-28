#!/usr/bin/env python3
"""
demo - A new Python project
"""

from typing import Optional
import os
import sys
from dataclasses import dataclass


@dataclass
class Config:
    """Application configuration"""
    name: str = "demo"
    version: str = "0.1.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"


def main() -> None:
    """Main entry point"""
    config = Config()
    print(f"🚀 {config.name} v{config.version} - Ready to ship!")
    
    # Delete this and start coding
    # Remember: Ship > Perfect


if __name__ == "__main__":
    main()