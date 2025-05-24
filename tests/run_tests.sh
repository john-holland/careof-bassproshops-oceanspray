#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting test suite..."

# Run PACT tests
echo -e "\n${GREEN}Running PACT tests...${NC}"
cd "$SCRIPT_DIR/fishery-pact" && python -m pytest -v
FISHERY_PACT_RESULT=$?

cd "$SCRIPT_DIR/uav-pact" && python -m pytest -v
UAV_PACT_RESULT=$?

# Run integration tests
echo -e "\n${GREEN}Running integration tests...${NC}"
cd "$SCRIPT_DIR/integration" && python -m pytest -v
INTEGRATION_RESULT=$?

# Check results
if [ $FISHERY_PACT_RESULT -eq 0 ] && [ $UAV_PACT_RESULT -eq 0 ] && [ $INTEGRATION_RESULT -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed.${NC}"
    exit 1
fi 