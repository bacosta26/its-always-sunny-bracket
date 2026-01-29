# It's Always Sunny in Philadelphia - Bracket & Draft Application

A full-stack web application for tournament-style voting brackets and fantasy draft gameplay featuring episodes from all 16 seasons of It's Always Sunny in Philadelphia.

## Features

### Core Functionality
- **Dual Bracket System**: Separate tournaments for Seasons 1-8 and Seasons 9-16
- **User Authentication**: Secure JWT-based registration, login, and session management
- **Voting System**: Users vote for their favorite episodes in head-to-head matchups
- **Fantasy Draft**: Create leagues, draft episodes, and compete against friends
- **Admin Panel**: Manage episodes, brackets, users, and league settings
- **Real-time Updates**: Polling system for live vote counts and draft picks
- **Responsive Design**: Mobile-first interface with Tailwind CSS

### Security Features
- bcrypt password hashing (10 salt rounds)
- JWT access tokens (15min) + refresh tokens (7 days)
- Rate limiting (100 requests/15min per IP)
- CORS configuration
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention with parameterized queries
- Admin route protection

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router
- Axios
- React Hot Toast

**Backend:**
- Node.js with Express
- TypeScript
- PostgreSQL
- JWT authentication
- bcryptjs

**Database:**
- PostgreSQL with UUID primary keys
- 158 episodes across 16 seasons pre-seeded

## Project Structure

```
its-always-sunny-in-pa/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/         # Login, Register, Protected routes
│   │   │   ├── brackets/     # Bracket voting UI (to implement)
│   │   │   ├── draft/        # Draft system UI (to implement)
│   │   │   ├── admin/        # Admin panel (to implement)
│   │   │   └── common/       # Shared components
│   │   ├── context/          # Auth context
│   │   ├── hooks/            # Custom hooks (polling, etc.)
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── config/           # Database & environment config
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, admin, rate limiting
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # JWT, password utilities
│   └── package.json
│
└── database/                  # Database setup
    ├── migrations/           # SQL migration files
    ├── seeds/               # Seed data (158 episodes)
    └── schema.sql           # Complete schema
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone the Repository
```bash
cd ~/Documents/Repos/its-always-sunny-in-pa
```

### 2. Database Setup

#### Option A: Using Supabase (Recommended for Free Tier)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (URI format)
5. Replace `[YOUR-PASSWORD]` with your actual database password

#### Option B: Local PostgreSQL
```bash
# Create database
createdb sunny_brackets

# Get connection string
DATABASE_URL=postgresql://username:password@localhost:5432/sunny_brackets
```

#### Run Migrations
```bash
cd database

# Connect to your database and run:
psql $DATABASE_URL < schema.sql

# Or run migrations individually:
psql $DATABASE_URL < migrations/001_create_users.sql
psql $DATABASE_URL < migrations/002_create_episodes.sql
# ... etc
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# - DATABASE_URL (from step 2)
# - JWT_SECRET (generate random string)
# - JWT_REFRESH_SECRET (generate random string)
```

**Generate secure JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Seed the database:**
```bash
npm run seed
```

This will:
- Create an admin user (check console for credentials)
- Insert all 158 episodes
- Create initial brackets

### 4. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:5000
# VITE_POLLING_INTERVAL=10000
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Development

### Current Status

✅ **Completed:**
- Project structure and configuration
- Database schema with 9 tables
- Complete authentication system
- Backend security middleware
- Frontend auth UI (login, register)
- Polling hook for real-time updates
- 158 episodes seeded across 16 seasons

🚧 **To Implement:**
- Bracket voting UI components
- Matchup generation algorithm
- Vote tallying and round progression
- Draft system implementation
- Admin panel UI
- Head-to-head scoring system

### API Endpoints

#### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login
POST   /api/auth/logout        # Logout
POST   /api/auth/refresh       # Refresh access token
GET    /api/auth/me            # Get current user
```

