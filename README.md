# 📖 Biblical Political Analyzer - Version 2

A sophisticated AI-powered web application that analyzes modern political statements by comparing them against Biblical scripture (with original Hebrew/Greek analysis), examining historical context, and finding real-life historical parallels.

**🚀 This is Version 2 - Enhanced and Improved**

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## 🎯 Vision

Help Christians understand how political rhetoric aligns (or conflicts) with Biblical principles, informed by deep historical and linguistic analysis.

## ✨ Features

### Core Analysis Components

- **📜 Biblical Scripture Matching**: Semantic search across 31,000+ verses
- **🔤 Original Language Analysis**: Hebrew & Greek etymology with Strong's Concordance
- **🏛️ Historical Context**: Understanding Biblical passages in their era
- **⏳ Historical Parallels**: Real-world historical events with similar dynamics
- **📊 Modern Policy Context**: Integration with Project 2025 and government data
- **📰 Current News**: Recent articles and developments
- **🤖 AI Synthesis**: Comprehensive analysis by Claude AI

### User Experience

- Beautiful, responsive UI with earth-tone design
- Real-time analysis with progress indicators
- Shareable analysis results
- Mobile-friendly interface
- Dark mode support (future)

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with API routes
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### Backend
- **Supabase** - PostgreSQL database with pgvector for semantic search
- **N8N** - Workflow automation and orchestration
- **OpenAI** - Embedding generation
- **Claude AI** - Analysis synthesis

### Deployment
- **Netlify** - Hosting and deployment
- **GitHub** - Version control

## 📦 Project Structure

```
biblical-political-analyzer/
├── src/
│   ├── components/          # React components
│   │   ├── AnalysisForm.tsx
│   │   ├── BiblicalPassageCard.tsx
│   │   ├── EtymologyExplorer.tsx
│   │   ├── HistoricalTimeline.tsx
│   │   ├── LoadingAnimation.tsx
│   │   └── ResultsDisplay.tsx
│   ├── lib/                 # Utilities and configurations
│   │   ├── supabase.ts      # Database client
│   │   ├── openai.ts        # Embedding generation
│   │   ├── n8n.ts           # Workflow integration
│   │   ├── utils.ts         # Helper functions
│   │   └── database.types.ts # TypeScript types
│   ├── pages/              # Next.js pages
│   │   ├── _app.tsx        # App wrapper
│   │   ├── index.tsx       # Home page
│   │   ├── analyze.tsx     # Analysis form page
│   │   ├── about.tsx       # About page
│   │   ├── results/[id].tsx # Results page
│   │   └── api/            # API routes
│   │       ├── analyze.ts
│   │       ├── results/[id].ts
│   │       └── status/[id].ts
│   └── styles/
│       └── globals.css     # Global styles
├── supabase/
│   └── schema.sql          # Database schema
├── public/                 # Static assets
├── .env.local             # Environment variables
├── netlify.toml           # Netlify configuration
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ and npm 10+
- Supabase account
- N8N account (or self-hosted instance)
- OpenAI API key
- Claude API key (optional, for local testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd biblical-political-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://nraxsxvjjffgrmfukjqf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   N8N_WEBHOOK_URL=https://igta.app.n8n.cloud/webhook/analyze
   OPENAI_API_KEY=your_openai_key
   CLAUDE_API_KEY=your_claude_key (optional)
   ```

4. **Set up Supabase database**

   Run the schema SQL in your Supabase SQL Editor:
   ```bash
   # Open Supabase dashboard > SQL Editor
   # Copy and paste contents of supabase/schema.sql
   # Execute the query
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Navigate to SQL Editor
3. Execute the schema from `supabase/schema.sql`
4. Verify tables are created:
   - `biblical_passages`
   - `original_language`
   - `historical_context`
   - `historical_parallels`
   - `project_2025_policies`
   - `analysis_requests`
   - `analysis_results`
   - `news_cache`

5. Enable pgvector extension (should be automatic)

### Data Population

(Scripts for populating the database will be provided in future updates)

## 🔄 N8N Workflow Setup

1. Log into your N8N instance at https://igta.app.n8n.cloud
2. Create a new workflow
3. Add webhook trigger with URL: `/webhook/analyze`
4. Configure the workflow nodes (documentation coming soon)
5. Update `N8N_WEBHOOK_URL` in your `.env.local`

## 🚢 Deployment

### Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository
   - Netlify will auto-detect Next.js settings

3. **Configure Environment Variables**

   In Netlify dashboard > Site settings > Environment variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `N8N_WEBHOOK_URL`
   - `OPENAI_API_KEY`
   - `CLAUDE_API_KEY`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site is live!

## 🔧 Configuration

### Tailwind Theme

The application uses a custom Biblical theme with earth tones:

```js
colors: {
  biblical: {
    sand: '#E8DCC4',
    parchment: '#F4ECD8',
    stone: '#8B7355',
    clay: '#A0826D',
    olive: '#6B705C',
    deepblue: '#2C3E50',
    gold: '#D4AF37',
    bronze: '#CD7F32',
  }
}
```

### API Rate Limits

- OpenAI embeddings: 3000 RPM (requests per minute)
- Supabase: Included in free tier
- Bible API: 1000 requests/day (free tier)

## 📖 API Documentation

### POST /api/analyze

Submit a political statement for analysis.

**Request:**
```json
{
  "statement": "Your political statement here",
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "request_id": "uuid",
  "message": "Analysis started successfully"
}
```

### GET /api/results/[id]

Retrieve analysis results.

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { /* request data */ },
    "results": { /* analysis results */ }
  }
}
```

### GET /api/status/[id]

Check analysis status.

**Response:**
```json
{
  "success": true,
  "status": "processing",
  "progress": 50,
  "message": "Analyzing your statement..."
}
```

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Please open an issue to discuss potential changes.

## 📄 License

Copyright © 2025. All rights reserved.

## 🙏 Acknowledgments

### Data Sources

- **Bible API** (api.bible) - Scripture access
- **OpenScriptures** - Hebrew & Greek texts
- **Strong's Concordance** - Etymology data
- **Open Bible Data** - Historical context
- **Ancient History Encyclopedia** - Historical parallels
- **Federal Register** - Government data
- **Heritage Foundation** - Project 2025 document

### Technologies

- Next.js team for the amazing framework
- Supabase for the powerful backend
- Anthropic for Claude AI
- OpenAI for embeddings
- The open-source community

## 📞 Support

For questions or issues:

1. Check the [About page](/about) for methodology details
2. Review this README thoroughly
3. Check the code comments for implementation details
4. Open an issue on GitHub

## 🗺️ Roadmap

- [ ] Complete N8N workflow templates
- [ ] Data population scripts
- [ ] User authentication
- [ ] Saved analyses
- [ ] PDF export
- [ ] Advanced filtering
- [ ] Dark mode
- [ ] Mobile app

---

**Built with ❤️ and powered by Biblical wisdom, historical knowledge, and modern AI.**
