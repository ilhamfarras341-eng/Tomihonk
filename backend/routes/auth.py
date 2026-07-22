from flask import Blueprint, request, jsonify
from models.user import User

auth_bp = Blueprint("auth", __name__)


# ── GET semua akun ──
@auth_bp.route("/users", methods=["GET"])
def get_all():
    return jsonify(User.get_all()), 200


# ── POST login ──
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")
    role = data.get("role", "")
    user = User.find_by_credentials(username, password, role)
    if not user:
        return jsonify({"error": "Username, password, atau role salah"}), 401
    return jsonify({"message": "Login berhasil", "user": user}), 200


# ── POST buat akun baru ──
@auth_bp.route("/users", methods=["POST"])
def create():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("password") or not data.get("name"):
        return jsonify({"error": "Username, password, dan nama wajib diisi"}), 400
    doc, err = User.create(data)
    if err:
        return jsonify({"error": err}), 409
    return jsonify({"message": "Akun berhasil dibuat", "user": doc}), 201


# ── PUT edit akun ──
@auth_bp.route("/users/<id>", methods=["PUT"])
def update(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Data tidak valid"}), 400
    ok = User.update(id, data)
    if not ok:
        return jsonify({"error": "Akun tidak ditemukan atau tidak ada perubahan"}), 404
    return jsonify({"message": "Akun berhasil diperbarui"}), 200


# ── DELETE hapus akun ──
@auth_bp.route("/users/<id>", methods=["DELETE"])
def delete(id):
    ok = User.delete(id)
    if not ok:
        return jsonify({"error": "Akun tidak ditemukan"}), 404
    return jsonify({"message": "Akun berhasil dihapus"}), 200
