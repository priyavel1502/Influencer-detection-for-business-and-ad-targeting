import random
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")

db = client.influencer_iq
collection = db.influencers

# Clear old data
collection.delete_many({})

categories = [
    "Fashion",
    "Tech",
    "Fitness",
    "Food",
    "Travel",
    "Gaming",
    "Beauty",
    "Finance",
    "Education",
    "Comedy"
]

platforms = [
    "Instagram",
    "YouTube",
    "TikTok"
]

first_names = [
    "Rahul", "Priya", "Amit", "Neha",
    "Rohit", "Sneha", "Karan", "Pooja"
]

last_names = [
    "Sharma", "Verma", "Singh",
    "Patel", "Kumar", "Gupta"
]

dataset = []

for i in range(200):

    first = random.choice(first_names)
    last = random.choice(last_names)

    name = f"{first} {last}"

    username = (
        f"@{first.lower()}_"
        f"{last.lower()}{random.randint(10,9999)}"
    )

    platform = random.choice(platforms)
    category = random.choice(categories)

    rand_val = random.random()

    if rand_val < 0.4:
        followers = random.randint(5000, 50000)

    elif rand_val < 0.8:
        followers = random.randint(50000, 500000)

    elif rand_val < 0.95:
        followers = random.randint(500000, 2000000)

    else:
        followers = random.randint(2000000, 10000000)

    like_percent = random.uniform(0.03, 0.12)
    likes = int(followers * like_percent)

    comment_percent = random.uniform(0.05, 0.15)
    comments = int(likes * comment_percent)

    dataset.append({
        "name": name,
        "username": username,
        "platform": platform,
        "category": category,
        "followers": followers,
        "likes": likes,
        "comments": comments,
        "country": "India"
    })

collection.insert_many(dataset)

print(
    f"Successfully inserted "
    f"{len(dataset)} influencers."
)