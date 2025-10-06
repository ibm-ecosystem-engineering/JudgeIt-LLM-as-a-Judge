
from typing import Any, Dict
from app.src.models.RequestHistory import RequestHistory
from app.src.models.Experiment import Experiment
from app.src.services.MongoService import MongoService
from bson.json_util import dumps, loads
from bson.objectid import ObjectId

class ManagementService:

    def __init__(self, mongo_db: MongoService) -> None:
        self.experiment_collection = mongo_db.get_experiment_collection()
        self.history_collection = mongo_db.get_request_history_collection()

    def get_experiments(self, user_id):
        cursor = self.experiment_collection.find({ "user_id": user_id })
        experiments = [self.bson_to_dict(doc) for doc in cursor]
        return experiments
    
    def get_experiments_by_type(self, user_id: str, type: str):
        cursor = self.experiment_collection.find({ "user_id": user_id, "type": type })
        experiments = [self.bson_to_dict(doc) for doc in cursor]
        return experiments
    
    def get_experiment_by_name(self, user_id: str, name: str):
        cursor = self.experiment_collection.find_one({ "user_id": user_id, "name": name })
        if cursor is not None:
            return self.bson_to_dict(cursor)
        return None
    
    def get_experiment_by_name_and_type(self, user_id: str, name: str, type: str):
        cursor = self.experiment_collection.find_one({ "user_id": user_id, "name": name, "type": type })
        if cursor is not None:
          return self.bson_to_dict(cursor)
        return None
    
    def get_history_by_id(self, user_id: str, doc_id: str):
        object_id = ObjectId(doc_id)
        cursor = self.history_collection.find_one({"user_id": user_id, "_id": object_id})
        return self.bson_to_dict(cursor)

    def get_histories(self, user_id):
        cursor = self.history_collection.find({ "user_id": user_id })
        histories = [self.bson_to_dict(doc) for doc in cursor]
        return histories
    
    def get_histories_by_type(self, user_id: str, type: str):
        projection = {'content': 0}
        cursor = self.history_collection.find({ "user_id": user_id, "type": type }, projection )
        histories = [self.bson_to_dict(doc) for doc in cursor]
        return histories
    
    def get_histories_by_experiment_name(self, user_id, experiment_name):
        cursor = self.history_collection.find({ "user_id": user_id, "experiment_name": experiment_name })
        histories = [self.bson_to_dict(doc) for doc in cursor]
        return histories
    
    def get_histories_by_experiment_name_type(self, user_id: str, experiment_name: str, type: str):
        query: dict = { "user_id": user_id, "experiment_name": experiment_name, "type": type }
        cursor = self.history_collection.find(query)
        print("calling here", query)
        histories = [self.bson_to_dict(doc) for doc in cursor]
        return histories
    
    def add_experiment(self, experiment: Experiment):
        input = experiment.model_dump()
        insertion = self.experiment_collection.insert_one(input)
        return str(insertion.inserted_id)
    
    def add_history(self, request_history: RequestHistory) -> str:
        input = request_history.model_dump()
        insertion = self.history_collection.insert_one(input)
        return str(insertion.inserted_id)
    
    def delete_experiment(self, doc_id: str, user_id):
        object_id = ObjectId(doc_id)
        result = self.experiment_collection.delete_one({"_id": object_id, "user_id": user_id})
        return result.deleted_count
    
    def delete_experiment_by_name(self, experiment_name, user_id):
        ## Delete all document under experiment name in request history collection
        self.history_collection.delete_many({"experiment_name": experiment_name, "user_id": user_id})
        ## Delete from experiment collections
        result = self.experiment_collection.delete_one({"name": experiment_name, "user_id": user_id})
        return result.deleted_count
    
    def delete_history(self, doc_id: str, user_id:str):
        object_id = ObjectId(doc_id)
        result = self.history_collection.delete_one({"_id": object_id, "user_id": user_id})
        return result.deleted_count

    # Function to convert BSON document to a dictionary
    def bson_to_dict(self, bson_doc) -> Dict[str, Any]:
        # Convert ObjectId to string and return as dictionary
        doc = bson_doc.copy()  # Create a copy to avoid modifying the original
        doc['_id'] = str(doc['_id'])  # Convert ObjectId to string
        return doc