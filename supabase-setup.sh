#!/bin/bash

echo "🚀 SplitSave Supabase Setup"
echo "==========================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    echo "   open -a Docker"
    exit 1
fi

echo "✅ Supabase CLI found"
echo "✅ Docker is running"
echo ""

# Check current status
echo "📊 Current Supabase Status:"
supabase status
echo ""

# Show available commands
echo "🔧 Available Commands:"
echo "  supabase start          - Start local Supabase"
echo "  supabase stop           - Stop local Supabase"
echo "  supabase status         - Check status"
echo "  supabase db reset       - Reset database"
echo "  supabase studio         - Open Supabase Studio"
echo "  supabase gen types      - Generate TypeScript types"
echo ""

# Show URLs
echo "🌐 Local Development URLs:"
echo "  App:           http://localhost:3000"
echo "  Supabase API:  http://127.0.0.1:54321"
echo "  Studio:        http://127.0.0.1:54323"
echo "  Database:      postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""

# Show demo credentials
echo "👤 Demo User Credentials:"
echo "  Email:    demo@splitsave.com"
echo "  Password: demo123"
echo ""

echo "🎉 Setup complete! Your local Supabase is ready for development."
