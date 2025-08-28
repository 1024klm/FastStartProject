"""Tests for main module"""

import pytest
from main import Config


def test_config():
    """Test configuration dataclass"""
    config = Config()
    assert config.name == "demo"
    assert config.version == "0.1.0"
    assert isinstance(config.debug, bool)


# Add more tests as you develop