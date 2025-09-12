#!/bin/bash

echo "🚀 SplitSave Environment Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local already exists"
    echo "📝 Current configuration:"
    echo ""
    grep -E "^[A-Z]" .env.local | sed 's/=.*/=***/' | head -10
    echo ""
    echo "To update your configuration, edit .env.local"
else
    echo "❌ .env.local not found"
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "📝 Please edit .env.local with your actual Supabase credentials"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Get your Supabase credentials from: https://supabase.com/dashboard"
echo "2. Edit .env.local with your actual values"
echo "3. Restart your development server: npm run dev"
echo ""
echo "📚 For detailed configuration help, see .env.example.detailed"
