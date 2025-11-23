# 📖 Biblical Political Analyzer - Complete Setup Guide

## 🎉 **EVERYTHING IS READY!**

This guide walks you through the complete setup from zero to deployed application.

---

## ✅ What You Have

### 1. **Complete Next.js Application** ✅
- **Location:** `~/biblical-political-analyzer`
- **Status:** Production-ready code
- **Pages:** Home, Analyze, Results, About
- **Components:** 6 fully-functional React components
- **API Routes:** 3 endpoints for analysis workflow
- **Styling:** Beautiful Biblical theme with Tailwind CSS

### 2. **Supabase Database Schema** ✅
- **Location:** `supabase/schema.sql`
- **Status:** Ready to run
- **Tables:** 8 tables with vector search
- **Functions:** 4 search functions for semantic matching
- **Features:** RLS policies, indexes, sample data

### 3. **N8N Workflow Templates** ✅
- **Location:** `n8n/master-workflow.json`
- **Status:** Ready to import
- **Nodes:** 11-node workflow for complete analysis
- **Features:** OpenAI embeddings, Supabase queries, Claude AI synthesis

### 4. **Data Population Scripts** ✅
- **Location:** `scripts/`
- **Status:** Ready to run
- **Scripts:** Sample data (ready now), Full Bible (template ready)
- **Features:** Progress tracking, resume capability, rate limiting

### 5. **Documentation** ✅
- **README.md:** Project overview
- **DEPLOYMENT.md:** Deployment steps
- **n8n/README.md:** Workflow setup
- **scripts/README.md:** Data population guide
- **This file:** Complete setup guide

---

## 🚀 Setup Timeline

### **Total Time:** 2-3 hours (mostly automated)

| Phase | Time | Automated | Manual |
|-------|------|-----------|--------|
| 1. Supabase Setup | 15 min | ❌ | ✅ |
| 2. GitHub & Netlify | 20 min | ✅ | Clicks |
| 3. N8N Workflow | 30 min | ❌ | ✅ |
| 4. Sample Data | 5 min | ✅ | Run script |
| 5. Full Data (Optional) | 2-3 hrs | ✅ | Run script |
| **Total (Minimum)** | **1 hr 10 min** | | |

---

## 📋 Complete Step-by-Step Setup

### **PHASE 1: Supabase Database** (15 minutes)

#### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name:** biblical-political-analyzer
   - **Database Password:** (save this!)
   - **Region:** Closest to you
4. Click **Create new project**
5. Wait 2-3 minutes for initialization

#### Step 1.2: Run Database Schema
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/schema.sql` on your computer
4. Copy ALL contents (it's long!)
5. Paste into Supabase SQL Editor
6. Click **Run** (bottom right)
7. Wait ~30 seconds for execution
8. You should see "Success. No rows returned"

#### Step 1.3: Verify Tables Created
1. Click **Table Editor** (left sidebar)
2. You should see 8 tables:
   - biblical_passages
   - original_language
   - historical_context
   - historical_parallels
   - project_2025_policies
   - analysis_requests
   - analysis_results
   - news_cache

#### Step 1.4: Get API Credentials
1. Click **Settings** > **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public:** The `anon` `public` key
   - **service_role:** The `service_role` `secret` key (click "Reveal")

**Save these - you'll need them!**

---

### **PHASE 2: GitHub & Netlify** (20 minutes)

#### Step 2.1: Push to GitHub

```bash
cd ~/biblical-political-analyzer

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Biblical Political Analyzer"

# Create repository on GitHub
# Go to github.com, click "New repository"
# Name: biblical-political-analyzer
# Don't initialize with README (we have one)

# Link and push
git remote add origin https://github.com/YOUR_USERNAME/biblical-political-analyzer.git
git branch -M main
git push -u origin main
```

#### Step 2.2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site** > **Import an existing project**
3. Click **GitHub**
4. Authorize Netlify (if first time)
5. Search for: `biblical-political-analyzer`
6. Click on your repository
7. Netlify auto-detects Next.js:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
8. **Don't click Deploy yet!** First, add environment variables...

#### Step 2.3: Add Environment Variables

1. Scroll down to **Environment variables**
2. Click **Add environment variables** > **Add a variable**

Add these **exact variables** (use values from Step 1.4):

```
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your_anon_key_here

Variable Name: SUPABASE_SERVICE_ROLE_KEY
Value: your_service_role_key_here

