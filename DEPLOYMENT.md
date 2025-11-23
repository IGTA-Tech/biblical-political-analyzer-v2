# 🚀 Deployment Guide

## ✅ What's Complete

### ✨ Application Code (100%)
- ✅ Next.js 14 project with TypeScript
- ✅ All pages (Home, Analyze, Results, About)
- ✅ All React components (AnalysisForm, ResultsDisplay, BiblicalPassageCard, etc.)
- ✅ API routes (analyze, results, status)
- ✅ Supabase client configuration
- ✅ Utility functions (embeddings, N8N integration)
- ✅ Tailwind CSS styling with custom Biblical theme
- ✅ Responsive design for all screen sizes

### 📊 Database (100%)
- ✅ Complete Supabase schema (`supabase/schema.sql`)
- ✅ All 8 tables defined
- ✅ Vector search functions
- ✅ Row Level Security policies
- ✅ Indexes for performance

### ⚙️ Configuration (100%)
- ✅ Netlify deployment config (`netlify.toml`)
- ✅ Environment variables template
- ✅ Build configuration
- ✅ TypeScript configuration
- ✅ Tailwind configuration

### 📖 Documentation (100%)
- ✅ Comprehensive README
- ✅ Setup instructions
- ✅ API documentation
- ✅ This deployment guide

## 📋 Prerequisites Checklist

Before deploying, make sure you have:

- [ ] GitHub account
- [ ] Netlify account (free tier is fine)
- [ ] Supabase account (free tier is fine)
- [ ] N8N account or instance
- [ ] OpenAI API key (for embeddings)
- [ ] Claude API key (optional, for analysis synthesis)

## 🔧 Setup Steps

### 1. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish initializing (2-3 minutes)
3. Go to **SQL Editor** in the Supabase dashboard
4. Copy the contents of `supabase/schema.sql`
5. Paste into the SQL Editor and click **Run**
6. Verify tables are created by checking **Table Editor**
7. Note your:
   - **Project URL**: `https://YOUR_PROJECT.supabase.co`
   - **Anon Key**: Found in Settings > API
   - **Service Role Key**: Found in Settings > API (keep this secret!)

### 2. Set Up GitHub Repository

```bash
cd ~/biblical-political-analyzer

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Biblical Political Analyzer"

# Create GitHub repository (via GitHub website)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/biblical-political-analyzer.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site** > **Import an existing project**
3. Connect to GitHub and select your repository
4. Netlify will auto-detect Next.js settings
5. Configure environment variables (see below)
6. Click **Deploy site**

### 4. Configure Environment Variables in Netlify

Go to **Site settings** > **Environment variables** and add:

```
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://nraxsxvjjffgrmfukjqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# N8N (Required for analysis workflow)
N8N_WEBHOOK_URL=https://igta.app.n8n.cloud/webhook/analyze

# OpenAI (Required for embeddings)
OPENAI_API_KEY=your_openai_key_here

# Claude API (Optional - for testing)
CLAUDE_API_KEY=your_claude_key_here
```

### 5. Trigger Redeploy

After adding environment variables:
1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** > **Deploy site**
3. Wait for build to complete (3-5 minutes)
4. Your site is live! 🎉

## 🧪 Testing Your Deployment

### 1. Test the Homepage
- Navigate to your Netlify URL
- Verify homepage loads with navigation
- Check all sections display correctly

### 2. Test the Analyze Page
- Click **Analyze** in navigation
- Try entering a sample political statement
- Submit the form

**Expected behavior (without N8N setup):**
- Form submission should create a record in Supabase
- You'll see an error about N8N webhook (this is normal)

**Once N8N is configured:**
- Analysis should start
- You'll be redirected to results page
- Results will display after processing

### 3. Check Supabase
- Go to your Supabase dashboard
- Check **Table Editor** > `analysis_requests`
- You should see your test submission

## 🔄 Setting Up N8N Workflows

### N8N Configuration Steps

1. Log into your N8N instance at `https://igta.app.n8n.cloud`
2. Create a new workflow called "Biblical Political Analyzer"
3. Add nodes in this order:

**Basic Workflow Structure:**
```
Webhook → HTTP Request (Supabase) → Claude AI → HTTP Request (Save Results)
```

**Detailed workflow creation guide coming in future updates**

For now, the application will work without N8N but won't generate analyses.

## 📊 Populating the Database

The database tables are created but empty. To populate them:

### Option 1: Manual Data Entry (Testing)
```sql
-- Insert sample biblical passage
INSERT INTO biblical_passages (book, chapter, verse_start, text, translation, themes, testament)
VALUES ('Micah', 6, 8, 'He has told you, O man, what is good...', 'ESV', ARRAY['justice', 'humility'], 'OT');
```

### Option 2: Automated Population (Coming Soon)
Python scripts to populate from free APIs are in development.

## 🐛 Troubleshooting

### Build Fails on Netlify

**Error:** "Module not found"
- Check that all dependencies are in `package.json`
- Try: Deploy > Clear cache and retry deploy

**Error:** "TypeScript errors"
- The @ts-ignore comments should handle Supabase type mismatches
- If build still fails, you can disable TypeScript checks (not recommended):
  - Add to `next.config.js`: `typescript: { ignoreBuildErrors: true }`

### Runtime Errors

**Error:** "Supabase connection failed"
- Verify environment variables are set correctly in Netlify
- Check that NEXT_PUBLIC_ prefix is used for client-side vars
- Redeploy after updating env vars

**Error:** "N8N webhook failed"
- This is expected if N8N isn't configured yet
- Application will still work, just won't generate analyses
- Configure N8N workflows to enable full functionality

### API Errors

**Error:** "Failed to generate embedding"
- Check that OPENAI_API_KEY is set correctly
- Verify you have API credits in your OpenAI account
- Check API key has embeddings permission

## 🎯 Next Steps

### Immediate Priority
1. ✅ Deploy to Netlify (follow steps above)
2. ⚠️ Set up N8N workflows for analysis generation
3. ⚠️ Populate database with biblical passages and historical data

### Future Enhancements
- User authentication
- Saved analyses
- PDF export functionality
- Dark mode
- Mobile app

## 📞 Getting Help

If you encounter issues:
1. Check the error logs in Netlify **Deploys** > **Deploy log**
2. Check browser console for client-side errors (F12)
3. Check Supabase logs for database errors
4. Review this guide and README.md

## 🎉 Success!

Once deployed, your app will be live at:
```
https://your-site-name.netlify.app
```

You can customize the domain in Netlify settings.

---

**Next:** Set up N8N workflows and populate the database to unlock full functionality!
