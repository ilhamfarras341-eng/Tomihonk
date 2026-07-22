from flask import Blueprint, request, jsonify
from models.paket import Paket

paket_bp = Blueprint("paket", __name__)

@paket_bp.route("", methods=["GET"])
def get_all():
    return jsonify(Paket.get_all()), 200

@paket_bp.route("", methods=["POST"])
def create():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body kosong"}), 400

    required = ["nama", "speed", "harga", "kat"]
    for field in required:
        if not data.get(field) and data.get(field) != 0:
            return jsonify({"error": f"Field '{field}' wajib diisi"}), 400

    doc = Paket.create(data)
    return jsonify({"message": "Paket berhasil ditambahkan", "data": doc}), 201

@paket_bp.route("/<id>", methods=["PUT"])
def update(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body kosong"}), 400

    if not Paket.update(id, data):
        return jsonify({"error": "Paket tidak ditemukan atau gagal diupdate"}), 404

    return jsonify({"message": "Paket berhasil diperbarui"}), 200

@paket_bp.route("/<id>", methods=["DELETE"])
def delete(id):
    if not Paket.delete(id):
        return jsonify({"error": "Paket tidak ditemukan"}), 404
    return jsonify({"message": "Paket berhasil dihapus"}), 200
