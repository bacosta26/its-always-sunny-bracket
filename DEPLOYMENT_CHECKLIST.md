# Deployment Checklist

## ✅ Prerequisites
- [ ] GitHub account created
- [ ] Supabase project created and database connection string ready
- [ ] Run the team flags migration in Supabase SQL editor

## 📦 Step 1: Push to GitHub
- [ ] Create repository at https://github.com/new named `its-always-sunny-bracket`
- [ ] Make it **Public**
- [ ] Don't initialize with README
- [ ] Run push commands (see `.github-push-commands.sh`)

## 🚂 Step 2: Deploy Backend (Railway)
- [ ] Sign up at https://railway.app with GitHub
- [ ] Create new project from GitHub repo
- [ ] Set root directory to `server`
- [ ] Set start command to `npm start`
- [ ] Add all environment variables from `.env.railway-backend`
- [ ] Generate domain and copy the URL

## ⚡ Step 3: Deploy Frontend (Vercel)
- [ ] Sign up at https://vercel.com with GitHub
- [ ] Import your GitHub repository
- [ ] Set framework to Vite
- [ ] Set root directory to `client`
- [ ] Set build command to `npm run build`
- [ ] Set output directory to `dist`
- [ ] Add environment variables from `.env.vercel-frontend`
- [ ] Deploy and copy the URL

## 🔗 Step 4: Connect Frontend & Backend
- [ ] Update Railway `CORS_ORIGIN` with your Vercel URL
- [ ] Update Vercel `VITE_API_URL` with your Railway URL
- [ ] Redeploy both if needed

## 🧪 Step 5: Test Your App
- [ ] Visit your Vercel URL
- [ ] Create an account
- [ ] Test bracket voting
- [ ] Create a draft league
- [ ] Test flag selection

## 🎉 Share with Friends!
Your app will be live at: `https://your-app.vercel.app`

## 📝 Notes
- JWT secrets have been generated (see above in terminal output)
- Database URL is from Supabase → Settings → Database → Connection String
- Both Railway and Vercel have generous free tiers
- Deployments will auto-update when you push to GitHub
