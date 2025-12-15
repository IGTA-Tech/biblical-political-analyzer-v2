#!/usr/bin/env python3
"""
Populate Biblical Characters and Relationships Database
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment
if os.path.exists('.env.local'):
    load_dotenv('.env.local')
else:
    load_dotenv('.env')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================
# COMPREHENSIVE CHARACTER DATA
# ============================================

CHARACTERS = [
    # ============ PATRIARCHS & MATRIARCHS ============
    {
        "name": "Adam",
        "alternate_names": ["First Man"],
        "title": "First Human",
        "category": "patriarch",
        "era": "Creation",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 1:26",
        "appearance_count": 30,
        "significance": "First human created by God, ancestor of all humanity",
        "biography": "Created by God from dust, placed in Eden with Eve. Disobeyed God by eating forbidden fruit, resulting in the Fall of humanity.",
        "major_events": ["Creation", "Naming the animals", "The Fall", "Expulsion from Eden"],
        "character_traits": ["Curious", "Responsible for creation", "Fallen"]
    },
    {
        "name": "Eve",
        "alternate_names": ["Chavah", "Mother of all living"],
        "title": "First Woman",
        "category": "matriarch",
        "era": "Creation",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 2:22",
        "appearance_count": 4,
        "significance": "First woman, mother of all humanity",
        "biography": "Created from Adam's rib as his companion. Tempted by the serpent to eat the forbidden fruit.",
        "major_events": ["Creation from Adam", "The Temptation", "The Fall", "Mother of Cain, Abel, Seth"],
        "character_traits": ["Curious", "Deceived", "Mother of humanity"]
    },
    {
        "name": "Noah",
        "title": "Builder of the Ark",
        "category": "patriarch",
        "era": "Antediluvian",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 5:29",
        "appearance_count": 51,
        "significance": "Righteous man who survived the Flood, ancestor of all post-flood humanity",
        "biography": "Found favor with God in a corrupt generation. Built the ark and preserved life through the great flood.",
        "major_events": ["Called by God", "Building the Ark", "The Flood", "Covenant of the Rainbow"],
        "character_traits": ["Righteous", "Obedient", "Patient", "Faithful"]
    },
    {
        "name": "Abraham",
        "alternate_names": ["Abram"],
        "title": "Father of Faith",
        "category": "patriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "birth_place": "Ur of the Chaldeans",
        "death_place": "Hebron",
        "books": ["Genesis"],
        "first_appearance": "Genesis 11:26",
        "appearance_count": 312,
        "significance": "Father of the Jewish nation, model of faith, received covenant promises",
        "biography": "Called by God to leave his homeland. Received promises of land, descendants, and blessing. Father of Isaac through Sarah and Ishmael through Hagar.",
        "major_events": ["Call from Ur", "Covenant with God", "Birth of Ishmael", "Birth of Isaac", "Binding of Isaac"],
        "character_traits": ["Faithful", "Obedient", "Hospitable", "Courageous"]
    },
    {
        "name": "Sarah",
        "alternate_names": ["Sarai"],
        "title": "Mother of Nations",
        "category": "matriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 11:29",
        "appearance_count": 56,
        "significance": "Wife of Abraham, mother of Isaac, matriarch of Israel",
        "biography": "Barren for most of her life, miraculously gave birth to Isaac at age 90. Known for her beauty.",
        "major_events": ["Marriage to Abraham", "Journey to Canaan", "Giving Hagar to Abraham", "Birth of Isaac"],
        "character_traits": ["Beautiful", "Faithful", "Sometimes doubtful", "Protective"]
    },
    {
        "name": "Isaac",
        "title": "Son of Promise",
        "category": "patriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 17:19",
        "appearance_count": 127,
        "significance": "Child of promise, link between Abraham and Jacob",
        "biography": "Miraculously born to elderly parents. Nearly sacrificed by Abraham as a test of faith. Father of Jacob and Esau.",
        "major_events": ["Miraculous birth", "Binding on Mount Moriah", "Marriage to Rebekah", "Blessing his sons"],
        "character_traits": ["Peaceful", "Meditative", "Faithful"]
    },
    {
        "name": "Rebekah",
        "title": "Wife of Isaac",
        "category": "matriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 22:23",
        "appearance_count": 31,
        "significance": "Wife of Isaac, mother of Jacob and Esau",
        "biography": "Chosen as Isaac's wife through divine guidance. Favored Jacob over Esau and helped him obtain the blessing.",
        "major_events": ["Meeting Abraham's servant", "Marriage to Isaac", "Birth of twins", "Helping Jacob deceive Isaac"],
        "character_traits": ["Beautiful", "Hospitable", "Cunning", "Loving"]
    },
    {
        "name": "Jacob",
        "alternate_names": ["Israel"],
        "title": "Father of the Twelve Tribes",
        "category": "patriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 25:26",
        "appearance_count": 363,
        "significance": "Father of the twelve tribes of Israel, wrestled with God",
        "biography": "Bought Esau's birthright, deceived Isaac for blessing. Worked 14 years for Rachel. Wrestled with God and was renamed Israel.",
        "major_events": ["Birth grasping Esau's heel", "Buying the birthright", "Stealing the blessing", "Ladder dream at Bethel", "Wrestling with God"],
        "character_traits": ["Cunning", "Determined", "Transformed", "Loving"]
    },
    {
        "name": "Rachel",
        "title": "Beloved Wife of Jacob",
        "category": "matriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 29:6",
        "appearance_count": 47,
        "significance": "Beloved wife of Jacob, mother of Joseph and Benjamin",
        "biography": "Jacob worked 14 years to marry her. Initially barren, then gave birth to Joseph and Benjamin (died giving birth to Benjamin).",
        "major_events": ["Meeting Jacob", "Marriage after 14 years", "Rivalry with Leah", "Birth of Joseph", "Death giving birth to Benjamin"],
        "character_traits": ["Beautiful", "Beloved", "Jealous", "Faithful"]
    },
    {
        "name": "Leah",
        "title": "First Wife of Jacob",
        "category": "matriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 29:16",
        "appearance_count": 34,
        "significance": "First wife of Jacob, mother of six tribes including Judah and Levi",
        "biography": "Married to Jacob through Laban's deception. Though unloved, was blessed with many children.",
        "major_events": ["Marriage through deception", "Bearing six sons", "Mother of Judah (messianic line)", "Mother of Levi (priestly line)"],
        "character_traits": ["Unloved", "Fertile", "Faithful"]
    },
    {
        "name": "Joseph",
        "title": "The Dreamer",
        "category": "patriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 30:24",
        "appearance_count": 213,
        "significance": "Saved Israel through famine, prefigures Christ",
        "biography": "Favored son of Jacob, sold into slavery by brothers. Rose to become second in command of Egypt. Saved his family during famine.",
        "major_events": ["Receiving the coat of many colors", "Dreams of greatness", "Sold into slavery", "Potiphar's house", "Prison", "Interpreting Pharaoh's dreams", "Ruling Egypt", "Reunion with brothers"],
        "character_traits": ["Dreamer", "Faithful", "Forgiving", "Wise", "Righteous"]
    },
    {
        "name": "Judah",
        "title": "Lion of the Tribe",
        "category": "patriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 29:35",
        "appearance_count": 83,
        "significance": "Ancestor of King David and Jesus Christ, founder of the tribe of Judah",
        "biography": "Fourth son of Jacob and Leah. Initially suggested selling Joseph. Later offered himself for Benjamin. Ancestor of the messianic line.",
        "major_events": ["Selling Joseph", "Marriage to Tamar", "Offering himself for Benjamin", "Blessing from Jacob"],
        "character_traits": ["Leader", "Transformed", "Self-sacrificing"]
    },
    {
        "name": "Benjamin",
        "title": "Son of the Right Hand",
        "category": "patriarch",
        "era": "Patriarchal",
        "testament": "OT",
        "books": ["Genesis"],
        "first_appearance": "Genesis 35:18",
        "appearance_count": 167,
        "significance": "Youngest son of Jacob, beloved after Joseph's disappearance",
        "biography": "Born as Rachel died. Became Jacob's favorite after Joseph's supposed death. His tribe would later include King Saul and the apostle Paul.",
        "major_events": ["Birth and Rachel's death", "Journey to Egypt", "Silver cup incident"],
        "character_traits": ["Beloved", "Protected"]
    },

    # ============ EXODUS LEADERS ============
    {
        "name": "Moses",
        "title": "Lawgiver",
        "category": "prophet",
        "era": "Exodus",
        "testament": "OT",
        "birth_place": "Egypt",
        "death_place": "Mount Nebo",
        "tribe_or_nation": "Levi",
        "books": ["Exodus", "Leviticus", "Numbers", "Deuteronomy"],
        "first_appearance": "Exodus 2:2",
        "appearance_count": 847,
        "significance": "Greatest prophet of Israel, received the Law, led Exodus",
        "biography": "Raised in Pharaoh's palace, fled to Midian, called by God at burning bush, led Israel from Egypt, received the Ten Commandments.",
        "major_events": ["Birth and rescue", "Killing the Egyptian", "Burning bush", "Ten Plagues", "Parting Red Sea", "Receiving the Law", "Golden calf incident", "Striking the rock", "Death viewing Promised Land"],
        "character_traits": ["Humble", "Faithful", "Leader", "Intercessor", "Sometimes angry"]
    },
    {
        "name": "Aaron",
        "title": "First High Priest",
        "category": "priest",
        "era": "Exodus",
        "testament": "OT",
        "tribe_or_nation": "Levi",
        "books": ["Exodus", "Leviticus", "Numbers"],
        "first_appearance": "Exodus 4:14",
        "appearance_count": 347,
        "significance": "First high priest of Israel, Moses' spokesman",
        "biography": "Elder brother of Moses, served as his spokesman before Pharaoh. Became first high priest. Made the golden calf.",
        "major_events": ["Speaking for Moses", "Rod becoming snake", "Golden calf sin", "Ordained as priest", "Death on Mount Hor"],
        "character_traits": ["Eloquent", "Weak at times", "Faithful"]
    },
    {
        "name": "Miriam",
        "title": "Prophetess",
        "category": "prophet",
        "era": "Exodus",
        "testament": "OT",
        "tribe_or_nation": "Levi",
        "books": ["Exodus", "Numbers"],
        "first_appearance": "Exodus 2:4",
        "appearance_count": 15,
        "significance": "Sister of Moses and Aaron, prophetess, worship leader",
        "biography": "Watched over baby Moses. Led women in worship after Red Sea crossing. Punished with leprosy for criticizing Moses.",
        "major_events": ["Watching baby Moses", "Song at Red Sea", "Criticism of Moses", "Leprosy and healing"],
        "character_traits": ["Protective", "Musical", "Sometimes jealous"]
    },
    {
        "name": "Joshua",
        "title": "Conqueror of Canaan",
        "category": "leader",
        "era": "Conquest",
        "testament": "OT",
        "tribe_or_nation": "Ephraim",
        "books": ["Exodus", "Numbers", "Deuteronomy", "Joshua"],
        "first_appearance": "Exodus 17:9",
        "appearance_count": 218,
        "significance": "Moses' successor, led Israel into Promised Land",
        "biography": "Served as Moses' aide. One of two faithful spies. Led conquest of Canaan and divided the land among tribes.",
        "major_events": ["Battle with Amalek", "Spying Canaan", "Crossing Jordan", "Battle of Jericho", "Sun standing still", "Dividing the land"],
        "character_traits": ["Courageous", "Faithful", "Military leader", "Obedient"]
    },
    {
        "name": "Caleb",
        "title": "Faithful Spy",
        "category": "leader",
        "era": "Conquest",
        "testament": "OT",
        "tribe_or_nation": "Judah",
        "books": ["Numbers", "Joshua"],
        "first_appearance": "Numbers 13:6",
        "appearance_count": 36,
        "significance": "One of two faithful spies, inherited Hebron",
        "biography": "One of twelve spies, gave positive report with Joshua. At 85, still strong enough to conquer Hebron.",
        "major_events": ["Spying Canaan", "Faithful report", "Receiving Hebron"],
        "character_traits": ["Courageous", "Faithful", "Strong"]
    },

    # ============ JUDGES ============
    {
        "name": "Deborah",
        "title": "Judge and Prophetess",
        "category": "judge",
        "era": "Judges",
        "testament": "OT",
        "books": ["Judges"],
        "first_appearance": "Judges 4:4",
        "appearance_count": 9,
        "significance": "Only female judge, led Israel to victory over Canaanites",
        "biography": "Prophetess who judged Israel under a palm tree. Commanded Barak to fight Sisera. Composed victory song.",
        "major_events": ["Judging Israel", "Commanding Barak", "Victory over Sisera", "Song of Deborah"],
        "character_traits": ["Wise", "Courageous", "Prophetic", "Leader"]
    },
    {
        "name": "Gideon",
        "alternate_names": ["Jerubbaal"],
        "title": "Mighty Warrior",
        "category": "judge",
        "era": "Judges",
        "testament": "OT",
        "books": ["Judges"],
        "first_appearance": "Judges 6:11",
        "appearance_count": 39,
        "significance": "Defeated Midianites with 300 men",
        "biography": "Called while threshing wheat in hiding. Tested God with fleece. Defeated vast army with only 300 men.",
        "major_events": ["Angel's visit", "Destroying Baal altar", "Fleece test", "Victory with 300", "Refusing kingship"],
        "character_traits": ["Doubtful initially", "Obedient", "Humble"]
    },
    {
        "name": "Samson",
        "title": "Strongest Man",
        "category": "judge",
        "era": "Judges",
        "testament": "OT",
        "tribe_or_nation": "Dan",
        "books": ["Judges"],
        "first_appearance": "Judges 13:24",
        "appearance_count": 38,
        "significance": "Nazirite with supernatural strength, fought Philistines",
        "biography": "Nazirite from birth with supernatural strength. Betrayed by Delilah. Killed more Philistines in death than in life.",
        "major_events": ["Birth announcement", "Lion encounter", "Riddle at wedding", "Delilah's betrayal", "Capture and blinding", "Final victory in death"],
        "character_traits": ["Strong", "Impulsive", "Compromising", "Repentant"]
    },
    {
        "name": "Ruth",
        "title": "The Faithful",
        "category": "matriarch",
        "era": "Judges",
        "testament": "OT",
        "tribe_or_nation": "Moab (convert)",
        "books": ["Ruth"],
        "first_appearance": "Ruth 1:4",
        "appearance_count": 13,
        "significance": "Moabite convert, great-grandmother of David, ancestor of Christ",
        "biography": "Moabite widow who chose to follow Naomi and her God. Married Boaz as kinsman-redeemer.",
        "major_events": ["Choosing to follow Naomi", "Gleaning in Boaz's field", "Night at threshing floor", "Marriage to Boaz"],
        "character_traits": ["Loyal", "Faithful", "Humble", "Hardworking"]
    },
    {
        "name": "Samuel",
        "title": "Last Judge, First Prophet",
        "category": "prophet",
        "era": "Judges",
        "testament": "OT",
        "tribe_or_nation": "Levi",
        "books": ["1 Samuel"],
        "first_appearance": "1 Samuel 1:20",
        "appearance_count": 140,
        "significance": "Transitioned Israel from judges to kings, anointed Saul and David",
        "biography": "Dedicated to God by Hannah. Heard God's voice as a child. Last judge, anointed first two kings.",
        "major_events": ["Birth and dedication", "Hearing God's voice", "Judging Israel", "Anointing Saul", "Anointing David"],
        "character_traits": ["Devoted", "Prophetic", "Faithful", "Obedient"]
    },

    # ============ UNITED MONARCHY ============
    {
        "name": "Saul",
        "title": "First King of Israel",
        "category": "king",
        "era": "United Monarchy",
        "testament": "OT",
        "tribe_or_nation": "Benjamin",
        "books": ["1 Samuel"],
        "first_appearance": "1 Samuel 9:2",
        "appearance_count": 406,
        "significance": "First king of Israel, initially successful but ultimately rejected by God",
        "biography": "Tall and handsome, anointed by Samuel. Initial victories but disobeyed God. Tormented by evil spirit, jealous of David.",
        "major_events": ["Anointing", "Victory over Ammonites", "Disobedience at Gilgal", "Rejection by God", "Hunting David", "Visit to witch of Endor", "Death at Gilboa"],
        "character_traits": ["Tall", "Initially humble", "Jealous", "Disobedient", "Tormented"]
    },
    {
        "name": "David",
        "title": "King of Israel",
        "category": "king",
        "era": "United Monarchy",
        "testament": "OT",
        "birth_place": "Bethlehem",
        "tribe_or_nation": "Judah",
        "books": ["1 Samuel", "2 Samuel", "1 Kings", "1 Chronicles", "Psalms"],
        "first_appearance": "1 Samuel 16:12",
        "appearance_count": 1118,
        "significance": "Greatest king of Israel, man after God's own heart, ancestor of Christ",
        "biography": "Shepherd boy anointed by Samuel. Killed Goliath. Fled from Saul. Became king, united Israel. Committed adultery but repented deeply.",
        "major_events": ["Anointing", "Killing Goliath", "Friendship with Jonathan", "Years as fugitive", "Becoming king", "Bringing ark to Jerusalem", "Bathsheba incident", "Absalom's rebellion"],
        "character_traits": ["Brave", "Musical", "Passionate", "Repentant", "Faithful"]
    },
    {
        "name": "Jonathan",
        "title": "Friend of David",
        "category": "prince",
        "era": "United Monarchy",
        "testament": "OT",
        "tribe_or_nation": "Benjamin",
        "books": ["1 Samuel"],
        "first_appearance": "1 Samuel 13:2",
        "appearance_count": 109,
        "significance": "Model of friendship and loyalty, Saul's son who loved David",
        "biography": "Brave warrior, defeated Philistine garrison. Formed deep friendship with David despite father's jealousy.",
        "major_events": ["Attack on Philistine garrison", "Covenant with David", "Warning David", "Death at Gilboa"],
        "character_traits": ["Brave", "Loyal", "Self-sacrificing", "Noble"]
    },
    {
        "name": "Bathsheba",
        "title": "Queen Mother",
        "category": "queen",
        "era": "United Monarchy",
        "testament": "OT",
        "books": ["2 Samuel", "1 Kings"],
        "first_appearance": "2 Samuel 11:3",
        "appearance_count": 11,
        "significance": "Wife of David, mother of Solomon",
        "biography": "Wife of Uriah, taken by David. Lost first child. Mother of Solomon, advocated for his succession.",
        "major_events": ["Taken by David", "Death of Uriah", "Death of first child", "Birth of Solomon", "Solomon's succession"],
        "character_traits": ["Beautiful", "Influential"]
    },
    {
        "name": "Solomon",
        "title": "Wisest King",
        "category": "king",
        "era": "United Monarchy",
        "testament": "OT",
        "books": ["1 Kings", "2 Chronicles", "Proverbs", "Ecclesiastes", "Song of Solomon"],
        "first_appearance": "2 Samuel 12:24",
        "appearance_count": 295,
        "significance": "Wisest king, built the Temple, wrote wisdom literature",
        "biography": "Son of David and Bathsheba. Asked for wisdom, built magnificent Temple. Married many foreign wives who turned his heart.",
        "major_events": ["Anointed king", "Dream asking for wisdom", "Judgment of two mothers", "Building the Temple", "Visit of Queen of Sheba", "Turning from God"],
        "character_traits": ["Wise", "Wealthy", "Builder", "Compromising in old age"]
    },

    # ============ DIVIDED KINGDOM PROPHETS ============
    {
        "name": "Elijah",
        "title": "Prophet of Fire",
        "category": "prophet",
        "era": "Divided Kingdom",
        "testament": "OT",
        "books": ["1 Kings", "2 Kings"],
        "first_appearance": "1 Kings 17:1",
        "appearance_count": 69,
        "significance": "Powerful prophet, confronted Baal worship, taken to heaven",
        "biography": "Appeared suddenly to announce drought. Fed by ravens. Confronted 450 prophets of Baal on Carmel. Taken to heaven in chariot of fire.",
        "major_events": ["Announcing drought", "Fed by ravens", "Widow of Zarephath", "Mount Carmel contest", "Still small voice", "Taken to heaven"],
        "character_traits": ["Bold", "Powerful", "Sometimes depressed", "Faithful"]
    },
    {
        "name": "Elisha",
        "title": "Successor of Elijah",
        "category": "prophet",
        "era": "Divided Kingdom",
        "testament": "OT",
        "books": ["1 Kings", "2 Kings"],
        "first_appearance": "1 Kings 19:16",
        "appearance_count": 58,
        "significance": "Elijah's successor, performed many miracles",
        "biography": "Called while plowing. Received double portion of Elijah's spirit. Performed more miracles than any OT prophet.",
        "major_events": ["Called by Elijah", "Receiving mantle", "Healing waters", "Widow's oil", "Raising Shunammite's son", "Healing Naaman", "Floating axehead"],
        "character_traits": ["Faithful", "Compassionate", "Powerful"]
    },
    {
        "name": "Isaiah",
        "title": "Messianic Prophet",
        "category": "prophet",
        "era": "Divided Kingdom",
        "testament": "OT",
        "books": ["Isaiah", "2 Kings"],
        "first_appearance": "2 Kings 19:2",
        "appearance_count": 37,
        "significance": "Major prophet, messianic prophecies, counseled kings",
        "biography": "Called in vision of God's throne. Prophesied to multiple kings of Judah. Wrote extensive messianic prophecies.",
        "major_events": ["Throne room vision", "Prophecy to Ahaz", "Advising Hezekiah", "Messianic prophecies"],
        "character_traits": ["Visionary", "Bold", "Eloquent"]
    },

    # ============ EXILE PROPHETS ============
    {
        "name": "Jeremiah",
        "title": "Weeping Prophet",
        "category": "prophet",
        "era": "Exile",
        "testament": "OT",
        "books": ["Jeremiah", "Lamentations"],
        "first_appearance": "Jeremiah 1:1",
        "appearance_count": 147,
        "significance": "Prophet of judgment and new covenant",
        "biography": "Called young, prophesied 40 years. Warned of destruction but largely rejected. Promised new covenant.",
        "major_events": ["Called as youth", "Temple sermon", "Thrown in cistern", "New covenant prophecy", "Fall of Jerusalem"],
        "character_traits": ["Faithful", "Suffering", "Compassionate", "Persistent"]
    },
    {
        "name": "Ezekiel",
        "title": "Prophet of Visions",
        "category": "prophet",
        "era": "Exile",
        "testament": "OT",
        "books": ["Ezekiel"],
        "first_appearance": "Ezekiel 1:3",
        "appearance_count": 1,
        "significance": "Priest-prophet in exile, visions of glory and restoration",
        "biography": "Priest taken to Babylon. Received dramatic visions. Performed symbolic acts. Prophesied restoration and new temple.",
        "major_events": ["Vision of four living creatures", "Eating scroll", "Symbolic acts", "Valley of dry bones", "New temple vision"],
        "character_traits": ["Visionary", "Obedient", "Dramatic"]
    },
    {
        "name": "Daniel",
        "title": "Prophet of Dreams",
        "category": "prophet",
        "era": "Exile",
        "testament": "OT",
        "books": ["Daniel"],
        "first_appearance": "Daniel 1:6",
        "appearance_count": 75,
        "significance": "Interpreter of dreams, survived lions' den, apocalyptic visions",
        "biography": "Taken to Babylon as youth. Rose to high position. Interpreted dreams. Remained faithful through persecution.",
        "major_events": ["Refusing king's food", "Nebuchadnezzar's dream", "Fiery furnace friends", "Writing on wall", "Lions' den", "Apocalyptic visions"],
        "character_traits": ["Wise", "Faithful", "Courageous", "Disciplined"]
    },
    {
        "name": "Esther",
        "title": "Queen of Persia",
        "category": "queen",
        "era": "Persian",
        "testament": "OT",
        "books": ["Esther"],
        "first_appearance": "Esther 2:7",
        "appearance_count": 55,
        "significance": "Jewish queen who saved her people from genocide",
        "biography": "Orphan raised by Mordecai. Became queen of Persia. Risked her life to save Jews from Haman's plot.",
        "major_events": ["Becoming queen", "Learning of plot", "Approaching king", "Exposing Haman", "Saving her people"],
        "character_traits": ["Beautiful", "Brave", "Wise", "Self-sacrificing"]
    },
    {
        "name": "Mordecai",
        "title": "Guardian of Esther",
        "category": "leader",
        "era": "Persian",
        "testament": "OT",
        "books": ["Esther"],
        "first_appearance": "Esther 2:5",
        "appearance_count": 58,
        "significance": "Raised Esther, refused to bow to Haman, saved Jews",
        "biography": "Raised orphaned cousin Esther. Refused to bow to Haman. Uncovered assassination plot. Rose to high position.",
        "major_events": ["Raising Esther", "Refusing to bow", "Uncovering plot", "Honored by king", "Becoming second to king"],
        "character_traits": ["Faithful", "Wise", "Courageous"]
    },

    # ============ NEW TESTAMENT ============
    {
        "name": "Jesus",
        "alternate_names": ["Christ", "Messiah", "Son of God", "Son of Man", "Yeshua"],
        "title": "Son of God",
        "category": "messiah",
        "era": "Ministry",
        "testament": "both",
        "birth_place": "Bethlehem",
        "death_place": "Jerusalem",
        "books": ["Matthew", "Mark", "Luke", "John", "Acts", "Revelation"],
        "first_appearance": "Matthew 1:1",
        "appearance_count": 1281,
        "significance": "The Christ, Savior of the world, Son of God",
        "biography": "Born of virgin Mary. Baptized, tempted, called disciples. Taught, healed, performed miracles. Crucified, resurrected, ascended.",
        "major_events": ["Birth", "Baptism", "Temptation", "Calling disciples", "Sermon on Mount", "Transfiguration", "Last Supper", "Crucifixion", "Resurrection", "Ascension"],
        "character_traits": ["Perfect", "Loving", "Compassionate", "Authoritative", "Humble"]
    },
    {
        "name": "Mary",
        "alternate_names": ["Miriam", "Virgin Mary"],
        "title": "Mother of Jesus",
        "category": "family",
        "era": "Ministry",
        "testament": "NT",
        "birth_place": "Nazareth",
        "books": ["Matthew", "Luke", "John", "Acts"],
        "first_appearance": "Matthew 1:16",
        "appearance_count": 19,
        "significance": "Virgin mother of Jesus",
        "biography": "Young virgin betrothed to Joseph. Visited by Gabriel, conceived by Holy Spirit. Witnessed Jesus' ministry, crucifixion, and was with disciples at Pentecost.",
        "major_events": ["Annunciation", "Visit to Elizabeth", "Birth of Jesus", "Presentation at Temple", "Wedding at Cana", "At the cross", "At Pentecost"],
        "character_traits": ["Faithful", "Humble", "Devoted", "Pondering"]
    },
    {
        "name": "Joseph of Nazareth",
        "title": "Earthly Father of Jesus",
        "category": "family",
        "era": "Ministry",
        "testament": "NT",
        "birth_place": "Bethlehem",
        "occupation": ["Carpenter"],
        "books": ["Matthew", "Luke"],
        "first_appearance": "Matthew 1:16",
        "appearance_count": 14,
        "significance": "Husband of Mary, legal father of Jesus, descendant of David",
        "biography": "Righteous man, planned to divorce Mary quietly. Warned in dreams to protect Jesus. Raised Jesus as carpenter.",
        "major_events": ["Dream about Mary", "Journey to Bethlehem", "Flight to Egypt", "Return to Nazareth", "Finding Jesus in Temple"],
        "character_traits": ["Righteous", "Obedient", "Protective"]
    },
    {
        "name": "John the Baptist",
        "alternate_names": ["The Baptizer", "Forerunner"],
        "title": "Forerunner of Christ",
        "category": "prophet",
        "era": "Ministry",
        "testament": "NT",
        "books": ["Matthew", "Mark", "Luke", "John"],
        "first_appearance": "Matthew 3:1",
        "appearance_count": 35,
        "significance": "Prepared the way for Jesus, baptized Jesus",
        "biography": "Son of Zechariah and Elizabeth. Preached repentance in wilderness. Baptized Jesus. Beheaded by Herod.",
        "major_events": ["Birth announcement", "Preaching in wilderness", "Baptizing Jesus", "Imprisonment", "Beheading"],
        "character_traits": ["Bold", "Humble", "Prophetic", "Ascetic"]
    },
    {
        "name": "Peter",
        "alternate_names": ["Simon", "Cephas", "Simon Peter"],
        "title": "The Rock",
        "category": "apostle",
        "era": "Early Church",
        "testament": "NT",
        "occupation": ["Fisherman"],
        "books": ["Matthew", "Mark", "Luke", "John", "Acts", "1 Peter", "2 Peter"],
        "first_appearance": "Matthew 4:18",
        "appearance_count": 195,
        "significance": "Leader of apostles, preached at Pentecost, opened door to Gentiles",
        "biography": "Fisherman called by Jesus. Often spoke first, sometimes wrongly. Denied Jesus but restored. Leader of early church.",
        "major_events": ["Called by Jesus", "Walking on water", "Confession at Caesarea Philippi", "Denying Jesus", "Restoration", "Pentecost sermon", "Vision of sheet", "Jerusalem council"],
        "character_traits": ["Impulsive", "Passionate", "Bold", "Restored"]
    },
    {
        "name": "Paul",
        "alternate_names": ["Saul", "Saul of Tarsus"],
        "title": "Apostle to the Gentiles",
        "category": "apostle",
        "era": "Early Church",
        "testament": "NT",
        "birth_place": "Tarsus",
        "tribe_or_nation": "Benjamin",
        "occupation": ["Tentmaker", "Pharisee"],
        "books": ["Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"],
        "first_appearance": "Acts 7:58",
        "appearance_count": 185,
        "significance": "Apostle to Gentiles, wrote most NT letters, established churches",
        "biography": "Pharisee who persecuted church. Converted on Damascus road. Became greatest missionary, wrote most of NT.",
        "major_events": ["Persecuting church", "Damascus road conversion", "Missionary journeys", "Shipwreck", "Imprisonments", "Writing letters"],
        "character_traits": ["Zealous", "Intellectual", "Tireless", "Suffering"]
    },
    {
        "name": "John",
        "alternate_names": ["Son of Thunder", "Beloved Disciple"],
        "title": "Beloved Disciple",
        "category": "apostle",
        "era": "Early Church",
        "testament": "NT",
        "occupation": ["Fisherman"],
        "books": ["Matthew", "Mark", "Luke", "John", "1 John", "2 John", "3 John", "Revelation"],
        "first_appearance": "Matthew 4:21",
        "appearance_count": 38,
        "significance": "Closest to Jesus, wrote Gospel, letters, and Revelation",
        "biography": "Fisherman, brother of James. One of inner circle. Only apostle at cross. Cared for Mary. Wrote Gospel and Revelation.",
        "major_events": ["Called with James", "Inner circle events", "At the cross", "Running to tomb", "Caring for Mary", "Exile on Patmos"],
        "character_traits": ["Loving", "Faithful", "Visionary"]
    },
    {
        "name": "James",
        "alternate_names": ["James the Greater", "Son of Thunder"],
        "title": "Son of Thunder",
        "category": "apostle",
        "era": "Early Church",
        "testament": "NT",
        "occupation": ["Fisherman"],
        "books": ["Matthew", "Mark", "Luke", "Acts"],
        "first_appearance": "Matthew 4:21",
        "appearance_count": 21,
        "significance": "One of inner circle, first apostle martyred",
        "biography": "Fisherman, brother of John. Part of inner circle with Peter and John. First apostle martyred by Herod.",
        "major_events": ["Called by Jesus", "Transfiguration", "Gethsemane", "Martyrdom"],
        "character_traits": ["Zealous", "Faithful"]
    },
    {
        "name": "Mary Magdalene",
        "title": "First Witness of Resurrection",
        "category": "disciple",
        "era": "Ministry",
        "testament": "NT",
        "books": ["Matthew", "Mark", "Luke", "John"],
        "first_appearance": "Matthew 27:56",
        "appearance_count": 12,
        "significance": "Delivered from demons, first to see risen Christ",
        "biography": "Delivered from seven demons. Supported Jesus' ministry. At crucifixion. First to see risen Jesus.",
        "major_events": ["Deliverance from demons", "Supporting ministry", "At crucifixion", "At tomb", "Seeing risen Jesus"],
        "character_traits": ["Devoted", "Faithful", "Grateful"]
    },
    {
        "name": "Timothy",
        "title": "Young Pastor",
        "category": "companion",
        "era": "Early Church",
        "testament": "NT",
        "books": ["Acts", "1 Timothy", "2 Timothy"],
        "first_appearance": "Acts 16:1",
        "appearance_count": 24,
        "significance": "Paul's protege, pastor of Ephesus",
        "biography": "Son of Jewish mother and Greek father. Joined Paul's ministry. Received two letters with pastoral instruction.",
        "major_events": ["Joining Paul", "Circumcision", "Leading Ephesus", "Receiving Paul's letters"],
        "character_traits": ["Faithful", "Timid", "Devoted"]
    },
    {
        "name": "Barnabas",
        "alternate_names": ["Joseph"],
        "title": "Son of Encouragement",
        "category": "companion",
        "era": "Early Church",
        "testament": "NT",
        "books": ["Acts"],
        "first_appearance": "Acts 4:36",
        "appearance_count": 28,
        "significance": "Encourager, introduced Paul, missionary partner",
        "biography": "Levite from Cyprus. Sold field to help church. Introduced Paul. Missionary partner until disagreement over Mark.",
        "major_events": ["Selling field", "Introducing Paul", "Sent to Antioch", "First missionary journey", "Jerusalem council", "Parting with Paul"],
        "character_traits": ["Encouraging", "Generous", "Forgiving"]
    },
    {
        "name": "Luke",
        "title": "The Physician",
        "category": "companion",
        "era": "Early Church",
        "testament": "NT",
        "occupation": ["Physician"],
        "books": ["Luke", "Acts"],
        "first_appearance": "Colossians 4:14",
        "appearance_count": 3,
        "significance": "Gentile physician, wrote Gospel and Acts",
        "biography": "Only Gentile NT author. Paul's companion. Careful historian who researched and wrote Gospel and Acts.",
        "major_events": ["Joining Paul", "Writing Gospel", "Writing Acts", "Staying with Paul in prison"],
        "character_traits": ["Careful", "Loyal", "Educated"]
    }
]

# ============================================
# RELATIONSHIP DATA
# ============================================

RELATIONSHIPS = [
    # ============ CREATION/PATRIARCHAL FAMILY ============
    # Adam & Eve
    ("Adam", "Eve", "spouse", None, "spouse", "First married couple, created by God", 10, "positive"),
    ("Adam", "Cain", "parent", "father", "child", "First son", 8, "complex"),
    ("Adam", "Abel", "parent", "father", "child", "Second son, murdered by Cain", 8, "positive"),
    ("Adam", "Seth", "parent", "father", "child", "Son in Adam's likeness", 8, "positive"),
    ("Eve", "Cain", "parent", "mother", "child", None, 8, "complex"),
    ("Eve", "Abel", "parent", "mother", "child", None, 8, "positive"),
    ("Eve", "Seth", "parent", "mother", "child", None, 8, "positive"),

    # Abraham's family
    ("Abraham", "Sarah", "spouse", None, "spouse", "Married, journeyed together from Ur", 10, "positive"),
    ("Abraham", "Isaac", "parent", "father", "child", "Son of promise through Sarah", 10, "positive"),
    ("Abraham", "Ishmael", "parent", "father", "child", "Son through Hagar", 8, "complex"),
    ("Sarah", "Isaac", "parent", "mother", "child", "Born miraculously in old age", 10, "positive"),
    ("Abraham", "Lot", "family", "uncle", "nephew", "Traveled together from Ur", 7, "positive"),

    # Isaac's family
    ("Isaac", "Rebekah", "spouse", None, "spouse", "Married through divine guidance", 9, "positive"),
    ("Isaac", "Jacob", "parent", "father", "child", "Second twin, received blessing", 9, "complex"),
    ("Isaac", "Esau", "parent", "father", "child", "First twin, lost birthright", 8, "complex"),
    ("Rebekah", "Jacob", "parent", "mother", "child", "Favored son, helped deceive Isaac", 9, "positive"),
    ("Rebekah", "Esau", "parent", "mother", "child", None, 6, "neutral"),
    ("Jacob", "Esau", "sibling", "twin", "twin", "Rivalry over birthright and blessing", 8, "complex"),

    # Jacob's family
    ("Jacob", "Rachel", "spouse", None, "spouse", "Beloved wife, worked 14 years for her", 10, "positive"),
    ("Jacob", "Leah", "spouse", None, "spouse", "First wife through deception", 7, "complex"),
    ("Jacob", "Joseph", "parent", "father", "child", "Favored son, coat of many colors", 10, "positive"),
    ("Jacob", "Benjamin", "parent", "father", "child", "Youngest, favored after Joseph", 9, "positive"),
    ("Jacob", "Judah", "parent", "father", "child", "Fourth son, messianic line", 8, "positive"),
    ("Rachel", "Joseph", "parent", "mother", "child", "First son, answer to prayers", 10, "positive"),
    ("Rachel", "Benjamin", "parent", "mother", "child", "Died giving birth", 9, "positive"),
    ("Leah", "Judah", "parent", "mother", "child", None, 8, "positive"),
    ("Joseph", "Benjamin", "sibling", "brother", "brother", "Full brothers through Rachel", 9, "positive"),
    ("Joseph", "Judah", "sibling", "half-brother", "half-brother", "Initially hostile, later reconciled", 8, "complex"),

    # ============ EXODUS FAMILY ============
    ("Moses", "Aaron", "sibling", "brother", "brother", "Aaron was Moses' spokesman", 9, "positive"),
    ("Moses", "Miriam", "sibling", "brother", "sister", "Miriam watched baby Moses", 8, "positive"),
    ("Aaron", "Miriam", "sibling", "brother", "sister", None, 8, "positive"),
    ("Moses", "Joshua", "mentor", None, "student", "Moses trained Joshua as successor", 9, "positive"),

    # ============ UNITED MONARCHY ============
    ("David", "Jonathan", "friend", None, "friend", "Covenant friendship, Jonathan protected David", 10, "positive"),
    ("David", "Saul", "served", None, "master", "David served then fled from Saul", 8, "complex"),
    ("Saul", "Jonathan", "parent", "father", "child", "Father-son, Jonathan loyal to David", 7, "complex"),
    ("David", "Bathsheba", "spouse", None, "spouse", "Married after David's sin", 8, "complex"),
    ("David", "Solomon", "parent", "father", "child", "Solomon succeeded David as king", 9, "positive"),
    ("Bathsheba", "Solomon", "parent", "mother", "child", "Advocated for Solomon's succession", 9, "positive"),
    ("Samuel", "Saul", "mentor", "anointed", "anointed-by", "Samuel anointed Saul as first king", 7, "complex"),
    ("Samuel", "David", "mentor", "anointed", "anointed-by", "Samuel secretly anointed David", 9, "positive"),

    # ============ PROPHETS ============
    ("Elijah", "Elisha", "mentor", None, "student", "Elisha received double portion of spirit", 10, "positive"),

    # ============ EXILE ============
    ("Mordecai", "Esther", "family", "cousin/guardian", "ward", "Raised Esther as his own", 10, "positive"),

    # ============ NEW TESTAMENT FAMILY ============
    ("Mary", "Jesus", "parent", "mother", "child", "Virgin birth through Holy Spirit", 10, "positive"),
    ("Joseph of Nazareth", "Jesus", "parent", "father", "child", "Legal/adoptive father", 9, "positive"),
    ("Mary", "Joseph of Nazareth", "spouse", None, "spouse", "Betrothed, then married", 9, "positive"),
    ("Mary", "Elizabeth", "family", "cousin", "cousin", "Elizabeth mother of John Baptist", 8, "positive"),
    ("John the Baptist", "Jesus", "family", "cousin", "cousin", "Baptized Jesus", 10, "positive"),

    # ============ DISCIPLES/APOSTLES ============
    ("Jesus", "Peter", "mentor", "master", "disciple", "Called Peter 'rock', leader of apostles", 10, "positive"),
    ("Jesus", "John", "mentor", "master", "disciple", "Beloved disciple, at cross", 10, "positive"),
    ("Jesus", "James", "mentor", "master", "disciple", "Inner circle, first martyred", 9, "positive"),
    ("Jesus", "Mary Magdalene", "mentor", "master", "disciple", "Delivered from demons, first resurrection witness", 9, "positive"),

    ("Peter", "John", "friend", "fellow apostle", "fellow apostle", "Often together, ran to tomb", 9, "positive"),
    ("Peter", "James", "friend", "fellow apostle", "fellow apostle", "Inner circle together", 8, "positive"),
    ("James", "John", "sibling", "brother", "brother", "Sons of Zebedee, 'Sons of Thunder'", 9, "positive"),

    # ============ PAUL'S RELATIONSHIPS ============
    ("Paul", "Barnabas", "friend", "partner", "partner", "First missionary journey together", 8, "complex"),
    ("Paul", "Timothy", "mentor", None, "student", "Paul's spiritual son and protege", 10, "positive"),
    ("Paul", "Luke", "friend", "companion", "companion", "Luke traveled with Paul, wrote Acts", 9, "positive"),
    ("Barnabas", "Paul", "mentor", "introduced", "introduced-by", "Barnabas vouched for Paul to apostles", 9, "positive"),

    # ============ ADVERSARIAL RELATIONSHIPS ============
    ("David", "Goliath", "enemy", None, "enemy", "David killed Goliath in battle", 10, "negative"),
    ("Elijah", "Ahab", "prophet-to", None, "king", "Elijah confronted Ahab's idolatry", 8, "negative"),
    ("Elijah", "Jezebel", "enemy", None, "enemy", "Jezebel sought to kill Elijah", 9, "negative"),
    ("Moses", "Pharaoh", "adversary", None, "adversary", "Moses demanded Israel's release", 10, "negative"),
    ("Daniel", "Nebuchadnezzar", "served", "advisor", "king", "Daniel interpreted dreams", 8, "complex"),
    ("Esther", "Haman", "enemy", None, "enemy", "Esther exposed Haman's plot", 10, "negative"),
]

def create_tables():
    """Run the schema file in Supabase"""
    print("Note: Please run supabase/characters_schema.sql in Supabase SQL Editor first")
    print("Then run this script to populate the data")

def populate_characters():
    """Insert all characters"""
    print("\n=== Populating Characters ===")

    for char in CHARACTERS:
        try:
            # Check if already exists
            existing = supabase.table('biblical_characters').select('id').eq('name', char['name']).execute()
            if existing.data:
                print(f"  Skipping {char['name']} (already exists)")
                continue

            # Create search text
            search_parts = [
                char['name'],
                char.get('title', ''),
                char.get('significance', ''),
                ' '.join(char.get('alternate_names', [])),
                ' '.join(char.get('books', [])),
                char.get('era', ''),
                char.get('category', '')
            ]
            char['search_text'] = ' '.join(filter(None, search_parts))

            result = supabase.table('biblical_characters').insert(char).execute()
            print(f"  Added: {char['name']}")
        except Exception as e:
            print(f"  Error adding {char['name']}: {e}")

def populate_relationships():
    """Insert all relationships"""
    print("\n=== Populating Relationships ===")

    # First, get all character IDs
    chars = supabase.table('biblical_characters').select('id, name').execute()
    char_map = {c['name']: c['id'] for c in chars.data}

    for rel in RELATIONSHIPS:
        char1, char2, rel_type, subtype, inverse, desc, strength, sentiment = rel

        # Get IDs
        char1_id = char_map.get(char1)
        char2_id = char_map.get(char2)

        if not char1_id:
            print(f"  Warning: Character '{char1}' not found")
            continue
        if not char2_id:
            print(f"  Warning: Character '{char2}' not found")
            continue

        try:
            # Check if exists
            existing = supabase.table('character_relationships')\
                .select('id')\
                .eq('character_id', char1_id)\
                .eq('related_character_id', char2_id)\
                .eq('relationship_type', rel_type)\
                .execute()

            if existing.data:
                print(f"  Skipping {char1} -> {char2} ({rel_type}) (exists)")
                continue

            data = {
                'character_id': char1_id,
                'related_character_id': char2_id,
                'relationship_type': rel_type,
                'relationship_subtype': subtype,
                'inverse_type': inverse,
                'description': desc,
                'strength': strength,
                'sentiment': sentiment
            }

            supabase.table('character_relationships').insert(data).execute()
            print(f"  Added: {char1} --[{rel_type}]--> {char2}")

        except Exception as e:
            print(f"  Error adding relationship {char1} -> {char2}: {e}")

def main():
    print("=" * 50)
    print("Biblical Characters & Relationships Population")
    print("=" * 50)

    # Check if tables exist by trying to query
    try:
        supabase.table('biblical_characters').select('id').limit(1).execute()
        print("Tables exist, proceeding with population...")
    except Exception as e:
        print(f"\nError: Tables not found. Please run characters_schema.sql first.")
        print(f"Error details: {e}")
        return

    populate_characters()
    populate_relationships()

    # Summary
    chars = supabase.table('biblical_characters').select('id', count='exact').execute()
    rels = supabase.table('character_relationships').select('id', count='exact').execute()

    print("\n" + "=" * 50)
    print("Population Complete!")
    print(f"  Characters: {chars.count}")
    print(f"  Relationships: {rels.count}")
    print("=" * 50)

if __name__ == '__main__':
    main()
