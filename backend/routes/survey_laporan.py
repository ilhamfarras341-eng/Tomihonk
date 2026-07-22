from flask import Blueprint, request, jsonify
from models.survey_laporan import SurveyLaporan

survey_laporan_bp = Blueprint("survey_laporan", __name__)


@survey_laporan_bp.route("", methods=["GET"])
def get_all():
    return jsonify(SurveyLaporan.get_all()), 200


@survey_laporan_bp.route("/sales/<sales_id>", methods=["GET"])
def get_by_sales(sales_id):
    return jsonify(SurveyLaporan.get_by_sales(sales_id)), 200


@survey_laporan_bp.route("", methods=["POST"])
def create():
    data = request.get_json()
    if not data or not data.get("calon") or not data.get("salesId"):
        return jsonify({"error": "Data laporan survey tidak lengkap"}), 400
    doc = SurveyLaporan.create(data)
    return jsonify({"message": "Laporan survey berhasil disimpan", "data": doc}), 201


@survey_laporan_bp.route("/<id>", methods=["DELETE"])
def delete(id):
    ok = SurveyLaporan.delete(id)
    if not ok:
        return jsonify({"error": "Laporan tidak ditemukan"}), 404
    return jsonify({"message": "Laporan survey berhasil dihapus"}), 200
