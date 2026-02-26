#!/bin/bash
# Setup script to link AGENTS.md to .agent/rules/
set -e

# Change directory to the script's location (.agent directory)
cd "$(dirname "$0")"

echo "Setting up AI agent rule symlinks..."

# Create rules directory if it doesn't exist just in case
mkdir -p rules

# Remove existing symlink or file if present
rm -f rules/AGENTS.md

# Create relative symlink
ln -s ../../AGENTS.md rules/AGENTS.md

echo "✅ Created relative symlink: .agent/rules/AGENTS.md -> ../../AGENTS.md"
