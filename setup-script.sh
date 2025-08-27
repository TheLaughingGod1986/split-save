#!/bin/bash

# SplitSave Backend Setup Script
# This script sets up the Vercel + Supabase backend for SplitSave

set -e

echo "🚀 Setting up SplitSave Backend..."

# Check for required tools
check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js version 18+ required. Current version: $(node --version)"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed."
        exit 1
    fi
    
    echo "✅ Dependencies checked"
}

# Create project structure
create_project() {
    echo "📁 Creating project structure..."
    
    mkdir -p splitsave-backend
    cd splitsave-backend
    
    mkdir -p api/{auth,partnerships,expenses,goals,approvals}
    mkdir -p api/partnerships/accept
    mkdir -p lib
    
    echo "✅ Project structure created"
}

# Initialize package.json
setup_package() {
    echo "📦 Setting up package.json..."
    
    cat > package.json << 'EOF'
{
  "name": "splitsave-backend",
  "version": "1.0.0",
  "description": "SplitSave backend API with Vercel + Supabase",
  "scripts": {
    "dev": "vercel dev",
    "build": "tsc",
    "deploy": "vercel --prod",
    "db:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.4",
    "@vercel/node": "^3.0.11",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "vercel": "^32.5.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
    
    echo "✅ Package.json created"
}

# Create Vercel configuration
setup_vercel_config() {
    echo "⚙️ Setting up Vercel configuration..."
    
    cat > vercel.json << 'EOF'
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
EOF
    
    echo "✅ Vercel config created"
}

# Create TypeScript config
setup_typescript() {
    echo "📝 Setting up TypeScript configuration..."
    
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", ".vercel"]
}
EOF
    
    echo "✅ TypeScript config created"
}

# Create environment template
setup_env() {
    echo "🔐 Creating environment template..."
    
    cat > .env.example << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Development
NODE_ENV=development
EOF
    
    cat > .env.local << 'EOF'
# Copy from .env.example and fill in your Supabase values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NODE_ENV=development
EOF
    
    echo "✅ Environment files created"
}

# Create Supabase types and client
create_supabase_lib() {
    echo "📚 Creating Supabase library files..."
    
    cat > lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
EOF

    cat > lib/database.types.ts << 'EOF'
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          country_code: string
          currency: string
          income: number | null
          payday: string | null
          personal_allowance: number | null
          created_at: string
          updated_at: string
          last_seen: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          country_code: string
          currency?: string
          income?: number | null
          payday?: string | null
          personal_allowance?: number | null
        }
        Update: {
          name?: string
          avatar_url?: string | null
          country_code?: string
          currency?: string
          income?: number | null
          payday?: string | null
          personal_allowance?: number | null
          updated_at?: string
        }
      }
      partnerships: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user1_id: string
          user2_id: string
          status?: string
        }
        Update: {
          status?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          partnership_id: string
          name: string
          amount: number
          category: string
          frequency: string
          added_by: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          partnership_id: string
          name: string
          amount: number
          category: string
          frequency?: string
          added_by?: string | null
          status?: string
        }
        Update: {
          name?: string
          amount?: number
          category?: string
          frequency?: string
          status?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          partnership_id: string
          name: string
          target_amount: number
          saved_amount: number
          goal_type: string
          priority: number
          added_by: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          partnership_id: string
          name: string
          target_amount: number
          saved_amount?: number
          goal_type: string
          priority?: number
          added_by?: string | null
          status?: string
        }
        Update: {
          name?: string
          target_amount?: number
          saved_amount?: number
          goal_type?: string
          priority?: number
          status?: string
          updated_at?: string
        }
      }
      approval_requests: {
        Row: {
          id: string
          partnership_id: string
          requested_by: string
          request_type: string
          request_data: Json
          message: string | null
          status: string
          responded_by: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          partnership_id: string
          requested_by: string
          request_type: string
          request_data: Json
          message?: string | null
          status?: string
        }
        Update: {
          status?: string
          responded_by?: string | null
          responded_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          partnership_id: string
          sender_id: string
          message_text: string
          message_type: string
          read_by_recipient: boolean
          created_at: string
        }
        Insert: {
          partnership_id: string
          sender_id: string
          message_text: string
          message_type?: string
          read_by_recipient?: boolean
        }
        Update: {
          read_by_recipient?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
EOF

    echo "✅ Supabase library files created"
}

# Create auth utilities
create_auth_lib() {
    echo "🔐 Creating authentication utilities..."
    
    cat > lib/auth.ts << 'EOF'
import { VercelRequest } from '@vercel/node'
import { supabaseAdmin } from './supabase'

export interface AuthUser {
  id: string
  email: string
  partnershipId?: string
}

export async function authenticateRequest(req: VercelRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Get user's active partnership
    const { data: partnerships } = await supabaseAdmin
      .from('partnerships')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    return {
      id: user.id,
      email: user.email!,
      partnershipId: partnerships?.id
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}
EOF
    
    echo "✅ Auth utilities created"
}

# Create validation schemas
create_validation() {
    echo "✅ Creating validation schemas..."
    
    cat > lib/validation.ts << 'EOF'
import { z } from 'zod'

export const expenseSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  frequency: z.enum(['monthly', 'weekly', 'yearly']),
  message: z.string().optional()
})

export const goalSchema = z.object({
  name: z.string().min(1).max(200),
  targetAmount: z.number().positive(),
  goalType: z.string().min(1).max(50),
  priority: z.number().int().min(1).optional(),
  message: z.string().optional()
})

export const userProfileSchema = z.object({
  name: z.string().min(1).max(100),
  income: z.number().positive().optional(),
  payday: z.string().optional(),
  personalAllowance: z.number().min(0).optional(),
  currency: z.string().length(3).optional()
})
EOF
    
    echo "✅ Validation schemas created"
}

