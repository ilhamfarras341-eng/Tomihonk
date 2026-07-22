import random
from bson import ObjectId
from config import db


# ── Helper: generate unique staff ID ──
def _generate_staff_id(prefix: str, field: str) -> str:
    """Generate a unique ID like TKN-1234 or SLS-5678."""
    while True:
        number = random.randint(1000, 9999)
        candidate = f"{prefix}-{number}"
        if not User.collection.find_one({field: candidate}):
            return candidate


# ── Initial seed data ──
INITIAL_ACCOUNTS = [
    {"username": "admin",  "password": "admin123",  "name": "Administrator",   "role": "admin",   "staffId": None},
    {"username": "rudi",   "password": "rudi123",   "name": "Rudi Hartono",    "role": "teknisi", "staffId": "TKN-0042"},
    {"username": "joko",   "password": "joko123",   "name": "Joko Susanto",    "role": "teknisi", "staffId": "TKN-0043"},
    {"username": "anton",  "password": "anton123",  "name": "Anton Pratama",   "role": "teknisi", "staffId": "TKN-0044"},
    {"username": "dewi",   "password": "dewi123",   "name": "Dewi Anggraini",  "role": "sales",   "staffId": "SLS-0021"},
    {"username": "rina",   "password": "rina123",   "name": "Rina Sari",       "role": "sales",   "staffId": "SLS-0022"},
]


class User:
    collection = db.users

    @staticmethod
    def seed():
        """Seed initial accounts if collection is empty."""
        if User.collection.count_documents({}) == 0:
            User.collection.insert_many(INITIAL_ACCOUNTS)
            print("[SEED] Users created")

    @staticmethod
    def _serialize(u):
        return {
            "id": str(u["_id"]),
            "username": u.get("username", ""),
            "password": u.get("password", ""),
            "name": u.get("name", ""),
            "role": u.get("role", "teknisi"),
            # Support both old field name (teknisiId) and new (staffId)
            "staffId": u.get("staffId") or u.get("teknisiId") or None,
        }

    @staticmethod
    def get_all():
        return [User._serialize(u) for u in User.collection.find()]

    @staticmethod
    def find_by_credentials(username, password, role):
        u = User.collection.find_one({"username": username, "password": password, "role": role})
        return User._serialize(u) if u else None

    @staticmethod
    def create(data):
        # Cek username sudah ada
        if User.collection.find_one({"username": data.get("username")}):
            return None, "Username sudah digunakan"

        role = data.get("role", "teknisi")

        # Auto-generate staffId berdasarkan role
        if role == "teknisi":
            staff_id = _generate_staff_id("TKN", "staffId")
        elif role == "sales":
            staff_id = _generate_staff_id("SLS", "staffId")
        else:
            staff_id = None  # admin tidak punya staffId

        doc = {
            "username": data.get("username"),
            "password": data.get("password"),
            "name": data.get("name"),
            "role": role,
            "staffId": staff_id,
        }
        result = User.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc, None

    @staticmethod
    def update(id, data):
        try:
            role = data.get("role", "teknisi")

            # Jika role berubah menjadi teknisi/sales dan staffId tidak disediakan,
            # generate ID baru; jika admin, set None
            existing = User.collection.find_one({"_id": ObjectId(id)})
            old_role = existing.get("role") if existing else None
            old_staff_id = existing.get("staffId") or existing.get("teknisiId")

            if role == "teknisi":
                # Pertahankan ID lama jika masih teknisi, generate baru jika baru jadi teknisi
                if old_staff_id and old_staff_id.startswith("TKN"):
                    staff_id = old_staff_id
                else:
                    staff_id = _generate_staff_id("TKN", "staffId")
            elif role == "sales":
                if old_staff_id and old_staff_id.startswith("SLS"):
                    staff_id = old_staff_id
                else:
                    staff_id = _generate_staff_id("SLS", "staffId")
            else:
                staff_id = None

            update_data = {
                "username": data.get("username"),
                "password": data.get("password"),
                "name": data.get("name"),
                "role": role,
                "staffId": staff_id,
            }
            res = User.collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
            return res.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def delete(id):
        try:
            res = User.collection.delete_one({"_id": ObjectId(id)})
            return res.deleted_count > 0
        except Exception:
            return False
