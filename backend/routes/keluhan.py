from flask import Blueprint, request, jsonify
from models.keluhan import Keluhan

keluhan_bp = Blueprint("keluhan", __name__)


@keluhan_bp.route("", methods=["GET"])
def get_all():
    return jsonify(Keluhan.get_all()), 200


@keluhan_bp.route("", methods=["POST"])
def create():
    data = request.get_json()
    if not data or not data.get("nama") or not data.get("pesan"):
        return jsonify({"error": "Nama dan pesan wajib diisi"}), 400
    doc = Keluhan.create(data)
    return jsonify({"message": "Keluhan berhasil disimpan", "data": doc}), 201


@keluhan_bp.route("/<id>/cycle", methods=["PUT"])
def cycle_status(id):
    next_status = Keluhan.cycle_status(id)
    if next_status is None:
        return jsonify({"error": "Data tidak ditemukan atau gagal update"}), 404
    return jsonify({"message": f"Status diubah ke {next_status}", "status": next_status}), 200


@keluhan_bp.route("/<id>", methods=["DELETE"])
def delete(id):
    ok = Keluhan.delete(id)
    if not ok:
        return jsonify({"error": "Data tidak ditemukan"}), 404
    return jsonify({"message": "Keluhan berhasil dihapus"}), 200
