#!/bin/bash

# PlacementHub Setup Script
# Run this after cloning the repository

set -e

echo "Setting up PlacementHub..."

# Check for required tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "Error: $1 is not installed. Please install it first."
        exit 1
    fi
}

check_command "bun"
check_command "docker"

# Install dependencies
echo "Installing dependencies..."
bun install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update .env with your actual values!"
fi

# Generate Prisma client
echo "Generating Prisma client..."
bun run db:generate

# Start Piston (code execution engine)
echo "Starting Piston..."
bun run piston:start

# Wait for Piston to be ready
echo "Waiting for Piston to be ready..."
until curl -s http://localhost:2000/api/v2/runtimes > /dev/null 2>&1; do
    sleep 2
done
echo "Piston is ready!"

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Supabase credentials"
echo "2. Run 'bun run db:push' to push the schema to your database"
echo "3. Run 'bun run dev' to start the development servers"
echo ""
