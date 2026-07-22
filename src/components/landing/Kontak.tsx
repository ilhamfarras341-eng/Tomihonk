import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function Kontak() {
  const { addKeluhan } = useApp();
  const [form, setForm] = useState({ nama: "", email: "", hp: "", pesan: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addKeluhan({
      nama: form.nama.slice(0, 100),
      email: form.email.slice(0, 255),
      hp: form.hp.slice(0, 20),
      pesan: form.pesan.slice(0, 1000),
    });
    setForm({ nama: "", email: "", hp: "", pesan: "" });
  };

  return (
    <section id="kontak" className="th-section">
      <div className="th-container">
        <div className="section-title">
          <span className="eyebrow">Kontak</span>
          <h2>Mari <span>Terhubung</span> dengan Kami</h2>
          <p>Kami siap melayani pertanyaan dan kebutuhan Anda</p>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Informasi Kontak</h3>
            <p>Jangan ragu untuk menghubungi kami melalui kanal berikut:</p>
            {[
              { i: "fa-map-marker-alt", t: "Alamat Kantor", d: "Jl. Projosumarto I Desa Kaligayam Kec. Talang Kab. Tegal 52193" },
              { i: "fa-phone", t: "Telepon", d: "+62 851-3822-2298" },
              { i: "fa-envelope", t: "Email", d: "pt.tomihonknetworknusantara@tomihonk.co.id" },
              { i: "fab fa-whatsapp", t: "WhatsApp", d: "+62 851-3822-2298" },
              { i: "fa-clock", t: "Jam Operasional", d: "Senin - Minggu: 08.30 - 16.00 WIB" },
            ].map((it) => (
              <div key={it.t} className="info-item">
                <div className="ic">
                  <i className={it.i.startsWith("fab") ? it.i : `fas ${it.i}`} />
                </div>
                <div>
                  <h5>{it.t}</h5>
                  <p>{it.d}</p>
                </div>
              </div>
            ))}
            <div className="socials">
              {["facebook-f", "instagram", "twitter", "youtube", "linkedin-in"].map((s) => (
                <a key={s} href="#">
                  <i className={`fab fa-${s}`} />
                </a>
              ))}
            </div>
          </div>
          <div className="contact-form">
            <h3>Kirim Keluhan / Pesan</h3>
            <p style={{ color: "var(--th-muted)", fontSize: ".9rem", marginBottom: 14 }}>
              Pesan Anda akan tercatat sebagai keluhan pelanggan dan ditangani oleh tim kami.
            </p>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  className="form-control"
                  required
                  maxLength={100}
                  value={form.nama}
                  onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="email@contoh.com"
                />
              </div>
              <div className="form-group">
                <label>No. HP</label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  maxLength={20}
                  value={form.hp}
                  onChange={(e) => setForm((p) => ({ ...p, hp: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="form-group">
                <label>Pesan / Keluhan</label>
                <textarea
                  className="form-control"
                  required
                  maxLength={1000}
                  value={form.pesan}
                  onChange={(e) => setForm((p) => ({ ...p, pesan: e.target.value }))}
                  placeholder="Tulis pesan atau keluhan Anda..."
                />
              </div>
              <button type="submit" className="th-btn th-btn-primary" style={{ width: "100%" }}>
                <i className="fas fa-paper-plane" /> Kirim Pesan
              </button>
            </form>
          </div>
        </div>
        {/* <div className="map-wrap">
          <iframe
            title="Map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=106.81%2C-6.22%2C106.85%2C-6.18&layer=mapnik"
            loading="lazy"
          />
        </div> */}
      </div>
    </section>
  );
}
