# SplitSave Local Supabase Setup

## 🎉 Setup Complete!

Your local Supabase development environment is now fully configured and running.

## 📊 Current Status

- ✅ **Supabase CLI**: Installed and working
- ✅ **Docker**: Running with all containers
- ✅ **Database**: Reset with all migrations applied
- ✅ **Environment**: Configured with local credentials
- ✅ **Demo User**: Created for testing

## 🌐 Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| **App** | http://localhost:3000 | Your Next.js application |
| **Supabase API** | http://127.0.0.1:54321 | Supabase API endpoint |
| **Studio** | http://127.0.0.1:54323 | Supabase Studio (Database UI) |
| **Database** | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct PostgreSQL connection |
| **Inbucket** | http://127.0.0.1:54324 | Email testing (local SMTP) |

## 🔑 Credentials

### Demo User (for testing)
- **Email**: `demo@splitsave.com`
- **Password**: `demo123`

### Database
- **Host**: `127.0.0.1`
- **Port**: `54322`
- **Database**: `postgres`
- **Username**: `postgres`
- **Password**: `postgres`

## 🛠️ Common Commands

```bash
# Check status
supabase status

# Start Supabase (if stopped)
supabase start

# Stop Supabase
supabase stop

# Reset database (apply all migrations)
supabase db reset

# Open Supabase Studio
supabase studio

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# View logs
supabase logs
```

## 📁 Environment Files

- **`.env.local`** - Your local environment variables
- **`.env.example.detailed`** - Detailed configuration guide
- **`setup-env.sh`** - Environment setup helper
- **`supabase-setup.sh`** - Supabase management helper

## 🚀 Next Steps

1. **Test the app**: Visit http://localhost:3000
2. **Login with demo user**: Use `demo@splitsave.com` / `demo123`
3. **Explore the database**: Open http://127.0.0.1:54323
4. **Start developing**: Make changes and see them live!

## 🔧 Troubleshooting

### If Supabase stops working:
```bash
# Restart everything
supabase stop
supabase start
```

### If database needs reset:
```bash
# Reset and reapply all migrations
supabase db reset
```

### If you need to update Supabase CLI:
```bash
# Update via Homebrew
brew upgrade supabase
```

## 📚 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/getting-started/local-development)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)

---

**Happy coding! 🎉**
