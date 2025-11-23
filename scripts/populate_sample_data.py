"""
Populate Sample Data
Quick script to add sample data for testing the application
"""
import os
import sys
from supabase import create_client, Client
from openai import OpenAI
from dotenv import load_dotenv
from tqdm import tqdm
import time

# Load environment variables
load_dotenv()

# Initialize clients
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_embedding(text: str) -> list:
    """Generate embedding for text"""
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text.replace("\n", " ")
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"  ❌ Embedding error: {e}")
        return None

def populate_biblical_passages():
    """Add sample biblical passages"""
    print("\n📖 Populating Sample Biblical Passages...")

    passages = [
        {
            "book": "Micah",
            "chapter": 6,
            "verse_start": 8,
            "verse_end": None,
            "translation": "ESV",
            "text": "He has told you, O man, what is good; and what does the LORD require of you but to do justice, and to love kindness, and to walk humbly with your God?",
            "themes": ["justice", "humility", "righteousness", "ethics"],
            "testament": "OT"
        },
        {
            "book": "Matthew",
            "chapter": 22,
            "verse_start": 37,
            "verse_end": 39,
            "translation": "ESV",
            "text": "And he said to him, 'You shall love the Lord your God with all your heart and with all your soul and with all your mind. This is the great and first commandment. And a second is like it: You shall love your neighbor as yourself.'",
            "themes": ["love", "commandments", "relationships", "God"],
            "testament": "NT"
        },
        {
            "book": "Proverbs",
            "chapter": 31,
            "verse_start": 8,
            "verse_end": 9,
            "translation": "ESV",
            "text": "Open your mouth for the mute, for the rights of all who are destitute. Open your mouth, judge righteously, defend the rights of the poor and needy.",
            "themes": ["justice", "advocacy", "poor", "righteousness"],
            "testament": "OT"
        },
        {
            "book": "Isaiah",
            "chapter": 1,
            "verse_start": 17,
            "verse_end": None,
            "translation": "ESV",
            "text": "Learn to do good; seek justice, correct oppression; bring justice to the fatherless, plead the widow's cause.",
            "themes": ["justice", "oppression", "poor", "righteousness"],
            "testament": "OT"
        },
        {
            "book": "James",
            "chapter": 2,
            "verse_start": 14,
            "verse_end": 17,
            "translation": "ESV",
            "text": "What good is it, my brothers, if someone says he has faith but does not have works? Can that faith save him? If a brother or sister is poorly clothed and lacking in daily food, and one of you says to them, 'Go in peace, be warmed and filled,' without giving them the things needed for the body, what good is that? So also faith by itself, if it does not have works, is dead.",
            "themes": ["faith", "works", "poor", "compassion", "action"],
            "testament": "NT"
        },
        {
            "book": "Leviticus",
            "chapter": 19,
            "verse_start": 33,
            "verse_end": 34,
            "translation": "ESV",
            "text": "When a stranger sojourns with you in your land, you shall not do him wrong. You shall treat the stranger who sojourns with you as the native among you, and you shall love him as yourself, for you were strangers in the land of Egypt: I am the LORD your God.",
            "themes": ["compassion", "immigration", "justice", "foreigners"],
            "testament": "OT"
        },
        {
            "book": "Matthew",
            "chapter": 25,
            "verse_start": 35,
            "verse_end": 36,
            "translation": "ESV",
            "text": "For I was hungry and you gave me food, I was thirsty and you gave me drink, I was a stranger and you welcomed me, I was naked and you clothed me, I was sick and you visited me, I was in prison and you came to me.",
            "themes": ["compassion", "service", "poor", "hospitality"],
            "testament": "NT"
        },
        {
            "book": "Amos",
            "chapter": 5,
            "verse_start": 24,
            "verse_end": None,
            "translation": "ESV",
            "text": "But let justice roll down like waters, and righteousness like an ever-flowing stream.",
            "themes": ["justice", "righteousness"],
            "testament": "OT"
        }
    ]

    for passage in tqdm(passages, desc="Inserting passages"):
        # Generate embedding
        embedding = generate_embedding(passage["text"])
        if embedding:
            passage["embedding"] = embedding

        # Insert into database
        try:
            result = supabase.table('biblical_passages').insert(passage).execute()
            time.sleep(0.5)  # Rate limiting
        except Exception as e:
            print(f"  ❌ Error inserting {passage['book']} {passage['chapter']}:{passage['verse_start']}: {e}")

    print(f"✅ Inserted {len(passages)} sample passages")

