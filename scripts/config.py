"""
Configuration for data population scripts
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Bible API Configuration
BIBLE_API_KEY = os.getenv('BIBLE_API_KEY')
BIBLE_API_BASE_URL = 'https://api.scripture.api.bible/v1'

# Rate Limiting
OPENAI_RPM = 3000  # Requests per minute
BIBLE_API_RPM = 100  # Conservative estimate

# Batch Sizes
EMBEDDING_BATCH_SIZE = 100
DB_INSERT_BATCH_SIZE = 50

# Biblical Books (ordered)
OLD_TESTAMENT_BOOKS = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
    'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
]

NEW_TESTAMENT_BOOKS = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
    'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
]

ALL_BOOKS = OLD_TESTAMENT_BOOKS + NEW_TESTAMENT_BOOKS

# Thematic keywords for classification
THEMES = {
    'justice': ['justice', 'righteous', 'fair', 'equity', 'judgment'],
    'compassion': ['mercy', 'compassion', 'kindness', 'love', 'grace'],
    'governance': ['king', 'ruler', 'authority', 'law', 'command'],
    'poor': ['poor', 'needy', 'oppressed', 'widow', 'orphan'],
    'wealth': ['rich', 'wealth', 'money', 'treasure', 'possess'],
    'war': ['war', 'battle', 'fight', 'enemy', 'army'],
    'peace': ['peace', 'rest', 'calm', 'harmony', 'reconcile'],
    'truth': ['truth', 'true', 'honest', 'faithful', 'integrity'],
    'worship': ['worship', 'praise', 'pray', 'sacrifice', 'temple'],
    'family': ['family', 'father', 'mother', 'son', 'daughter'],
    'work': ['work', 'labor', 'servant', 'wage', 'reward'],
    'land': ['land', 'inherit', 'possess', 'territory', 'nation']
}

def validate_config():
    """Validate that required configuration is present"""
    required = {
        'SUPABASE_URL': SUPABASE_URL,
        'SUPABASE_KEY': SUPABASE_KEY,
        'OPENAI_API_KEY': OPENAI_API_KEY
    }

    missing = [key for key, value in required.items() if not value]

    if missing:
        raise ValueError(f"Missing required configuration: {', '.join(missing)}")

    print("✅ Configuration validated")
    return True
