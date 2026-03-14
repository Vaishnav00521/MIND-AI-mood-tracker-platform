#!/bin/bash
# Doppler Setup Script for MindAI Backend
# ========================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Doppler Setup for MindAI Backend${NC}\n"

# Check if Doppler is installed
if ! command -v doppler &> /dev/null; then
    echo -e "${YELLOW}Doppler CLI not found in PATH.${NC}"
    echo "Installing Doppler CLI..."
    
    # Check OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install dopplerhq/cli/doppler
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Install Doppler via script
        curl -Ls https://doppler.com/install.sh | sh
    else
        echo "Please install Doppler CLI manually from https://doppler.com/docs/cli"
        exit 1
    fi
fi

# Check if token is set
if [ -z "$DOPPLER_TOKEN" ]; then
    echo -e "${YELLOW}DOPPLER_TOKEN environment variable not set.${NC}"
    echo "Please set your Doppler token:"
    echo "  export DOPPLER_TOKEN=your_token_here"
    echo ""
    echo "You can get your token from: https://dashboard.doppler.com/settings/tokens"
    exit 1
fi

# Test Doppler connection
echo "Testing Doppler connection..."
if doppler secrets list &> /dev/null; then
    echo -e "${GREEN}✓ Successfully connected to Doppler!${NC}"
else
    echo -e "${YELLOW}⚠ Could not connect to Doppler. Please check your token.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "To run the Django server with Doppler secrets:"
echo "  cd backend"
echo "  doppler run -- python manage.py runserver"
echo ""
echo "Or to test if secrets are loading correctly:"
echo "  doppler run -- python -c \"import os; print(os.environ.get('SECRET_KEY'))\""
