import kami from "../../assets/kami.png";

export default function Profil() {
  return (
    <section id="profil" className="th-section" style={{ background: "#fff" }}>
      <div className="th-container">
        <div className="section-title">
          <span className="eyebrow">Tentang Kami</span>
          <h2>Profil <span>Perusahaan</span></h2>
          <p>Mengenal lebih dekat PT. Tomihonk — penyedia layanan internet fiber optic terkemuka</p>
        </div>
        <div className="profile-grid">
          <div className="profile-img">
            <img src={kami} alt="Logo Tomihonk" />
          </div>
          <div className="profile-text">
            <p>
             Pt. Tomihonk Network Nusantara adalah perusahaan sistem integrator yang mempunyai focus yang kuat dalam mendeliver solusi business di enterprise <i>Information Technology</i> <strong>(IT)</strong>.
             TNN mempunyai lini servis dan solusi IT yang lengkap untuk setiap industry di indonesia.
            </p>
            <p>
              Portfolio kita dibangun dari servis applikasi yang innovative, infrastruktur servis, managed servis dan financing servis. 
              Team TNN membawa pengalaman bertahun2 sebagain konsultan dalam bidang IT, networking, hardware, telco dan solusi software.
            </p>
            <p>
              Kita di dalam proses untuk mengadopsi infrastruktur IT di area implementasi dan support yang memastikan quality control, 
              tetapi juga cost effektif agar client2 kita dapat meng-respond dengan cepat dinamis market dan mengembangkan business client agar selalu competitive
            </p>
          </div>
        </div>
        <div className="vm-grid">
          <div className="vm-card">
            <h3>
              <i className="fas fa-eye" style={{ color: "var(--th-accent)" }} /> Visi
            </h3>
            <p>
              Menjadi penyedia layanan internet terdepan di Indonesia yang dipercaya untuk
              menghadirkan koneksi handal bagi seluruh masyarakat.
            </p>
          </div>
          <div className="vm-card">
            <h3>
              <i className="fas fa-bullseye" style={{ color: "var(--th-accent)" }} /> Misi
            </h3>
            <ul>
              <li>Menyediakan layanan internet berkualitas tinggi</li>
              <li>Memberikan dukungan pelanggan terbaik 24/7</li>
              <li>Mengembangkan infrastruktur jaringan modern</li>
              <li>Memperluas jangkauan ke seluruh Indonesia</li>
            </ul>
          </div>
        </div>
        {/* <h3 className="org-title">Struktur Organisasi</h3>
        <div className="org-grid">
          {[
            { i: "fa-user-tie", n: "Budi Santoso", j: "Direktur Utama" },
            { i: "fa-user-cog", n: "Andi Wijaya", j: "Direktur Operasional" },
            { i: "fa-user-shield", n: "Siti Rahma", j: "Manajer Teknis" },
            { i: "fa-headset", n: "Dewi Lestari", j: "Manajer CS" },
          ].map((o) => (
            <div key={o.n} className="org-card">
              <div className="org-avatar">
                <i className={`fas ${o.i}`} />
              </div>
              <h4>{o.n}</h4>
              <p>{o.j}</p>
            </div>
          ))}
        </div> */}
        <div className="values-grid">
          {[
            { i: "fa-handshake", n: "Integritas" },
            { i: "fa-lightbulb", n: "Inovasi" },
            { i: "fa-medal", n: "Profesional" },
            { i: "fa-heart", n: "Pelayanan" },
            { i: "fa-leaf", n: "Berkelanjutan" },
          ].map((v) => (
            <div key={v.n} className="value-item">
              <i className={`fas ${v.i}`} />
              <h4>{v.n}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
