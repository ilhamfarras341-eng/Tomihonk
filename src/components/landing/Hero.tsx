export default function Hero() {
  return (
    <section className="hero" id="beranda">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="wave-circle" />
      ))}
      <div className="th-container hero-grid">
        <div className="hero-content">
          <span className="hero-badge">
            <i className="fas fa-bolt" /> #1 ISP Terpercaya 2025
          </span>
          <h1>
            Internet Fiber <span>Cepat &amp; Stabil</span> untuk Bisnis &amp; Rumah Anda
          </h1>
          <p className="tagline">"Koneksi Handal, Layanan Terpercaya"</p>
          <p className="desc">
            PT. Tomihonk menghadirkan jaringan fiber optic berkualitas enterprise dengan SLA
            uptime 99.9%, dukungan teknis 24/7, dan instalasi profesional di seluruh wilayah
            layanan.
          </p>
          <div className="hero-cta">
            <a href="#layanan" className="th-btn th-btn-accent">
              <i className="fas fa-tag" /> Lihat Paket
            </a>
            <a
              href="https://wa.me/6285138222298"
              target="_blank"
              rel="noopener noreferrer"
              className="th-btn th-btn-outline"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.5)" }}
            >
              <i className="fab fa-whatsapp" /> Konsultasi Gratis
            </a>
          </div>
          <div className="trust-pills">
            <div className="trust-pill"><i className="fas fa-shield-alt" /> SLA 99.9% Uptime</div>
            <div className="trust-pill"><i className="fas fa-headset" /> Support 24/7</div>
            <div className="trust-pill"><i className="fas fa-bolt" /> Instalasi 1x24 Jam</div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="speed-card">
            <div className="sc-head">
              <div>
                <div className="sc-title">Live Network Status</div>
                <div className="sc-sub">Jaringan stabil &amp; optimal</div>
              </div>
              <span className="sc-dot" />
            </div>
            <div className="speed-meter">
              <div className="num">100</div>
              <div className="unit">Mbps Symmetric</div>
              <div className="bar-line"><span /></div>
            </div>
            <div className="speed-stats">
              <div className="ss"><b>5 ms</b><span>Latency</span></div>
              <div className="ss"><b>0%</b><span>Packet Loss</span></div>
              <div className="ss"><b>99.9%</b><span>Uptime</span></div>
            </div>
          </div>
          <div className="float-chip fc-1">
            <i className="fas fa-wifi" /> Fiber Optic Active
          </div>
          <div className="float-chip fc-2">
            <i className="fas fa-shield-alt" /> Secure Network
          </div>
        </div>
      </div>
    </section>
  );
}
