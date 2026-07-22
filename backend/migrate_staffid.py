"""
Script migrasi: tambahkan staffId ke user teknisi/sales yang belum punya.
Jalankan sekali saja: python migrate_staffid.py
"""
import random
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from config import db

def generate_unique_id(prefix, collection):
    while True:
        number = random.randint(1000, 9999)
        candidate = f"{prefix}-{number}"
        if not collection.find_one({"staffId": candidate}):
            return candidate

users = list(db.users.find())
print(f"Total users di database: {len(users)}")

updated = 0
for u in users:
    role = u.get("role")
    staff_id = u.get("staffId") or u.get("teknisiId")
    
    print(f"  User: {u.get('username')} | role={role} | staffId={staff_id}")
    
    if role == "teknisi" and not staff_id:
        new_id = generate_unique_id("TKN", db.users)
        db.users.update_one({"_id": u["_id"]}, {"$set": {"staffId": new_id}})
        print(f"    -> Diberi staffId: {new_id}")
        updated += 1
    elif role == "sales" and not staff_id:
        new_id = generate_unique_id("SLS", db.users)
        db.users.update_one({"_id": u["_id"]}, {"$set": {"staffId": new_id}})
        print(f"    -> Diberi staffId: {new_id}")
        updated += 1
    elif staff_id and not u.get("staffId"):
        # Punya teknisiId lama, copy ke staffId
        db.users.update_one({"_id": u["_id"]}, {"$set": {"staffId": staff_id}})
        print(f"    -> Migrasi teknisiId ke staffId: {staff_id}")
        updated += 1

print(f"\nSelesai! {updated} user diperbarui.")
