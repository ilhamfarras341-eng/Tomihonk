const FEATURES = [
  { icon: "fa-rocket", title: "Kecepatan Tinggi", desc: "Teknologi fiber optic dengan kecepatan hingga 1 Gbps." },
  { icon: "fa-shield-alt", title: "Koneksi Stabil", desc: "Jaringan redundant dengan jaminan uptime 99.9%." },
  { icon: "fa-headset", title: "Support 24/7", desc: "Tim teknisi profesional siap membantu kapan saja." },
  { icon: "fa-tags", title: "Harga Terjangkau", desc: "Paket lengkap dengan harga kompetitif." },
];

export default function Features() {
  return (
    <section style={{ paddingTop: 30 }} className="th-section">
      <div className="th-container">
        <div className="section-title">
          <span className="eyebrow">Keunggulan</span>
          <h2>Mengapa Memilih <span>Tomihonk</span></h2>
          <p>Kami berkomitmen memberikan kualitas layanan terbaik untuk seluruh pelanggan</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">
                <i className={`fas ${f.icon}`} />
              </div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