# Create a sample API endpoint
create_sample_endpoint() {
    echo "🔧 Creating sample API endpoint..."
    
    cat > api/expenses/index.ts << 'EOF'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from '../../lib/auth'
import { supabaseAdmin } from '../../lib/supabase'
import { expenseSchema } from '../../lib/validation'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const user = await authenticateRequest(req)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!user.partnershipId) {
    return res.status(400).json({ error: 'No active partnership' })
  }

  if (req.method === 'GET') {
    try {
      const { data: expenses, error } = await supabaseAdmin
        .from('expenses')
        .select(`
          *,
          added_by_user:users!expenses_added_by_fkey(id, name)
        `)
        .eq('partnership_id', user.partnershipId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch expenses' })
      }

      return res.json(expenses)
    } catch (error) {
      console.error('Get expenses error:', error)
      return res.status(500).json({ error: 'Failed to fetch expenses' })
    }
  }

  if (req.method === 'POST') {
    try {
      const expenseData = expenseSchema.parse(req.body)
      
      // Check if requires approval (expenses over $100)
      const requiresApproval = expenseData.amount > 100

      if (requiresApproval) {
        // Create approval request
        const { data: approval, error } = await supabaseAdmin
          .from('approval_requests')
          .insert({
            partnership_id: user.partnershipId,
            requested_by: user.id,
            request_type: 'expense_add',
            request_data: expenseData,
            message: expenseData.message || null
          })
          .select()
          .single()

        if (error) {
          return res.status(400).json({ error: 'Failed to create approval request' })
        }

        return res.status(201).json({
          requiresApproval: true,
          approvalRequestId: approval.id
        })
      } else {
        // Create expense directly
        const { data: expense, error } = await supabaseAdmin
          .from('expenses')
          .insert({
            partnership_id: user.partnershipId,
            name: expenseData.name,
            amount: expenseData.amount,
            category: expenseData.category,
            frequency: expenseData.frequency,
            added_by: user.id,
            status: 'active'
          })
          .select(`
            *,
            added_by_user:users!expenses_added_by_fkey(id, name)
          `)
          .single()

        if (error) {
          return res.status(400).json({ error: 'Failed to add expense' })
        }

        return res.status(201).json(expense)
      }
    } catch (error) {
      console.error('Add expense error:', error)
      return res.status(400).json({ error: 'Invalid input data' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
EOF
    
    echo "✅ Sample API endpoint created"
}

# Create README with setup instructions
create_readme() {
    echo "📚 Creating README..."
    
    cat > README.md << 'EOF'
# SplitSave Backend - Vercel + Supabase

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy your project URL and anon key
4. Copy your service role key (keep this secret!)

### 3. Configure Environment Variables

Copy the values from your Supabase project:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Set up Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  country_code TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  income NUMERIC(12,2),
  payday TEXT,
  personal_allowance NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, country_code)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'New User'), 'US');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create partnerships table
CREATE TABLE public.partnerships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  added_by UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table  
CREATE TABLE public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  saved_amount NUMERIC(12,2) DEFAULT 0,
  goal_type TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  added_by UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create approval_requests table
CREATE TABLE public.approval_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES public.users(id) NOT NULL,
  request_type TEXT NOT NULL,
  request_data JSONB NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  responded_by UUID REFERENCES public.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  read_by_recipient BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security policies
CREATE POLICY "Users can view own profile" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Partnership members can view partnerships" ON public.partnerships 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create partnerships" ON public.partnerships 
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Partnership members can view expenses" ON public.expenses 
  FOR SELECT USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 6. Configure Vercel Environment Variables

In your Vercel dashboard, add these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

### 7. Test the API

Your API will be available at: `https://your-project.vercel.app/api/`

## Development

```bash
# Start local development
vercel dev
```

## API Endpoints

- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Add expense
- `GET /api/goals` - List goals
- `POST /api/goals` - Add goal
- `GET /api/approvals` - List pending approvals
- `POST /api/partnerships/invite` - Send partner invitation

## Features

- JWT authentication via Supabase
- Real-time updates via Supabase subscriptions  
- Approval workflow for expenses and goals
- Row-level security for data isolation
- Serverless scaling with Vercel
EOF
    
    echo "✅ README created"
}

# Create gitignore
create_gitignore() {
    echo "🙈 Creating .gitignore..."
    
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Build output
dist/
.vercel/

# TypeScript
*.tsbuildinfo

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
    
    echo "✅ .gitignore created"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Main setup function
main() {
    echo "🎉 SplitSave Backend Setup"
    echo "========================="
    
    check_dependencies
    create_project
    setup_package
    setup_vercel_config
    setup_typescript
    setup_env
    create_supabase_lib
    create_auth_lib
    create_validation
    create_sample_endpoint
    create_readme
    create_gitignore
    install_dependencies
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Create a Supabase project at https://supabase.com"
    echo "2. Run the database schema SQL from README.md"
    echo "3. Update .env.local with your Supabase credentials"
    echo "4. Test locally: npm run dev"
    echo "5. Deploy to Vercel: npm run deploy"
    echo ""
    echo "📁 Project created in: $(pwd)"
}

# Run the setup
main