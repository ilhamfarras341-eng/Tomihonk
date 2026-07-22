from bson import ObjectId
from config import db
from datetime import datetime


class SurveyLaporan:
    collection = db.survey_laporan

    @staticmethod
    def get_all():
        data = []
        for l in SurveyLaporan.collection.find().sort("tgl", -1):
            data.append(SurveyLaporan._serialize(l))
        return data

    @staticmethod
    def get_by_sales(sales_id):
        data = []
        for l in SurveyLaporan.collection.find({"salesId": sales_id}).sort("tgl", -1):
            data.append(SurveyLaporan._serialize(l))
        return data

    @staticmethod
    def _serialize(l):
        return {
            "id": str(l["_id"]),
            "ticketId": l.get("ticketId", ""),
            "visitId": l.get("visitId", ""),
            "tgl": l.get("tgl", ""),
            "calon": l.get("calon", ""),
            "hp": l.get("hp", ""),
            "alamat": l.get("alamat", ""),
            "kondisiLokasi": l.get("kondisiLokasi", ""),
            "jarakOdp": l.get("jarakOdp", ""),
            "sinyal": l.get("sinyal", "sedang"),
            "minat": l.get("minat", "ragu"),
            "paketDiminati": l.get("paketDiminati", ""),
            "catatan": l.get("catatan", ""),
            "fotoLokasi": l.get("fotoLokasi", []),
            "salesId": l.get("salesId", ""),
            "salesName": l.get("salesName", ""),
            "rekomendasi": l.get("rekomendasi", "perlu_review"),
            "tglRencana": l.get("tglRencana", ""),
            "ttd": l.get("ttd", ""),
        }

    @staticmethod
    def create(data):
        doc = {
            "ticketId": data.get("ticketId", ""),
            "visitId": data.get("visitId", ""),
            "tgl": datetime.now().strftime("%Y-%m-%d"),
            "calon": data.get("calon", ""),
            "hp": data.get("hp", ""),
            "alamat": data.get("alamat", ""),
            "kondisiLokasi": data.get("kondisiLokasi", ""),
            "jarakOdp": data.get("jarakOdp", ""),
            "sinyal": data.get("sinyal", "sedang"),
            "minat": data.get("minat", "ragu"),
            "paketDiminati": data.get("paketDiminati", ""),
            "catatan": data.get("catatan", ""),
            "fotoLokasi": data.get("fotoLokasi", []),
            "salesId": data.get("salesId", ""),
            "salesName": data.get("salesName", ""),
            "rekomendasi": data.get("rekomendasi", "perlu_review"),
            "tglRencana": data.get("tglRencana", ""),
            "ttd": data.get("ttd", ""),
        }
        result = SurveyLaporan.collection.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)
        return doc

    @staticmethod
    def delete(id):
        try:
            res = SurveyLaporan.collection.delete_one({"_id": ObjectId(id)})
            return res.deleted_count > 0
        except Exception:
            return False
