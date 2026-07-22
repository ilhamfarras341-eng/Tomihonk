from flask import Blueprint, request, jsonify
from models.galeri import Galeri

galeri_bp = Blueprint("galeri", __name__)

@galeri_bp.route("", methods=["GET"])
def get_all():
    return jsonify(Galeri.get_all()), 200

@galeri_bp.route("", methods=["POST"])
def create():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body kosong"}), 400

    if not data.get("title", "").strip():
        return jsonify({"error": "Field 'title' wajib diisi"}), 400

    if not data.get("img", "").strip():
        return jsonify({"error": "Field 'img' wajib diisi (base64 data URL)"}), 400

    doc = Galeri.create(data)
    return jsonify({"message": "Foto berhasil ditambahkan", "data": doc}), 201

@galeri_bp.route("/<id>", methods=["PUT"])
def update(id):
    data = request.get_json()
    if not data or not data.get("title", "").strip():
        return jsonify({"error": "Field 'title' wajib diisi"}), 400

    if not Galeri.update_title(id, data["title"].strip()):
        return jsonify({"error": "Foto tidak ditemukan atau gagal diperbarui"}), 404

    return jsonify({"message": "Judul foto berhasil diperbarui"}), 200

@galeri_bp.route("/<id>", methods=["DELETE"])
def delete(id):
    if not Galeri.delete(id):
        return jsonify({"error": "Foto tidak ditemukan"}), 404
    return jsonify({"message": "Foto berhasil dihapus"}), 200
