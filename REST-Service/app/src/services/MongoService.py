import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson.objectid import ObjectId

load_dotenv()

class MongoService:

    def __init__(self):
        # MongoDB backend
        MONGO_URL=os.getenv('MONGO_URL')
        MONGO_USER=os.getenv('MONGO_USER')
        MONGO_PASS=os.getenv('MONGO_PASS')

        self.MONGO_DB=os.getenv('MONGO_DB')        
        
        ##f"mongodb://{MONGO_USER}:{MONGO_PASS}@{MONGO_URL}"

        client = MongoClient(
            
            f"mongodb://{MONGO_USER}:{MONGO_PASS}@{MONGO_URL}/{self.MONGO_DB}?authSource={self.MONGO_DB}",
            ssl=True,
            tlsCAFile="cert/mongo.crt"
        )
        self.client = client        
        print(f"mongo client:{client}yyyy")
    
    def get_db(self):
        db = self.client[self.MONGO_DB]
        return db

    def get_collection(self, collection_name):
        collection = self.get_db()[collection_name]
        return collection
    
    def get_request_history_collection(self):
        return self.get_collection('request_histories')
    
    def get_experiment_collection(self):
        return self.get_collection('experiments')
    
    def find_one(self, collection, id):
        one = collection.find_one({'_id': ObjectId(id)})
        return one

    

    

    