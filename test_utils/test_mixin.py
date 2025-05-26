import json
import os
from pathlib import Path
from typing import Dict, Optional, TypedDict

class TestConfig(TypedDict):
    type: str
    framework: str
    service: str

class TestConfigFile(TypedDict):
    testFiles: Dict[str, TestConfig]

class TestMixin:
    def __init__(self, current_file: str):
        self.current_file = current_file
        self.index_path = Path(os.getcwd()) / 'test-index.json'
        self.config = self._load_config()

    def _load_config(self) -> TestConfigFile:
        with open(self.index_path, 'r') as f:
            return json.load(f)

    def _save_config(self) -> None:
        with open(self.index_path, 'w') as f:
            json.dump(self.config, f, indent=2)

    def get_test_config(self) -> Optional[TestConfig]:
        # Try exact match first
        if self.current_file in self.config['testFiles']:
            return self.config['testFiles'][self.current_file]

        # Try relative path match
        relative_path = os.path.relpath(self.current_file, os.getcwd())
        if relative_path in self.config['testFiles']:
            return self.config['testFiles'][relative_path]

        return None

    def get_service_name(self) -> str:
        config = self.get_test_config()
        return config['service'] if config else 'unknown'

    def get_test_type(self) -> str:
        config = self.get_test_config()
        return config['type'] if config else 'unknown'

    def get_framework(self) -> str:
        config = self.get_test_config()
        return config['framework'] if config else 'unknown'

    def get_test_metadata(self) -> str:
        config = self.get_test_config()
        if not config:
            return 'Unknown test configuration'
        return f"{config['type']} test using {config['framework']} framework for {config['service']} service"

    def index_test(self, command: str) -> None:
        relative_path = os.path.relpath(self.current_file, os.getcwd())
        test_type = self.get_test_type()
        framework = self.get_framework()
        service = self.get_service_name()

        # Update the test index
        self.config['testFiles'][relative_path] = {
            'type': test_type,
            'framework': framework,
            'service': service
        }

        # Save the updated index
        self._save_config()

        # Log the command for reference
        print(f"Test command for {relative_path}:")
        print(command)

def pytestMixin(file_path: str):
    """Create a pytest mixin for the given file."""
    mixin = TestMixin(file_path)
    return {
        'setup_module': lambda: print(f"Running {mixin.get_test_metadata()}"),
        'teardown_module': lambda: print(f"Completed {mixin.get_test_metadata()}")
    } 