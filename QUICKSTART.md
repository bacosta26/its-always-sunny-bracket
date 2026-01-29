# Quick Start Guide

## 5-Minute Setup

### 1. Setup Supabase (Database)
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create new project (wait ~2 minutes for provisioning)
3. Go to Settings → Database → Copy connection string
4. Replace `[YOUR-PASSWORD]` with the password you set

### 2. Run Database Migrations
```bash
# From project root
cd database

# Option 1: Run complete schema
psql "your-connection-string-here" < schema.sql

# Option 2: Or use Supabase SQL Editor
# - Go to Supabase dashboard → SQL Editor
# - Click "New Query"
# - Paste contents of schema.sql
# - Click "Run"
```

### 3. Configure Backend
```bash
cd server
npm install

# Create .env file:
cat > .env << EOL
PORT=5000
NODE_ENV=development
DATABASE_URL=your-connection-string-here
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_EMAIL=admin@sunny.com
ADMIN_PASSWORD=admin123
EOL

# Seed database with episodes
npm run seed
```

### 4. Configure Frontend
```bash
cd ../client
npm install

# Create .env file:
cat > .env << EOL
VITE_API_URL=http://localhost:5000
VITE_POLLING_INTERVAL=10000
EOL
```

### 5. Run Application
```bash
# Option 1: Run both together (from root)
cd ..
npm install  # Installs concurrently
npm run dev

# Option 2: Run separately in two terminals
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

### 6. Access Application
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/health](http://localhost:5000/health)

### 7. Login as Admin
- Email: `admin@sunny.com`
- Password: `admin123` (or what you set in ADMIN_PASSWORD)

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql "your-connection-string" -c "SELECT version();"
```

### Port Already in Use
```bash
# Change ports in .env files:
# Backend: PORT=5001
# Frontend: Update vite.config.ts server.port
```

### JWT Secret Issues
```bash
# Regenerate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend Can't Connect to Backend
- Check CORS_ORIGIN in server/.env matches frontend URL
- Check VITE_API_URL in client/.env points to backend
- Verify backend is running on correct port

## Next Steps

1. **Test Authentication**: Register a new user, login, logout
2. **Explore Data**: Check Supabase dashboard to see seeded episodes
3. **Start Building**: Implement bracket voting UI or draft system
4. **Read Full Docs**: See [README.md](README.md) for complete documentation

## Common Commands

```bash
# Install all dependencies
npm run install:all

# Run both servers
npm run dev

# Seed database
npm run seed

# Build for production
npm run build

# View database
psql "your-connection-string"
```

## Architecture Overview

```
┌─────────────────┐
│  React Frontend │  Port 5173
│   (Vite + TS)  │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│ Express Backend │  Port 5000
│  (Node.js + TS)│
└────────┬────────┘
         │ pg client
         ↓
┌─────────────────┐
│   PostgreSQL    │  Supabase
│  (158 episodes) │
└─────────────────┘
```

## Development Workflow

1. Make changes to code
2. Servers auto-reload (watch mode)
3. Test in browser
4. Commit changes
5. Deploy when ready

Happy coding! 🎉
