# Co-Game GM — Deployment Guide

## Step 1: Set up Supabase database (5 minutes)
1. Go to supabase.com → your project → SQL Editor
2. Paste the contents of `supabase_schema.sql` and click Run
3. Go to Authentication → Settings → enable Email confirmations (or disable for easier beta testing)

## Step 2: Upload to GitHub (5 minutes)
1. Go to github.com → New repository → name it "cogamegm" → Create
2. Upload all these files (drag and drop works)
3. Make sure .env.local is NOT uploaded (it's in .gitignore for safety)

## Step 3: Deploy to Vercel (5 minutes)
1. Go to vercel.com → Add New Project → Import your GitHub repo
2. In "Environment Variables" add these three:
   - REACT_APP_SUPABASE_URL = https://zzdtzjnfroagjweavujj.supabase.co
   - REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   - REACT_APP_ANTHROPIC_API_KEY = sk-ant-... (your Anthropic key)
3. Click Deploy — Vercel builds it automatically
4. Your app is live at cogamegm.vercel.app (or custom domain)

## Step 4: Invite your 6 GM friends
Share the URL and have each person click Sign Up to create their account.
Each GM gets their own private campaign vault — data never mixes.

## Your Supabase credentials (already configured)
- Project URL: https://zzdtzjnfroagjweavujj.supabase.co
- Anon key: in your .env.local file

## Need help?
- Vercel docs: vercel.com/docs
- Supabase docs: supabase.com/docs
