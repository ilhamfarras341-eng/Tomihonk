import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import SurveyLaporanModal from "@/components/modals/SurveyLaporanModal";
import type { Ticket } from "@/lib/types";

type Tab = "dashboard" | "tiket" | "laporan";
const TABS: { k: Tab; ic: string; l: string }[] = [
  { k: "dashboard", ic: "fa-tachometer-alt", l: "Dashboard" },
  { k: "tiket", ic: "fa-ticket-alt", l: "Tiket Survey" },
  { k: "laporan", ic: "fa-file-alt", l: "Laporan Survey" },
];


const minatLabel: Record<string, string> = {
  sangat_minat: "Sangat Minat", minat: "Minat", ragu: "Ragu-ragu", tidak_minat: "Tidak Minat",
};
const minatBadge: Record<string, string> = {
  sangat_minat: "badge-success", minat: "badge-info", ragu: "badge-warning", tidak_minat: "badge-danger",
};
const rekBadge: Record<string, string> = {
  layak: "badge-success", perlu_review: "badge-warning", tidak_layak: "badge-danger",
};
const rekLabel: Record<string, string> = {
  layak: "Layak Dipasang", perlu_review: "Perlu Review", tidak_layak: "Tidak Layak",
};

export default function SalesDashboard() {
  const { currentUser, logout, tickets, surveyLaporan, deleteSurveyLaporan, accounts } = useApp();
  const [tab, setTabRaw] = useState<Tab>(
    () => (localStorage.getItem("sales_tab") as Tab | null) || "dashboard"
  );
  const setTab = (t: Tab) => { setTabRaw(t); localStorage.setItem("sales_tab", t); };
  const [lapModal, setLapModal] = useState<{ open: boolean; ticket: Ticket | null; visitId?: string }>({ open: false, ticket: null });
  const [detailLap, setDetailLap] = useState<typeof surveyLaporan[0] | null>(null);

  const myId = currentUser?.id || "";
  // Cari akun sales yang sedang login untuk mendapatkan username-nya
  const myUsername = useMemo(() => accounts.find((a) => a.staffId === myId || a.username === myId)?.username || myId, [accounts, myId]);
  // Tiket survey yang ditugaskan ke sales ini (cocokkan staffId atau username)
  const myTickets = useMemo(() => tickets.filter((t) => t.jenis === "survey" && (t.tek === myId || t.tek === myUsername)), [tickets, myId, myUsername]);
  // Laporan survey milik sales ini
  const myLaporan = useMemo(() => surveyLaporan.filter((l) => l.salesId === myId), [surveyLaporan, myId]);
  // Tiket aktif (belum selesai)
  const activeTickets = useMemo(() => myTickets.filter((t) => t.st !== "selesai"), [myTickets]);

  const stats = {
    dijadwal: activeTickets.length,
    selesai: myTickets.filter((t) => t.st === "selesai").length,
    laporan: myLaporan.length,
  };

  return (
    <div className="dashboard" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="dash-topbar">
        <div className="th-logo"><i className="fas fa-wifi" /> Tomihonk Sales</div>
        <div className="dash-user">
          <div className="dash-user-info">
            <h5>{currentUser?.name}</h5>
            <p>Sales Marketing</p>
          </div>
          <div className="dash-avatar">{currentUser?.name.charAt(0)}</div>
          <button className="th-btn th-btn-outline th-btn-sm" onClick={logout}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </div>
      <div className="dash-body">
        <aside className="th-sidebar">
          <ul className="sidebar-menu">
            {TABS.map((t) => (
              <li key={t.k}><a className={tab === t.k ? "active" : ""} onClick={() => setTab(t.k)}>
                <i className={`fas ${t.ic}`} /><span>{t.l}</span></a></li>
            ))}
          </ul>
        </aside>
        <main className="dash-content">
          <div className="tech-profile">
            <div className="avatar-lg" style={{ background: "var(--th-primary)", color: "#fff" }}>{currentUser?.name.charAt(0)}</div>
            <div>
              <h3>{currentUser?.name}</h3>
              <p><i className="fas fa-bullhorn" /> Sales Marketing &nbsp;·&nbsp; <i className="fas fa-user-tag" /> {myId}</p>
            </div>
          </div>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <>
              <div className="dash-stats">
                <div className="dash-stat"><div className="ic b1"><i className="fas fa-calendar-alt" /></div><div><h3>{stats.dijadwal}</h3><p>Tiket Aktif</p></div></div>
                <div className="dash-stat"><div className="ic b3"><i className="fas fa-check-circle" /></div><div><h3>{stats.selesai}</h3><p>Survey Selesai</p></div></div>
                <div className="dash-stat"><div className="ic b2"><i className="fas fa-file-alt" /></div><div><h3>{stats.laporan}</h3><p>Total Laporan</p></div></div>
              </div>

              <div className="dash-card">
                <div className="dash-card-head"><h3>Tiket Survey Aktif</h3></div>
                <div className="table-wrap">
                  <table className="th-table">
                    <thead><tr><th>ID</th><th>Calon Pelanggan</th><th>Tujuan</th><th>Status</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {activeTickets.length === 0 ? (
                        <tr><td colSpan={5}><div className="empty-state"><i className="fas fa-check-circle" /><p>Semua tiket selesai!</p></div></td></tr>
                      ) : activeTickets.slice(0, 5).map((t) => (
                          <tr key={t.id}><td>{t.id}</td>
                            <td><strong>{t.pel}</strong><br /><small className="text-muted"><i className="fas fa-map-marker-alt" /> {t.alm}</small></td>
                            <td>{t.mas}</td>
                            <td><span className={`th-badge ${t.st === "selesai" ? "badge-success" : t.st === "proses" ? "badge-info" : "badge-warning"}`}>{t.st}</span></td>
                            <td>
                              <button className="act-btn lap" onClick={() => setLapModal({ open: true, ticket: t })}>
                                <i className="fas fa-clipboard-check" /> Lapor
                              </button>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── TIKET SURVEY ── */}
          {tab === "tiket" && (
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Tiket Survey Saya</h3>
                <span className="th-badge badge-info">{myTickets.length} tiket</span>
              </div>
              <div className="table-wrap">
                <table className="th-table">
                  <thead><tr><th>ID Tiket</th><th>Pelanggan</th><th>HP</th><th>Alamat</th><th>Deskripsi</th><th>Status</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {myTickets.length === 0 ? (
                      <tr><td colSpan={7}><div className="empty-state"><i className="fas fa-inbox" /><p>Belum ada tiket survey</p></div></td></tr>
                    ) : myTickets.map((t) => {
                      const sudahLapor = myLaporan.some((l) => l.ticketId === t.id);
                      return (
                        <tr key={t.id}>
                          <td><strong>{t.id}</strong></td>
                          <td>{t.pel}</td>
                          <td>{t.hp}</td>
                          <td>{t.alm}</td>
                          <td><small>{t.mas}</small></td>
                          <td>
                            <span className={`th-badge ${t.st === "selesai" ? "badge-success" : t.st === "proses" ? "badge-info" : "badge-warning"}`}>
                              {t.st}
                            </span>
                          </td>
                          <td>
                            {sudahLapor ? (
                              <span className="th-badge badge-success" style={{ fontSize: ".8rem" }}>
                                <i className="fas fa-check" /> Sudah Lapor
                              </span>
                            ) : (
                              <button className="act-btn lap"
                                onClick={() => setLapModal({ open: true, ticket: t })}>
                                <i className="fas fa-clipboard-check" /> Buat Laporan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── LAPORAN SURVEY ── */}
          {tab === "laporan" && (
            <div className="dash-card">
              <div className="dash-card-head"><h3>Laporan Survey Saya</h3>
                <span className="th-badge badge-info">{myLaporan.length} laporan</span>
              </div>
              <div className="table-wrap">
                <table className="th-table">
                  <thead><tr><th>Tanggal</th><th>Tiket</th><th>Calon Pelanggan</th><th>Sinyal</th><th>Minat</th><th>Rekomendasi</th><th>Aksi</th></tr></thead>
                  <tbody>
                    {myLaporan.length === 0 ? (
                      <tr><td colSpan={7}><div className="empty-state"><i className="fas fa-file-alt" /><p>Belum ada laporan</p></div></td></tr>
                    ) : myLaporan.map((l) => (
                      <tr key={l.id}>
                        <td style={{ whiteSpace: "nowrap" }}>{l.tgl}</td>
                        <td><strong>{l.ticketId}</strong></td>
                        <td>
                          <strong>{l.calon}</strong><br />
                          <small><i className="fas fa-phone" /> {l.hp}</small>
                        </td>
                        <td>
                          <span className={`th-badge ${l.sinyal === "kuat" ? "badge-success" : l.sinyal === "sedang" ? "badge-warning" : "badge-danger"}`}>
                            {l.sinyal === "kuat" ? "🟢 Kuat" : l.sinyal === "sedang" ? "🟡 Sedang" : "🔴 Lemah"}
                          </span>
                        </td>
                        <td>
                          <span className={`th-badge ${minatBadge[l.minat] || "badge-info"}`}>
                            {minatLabel[l.minat] || l.minat}
                          </span>
                        </td>
                        <td>
                          <span className={`th-badge ${rekBadge[l.rekomendasi] || "badge-info"}`}>
                            {rekLabel[l.rekomendasi] || l.rekomendasi}
                          </span>
                        </td>
                        <td style={{ display: "flex", gap: 4 }}>
                          <button className="act-btn upd" onClick={() => setDetailLap(l)}>
                            <i className="fas fa-eye" /> Detail
                          </button>
                          <button className="act-btn del" onClick={() => deleteSurveyLaporan(l.id)}>
                            <i className="fas fa-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Modal Laporan Survey ── */}
      <SurveyLaporanModal
        open={lapModal.open}
        ticket={lapModal.ticket}
        visitId={lapModal.visitId}
        onClose={() => setLapModal({ open: false, ticket: null })}
      />

      {/* ── Detail Laporan ── */}
      {detailLap && (
        <div className="lightbox" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: 620, background: "#fff", padding: 24, borderRadius: 12, position: "relative" }}>
            <span className="lightbox-close" onClick={() => setDetailLap(null)} style={{ color: "#333", background: "#f0f0f0" }}>
              <i className="fas fa-times" />
            </span>
            <h3 style={{ marginBottom: 16 }}>
              <i className="fas fa-map-marked-alt" style={{ color: "var(--th-primary)", marginRight: 8 }} />
              Detail Laporan Survey
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", fontSize: ".88rem", marginBottom: 16 }}>
              <div><small style={{ color: "#666" }}>Tiket ID:</small><div><strong>{detailLap.ticketId}</strong></div></div>
              <div><small style={{ color: "#666" }}>Tanggal:</small><div>{detailLap.tgl}</div></div>
              <div><small style={{ color: "#666" }}>Calon Pelanggan:</small><div><strong>{detailLap.calon}</strong></div></div>
              <div><small style={{ color: "#666" }}>HP:</small><div>{detailLap.hp}</div></div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Alamat:</small><div>{detailLap.alamat}</div></div>
            </div>
            <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 14, marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: ".88rem" }}>
              <div><small style={{ color: "#666" }}>Jarak ke ODP:</small><div>{detailLap.jarakOdp}</div></div>
              <div><small style={{ color: "#666" }}>Kualitas Sinyal:</small>
                <div><span className={`th-badge ${detailLap.sinyal === "kuat" ? "badge-success" : detailLap.sinyal === "sedang" ? "badge-warning" : "badge-danger"}`}>{detailLap.sinyal}</span></div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Kondisi Lokasi:</small><div>{detailLap.kondisiLokasi}</div></div>
            </div>
            <div style={{ background: "#f0f7ff", borderRadius: 8, padding: 14, marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: ".88rem" }}>
              <div><small style={{ color: "#666" }}>Minat Berlangganan:</small>
                <div><span className={`th-badge ${minatBadge[detailLap.minat]}`}>{minatLabel[detailLap.minat]}</span></div>
              </div>
              <div><small style={{ color: "#666" }}>Paket Diminati:</small><div>{detailLap.paketDiminati || "-"}</div></div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Catatan:</small><div>{detailLap.catatan}</div></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: 14, fontSize: ".88rem" }}>
              <div>
                <small style={{ color: "#666" }}>Rekomendasi:</small><br />
                <span className={`th-badge ${rekBadge[detailLap.rekomendasi]}`}>{rekLabel[detailLap.rekomendasi]}</span>
              </div>
              {detailLap.tglRencana && (
                <div style={{ textAlign: "right" }}>
                  <small style={{ color: "#666" }}>Rencana Tindak Lanjut:</small><br />
                  <strong>{detailLap.tglRencana}</strong>
                </div>
              )}
            </div>
            {detailLap.fotoLokasi && detailLap.fotoLokasi.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <small style={{ color: "#666" }}>Foto Lokasi:</small>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {detailLap.fotoLokasi.map((f, i) => (
                    <div key={i} style={{ width: 80, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd" }}>
                      <img src={f} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
