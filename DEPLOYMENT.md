# Vercel Deployment Guide

## Prerequisites
1. Create a Vercel account at https://vercel.com
2. Install Vercel CLI (optional): `npm i -g vercel`

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
   - If not using Git, you can drag and drop your project folder
3. Configure your project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:
     ```
     VITE_GEMINI_API_KEY=AIzaSyCP4_6Lz-1gjDP9jTCLCkN7pkBxf9A5jVk
     VITE_SUPABASE_URL=https://ffbwvpwjuexelrgqsevw.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYnd2cHdqdWV4ZWxyZ3FzZXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODQ1MzQsImV4cCI6MjA3OTM2MDUzNH0.bJLfjD0yJSNwX93Qvs6IqZYVA4blKw56Dm34M0KucY0
     ```
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Follow the prompts
5. Add environment variables:
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
6. Redeploy: `vercel --prod`

## Important Notes
- **DO NOT** commit your `.env` file to Git
- Add `.env` to `.gitignore`
- Environment variables must be added in Vercel dashboard for each deployment
- Your app will be available at: `https://your-project-name.vercel.app`

## Automatic Deployments
Once connected to Git:
- Every push to `main` branch = automatic production deployment
- Every push to other branches = automatic preview deployment
