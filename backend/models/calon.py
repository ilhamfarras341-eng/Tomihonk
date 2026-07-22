from bson import ObjectId
from config import db
from datetime import datetime


class Calon:
    collection = db.calon

    @staticmethod
    def get_all():
        data = []
        for c in Calon.collection.find().sort("tgl", -1):
            data.append({
                "id": str(c["_id"]),
                "nik": c.get("nik", ""),
                "nama": c.get("nama", ""),
                "hp": c.get("hp", ""),
                "email": c.get("email", ""),
                "alamat": c.get("alamat", ""),
                "paket": c.get("paket", ""),
                "sumber": c.get("sumber", ""),
                "ktp": c.get("ktp", ""),
                "rumah": c.get("rumah", ""),
                "tgl": c.get("tgl", ""),
                "status": c.get("status", "baru"),
            })
        return data

    @staticmethod
    def create(data):
        doc = {
            "nik": data.get("nik", ""),
            "nama": data.get("nama"),
            "hp": data.get("hp", ""),
            "email": data.get("email", ""),
            "alamat": data.get("alamat", ""),
            "paket": data.get("paket", ""),
            "sumber": data.get("sumber", ""),
            "ktp": data.get("ktp", ""),
            "rumah": data.get("rumah", ""),
            "tgl": datetime.now().strftime("%Y-%m-%d"),
            "status": "baru",
        }
        result = Calon.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    @staticmethod
    def update_status(id, new_status):
        try:
            res = Calon.collection.update_one(
                {"_id": ObjectId(id)},
                {"$set": {"status": new_status}}
            )
            return res.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def delete(id):
        try:
            res = Calon.collection.delete_one({"_id": ObjectId(id)})
            return res.deleted_count > 0
        except Exception:
            return False
