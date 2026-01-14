#!/bin/bash

echo "═══════════════════════════════════════════════════"
echo "     UPDATE SUPABASE CREDENTIALS"
echo "═══════════════════════════════════════════════════"
echo ""

# Prompt for credentials
echo "Enter your Supabase credentials from: https://supabase.com/dashboard"
echo ""

read -p "Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Anon/Public Key: " ANON_KEY
read -p "Service Role Key: " SERVICE_KEY

# Validate inputs
if [[ -z "$SUPABASE_URL" ]] || [[ -z "$ANON_KEY" ]] || [[ -z "$SERVICE_KEY" ]]; then
    echo "❌ Error: All fields are required"
    exit 1
fi

# Update .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY

# App Configuration
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "replace-with-secure-random-string")
NEXTAUTH_URL=http://localhost:3000
EOF

echo ""
echo "✅ Credentials updated successfully!"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Open http://localhost:3000 in your browser"
echo ""
