# Historical Faith Tracker

Interactive web application for exploring 2,000 years of religious history (4 BC - 2024 AD).

## Purpose

This application provides:

- **Interactive Timeline**: Navigate from 4 BC to 2024 AD
- **Semantic Search**: Find events, figures, and themes using AI-powered search
- **Perspective Comparison**: View events from multiple viewpoints (Orthodox, Catholic, Protestant, Jewish, Academic)
- **Scripture Usage Explorer**: Track how biblical texts were used throughout history
- **Geographic Visualization**: See the spread of faiths on interactive maps

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + pgvector)
- **Visualizations**: D3.js, TimelineJS
- **Maps**: Mapbox / Leaflet + OpenStreetMap
- **AI**: OpenAI embeddings for semantic search

## Folder Structure

```
historical-faith-tracker/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── lib/           # Utilities & helpers
│   └── styles/        # Global styles
├── supabase/
│   ├── schema.sql     # Database schema
│   ├── migrations/    # Schema changes
│   └── seed/          # Sample data
└── public/            # Static assets
```

## Getting Started

1. Install dependencies: `npm install`
2. Configure `.env` with Supabase credentials
3. Run database migrations
4. Start development server: `npm run dev`

## Features

### Timeline View
- Zoomable timeline from 4 BC to 2024 AD
- Filter by tradition, event type, region
- Click events for detailed information

### Search
- Full-text search across all content
- Semantic search using vector embeddings
- Filter by era, tradition, perspective

### Perspective Comparison
- Side-by-side view of different interpretations
- Orthodox, Catholic, Protestant, Jewish, Academic views
- Areas of agreement/disagreement highlighted

### Scripture Usage Tracker (Key Feature)
- Search any biblical passage to see how it was used through history
- Filter by era, purpose, tradition
- See interpretations given and impact
- Pattern analysis across centuries

### Maps
- Geographic spread visualization
- Animated history of faith movements
- Event location mapping

## Database Schema

See `supabase/schema.sql` for complete schema including:
- `eras` - Historical periods
- `perspectives` - Different viewpoints
- `events` - Historical events with embeddings
- `event_interpretations` - Multiple perspectives per event
- `figures` - Historical people
- `movements` - Religious movements
- `scripture_usage` - How texts were used (killer feature)
- `primary_sources` - Source references

## Related

- See `../historical-faith-narrative/` for content generation
- See `../jewish_biblical_narrative_enhanced.md` for biblical period narrative
