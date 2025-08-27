#!/bin/bash

echo "🚀 Starting SplitSave deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Step 1: Deploy Supabase Edge Functions
print_status "📡 Step 1: Deploying Supabase Edge Functions..."
if [ -d "supabase/functions" ]; then
    for func in supabase/functions/*/; do
        if [ -d "$func" ]; then
            func_name=$(basename "$func")
            print_status "  Deploying function: $func_name"
            supabase functions deploy "$func_name"
            if [ $? -eq 0 ]; then
                print_success "  ✅ $func_name deployed successfully!"
            else
                print_error "  ❌ Failed to deploy $func_name"
                exit 1
            fi
        fi
    done
else
    print_warning "  ⚠️  No Supabase functions found to deploy"
fi

# Step 2: Build the Next.js application
print_status "🔨 Step 2: Building Next.js application..."
./scripts/build.sh
if [ $? -ne 0 ]; then
    print_error "❌ Build failed! Aborting deployment."
    exit 1
fi

# Step 3: Deploy to Vercel
print_status "🚀 Step 3: Deploying to Vercel..."
vercel --prod
if [ $? -eq 0 ]; then
    print_success "✅ Deployment to Vercel successful!"
else
    print_error "❌ Deployment to Vercel failed!"
    exit 1
fi

print_success "🎉 SplitSave deployment completed successfully!"
print_status "📱 Your app is now live on Vercel!"
print_status "🔧 Supabase Edge Functions are deployed and ready!"