Variable Name: N8N_WEBHOOK_URL
Value: https://igta.app.n8n.cloud/webhook/analyze-political-statement
(We'll update this after N8N setup)

Variable Name: OPENAI_API_KEY
Value: your_openai_key_here
(Get from platform.openai.com)
```

3. After adding all variables, click **Deploy site**
4. Wait 3-5 minutes for build
5. Your site is live! 🎉

**Copy your Netlify URL:** `https://random-name-123.netlify.app`

---

### **PHASE 3: N8N Workflow** (30 minutes)

#### Step 3.1: Import Workflow

1. Go to [igta.app.n8n.cloud](https://igta.app.n8n.cloud)
2. Log in to your N8N account
3. Click **Workflows** (left sidebar)
4. Click **Add workflow** dropdown
5. Select **Import from File**
6. Click **Select file**
7. Navigate to `n8n/master-workflow.json`
8. Click **Open**
9. Workflow appears! Don't activate yet...

#### Step 3.2: Configure Credentials

The workflow needs 3 credentials:

**A) OpenAI API**
1. Click **Settings** > **Credentials** (left sidebar)
2. Click **Add Credential**
3. Select **OpenAI**
4. Enter:
   - **Name:** OpenAI
   - **API Key:** Your OpenAI API key
5. Click **Save**

**B) Supabase (Read)**
1. Click **Add Credential** > **Http Header Auth**
2. Enter:
   - **Name:** Supabase Read
   - **Header Name:** `apikey`
   - **Header Value:** Your Supabase ANON key
3. Click **Save**

**C) Supabase (Write)**
1. Click **Add Credential** > **Http Header Auth**
2. Enter:
   - **Name:** Supabase Write
   - **Header Name:** `apikey`
   - **Header Value:** Your Supabase SERVICE ROLE key
3. Click **Save**

**D) Claude API**
1. Click **Add Credential** > **Http Header Auth**
2. Enter:
   - **Name:** Claude API
   - **Header Name:** `x-api-key`
   - **Header Value:** Your Claude API key
3. Click **Save**

#### Step 3.3: Add Environment Variables to N8N

1. Click **Settings** > **Environment**
2. Click **Add Variable**

Add these:

```
Name: SUPABASE_URL
Value: https://your-project.supabase.co

Name: SUPABASE_ANON_KEY
Value: your_anon_key

Name: SUPABASE_SERVICE_ROLE_KEY
Value: your_service_role_key

Name: CLAUDE_API_KEY
Value: your_claude_key
```

#### Step 3.4: Configure Workflow Nodes

1. Go back to **Workflows**
2. Click on your imported workflow
3. For each HTTP Request node that uses Supabase:
   - Click the node
   - Select credential: **Supabase Read** or **Supabase Write**
4. For "Generate Embedding" node:
   - Select credential: **OpenAI**
5. For "Claude AI Analysis" node:
   - Select credential: **Claude API**

#### Step 3.5: Activate Workflow

1. Click **Active** toggle (top right) - it should turn green
2. Click on **Webhook Trigger** node
3. Copy the **Production URL** shown
4. It looks like: `https://igta.app.n8n.cloud/webhook/XXXXX`

#### Step 3.6: Update Netlify with N8N URL

1. Go back to Netlify dashboard
2. Click **Site settings** > **Environment variables**
3. Find `N8N_WEBHOOK_URL`
4. Click **Edit**
5. Paste your N8N webhook URL
6. Click **Save**
7. Go to **Deploys** > **Trigger deploy** > **Clear cache and deploy**

---

### **PHASE 4: Populate Sample Data** (5 minutes)

#### Step 4.1: Install Python Dependencies

```bash
cd ~/biblical-political-analyzer/scripts

# Install dependencies
pip install -r requirements.txt
```

#### Step 4.2: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

Add your credentials:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

Save and exit (Ctrl+X, then Y, then Enter for nano)

#### Step 4.3: Run Sample Data Script

```bash
python populate_sample_data.py
```

**Expected output:**

```
🚀 Biblical Political Analyzer - Sample Data Population
============================================================

📖 Populating Sample Biblical Passages...
Inserting passages: 100%|████████████| 8/8 [00:15<00:00, 1.92s/it]
✅ Inserted 8 sample passages

⏳ Populating Sample Historical Parallels...
Inserting parallels: 100%|██████████| 3/3 [00:08<00:00, 2.67s/it]
✅ Inserted 3 historical parallels

============================================================
✅ Sample data population complete!
```

**This costs ~$0.01 in OpenAI API calls**

#### Step 4.4: Verify Data in Supabase

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Click **biblical_passages** table
4. You should see 8 rows!
5. Click **historical_parallels** table
6. You should see 3 rows!

---

### **PHASE 5: Test the Application** (10 minutes)

#### Step 5.1: Open Your Site

Go to your Netlify URL: `https://your-site.netlify.app`

#### Step 5.2: Test the Homepage

- Click around
- Check navigation works
- Verify styling looks good
- Test on mobile (resize browser)

#### Step 5.3: Test Analysis

1. Click **Analyze** in navigation
2. Try this statement:
   ```
   We need to help the poor and needy in our community
   ```
3. Click **Analyze**
4. You should see loading animation
5. After 15-30 seconds, results should appear!

#### Step 5.4: Verify Results

Results page should show:
- ✅ Executive summary
- ✅ Biblical passages (with verses)
- ✅ Historical parallels
- ✅ Detailed analysis from Claude
- ✅ Share button

If you see errors, check:
- N8N workflow is Active
- Environment variables are correct in Netlify
- Check N8N execution logs
- Check browser console (F12)

---

## 🎯 You're Done! What Now?

### **Immediate Next Steps:**

