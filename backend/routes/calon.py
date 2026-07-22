from flask import Blueprint, request, jsonify
from models.calon import Calon

calon_bp = Blueprint("calon", __name__)


@calon_bp.route("", methods=["GET"])
def get_all():
    return jsonify(Calon.get_all()), 200


@calon_bp.route("", methods=["POST"])
def create():
    data = request.get_json()
    if not data or not data.get("nama"):
        return jsonify({"error": "Nama wajib diisi"}), 400
    doc = Calon.create(data)
    return jsonify({"message": "Calon pelanggan berhasil disimpan", "data": doc}), 201


@calon_bp.route("/<id>/status", methods=["PUT"])
def update_status(id):
    data = request.get_json()
    new_status = data.get("status")
    valid = ["baru", "diproses", "selesai"]
    if new_status not in valid:
        return jsonify({"error": f"Status tidak valid. Pilihan: {valid}"}), 400
    ok = Calon.update_status(id, new_status)
    if not ok:
        return jsonify({"error": "Gagal update status atau ID tidak ditemukan"}), 404
    return jsonify({"message": f"Status berhasil diubah ke {new_status}"}), 200


@calon_bp.route("/<id>", methods=["DELETE"])
def delete(id):
    ok = Calon.delete(id)
    if not ok:
        return jsonify({"error": "Data tidak ditemukan"}), 404
    return jsonify({"message": "Calon pelanggan berhasil dihapus"}), 200
