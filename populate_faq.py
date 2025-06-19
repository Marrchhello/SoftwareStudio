import os
from sqlalchemy import create_engine
from backend.InsertDeleteManager import DatabaseManager

# Use the same DB URL as in docker-compose.yml for Docker containers
# For local runs, change 'SS_Database' to 'localhost' if needed
DATABASE_URL = os.getenv(
      "DATABASE_URL",
      "postgresql+psycopg://postgres:password@localhost:5432/postgres"
  )
engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)
db = DatabaseManager(engine)

faqs = [
    # From frontend FAQPage.jsx
    {"question": "How to log in?", "answer": "You can use your student account to log in."},
    {"question": "Where to check my grades?", "answer": "You can check your grades in your profile."},
    {"question": "Where to find the classroom?", "answer": "You can click your class schedul to find the classrom and building."},
    # From deprecated/demo_db_insert.py
    {"question": "What did the tomato say to the other tomato during a race?", "answer": "Ketchup."},
    {"question": "What do you call a priest that becomes a lawyer?", "answer": "A father-in-law."},
    {"question": "What runs but never goes anywhere?", "answer": "A fridge."},
    {"question": "Why do seagulls fly over the sea?", "answer": "If they flew over the bay, they would be bagels."},
    {"question": "Why are snails slow?", "answer": "Because they're carrying a house on their back."},
    {"question": "How does the ocean say hi?", "answer": "It waves!"},
]

def main():
    for faq in faqs:
        try:
            db.add_faq(faq["question"], faq["answer"])
            print(f'Inserted: {faq["question"]}')
        except Exception as e:
            print(f'Warning: {e}')
    print("FAQ population complete.")

if __name__ == "__main__":
    main() 