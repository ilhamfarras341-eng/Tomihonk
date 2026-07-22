from flask import Blueprint, request, jsonify
from models.laporan import Laporan
from models.ticket import Ticket

laporan_bp = Blueprint("laporan", __name__)


@laporan_bp.route("", methods=["GET"])
def get_all():
    return jsonify(Laporan.get_all()), 200


@laporan_bp.route("/teknisi/<tek_id>", methods=["GET"])
def get_by_teknisi(tek_id):
    return jsonify(Laporan.get_by_teknisi(tek_id)), 200


@laporan_bp.route("", methods=["POST"])
def create():
    data = request.get_json()
    if not data or not data.get("pel") or not data.get("ticketId"):
        return jsonify({"error": "Data laporan tidak lengkap"}), 400
    doc = Laporan.create(data)
    # Otomatis set status tiket menjadi selesai
    ticket_id = data.get("ticketId")
    if ticket_id:
        Ticket.update_status(ticket_id, "selesai")
    return jsonify({"message": "Laporan berhasil disimpan", "data": doc}), 201


@laporan_bp.route("/<id>", methods=["DELETE"])
def delete(id):
    ok = Laporan.delete(id)
    if not ok:
        return jsonify({"error": "Laporan tidak ditemukan"}), 404
    return jsonify({"message": "Laporan berhasil dihapus"}), 200
