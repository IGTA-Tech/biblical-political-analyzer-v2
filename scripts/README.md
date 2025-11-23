# 📊 Database Population Scripts

Python scripts to populate the Supabase database with Biblical passages, historical parallels, and other data.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
# Edit .env with your actual keys
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (not anon key!)
- `OPENAI_API_KEY` - For generating embeddings
- `BIBLE_API_KEY` - Optional, for Bible API access

### 3. Run Sample Data (Quick Test)

Start with sample data to test your setup:

```bash
python populate_sample_data.py
```

This will insert ~10 biblical passages and 3 historical parallels with embeddings.

**Expected output:**
```
📖 Populating Sample Biblical Passages...
Inserting passages: 100%|██████| 8/8
✅ Inserted 8 sample passages

⏳ Populating Sample Historical Parallels...
Inserting parallels: 100%|██████| 3/3
✅ Inserted 3 historical parallels

✅ Sample data population complete!
```

## 📚 Available Scripts

### populate_sample_data.py
**Purpose:** Quick test data insertion
**Time:** ~2 minutes
**Records:** ~10 passages, 3 parallels
**Cost:** ~$0.01 in API calls

**Use when:**
- Testing the application
- Validating setup
- Quick development

```bash
python populate_sample_data.py
```

### populate_biblical_passages.py *(Coming Soon)*
**Purpose:** Full Bible population
**Time:** ~2-3 hours
**Records:** 31,000+ verses
**Cost:** ~$5-10 in embeddings

**Features:**
- All 66 books of the Bible
- Multiple translations (ESV, NIV, KJV)
- Automatic theme detection
- Progress tracking
- Resume capability

```bash
python populate_biblical_passages.py --translation ESV
```

### populate_historical_parallels.py *(Coming Soon)*
**Purpose:** Historical events database
**Time:** ~30 minutes
**Records:** 100+ events

**Sources:**
- Ancient History Encyclopedia
- Wikipedia (programmatic access)
- Public domain histories

```bash
python populate_historical_parallels.py
```

### populate_project_2025.py *(Coming Soon)*
**Purpose:** Project 2025 policy database
**Time:** ~15 minutes
**Records:** ~200 policy excerpts

**Features:**
- Fair use excerpts (200-300 words)
- Chapter organization
- Policy area tagging
- Embeddings for search

```bash
python populate_project_2025.py
```

## 🔧 Configuration

### config.py

Central configuration file with:
- API endpoints
- Rate limits
- Batch sizes
- Biblical book lists
- Theme keywords

**Rate Limits (Default):**
- OpenAI: 3000 RPM
- Bible API: 100 RPM

**Batch Sizes:**
- Embeddings: 100 per batch
- Database inserts: 50 per batch

### Customize Themes

Edit `config.py` to add/modify theme keywords:

```python
THEMES = {
    'justice': ['justice', 'righteous', 'fair', ...],
    'compassion': ['mercy', 'compassion', 'kindness', ...],
    # Add your themes here
}
```

## 📊 Data Structure

### Biblical Passages

```python
{
    "book": "Micah",
    "chapter": 6,
    "verse_start": 8,
    "verse_end": None,
    "translation": "ESV",
    "text": "He has told you, O man...",
    "embedding": [0.123, -0.456, ...],  # 1536 dimensions
    "themes": ["justice", "humility"],
    "testament": "OT"
}
```

### Historical Parallels

```python
{
    "title": "Roman Empire Immigration...",
    "time_period": "1st-2nd Century AD",
    "location": "Roman Empire",
    "situation_summary": "Rome restricted...",
    "what_happened": "Rome implemented...",
    "outcome": "Short-term: Protected...",
    "lessons_learned": "Exclusionary policies...",
    "embedding": [0.789, -0.012, ...],
    "similarity_themes": ["immigration", "citizenship"]
}
```

## 🐛 Troubleshooting

### "Missing Supabase credentials"

- Check `.env` file exists in scripts directory
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Use **SERVICE_ROLE_KEY**, not ANON_KEY (more permissions needed)

### "OpenAI API error"

- Verify `OPENAI_API_KEY` is correct
- Check you have API credits: https://platform.openai.com/usage
- Ensure key has embeddings permission
- Check rate limits (default: 3000 RPM)

### "Database insert error"

- Verify Supabase tables exist (run schema.sql first)
- Check RLS policies allow service role key to insert
- Verify table structure matches data structure
- Check Supabase logs for specific errors

### "Rate limit exceeded"

- Adjust rate limits in `config.py`
- Add delays between batches
- Reduce batch sizes

### Script crashes mid-run

- Scripts will resume from last successful batch
- Check `last_processed.json` for progress
- Re-run the same command to continue

## 💰 Cost Estimates

### OpenAI Embeddings

**Model:** `text-embedding-ada-002`
**Cost:** $0.0001 per 1,000 tokens

**Estimates:**
- Sample data: ~$0.01
- Full Bible (31K verses): ~$5-10
- Historical parallels (100): ~$0.50
- Project 2025: ~$2-3

**Total for full population: ~$10-15**

### API Rate Limits

**OpenAI:**
- Free tier: 3 RPM
- Paid tier: 3,000 RPM

**Bible API:**
- Free tier: 1,000 requests/day
- Rate: ~100 RPM

## 📈 Monitoring Progress

All scripts show progress bars:

```
Inserting passages: 100%|████████████| 8/8 [00:12<00:00, 1.50s/it]
```

Check Supabase Table Editor to verify insertions:
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select table (e.g., `biblical_passages`)
4. See inserted records

## 🔄 Re-running Scripts

Scripts are **idempotent** when possible:
- Duplicate detection prevents re-insertion
- Resume capability for interrupted runs
- Safe to run multiple times

To force re-population:
```bash
python populate_sample_data.py --force
```

## 🎯 Recommended Order

1. **First:** Run `populate_sample_data.py`
   - Quick validation
   - Test your setup
   - Verify embeddings work

2. **Second:** Test the application
   - Try a few analyses
   - Check results quality
   - Verify everything connects

3. **Third:** Run full population scripts
   - `populate_biblical_passages.py`
   - `populate_historical_parallels.py`
   - `populate_project_2025.py`

4. **Finally:** Deploy to production
   - Full dataset ready
   - Application tested
   - N8N workflows configured

## 📞 Support

**Issues?**
- Check script output for specific errors
- Review Supabase logs
- Verify API keys and credentials
- Check network connectivity

**Questions?**
- See main README.md
- Check DEPLOYMENT.md
- Review code comments

---

**Ready to populate your database! 🚀**
