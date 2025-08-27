#!/bin/bash

echo "🚀 Starting SplitSave build process..."

# Check if supabase/functions exists
if [ -d "supabase/functions" ]; then
    echo "📁 Temporarily moving Supabase functions for build..."
    mv supabase/functions ../supabase-functions-temp
fi

# Run the build
echo "🔨 Running Next.js build..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Restore Supabase functions
    if [ -d "../supabase-functions-temp" ]; then
        echo "📁 Restoring Supabase functions..."
        mv ../supabase-functions-temp supabase/functions
        echo "✅ Supabase functions restored!"
    fi
    
    echo "🎉 Build process completed successfully!"
    exit 0
else
    echo "❌ Build failed!"
    
    # Restore Supabase functions even if build failed
    if [ -d "../supabase-functions-temp" ]; then
        echo "📁 Restoring Supabase functions after failed build..."
        mv ../supabase-functions-temp supabase/functions
        echo "✅ Supabase functions restored!"
    fi
    
    exit 1
fi
