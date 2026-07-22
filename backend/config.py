import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI","mongodb+srv://test:test123@cluster1.bv983sn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1")
DB_NAME = os.getenv("DB_NAME", "tomihonk")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")

import certifi

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client[DB_NAME]
