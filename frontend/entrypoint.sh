#!/bin/sh

cd /var/www/html

# Clean up any existing builds
rm -rf dist

# Make sure public folder exists
mkdir -p public

# Install dependencies and build
npm install && npm run build

# Start nginx
nginx -g "daemon off;"