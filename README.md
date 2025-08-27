# SplitSave - Collaborative Finance App

SplitSave is a collaborative finance application designed for couples to manage shared expenses and savings goals together. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Partnership Management**: Connect with your partner and manage shared finances
- **Expense Tracking**: Add and categorize shared expenses with automatic approval workflows
- **Savings Goals**: Set and track progress on shared financial goals
- **Approval System**: Partner approval required for expenses over $100 and all goals
- **Real-time Updates**: Live synchronization between partners
- **Responsive Design**: Beautiful, mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **Deployment**: Vercel (recommended) or any Next.js hosting

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd splitsave
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Copy your service role key (keep this secret!)
4. Run the database setup script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database-setup.sql
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
splitsave/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── partnerships/  # Partnership management
│   │   ├── expenses/      # Expense management
│   │   ├── goals/         # Goal management
│   │   └── approvals/     # Approval workflow
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/             # React components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── LoginForm.tsx      # Login/signup form
│   └── SplitsaveApp.tsx   # Main application
├── lib/                    # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── auth.ts            # Authentication utilities
│   ├── validation.ts      # Zod validation schemas
│   └── api-client.ts      # Frontend API client
├── database-setup.sql     # Database schema
├── package.json           # Dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Partnerships
- `POST /api/partnerships/invite` - Send partner invitation
- `POST /api/partnerships/accept/[id]` - Accept partnership

### Expenses
- `GET /api/expenses` - List shared expenses
- `POST /api/expenses` - Add new expense

### Goals
- `GET /api/goals` - List savings goals
- `POST /api/goals` - Add new goal

### Approvals
- `GET /api/approvals` - List pending approvals
- `POST /api/approvals/[id]/approve` - Approve request
- `POST /api/approvals/[id]/decline` - Decline request

## Database Schema

The application uses the following main tables:

- **users**: User profiles and preferences
- **partnerships**: Couple connections and status
- **expenses**: Shared expense tracking
- **goals**: Savings goal management
- **approval_requests**: Partner approval workflow
- **messages**: Communication between partners

## Key Features Explained

### Approval Workflow
- Expenses over $100 require partner approval
- All savings goals require partner approval
- Partners can approve or decline requests
- Approved items are automatically created

### Partnership System
- Users can invite partners by email
- Partners must accept invitations
- Data is only shared between connected partners
- Row Level Security ensures data privacy

### Real-time Updates
- Built-in Supabase real-time subscriptions
- Automatic data synchronization
- Live updates for expenses, goals, and approvals

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:types     # Generate Supabase types
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security Features

- JWT-based authentication
- Row Level Security (RLS) in database
- Input validation with Zod
- CORS protection
- Rate limiting (can be added)
- Secure environment variable handling

## Performance Optimizations

- Next.js automatic code splitting
- Optimized database queries with indexes
- Efficient state management
- Responsive design for mobile devices

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check Supabase URL and keys
   - Ensure database is running
   - Verify RLS policies are set up

2. **Authentication Issues**
   - Clear browser cookies
   - Check Supabase Auth settings
   - Verify email confirmation

3. **Build Errors**
   - Clear `.next` folder
   - Reinstall dependencies
   - Check TypeScript errors

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review [Next.js documentation](https://nextjs.org/docs)
- Open an issue in this repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

---

**Happy coding! 🚀**
