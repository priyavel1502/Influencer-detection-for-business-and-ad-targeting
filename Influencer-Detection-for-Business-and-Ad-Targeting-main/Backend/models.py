from pydantic import BaseModel, EmailStr
from typing import Optional

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CampaignSetup(BaseModel):
    category: str
    budget: float
    target_audience_size: int
    platform: str