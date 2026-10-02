from pymongo import MongoClient

# Database connection
MONGO_DETAILS = "mongodb://localhost:27017"

client = MongoClient(MONGO_DETAILS)

# Create/Connect to the influencer_iq database
database = client.influencer_iq

# Collections
user_collection = database.get_collection("users")
influencer_collection = database.get_collection("influencers")