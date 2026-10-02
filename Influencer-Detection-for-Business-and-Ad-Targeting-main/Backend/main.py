from googleapiclient.discovery import build
import joblib
from fastapi import FastAPI, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
import random
import bcrypt

from database import user_collection
from models import UserSignup, UserLogin

# =========================
# FASTAPI APP
# =========================

app = FastAPI(title="InfluencerIQ API")

# =========================
# YOUTUBE API CONFIG
# =========================

API_KEY = "AIzaSyBTNICu7sFKPbeNOFAXPatSKUjPmutp3K8"

youtube = build(
    "youtube",
    "v3",
    developerKey=API_KEY
)

# =========================
# LOAD ML MODEL
# =========================

model = joblib.load("model.pkl")

# =========================
# HOME
# =========================

@app.get("/")
async def home():

    return {
        "message":
            "InfluencerIQ API Running"
    }

# =========================
# HEALTH
# =========================

@app.get("/health")
async def health():

    return {
        "status": "healthy"
    }

# =========================
# FAVICON
# =========================

@app.get(
    "/favicon.ico",
    include_in_schema=False
)

async def favicon():

    return Response(
        status_code=204
    )

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =========================
# PASSWORD HASH
# =========================

def get_password_hash(password):

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    )

    return hashed.decode("utf-8")

# =========================
# PASSWORD VERIFY
# =========================

def verify_password(
    plain_password,
    hashed_password
):

    try:

        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )

    except Exception:

        return False

# =========================
# SIGNUP
# =========================

@app.post(
    "/signup",
    status_code=status.HTTP_201_CREATED
)

async def signup(user: UserSignup):

    existing_user = user_collection.find_one({

        "email": user.email
    })

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(
        user.password
    )

    new_user = {

        "name": user.name,

        "email": user.email,

        "password": hashed_password
    }

    user_collection.insert_one(new_user)

    return {

        "message":
            "User created successfully"
    }

# =========================
# LOGIN
# =========================

@app.post("/login")

async def login(user: UserLogin):

    db_user = user_collection.find_one({

        "email": user.email
    })

    if not db_user:

        raise HTTPException(
            status_code=400,
            detail="User not found"
        )

    valid_password = verify_password(

        user.password,

        db_user["password"]
    )

    if not valid_password:

        raise HTTPException(
            status_code=400,
            detail="Invalid password"
        )

    return {

        "message":
            "Login successful",

        "name":
            db_user["name"],

        "email":
            db_user["email"]
    }

# =========================
# CATEGORY FILTERS
# =========================

category_filters = {

    "Beauty": [
        "beauty",
        "makeup",
        "skincare",
        "fashion",
        "cosmetic"
    ],

    "Food": [
        "food",
        "cooking",
        "recipe",
        "kitchen",
        "street food"
    ],

    "Tech": [
        "tech",
        "gadgets",
        "review",
        "mobile",
        "technology"
    ],

    "Travel": [
        "travel",
        "trip",
        "tour",
        "vlog"
    ],

    "Gaming": [
        "gaming",
        "games",
        "stream"
    ],

    "Fitness": [
        "fitness",
        "gym",
        "workout",
        "health"
    ],

    "Fashion": [
        "fashion",
        "style",
        "clothing"
    ]
}

# =========================
# REAL-TIME TOP INFLUENCERS
# =========================

@app.get("/top-influencers")