1. **Test thoroughly:**
   - Try 5-10 different political statements
   - Check all result tabs
   - Test on mobile
   - Share with friends

2. **Customize (Optional):**
   - Change site name in Netlify
   - Add custom domain
   - Adjust colors in `tailwind.config.js`
   - Modify About page with your info

3. **Populate Full Database (Optional):**
   ```bash
   # This takes 2-3 hours and costs ~$10 in API calls
   python populate_biblical_passages.py
   ```

### **Future Enhancements:**

- ⬜ User authentication
- ⬜ Save favorite analyses
- ⬜ PDF export
- ⬜ Dark mode
- ⬜ Mobile app
- ⬜ More historical parallels
- ⬜ Additional data sources

---

## 🐛 Troubleshooting

### Problem: Build fails on Netlify

**Solution:**
1. Check **Deploys** > **Deploy log** for errors
2. Common issues:
   - Missing environment variables
   - Typo in variable names
   - Wrong Node version
3. Try: **Deploys** > **Trigger deploy** > **Clear cache and deploy**

### Problem: Analysis doesn't start

**Solution:**
1. Check N8N workflow is **Active** (green toggle)
2. Check `N8N_WEBHOOK_URL` in Netlify is correct
3. Check browser console for errors (F12)
4. Test N8N webhook directly:
   ```bash
   curl -X POST https://your-n8n-url/webhook/analyze \
     -H "Content-Type: application/json" \
     -d '{"political_statement": "test"}'
   ```

### Problem: No results shown

**Solution:**
1. Check Supabase has data:
   - Table Editor > biblical_passages (should have rows)
2. Check N8N execution logs:
   - Workflows > Executions > Click latest
3. Check analysis_results table in Supabase
4. Wait longer (first analysis can take 30-45 seconds)

### Problem: Python script errors

**Solution:**
1. Check `.env` file exists in scripts directory
2. Verify all API keys are correct
3. Check you have OpenAI API credits
4. Try running with verbose logging:
   ```bash
   python populate_sample_data.py --verbose
   ```

---

## 💰 Cost Breakdown

### One-Time Setup Costs:
- **Supabase:** FREE (500MB database, 50GB bandwidth)
- **Netlify:** FREE (100GB bandwidth, 300 build minutes)
- **N8N:** FREE (5K workflow executions/month)

### Ongoing API Costs:
- **OpenAI Embeddings:** ~$0.0001 per request
- **Claude AI Analysis:** ~$0.01 per analysis
- **Sample data population:** ~$0.01
- **Full Bible population:** ~$10 (one-time)

### Monthly Estimates (100 analyses/month):
- **OpenAI:** ~$0.50
- **Claude:** ~$1.00
- **Total:** ~$1.50/month

**All platforms offer free tiers sufficient for personal use!**

---

## 📊 Success Checklist

Use this to verify everything works:

### Setup Phase:
- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] 8 tables visible in Table Editor
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Netlify site deployed
- [ ] Environment variables configured
- [ ] Build succeeded (green checkmark)
- [ ] N8N workflow imported
- [ ] N8N credentials configured
- [ ] N8N workflow activated
- [ ] Webhook URL updated in Netlify

### Data Phase:
- [ ] Python dependencies installed
- [ ] `.env` file configured
- [ ] Sample data script ran successfully
- [ ] Biblical passages in database (8 rows)
- [ ] Historical parallels in database (3 rows)

### Testing Phase:
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Analysis form accepts input
- [ ] Analysis completes successfully
- [ ] Results display properly
- [ ] All tabs show content
- [ ] Site works on mobile
- [ ] Can share analysis URL

### All Green? **🎉 YOU'RE DONE! 🎉**

---

## 📞 Need Help?

1. **Check the docs:**
   - README.md (project overview)
   - DEPLOYMENT.md (deployment details)
   - n8n/README.md (workflow setup)
   - scripts/README.md (data population)

2. **Check logs:**
   - Netlify: Deploys > Deploy log
   - N8N: Workflows > Executions
   - Supabase: Logs section
   - Browser: Console (F12)

3. **Common issues:**
   - 90% are environment variable typos
   - Check API keys are valid
   - Verify services are active
   - Wait for builds to complete

4. **Still stuck?**
   - Review this guide step-by-step
   - Check each checkbox above
   - Verify credentials in multiple places

---

## 🎊 Congratulations!

You now have a fully functional AI-powered Biblical Political Analyzer!

**Your application can:**
- ✅ Analyze political statements
- ✅ Find relevant Biblical passages
- ✅ Provide historical context
- ✅ Generate comprehensive analysis
- ✅ Display beautiful results
- ✅ Share analyses via URL

**You've built something amazing! 🙏**

### Share Your Success!

Try these analyses to show off your new tool:
1. "Healthcare is a human right"
2. "We should close our borders"
3. "Tax cuts for corporations create jobs"
4. "Climate change requires immediate action"
5. "Traditional family values are important"

---

**Built with ❤️ using Next.js, Supabase, N8N, and AI**

**Now go analyze some political statements! 🚀**
