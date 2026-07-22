from bson import ObjectId
from config import db

class Paket:
    collection = db.paket

    @staticmethod
    def get_all():
        data = []
        for p in Paket.collection.find():
            data.append({
                "id": str(p["_id"]),
                "nama": p.get("nama", ""),
                "speed": p.get("speed", 0),
                "harga": p.get("harga", 0),
                "kat": p.get("kat", ""),
                "desc": p.get("desc", "")
            })
        return data

    @staticmethod
    def create(data):
        doc = {
            "nama": data.get("nama"),
            "speed": data.get("speed"),
            "harga": data.get("harga"),
            "kat": data.get("kat"),
            "desc": data.get("desc", "")
        }
        result = Paket.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    @staticmethod
    def update(id, data):
        try:
            update_data = {k: v for k, v in data.items() if k in ["nama", "speed", "harga", "kat", "desc"]}
            if not update_data:
                return False
            
            res = Paket.collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
            return res.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def delete(id):
        try:
            res = Paket.collection.delete_one({"_id": ObjectId(id)})
            return res.deleted_count > 0
        except Exception:
            return False