#### Brackets (Protected)
```
GET    /api/brackets           # List all brackets
GET    /api/brackets/:id       # Get bracket details
GET    /api/brackets/:id/matchups  # Get matchups
GET    /api/brackets/:id/status    # Get status (polling)
```

#### Voting (Protected)
```
POST   /api/votes              # Cast vote
GET    /api/votes/user/:id     # Get user's votes
```

#### Drafts (Protected)
```
POST   /api/drafts             # Create league
GET    /api/drafts/:id         # Get league
POST   /api/drafts/:id/join    # Join league
POST   /api/drafts/:id/pick    # Make draft pick
GET    /api/drafts/:id/current # Current state (polling)
```

#### Admin (Protected - Admin Only)
```
GET    /api/admin/users        # List users
PATCH  /api/admin/users/:id/admin  # Toggle admin
POST   /api/admin/brackets     # Create bracket
POST   /api/admin/brackets/:id/reset  # Reset bracket
POST   /api/admin/episodes     # Create episode
PUT    /api/admin/episodes/:id # Update episode
DELETE /api/admin/episodes/:id # Delete episode
```

### Adding New Features

To implement the remaining features, follow this guide:

#### 1. Bracket System
- **Backend:** Implement matchup generation in `server/src/services/bracket.service.ts`
- **Frontend:** Create `BracketView.tsx` and `Matchup.tsx` components
- **Logic:** Generate random or seeded matchups, handle vote counting

#### 2. Draft System
- **Backend:** Implement snake draft in `server/src/services/draft.service.ts`
- **Frontend:** Create `DraftBoard.tsx` with episode selection
- **Logic:** Track pick order, prevent duplicate picks

#### 3. Admin Panel
- **Frontend:** Build episode CRUD interface
- **Backend:** Already scaffolded in `admin.routes.ts`

## Deployment

### Free Tier Deployment (Recommended)

#### 1. Database - Supabase
- Already setup in step 2
- Free tier: 500MB, 50K MAU
- Cost: **$0/month**

#### 2. Backend - Railway or Render

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Add environment variables in Railway dashboard
# Deploy
railway up
```

**Render:**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `cd server && npm install && npm run build`
5. Set start command: `cd server && npm start`
6. Add environment variables
7. Deploy

Cost: **$0/month** (within free tier)

#### 3. Frontend - Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel

# Set environment variables:
# VITE_API_URL=https://your-backend.railway.app
```

Cost: **$0/month**

### Environment Variables for Production

**Backend (.env):**
```
NODE_ENV=production
DATABASE_URL=postgresql://... (from Supabase)
JWT_SECRET=<your-secure-secret>
JWT_REFRESH_SECRET=<your-secure-refresh-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app.vercel.app
```

**Frontend (.env.production):**
```
VITE_API_URL=https://your-backend.railway.app
VITE_POLLING_INTERVAL=10000
```

## Testing

### Manual Testing Checklist

- [ ] Register new user → Email/username unique validation works
- [ ] Login → JWT stored, redirects to home
- [ ] Protected routes → Redirects to login when not authenticated
- [ ] Logout → Clears token, redirects to home
- [ ] Token refresh → Auto-refreshes on 401
- [ ] Rate limiting → Returns 429 after 100 requests
- [ ] Admin routes → Only accessible to admins
- [ ] Database seed → All 158 episodes loaded
- [ ] Responsive design → Works on mobile/tablet/desktop

## Security Checklist

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT secrets in environment variables
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React auto-escapes)
- ✅ CSRF protection (SameSite cookies)
- ✅ Rate limiting configured
- ✅ CORS restricted to frontend origin
- ✅ Helmet.js security headers
- ✅ HTTPS enforced in production
- ✅ Admin routes protected
- ✅ Users can only modify own data

## Contributing

To contribute to this project:

1. Create a feature branch
2. Implement changes
3. Test thoroughly
4. Submit for review

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for Always Sunny fans**

**Total Cost: $0/month** (within free tier limits)
