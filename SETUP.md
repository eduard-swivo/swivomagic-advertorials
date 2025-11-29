# 🚀 Quick Setup Guide

## Step 1: Enable Vercel Postgres

1. Go to: https://vercel.com/lenards-projects-bd33782d/swivomagic-advertorials
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Click "Continue" → "Create"

## Step 2: Connect Database to Project

Vercel will automatically:
- Create the database
- Add environment variables to your project
- Make them available in production

## Step 3: Get Environment Variables Locally

### Option A: Via Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### Option B: Manual Copy
1. In Vercel dashboard, go to Settings → Environment Variables
2. Copy all `POSTGRES_*` variables
3. Paste them into `.env.local`

## Step 4: Deploy & Initialize

1. **Push to GitHub:**
```bash
git add .
git commit -m "Added database backend with admin interface"
git push origin main
```

2. **Wait for Vercel to deploy** (~1 minute)

3. **Visit your production site:**
   - Go to: https://your-site.vercel.app/admin
   - Click "Initialize Database"
   - This creates the articles table

4. **Create your first article:**
   - Click "+ New Article"
   - Fill in the form
   - Submit!

## Step 5: Test Locally (Optional)

```bash
# Make sure you have .env.local with Vercel Postgres credentials
npm run dev

# Visit http://localhost:3000/admin
# Click "Initialize Database"
# Create test articles
```

## 🎯 You're Done!

Now you can:
- ✅ Create articles via `/admin`
- ✅ View them on the homepage
- ✅ No more manual coding needed!

## 📝 Next Steps

1. Upload product images to `/public/images/`
2. Create your advertorial articles
3. Share the article URLs in your Meta ads
4. Track performance with UTM parameters

## ⚠️ Important Notes

- **Database is free** up to 256MB (hundreds of articles)
- **Admin is public** - add authentication later if needed
- **Images must be uploaded manually** to `/public/images/`
- **UTM tracking** works automatically on all links
