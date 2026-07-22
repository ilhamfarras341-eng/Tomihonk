import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function Galeri() {
  const { gallery } = useApp();
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="galeri" className="th-section" style={{ background: "#fff" }}>
      <div className="th-container">
        <div className="section-title">
          <span className="eyebrow">Dokumentasi</span>
          <h2>Galeri <span>Kegiatan</span></h2>
          <p>Dokumentasi kegiatan dan aktivitas perusahaan</p>
        </div>
        <div className="gallery-grid">
          {gallery.map((g) => (
            <div key={g.id} className="gallery-item" onClick={() => setLightbox(g.img)}>
              <img src={g.img} alt={g.title} loading="lazy" />
              <div className="gallery-overlay">
                <div>
                  <h5 style={{ color: "#fff" }}>{g.title}</h5>
                </div>
                <i className="fas fa-search-plus" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <span className="lightbox-close">
            <i className="fas fa-times" />
          </span>
          <img src={lightbox} alt="Preview" />
        </div>
      )}
    </section>
  );
}
