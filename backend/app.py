from flask import Flask
from flask_cors import CORS
from config import db, DB_NAME, SECRET_KEY

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY

# CORS — izinkan frontend React (port 5173 / 8080)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Register Blueprints ──
from routes.paket import paket_bp
from routes.tickets import tickets_bp
from routes.calon import calon_bp
from routes.keluhan import keluhan_bp
from routes.laporan import laporan_bp
from routes.auth import auth_bp
from routes.survey_laporan import survey_laporan_bp
from routes.chatbot import chatbot_bp
from routes.galeri import galeri_bp

app.register_blueprint(paket_bp, url_prefix="/api/paket")
app.register_blueprint(tickets_bp, url_prefix="/api/tickets")
app.register_blueprint(calon_bp, url_prefix="/api/calon")
app.register_blueprint(keluhan_bp, url_prefix="/api/keluhan")
app.register_blueprint(laporan_bp, url_prefix="/api/laporan")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(survey_laporan_bp, url_prefix="/api/survey-laporan")
app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")
app.register_blueprint(galeri_bp, url_prefix="/api/galeri")

@app.route("/")
def index():
    return {"message": "Tomihonk API is running", "database": DB_NAME}

# ── Seed initial data jika collection kosong ──
def seed_data():
    """Isi data awal jika database masih kosong."""

    # Paket
    if db.paket.count_documents({}) == 0:
        db.paket.insert_many([
            {"nama": "HOME 11 Mbps", "speed": 11, "harga": 155000, "kat": "Home", "desc": "Paket rumahan 11 Mbps"},
            {"nama": "HOME 16 Mbps", "speed": 16, "harga": 175000, "kat": "Home", "desc": "Paket rumahan 16 Mbps"},
            {"nama": "HOME 21 Mbps", "speed": 21, "harga": 195000, "kat": "Home", "desc": "Paket rumahan 21 Mbps"},
            {"nama": "GAMERS 50 Mbps", "speed": 50, "harga": 350000, "kat": "Gamers", "desc": "Paket gamers 50 Mbps"},
            {"nama": "GAMERS 100 Mbps", "speed": 100, "harga": 405000, "kat": "Gamers", "desc": "Paket gamers 100 Mbps"},
        ])
        print("[SEED] Paket created")

    # Users (akun admin, teknisi, sales)
    from models.user import User
    User.seed()

with app.app_context():
    seed_data()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
