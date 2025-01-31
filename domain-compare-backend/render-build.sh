#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm install

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer/chrome
PROJECT_CACHE_DIR=/opt/render/project/src/.cache/puppeteer/chrome

# Create directories if they don't exist
mkdir -p $PUPPETEER_CACHE_DIR
mkdir -p $PROJECT_CACHE_DIR

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome

# Copy Puppeteer cache to/from project directory
if [[ -d $PUPPETEER_CACHE_DIR ]]; then
    echo "...Copying Puppeteer Cache from Build Cache"
    cp -R $PUPPETEER_CACHE_DIR/* $PROJECT_CACHE_DIR
else
    echo "...Storing Puppeteer Cache in Build Cache"
    cp -R $PROJECT_CACHE_DIR/* $PUPPETEER_CACHE_DIR
fi
