import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load Dataset

df = pd.read_csv("dataset.csv")

X = df[[
    'subscribers',
    'views',
    'videos'
]]

y = df['influencer']

# Train Model

model = RandomForestClassifier()

model.fit(X, y)

# Save Model

joblib.dump(model, "model.pkl")

print("Model trained successfully")