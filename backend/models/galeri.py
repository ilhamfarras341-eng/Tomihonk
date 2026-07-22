from bson import ObjectId
from config import db

class Galeri:
    collection = db.galeri

    @staticmethod
    def get_all():
        data = []
        for g in Galeri.collection.find().sort("_id", -1):
            data.append({
                "id": str(g["_id"]),
                "title": g.get("title", ""),
                "img": g.get("img", ""),
            })
        return data

    @staticmethod
    def create(data):
        doc = {
            "title": data.get("title", ""),
            "img": data.get("img", ""),
        }
        result = Galeri.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    @staticmethod
    def update_title(id, title):
        try:
            res = Galeri.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"title": title}}
            )
            return res.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def delete(id):
        try:
            res = Galeri.collection.delete_one({"_id": ObjectId(id)})
            return res.deleted_count > 0
        except Exception:
            return False