def populate_historical_parallels():
    """Add sample historical parallels"""
    print("\n⏳ Populating Sample Historical Parallels...")

    parallels = [
        {
            "title": "Roman Empire Immigration Policy (1st-2nd Century AD)",
            "time_period": "1st-2nd Century AD",
            "location": "Roman Empire",
            "situation_summary": "Rome restricted citizenship and immigration to protect Roman culture and jobs, creating a two-tier society.",
            "key_actors": ["Roman Senate", "Emperors", "Non-citizen residents"],
            "political_context": "Empire expansion led to diverse population; Romans feared cultural dilution and job competition.",
            "what_happened": "Rome implemented strict citizenship laws, limiting rights of non-Romans. This created resentment and divided society. Eventually, the Edict of Caracalla (212 AD) granted citizenship to all free inhabitants, but by then, divisions had weakened the empire.",
            "outcome": "Short-term: Protected Roman privilege. Long-term: Created social division, weakened military recruitment, and contributed to eventual decline. The late citizenship extension couldn't undo decades of resentment.",
            "lessons_learned": "Exclusionary policies may provide short-term security but create long-term instability. Social cohesion requires inclusive policies. Economic protectionism can backfire.",
            "similarity_themes": ["immigration", "citizenship", "nationalism", "economic-protection"]
        },
        {
            "title": "Ancient Israel's Jubilee Economic Reset",
            "time_period": "Biblical Period (~1400 BC onwards)",
            "location": "Ancient Israel",
            "situation_summary": "God commanded Israel to implement a Jubilee year every 50 years, canceling debts and returning land to original families.",
            "key_actors": ["Israelites", "Landowners", "Debtors"],
            "political_context": "Agricultural economy where land loss meant permanent poverty. Wealth concentration threatened social fabric.",
            "what_happened": "The Jubilee system prevented permanent wealth concentration by periodically resetting economic inequality. Every 50 years, land returned to original families and debts were forgiven.",
            "outcome": "Designed to prevent extreme poverty and wealth gaps. Historical evidence suggests it was not consistently practiced, and this failure contributed to the social injustices prophets like Amos condemned.",
            "lessons_learned": "Economic systems need built-in mechanisms to prevent extreme inequality. Failing to implement such safeguards leads to social breakdown and injustice.",
            "similarity_themes": ["economic-policy", "debt", "wealth-distribution", "poverty"]
        },
        {
            "title": "Athenian Direct Democracy (5th Century BC)",
            "time_period": "5th Century BC",
            "location": "Athens, Greece",
            "situation_summary": "Athens developed direct democracy where citizens voted on all major decisions, excluding women, slaves, and foreigners.",
            "key_actors": ["Athenian citizens", "Demagogues", "Non-citizens"],
            "political_context": "City-state governance experiment with citizen participation, but limited to narrow definition of citizenship.",
            "what_happened": "Initially successful, but susceptible to emotional manipulation. Demagogues swayed public opinion for personal gain. The execution of Socrates and disastrous military decisions showed flaws.",
            "outcome": "Democracy collapsed under pressure from Sparta, later restored but never regained former glory. Showed both power and danger of direct democracy.",
            "lessons_learned": "Democratic systems need educated, informed citizens. Emotional appeals can override reason. Exclusionary citizenship undermines democratic ideals.",
            "similarity_themes": ["democracy", "governance", "citizenship", "populism"]
        }
    ]

    for parallel in tqdm(parallels, desc="Inserting parallels"):
        # Generate embedding from combined text
        text_for_embedding = f"{parallel['title']}. {parallel['situation_summary']} {parallel['what_happened']}"
        embedding = generate_embedding(text_for_embedding)
        if embedding:
            parallel["embedding"] = embedding

        # Insert into database
        try:
            result = supabase.table('historical_parallels').insert(parallel).execute()
            time.sleep(0.5)
        except Exception as e:
            print(f"  ❌ Error inserting {parallel['title']}: {e}")

    print(f"✅ Inserted {len(parallels)} historical parallels")

def main():
    """Main execution"""
    print("🚀 Biblical Political Analyzer - Sample Data Population")
    print("=" * 60)

    try:
        # Validate environment
        if not os.getenv('SUPABASE_URL') or not os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
            print("❌ Error: Missing Supabase credentials")
            print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file")
            sys.exit(1)

        if not os.getenv('OPENAI_API_KEY'):
            print("❌ Error: Missing OpenAI API key")
            print("Please set OPENAI_API_KEY in .env file")
            sys.exit(1)

        # Populate data
        populate_biblical_passages()
        populate_historical_parallels()

        print("\n" + "=" * 60)
        print("✅ Sample data population complete!")
        print("\nNext steps:")
        print("1. Test the application with these sample passages")
        print("2. Run populate_biblical_passages.py for full Bible")
        print("3. Configure N8N workflows")
        print("4. Deploy to Netlify")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
