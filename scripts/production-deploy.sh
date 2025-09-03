#!/bin/bash

# Production Deployment Script for SplitSave
set -e

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run linting
echo "🔧 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Build the application
echo "🏗️ Building application..."
npm run build

# Run production build analysis
echo "📊 Analyzing bundle..."
npm run analyze

# Check build output
if [ ! -d ".next" ]; then
    echo "❌ Error: Build failed - .next directory not found"
    exit 1
fi

echo "✅ Production build completed successfully!"
echo "📁 Build output: .next/"
echo "🚀 Ready for deployment!"

# Optional: Start production server for testing
if [ "$1" = "--test" ]; then
    echo "🧪 Starting production server for testing..."
    npm start
fi
