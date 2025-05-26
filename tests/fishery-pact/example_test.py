import pytest
from pact import Consumer, Provider
import sys
import os
from pathlib import Path

# Add the project root to Python path to import the test mixin
project_root = str(Path(__file__).parent.parent.parent)
sys.path.append(project_root)

from test_utils.test_mixin import pytestMixin

# Initialize the test mixin
test_mixin = pytestMixin(__file__)

# Update test index with the command
test_mixin.indexTest("cd tests/fishery-pact && python -m pytest example_test.py -v")

# Define the consumer and provider
consumer = Consumer('fishery-consumer').has_pact_with(Provider('fishery-service'))

@pytest.fixture(scope='session')
def pact():
    """Setup and teardown for pact tests"""
    test_mixin.setup_module()
    yield consumer
    test_mixin.teardown_module()

def test_example(pact):
    """Example test using the mixin"""
    # Define the expected interaction
    (pact
        .given('test state')
        .upon_receiving('a test request')
        .with_request('GET', '/test')
        .will_respond_with(200, body={'status': 'ok'}))

    with pact:
        # Your test code here
        assert True 