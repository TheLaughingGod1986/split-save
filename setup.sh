#!/bin/bash

echo "🚀 Setting up SplitSave Backend and Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local file..."
    cat > .env.local << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=http://localhost:3000
EOL
    echo "⚠️  Please update .env.local with your actual Supabase credentials"
else
    echo "✅ .env.local already exists"
fi

# Check if .env.local has been configured
if grep -q "your-supabase-project-url" .env.local; then
    echo "⚠️  Please configure your Supabase credentials in .env.local"
    echo "   You can find these in your Supabase project dashboard under Settings > API"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the database setup script (database-setup.sql) in your Supabase SQL editor"
echo "3. Update .env.local with your Supabase credentials"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For detailed setup instructions, see README.md"
