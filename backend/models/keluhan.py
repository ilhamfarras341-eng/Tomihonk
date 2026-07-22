from bson import ObjectId
from config import db
from datetime import datetime


class Keluhan:
    collection = db.keluhan

    @staticmethod
    def get_all():
        data = []
        for k in Keluhan.collection.find().sort("tgl", -1):
            data.append({
                "id": str(k["_id"]),
                "tgl": k.get("tgl", ""),
                "nama": k.get("nama", ""),
                "email": k.get("email", ""),
                "hp": k.get("hp", ""),
                "pesan": k.get("pesan", ""),
                "status": k.get("status", "baru"),
            })
        return data

    @staticmethod
    def create(data):
        doc = {
            "tgl": datetime.now().strftime("%Y-%m-%d"),
            "nama": data.get("nama"),
            "email": data.get("email", ""),
            "hp": data.get("hp", ""),
            "pesan": data.get("pesan"),
            "status": "baru",
        }
        result = Keluhan.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    @staticmethod
    def cycle_status(id):
        order = ["baru", "ditangani", "selesai"]
        try:
            k = Keluhan.collection.find_one({"_id": ObjectId(id)})
            if not k:
                return None
            current = k.get("status", "baru")
            next_status = order[(order.index(current) + 1) % len(order)]
            Keluhan.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"status": next_status}}
            )
            return next_status
        except Exception:
            return None

    @staticmethod
    def delete(id):
        try:
            res = Keluhan.collection.delete_one({"_id": ObjectId(id)})
            return res.deleted_count > 0
        except Exception:
            return False
