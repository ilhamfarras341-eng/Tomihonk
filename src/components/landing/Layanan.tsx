import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";

interface Props {
  onDaftar: (paketName: string) => void;
}

const COVERAGE = [
  "Slawi", "Adiwerna", "Dukuhturi", "Talang", "Tarub", "Kramat", "Suradadi", 
  "Warureja", "Pangkah","Jatinegara", "Lebaksiu", "Balapulang", 
  "BumiJawa", "Bojong", "Margasari", "Pagerbarang", "Dukuwaru", "Dungbanteng"
];

const CAT_META: Record<string, { name: string; icon: string; desc: string; features: string[] }> = {
  Home: {
    name: "Tomihonk Home",
    icon: "fa-home",
    desc: "Paket internet rumahan untuk keluarga",
    features: ["Unlimited Quota", "Free Instalasi", "Free Modem WiFi", "Support 24/7"],
  },
  Gamers: {
    name: "Tomihonk Gamers",
    icon: "fa-gamepad",
    desc: "Paket internet untuk gaming & streaming",
    features: ["Unlimited Quota", "Low Latency", "Free Modem WiFi", "Priority Support 24/7"],
  },
};

function formatRupiah(n: number) {
  return "Rp." + n.toLocaleString("id-ID") + ",-";
}

export default function Layanan({ onDaftar }: Props) {
  const { paketList } = useApp();
  const [activeTab, setActiveTab] = useState<"Home" | "Gamers">("Home");

  // Group paket from database by category
  const grouped = useMemo(() => {
    const result: Record<string, typeof paketList> = { Home: [], Gamers: [] };
    for (const p of paketList) {
      const key = (p.kat || "Home");
      if (!result[key]) result[key] = [];
      result[key].push(p);
    }
    // Sort each group by speed
    for (const k of Object.keys(result)) {
      result[k].sort((a, b) => a.speed - b.speed);
    }
    return result;
  }, [paketList]);

  const categories = Object.keys(CAT_META) as ("Home" | "Gamers")[];
  const activePlans = grouped[activeTab] || [];
  const meta = CAT_META[activeTab];

  return (
    <section id="layanan" className="th-section">
      <div className="th-container">
        <div className="section-title">
          <span className="eyebrow">Paket Layanan</span>
          <h2>Pilih <span>Paket Internet</span> Anda</h2>
          <p>Solusi koneksi fiber optic untuk setiap kebutuhan — dari rumahan hingga gamers</p>
        </div>

        {/* ── Two main category selector cards ── */}
        <div className="pkg-selector">
          {categories.map((cat) => {
            const m = CAT_META[cat];
            const colorKey = cat === "Gamers" ? "gamers" : "home";
            return (
              <button
                key={cat}
                className={`pkg-selector-card pkg-selector-card--${colorKey} ${activeTab === cat ? "active" : ""}`}
                onClick={() => setActiveTab(cat)}
              >
                <div className={`pkg-selector-icon pkg-selector-icon--${colorKey}`}>
                  <i className={`fas ${m.icon}`} />
                </div>
                <div className="pkg-selector-info">
                  <h3>{m.name}</h3>
                  <p>{m.desc}</p>
                </div>
                <div className="pkg-selector-arrow">
                  <i className="fas fa-chevron-right" />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Expanded plans for the selected category ── */}
        <div className="pkg-plans-panel" key={activeTab}>
          <div className="pkg-plans-header">
            <div className={`pkg-plans-icon pkg-plans-icon--${activeTab === "Gamers" ? "gamers" : "home"}`}>
              <i className={`fas ${meta.icon}`} />
            </div>
            <div>
              <h3 className="pkg-plans-title">{meta.name}</h3>
              <p className="pkg-plans-subtitle">Pilih kecepatan yang sesuai kebutuhan Anda</p>
            </div>
          </div>

          {activePlans.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--th-muted)", padding: "2rem" }}>
              Belum ada paket pada kategori ini.
            </p>
          ) : (
            <div className={`packages-grid packages-grid--${Math.min(activePlans.length, 4)}`}>
              {activePlans.map((p, idx) => {
                const colorKey = activeTab === "Gamers" ? "gamers" : "home";
                return (
                  <div
                    key={p.id}
                    className={`package-card package-card--${colorKey}`}
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    <div className="pkg-speed">
                      {p.speed} <small>Mbps</small>
                    </div>
                    <div className="pkg-price">
                      {formatRupiah(p.harga)}
                      <small>/bulan</small>
                    </div>
                    <ul className="pkg-features">
                      {meta.features.map((f) => (
                        <li key={f}>
                          <i className="fas fa-check-circle" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`th-btn ${colorKey === "gamers" ? "th-btn-accent" : "th-btn-primary"}`}
                      style={{ width: "100%" }}
                      onClick={() => onDaftar(`${p.nama} - ${formatRupiah(p.harga)}`)}
                    >
                      Daftar Sekarang
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="coverage">
          <h3>
            <i className="fas fa-map-marked-alt" style={{ color: "var(--th-accent)" }} /> Area
            Coverage Layanan
          </h3>
          <p style={{ textAlign: "center", color: "var(--th-muted)", marginBottom: 20 }}>
            Layanan kami tersedia di Kecamatan berikut:
          </p>
          <div className="coverage-grid">
            {COVERAGE.map((c) => (
              <div key={c} className="coverage-item">
                <i className="fas fa-map-pin" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

