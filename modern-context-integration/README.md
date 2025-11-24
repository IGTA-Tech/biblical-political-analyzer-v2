# 🌍 Modern Context & Historical Parallels Integration

System for connecting biblical narratives to modern events and historical parallels across 2000+ years of history.

## 🎯 Purpose

This integration allows the app to:
- **Connect Bible to current events** - Show how biblical themes relate to today's news
- **Find historical parallels** - Identify similar events from past 2000 years
- **Track patterns** - Show recurring themes (exile, empire collapse, religious persecution, etc.)
- **Provide context** - Help users understand biblical events through modern/historical lens

## 🏗️ Architecture

```
Biblical Narrative
       ↓
Theme Extraction (exile, persecution, empire, prophecy, etc.)
       ↓
       ├─→ Modern Events (News APIs)
       │   └─→ Current events matching biblical themes
       │
       └─→ Historical Parallels (Historical Events APIs)
           └─→ Similar events from past 2000 years
```

## 📚 Data Sources

### News APIs (Current Events)
1. **NewsAPI.org** - 150,000+ sources, 14 languages, 55 countries
2. **GNews.io** - 60,000+ sources, 5 years historical data
3. **The News API** - Free tier, global coverage
4. **NewsData.io** - 79,451+ sources, 206 countries

### Historical Events APIs
1. **API Ninjas Historical Events** - Ancient to modern times
2. **Day in History API** - 300 BC to present
3. **Historical Events API (Zyla)** - 3200 BCE to 2000 CE

### Pattern Matching Examples

**Biblical Theme → Modern/Historical Parallels**

- **Exile/Diaspora** → Syrian refugee crisis, Jewish diaspora, Armenian genocide
- **Empire Collapse** → Soviet Union fall, Roman Empire collapse, Ottoman Empire end
- **Religious Persecution** → Uyghur Muslims in China, Christians in Middle East, Holocaust
- **Prophetic Warning** → Climate change warnings, economic crisis predictions
- **Social Justice** → Civil rights movements, labor movements, abolition
- **Famine/Plague** → COVID-19 pandemic, Irish Famine, Black Death
- **Covenant/Treaty** → UN Charter, Treaty of Westphalia, peace treaties
- **Monarchy/Leadership** → Rise/fall of dictators, democratic transitions
- **Temple Destruction** → Notre Dame fire, destruction of cultural sites (ISIS)
- **Restoration** → Nation rebuilding (post-WWII), independence movements

## 🔑 API Keys Required

See `.env.example` for setup instructions.

## 📖 Use Cases

1. **Study Genesis flood** → See historical flood events, climate change news
2. **Study Babylonian exile** → See refugee crises, forced migrations
3. **Study prophetic warnings** → See modern warnings about society
4. **Study Roman persecution** → See religious persecution news
5. **Study economic injustice** → See wealth inequality news

## 🚀 Features

- Real-time news matching to biblical themes
- Historical parallels from 2000+ years
- Timeline visualization capabilities
- Theme tracking across time periods
- Sentiment analysis on modern events
- Geographic mapping of parallels
