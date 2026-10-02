from googleapiclient.discovery import build

API_KEY = "AIzaSyBTNICu7sFKPbeNOFAXPatSKUjPmutp3K8"

youtube = build(
    'youtube',
    'v3',
    developerKey=API_KEY
)

request = youtube.search().list(
    q="fitness influencer",
    part="snippet",
    type="channel",
    maxResults=5
)

response = request.execute()

for item in response['items']:

    print(item['snippet']['title'])