async def get_top_influencers(

    category: str = "All",

    budget: int = 0
):

    tamil_keywords = {

        "Travel":
            "Tamil travel vlogger",

        "Food":
            "Tamil food reviewer",

        "Beauty":
            "Tamil beauty influencer",

        "Tech":
            "Tamil tech reviewer",

        "Gaming":
            "Tamil gaming channel",

        "Fitness":
            "Tamil fitness influencer",

        "Fashion":
            "Tamil fashion influencer"
    }

    if category in tamil_keywords:

        keyword = tamil_keywords[category]

    elif category == "All":

        keyword = "Top Tamil influencers"

    else:

        keyword = f"{category} influencer"

    # =========================
    # SEARCH YOUTUBE
    # =========================

    request = youtube.search().list(

        q=keyword,

        part="snippet",

        type="channel",

        maxResults=25
    )

    response = request.execute()

    influencers = []

    added_channels = set()

    for item in response["items"]:

        channel_id = item["snippet"]["channelId"]

        channel_name = item["snippet"]["title"]

        channel_desc = item["snippet"].get(
            "description",
            ""
        ).lower()

        lower_name = channel_name.lower()

        # =========================
        # FILTER CATEGORY MATCH
        # =========================

        if category in category_filters:

            keywords = category_filters[category]

            matched = any(

                word in lower_name

                or

                word in channel_desc

                for word in keywords
            )

            if not matched:
                continue

        # =========================
        # REMOVE DUPLICATES
        # =========================

        if channel_name in added_channels:
            continue

        added_channels.add(channel_name)

        # =========================
        # GET STATS
        # =========================

        stats_request = youtube.channels().list(

            part="statistics",

            id=channel_id
        )

        stats_response = stats_request.execute()

        if not stats_response["items"]:
            continue

        stats = stats_response["items"][0]["statistics"]

        subscribers = int(
            stats.get("subscriberCount", 0)
        )

        views = int(
            stats.get("viewCount", 0)
        )

        videos = int(
            stats.get("videoCount", 0)
        )

        # =========================
        # SKIP SMALL CHANNELS
        # =========================

        if subscribers < 1000:
            continue

        # =========================
        # ENGAGEMENT
        # =========================

        engagement = (

            (
                subscribers + views
            )

            /

            max(videos, 1)

        ) / 1000

        engagement = min(
            engagement,
            25
        )

        # =========================
        # ML PREDICTION
        # =========================

        prediction = model.predict([[

            subscribers,
            views,
            videos

        ]])

        status = (

            "Influencer"

            if prediction[0] == 1

            else "Growing Creator"
        )

        # =========================
        # COST ESTIMATION
        # =========================

        estimated_cost = (
            subscribers * 0.02
        )

        actual_cost = (

            estimated_cost

            *

            random.uniform(0.9, 1.2)
        )

        influencers.append({

            "name":
                channel_name,

            "username":
                f"@{channel_name.replace(' ','')}",

            "platform":
                "YouTube",

            "category":
                category,

            "followers":
                subscribers,

            "likes":
                int(engagement * 100),

            "comments":
                int(engagement * 50),

            "engagement":
                round(engagement, 2),

            "predicted_cost":
                round(estimated_cost, 2),

            "actual_cost":
                round(actual_cost, 2),

            "status":
                status
        })

    # =========================
    # SORT BY FOLLOWERS
    # =========================

    influencers.sort(

        key=lambda x: x["followers"],

        reverse=True
    )

    # =========================
    # BUDGET FILTER
    # =========================

    if budget > 0:

        filtered = [

            inf for inf in influencers

            if inf["actual_cost"] <= budget
        ]

    else:

        filtered = influencers

    # =========================
    # TOP + REMAINING
    # =========================

    selected = filtered[:5]

    remaining = filtered[5:]

    total_cost = sum(

        inf["actual_cost"]

        for inf in selected
    )

    return {

        "selected_influencers":
            selected,

        "remaining_influencers":
            remaining,

        "total_cost":
            round(total_cost, 2),

        "budget":
            budget,

        "affordable_count":
            len(filtered)
    }

# =========================
# YOUTUBE LIVE
# =========================

@app.get("/youtube-live")

async def youtube_live(

    keyword: str = "Tamil influencer"
):

    request = youtube.search().list(

        q=keyword,

        part="snippet",

        type="channel",

        maxResults=5
    )

    response = request.execute()

    results = []

    for item in response["items"]:

        channel_id = item["snippet"]["channelId"]

        channel_name = item["snippet"]["title"]

        stats_request = youtube.channels().list(

            part="statistics",

            id=channel_id
        )

        stats_response = stats_request.execute()

        stats = stats_response["items"][0]["statistics"]

        subscribers = int(
            stats.get("subscriberCount", 0)
        )

        views = int(
            stats.get("viewCount", 0)
        )

        videos = int(
            stats.get("videoCount", 0)
        )

        engagement_score = (

            subscribers + views

        ) / max(videos, 1)

        prediction = model.predict([[

            subscribers,
            views,
            videos

        ]])

        influencer_status = (

            "Influencer"

            if prediction[0] == 1

            else "Normal Creator"
        )

        results.append({

            "channel":
                channel_name,

            "subscribers":
                subscribers,

            "views":
                views,

            "videos":
                videos,

            "engagement_score":
                round(engagement_score, 2),

            "status":
                influencer_status
        })

    return {
        "results": results
    }