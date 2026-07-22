import { useMemo, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { fmtRp, StarsStatic } from "@/lib/format";
import PaketModal from "@/components/modals/PaketModal";
import TicketModal from "@/components/modals/TicketModal";
import NotifPanel from "@/components/dashboard/NotifPanel";
import type { Calon, Paket, Role, SurveyLaporan } from "@/lib/types";
import * as XLSX from "xlsx";
import { downloadPdfPemasangan, downloadPdfPemeliharaan, downloadPdfSurvey } from "@/lib/pdfLaporan";

type Tab = "dashboard" | "paket" | "tiket" | "calon" | "keluhan" | "laporan" | "galeri" | "akun";

const TABS: { k: Tab; ic: string; l: string }[] = [
  { k: "dashboard", ic: "fa-tachometer-alt", l: "Dashboard" },
  { k: "paket", ic: "fa-box", l: "Paket" },
  { k: "tiket", ic: "fa-ticket-alt", l: "Tiket" },
  { k: "calon", ic: "fa-user-plus", l: "Calon Pelanggan" },
  { k: "keluhan", ic: "fa-comment-dots", l: "Keluhan" },
  { k: "laporan", ic: "fa-file-alt", l: "Laporan" },
  { k: "galeri", ic: "fa-images", l: "Galeri" },
  { k: "akun", ic: "fa-users-cog", l: "Akun" },
];

const stBadge = (s: string) => ({
  pending: "badge-warning", proses: "badge-info", selesai: "badge-success",
  baru: "badge-warning", ditangani: "badge-info", diproses: "badge-info",
}[s] || "badge-info");

// ── Export Excel helper ──
function exportToExcel(data: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ── Konstanta nama bulan ──
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ── Helper filter berdasarkan bulan & tahun dari string tgl "YYYY-MM-DD" ──
function filterByBulan<T extends { tgl: string }>(list: T[], bulan: string, tahun: string): T[] {
  return list.filter((item) => {
    const [y, m] = item.tgl.split("-");
    if (tahun && y !== tahun) return false;
    if (bulan && m !== bulan) return false;
    return true;
  });
}

// ── Komponen UI filter bulan/tahun ──
function FilterBulan({
  bulan, tahun, onChange,
}: { bulan: string; tahun: string; onChange: (b: string, t: string) => void }) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(thisYear - i));
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <i className="fas fa-filter" style={{ color: "var(--th-muted,#6c757d)", fontSize: ".85rem" }} />
      <select
        value={bulan}
        onChange={(e) => onChange(e.target.value, tahun)}
        style={{
          padding: "5px 10px", borderRadius: 8, border: "1px solid var(--th-border,#dee2e6)",
          fontSize: ".82rem", background: "var(--th-surface,#fff)", cursor: "pointer",
          color: "var(--th-text,#212529)", outline: "none",
        }}
      >
        <option value="">Semua Bulan</option>
        {NAMA_BULAN.map((n, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>{n}</option>
        ))}
      </select>
      <select
        value={tahun}
        onChange={(e) => onChange(bulan, e.target.value)}
        style={{
          padding: "5px 10px", borderRadius: 8, border: "1px solid var(--th-border,#dee2e6)",
          fontSize: ".82rem", background: "var(--th-surface,#fff)", cursor: "pointer",
          color: "var(--th-text,#212529)", outline: "none",
        }}
      >
        <option value="">Semua Tahun</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      {(bulan || tahun) && (
        <button
          onClick={() => onChange("", String(thisYear))}
          style={{
            padding: "5px 10px", borderRadius: 8, border: "1px solid var(--th-border,#dee2e6)",
            fontSize: ".78rem", background: "transparent", cursor: "pointer",
            color: "var(--th-muted,#6c757d)", display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <i className="fas fa-times" /> Reset
        </button>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const {
    currentUser, logout, paketList, deletePaket,
    tickets, refreshTickets, deleteTicket, calon, prosesCalon, deleteCalon,
    keluhan, cycleKeluhan, laporan, surveyLaporan, notifications,
    gallery, addGallery, editGallery, deleteGallery,
    accounts, addAccount, editAccount, deleteAccount,
  } = useApp();

  const [tab, setTabRaw] = useState<Tab>(
    () => (localStorage.getItem("admin_tab") as Tab | null) || "dashboard"
  );
  const setTab = (t: Tab) => { setTabRaw(t); localStorage.setItem("admin_tab", t); if (t === "tiket") refreshTickets(); };

  const [notifOpen, setNotifOpen] = useState(false);
  const [paketModal, setPaketModal] = useState<{ open: boolean; editing: Paket | null }>({ open: false, editing: null });
  const [ticketModal, setTicketModal] = useState<{ open: boolean; from: Calon | null; isSales?: boolean }>({ open: false, from: null, isSales: false });
  const [detailLaporan, setDetailLaporan] = useState<typeof laporan[0] | null>(null);
  const [detailSurveyLap, setDetailSurveyLap] = useState<SurveyLaporan | null>(null);

  const [lapFilter, setLapFilterRaw] = useState<"teknisi" | "sales">(
    () => (localStorage.getItem("admin_lapFilter") as "teknisi" | "sales" | null) || "teknisi"
  );
  const setLapFilter = (v: "teknisi" | "sales") => { setLapFilterRaw(v); localStorage.setItem("admin_lapFilter", v); };

  const [tiketFilter, setTiketFilterRaw] = useState<"teknisi" | "sales">(
    () => (localStorage.getItem("admin_tiketFilter") as "teknisi" | "sales" | null) || "teknisi"
  );
  const setTiketFilter = (v: "teknisi" | "sales") => { setTiketFilterRaw(v); localStorage.setItem("admin_tiketFilter", v); };

  // ── Filter bulan/tahun ──
  const thisYear = String(new Date().getFullYear());
  const [tiketBulan, setTiketBulan] = useState("");
  const [tiketTahun, setTiketTahun] = useState(thisYear);
  const [calonBulan, setCalonBulan] = useState("");
  const [calonTahun, setCalonTahun] = useState(thisYear);

  // Gallery upload/edit state
  const fileRef = useRef<HTMLInputElement>(null);
  const [galTitle, setGalTitle] = useState("");
  const [editGalId, setEditGalId] = useState<string | null>(null);

  // Account form state
  const [accForm, setAccForm] = useState({ username: "", password: "", name: "", role: "teknisi" as Role });
  const [editAccId, setEditAccId] = useState<number | string | null>(null);
  const [showAccPass, setShowAccPass] = useState(false);

  const unread = notifications.admin.filter((n) => !n.read).length;
  const stats = useMemo(() => ({
    paket: paketList.length,
    tiket: tickets.filter((t) => t.st !== "selesai").length,
    calon: calon.filter((c) => c.status === "baru").length,
    keluhan: keluhan.filter((k) => k.status !== "selesai").length,
    laporan: laporan.length,
  }), [paketList, tickets, calon, keluhan, laporan]);

  // ── Gallery handler ──
  const handleGallerySubmit = () => {
    if (!galTitle.trim()) return;
    
    if (editGalId) {
      editGallery(editGalId, galTitle.trim());
      setEditGalId(null);
      setGalTitle("");
      return;
    }

    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addGallery(galTitle.trim(), reader.result as string);
      setGalTitle("");
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const startEditGallery = (g: typeof gallery[0]) => {
    setEditGalId(String(g.id));
    setGalTitle(g.title);
  };

  // ── Account handler ──
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      username: accForm.username,
      password: accForm.password,
      name: accForm.name,
      role: accForm.role,
      // staffId akan di-generate otomatis oleh backend
    };
    
    if (editAccId) {
      editAccount(editAccId, data);
      setEditAccId(null);
    } else {
      addAccount(data);
    }
    setAccForm({ username: "", password: "", name: "", role: "teknisi" });
  };

  const startEditAccount = (a: typeof accounts[0]) => {
    setEditAccId(a.id);
    setAccForm({
      username: a.username,
      password: a.password,
      name: a.name,
      role: a.role,
    });
  };

  // ── Export handlers ──
  // (dipindahkan ke atas bersama tiketFilter)

  // ── Data tiket terfilter ──
  const tiketTeknisiFiltered = useMemo(() =>
    filterByBulan(tickets.filter((t) => t.jenis !== "survey"), tiketBulan, tiketTahun),
    [tickets, tiketBulan, tiketTahun]
  );
  const tiketSalesFiltered = useMemo(() =>
    filterByBulan(tickets.filter((t) => t.jenis === "survey"), tiketBulan, tiketTahun),
    [tickets, tiketBulan, tiketTahun]
  );
  const calonFiltered = useMemo(() =>
    filterByBulan(calon, calonBulan, calonTahun),
    [calon, calonBulan, calonTahun]
  );

  const exportTiket = () => {
    const filtered = tiketFilter === "sales" ? tiketSalesFiltered : tiketTeknisiFiltered;
    const labelBulan = tiketBulan ? `_${NAMA_BULAN[+tiketBulan - 1]}` : "";
    const labelTahun = tiketTahun ? `_${tiketTahun}` : "";
    const data = filtered.map((t) => ({
      ID: t.id, Pelanggan: t.pel, HP: t.hp, Alamat: t.alm,
      Jenis: t.jenis, Masalah: t.mas, Prioritas: t.pri,
      Status: t.st,
      [tiketFilter === "sales" ? "Sales" : "Teknisi"]: t.tek,
      Tanggal: t.tgl,
    }));
    exportToExcel(data, `tiket_${tiketFilter === "sales" ? "sales" : "teknisi"}${labelBulan}${labelTahun}`);
  };

  const exportCalon = () => {
    const labelBulan = calonBulan ? `_${NAMA_BULAN[+calonBulan - 1]}` : "";
    const labelTahun = calonTahun ? `_${calonTahun}` : "";
    const data = calonFiltered.map((c) => ({
      Tanggal: c.tgl, NIK: c.nik || "", Nama: c.nama, HP: c.hp,
      Email: c.email || "", Alamat: c.alamat, Paket: c.paket,
      Sumber: c.sumber || "", Status: c.status,
    }));
    exportToExcel(data, `calon_pelanggan${labelBulan}${labelTahun}`);
  };

  return (
    <div className="dashboard" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="dash-topbar">
        <div className="th-logo"><i className="fas fa-wifi" /> Tomihonk Admin</div>
        <div className="dash-user">
          <div className="notif-btn" onClick={() => setNotifOpen((v) => !v)}>
            <i className="fas fa-bell" />
            {unread > 0 && <span className="notif-dot">{unread}</span>}
          </div>
          <div className="dash-user-info">
            <h5>{currentUser?.name}</h5>
            <p>Admin Panel</p>
          </div>
          <div className="dash-avatar">{currentUser?.name.charAt(0)}</div>
          <button className="th-btn th-btn-outline th-btn-sm" onClick={logout}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
        <NotifPanel target="admin" open={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
      <div className="dash-body">
        <aside className="th-sidebar">
          <ul className="sidebar-menu">
            {TABS.map((t) => (
              <li key={t.k}>
                <a className={tab === t.k ? "active" : ""} onClick={() => setTab(t.k)}>
                  <i className={`fas ${t.ic}`} /><span>{t.l}</span>
                </a>
                {/* Sub-menu filter Tiket */}
                {t.k === "tiket" && tab === "tiket" && (
                  <ul style={{ listStyle: "none", margin: "2px 0 4px", padding: "0 0 0 12px" }}>
                    {([
                      { v: "teknisi", ic: "fa-tools", l: "Teknisi", count: tickets.filter((tk) => tk.jenis !== "survey").length },
                      { v: "sales",   ic: "fa-map-marked-alt", l: "Sales (Survey)", count: tickets.filter((tk) => tk.jenis === "survey").length },
                    ] as const).map((sub) => (
                      <li key={sub.v}>
                        <a
                          onClick={() => setTiketFilter(sub.v)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                            fontSize: ".82rem", fontWeight: tiketFilter === sub.v ? 600 : 400,
                            color: tiketFilter === sub.v ? "#fff" : "rgba(255,255,255,0.6)",
                            background: tiketFilter === sub.v
                              ? "rgba(255,255,255,0.15)"
                              : "transparent",
                            borderLeft: tiketFilter === sub.v
                              ? "3px solid rgba(255,255,255,0.8)"
                              : "3px solid transparent",
                            transition: "all .18s",
                          }}
                        >
                          <i className={`fas ${sub.ic}`} style={{ width: 14, textAlign: "center", fontSize: ".78rem" }} />
                          <span style={{ flex: 1 }}>{sub.l}</span>
                          <span style={{
                            background: tiketFilter === sub.v ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                            borderRadius: 10, padding: "1px 7px", fontSize: ".72rem",
                            fontWeight: 700, minWidth: 20, textAlign: "center",
                          }}>
                            {sub.count}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Sub-menu filter Laporan */}
                {t.k === "laporan" && tab === "laporan" && (
                  <ul style={{ listStyle: "none", margin: "2px 0 4px", padding: "0 0 0 12px" }}>
                    {([
                      { v: "teknisi", ic: "fa-tools", l: "Teknisi", count: laporan.length },
                      { v: "sales",   ic: "fa-map-marked-alt", l: "Survey Sales", count: surveyLaporan.length },
                    ] as const).map((sub) => (
                      <li key={sub.v}>
                        <a
                          onClick={() => setLapFilter(sub.v)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                            fontSize: ".82rem", fontWeight: lapFilter === sub.v ? 600 : 400,
                            color: lapFilter === sub.v ? "#fff" : "rgba(255,255,255,0.6)",
                            background: lapFilter === sub.v
                              ? "rgba(255,255,255,0.15)"
                              : "transparent",
                            borderLeft: lapFilter === sub.v
                              ? "3px solid rgba(255,255,255,0.8)"
                              : "3px solid transparent",
                            transition: "all .18s",
                          }}
                        >
                          <i className={`fas ${sub.ic}`} style={{ width: 14, textAlign: "center", fontSize: ".78rem" }} />
                          <span style={{ flex: 1 }}>{sub.l}</span>
                          <span style={{
                            background: lapFilter === sub.v ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                            borderRadius: 10, padding: "1px 7px", fontSize: ".72rem",
                            fontWeight: 700, minWidth: 20, textAlign: "center",
                          }}>
                            {sub.count}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>
        <main className="dash-content">
          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <>
              <h2>Selamat Datang, {currentUser?.name}!</h2>
              <p className="subtitle">Ringkasan aktivitas sistem hari ini</p>
              <div className="dash-stats">
                <Stat ic="b1" icon="fa-box" v={stats.paket} l="Total Paket" />
                <Stat ic="b2" icon="fa-ticket-alt" v={stats.tiket} l="Tiket Aktif" />
                <Stat ic="b3" icon="fa-user-plus" v={stats.calon} l="Calon Baru" />
                <Stat ic="b4" icon="fa-comment-dots" v={stats.keluhan} l="Keluhan Aktif" />
                <Stat ic="b5" icon="fa-file-alt" v={stats.laporan} l="Total Laporan" />
              </div>
              <div className="dash-card">
                <div className="dash-card-head"><h3>Tiket Terbaru</h3></div>
                <div className="table-wrap">
                  <table className="th-table">
                    <thead><tr><th>ID</th><th>Pelanggan</th><th>HP</th><th>Jenis</th><th>Status</th><th>Tanggal</th></tr></thead>
                    <tbody>
                      {tickets.slice(0, 5).map((t) => (
                        <tr key={t.id}><td>{t.id}</td><td>{t.pel}</td><td>{t.hp}</td><td>{t.jenis}</td>
                          <td><span className={`th-badge ${stBadge(t.st)}`}>{t.st}</span></td><td>{t.tgl}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── PAKET ── */}
          {tab === "paket" && (
            <>
              <h2>Manajemen Paket</h2>
              <p className="subtitle">Tambah, edit, atau hapus paket layanan</p>
              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>Daftar Paket</h3>
                  <button className="th-btn th-btn-primary th-btn-sm"
                    onClick={() => setPaketModal({ open: true, editing: null })}>
                    <i className="fas fa-plus" /> Tambah Paket
                  </button>
                </div>
                <div className="table-wrap">
                  <table className="th-table">
                    <thead><tr><th>Nama</th><th>Kategori</th><th>Speed</th><th>Harga</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {paketList.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.nama}</strong><br /><small style={{ color: "var(--th-muted)" }}>{p.desc}</small></td>
                          <td><span className="th-badge badge-info">{p.kat}</span></td>
                          <td>{p.speed} Mbps</td>
                          <td>{fmtRp(p.harga)}</td>
                          <td>
                            <button className="act-btn edit" onClick={() => setPaketModal({ open: true, editing: p })}>
                              <i className="fas fa-edit" /> Edit
                            </button>
                            <button className="act-btn del" onClick={() => deletePaket(p.id)}>
                              <i className="fas fa-trash" /> Hapus
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

          {/* ── TIKET ── */}
          {tab === "tiket" && (
            <>
              <h2>{tiketFilter === "teknisi" ? "Tiket Teknisi" : "Tiket Sales (Survey)"}</h2>
              <p className="subtitle">
                {tiketFilter === "teknisi"
                  ? "Kelola tiket pemasangan, pemeliharaan, dan pencabutan"
                  : "Kelola tiket survey yang ditugaskan ke sales"}
              </p>

              {/* ── Filter Bulan & Tahun ── */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 12, marginBottom: 12,
                padding: "10px 14px", borderRadius: 10,
                background: "var(--th-surface,#fff)", border: "1px solid var(--th-border,#dee2e6)",
              }}>
                <FilterBulan
                  bulan={tiketBulan}
                  tahun={tiketTahun}
                  onChange={(b, t) => { setTiketBulan(b); setTiketTahun(t); }}
                />
                <span style={{ fontSize: ".8rem", color: "var(--th-muted,#6c757d)" }}>
                  Menampilkan{" "}
                  <strong>{tiketFilter === "teknisi" ? tiketTeknisiFiltered.length : tiketSalesFiltered.length}</strong>
                  {" "}dari{" "}
                  <strong>{tiketFilter === "teknisi" ? tickets.filter(t => t.jenis !== "survey").length : tickets.filter(t => t.jenis === "survey").length}</strong>
                  {" "}tiket
                </span>
              </div>


              {/* ── Tiket Teknisi ── */}
              {tiketFilter === "teknisi" && (
                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>Daftar Tiket Teknisi</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="th-btn th-btn-accent th-btn-sm" onClick={exportTiket}>
                        <i className="fas fa-file-excel" /> Export Excel
                      </button>
                      <button className="th-btn th-btn-primary th-btn-sm"
                        onClick={() => setTicketModal({ open: true, from: null, isSales: false })}>
                        <i className="fas fa-plus" /> Buat Tiket
                      </button>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table className="th-table">
                      <thead><tr><th>ID</th><th>Pelanggan</th><th>HP</th><th>Jenis</th><th>Prioritas</th><th>Teknisi</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                      <tbody>
                        {tiketTeknisiFiltered.length === 0 ? (
                          <tr><td colSpan={9}><div className="empty-state"><i className="fas fa-tools" /><p>Tidak ada tiket teknisi{tiketBulan || tiketTahun ? " pada periode ini" : ""}</p></div></td></tr>
                        ) : tiketTeknisiFiltered.map((t) => (
                          <tr key={t.id}><td>{t.id}</td><td>{t.pel}</td><td>{t.hp}</td>
                            <td><span className="th-badge badge-info">{t.jenis}</span></td>
                            <td><span className={`th-badge ${t.pri === "Tinggi" ? "badge-danger" : t.pri === "Sedang" ? "badge-warning" : "badge-info"}`}>{t.pri}</span></td>
                            <td>{t.tek}</td>
                            <td><span className={`th-badge ${stBadge(t.st)}`}>{t.st}</span></td>
                            <td style={{ fontSize: ".82rem", color: "var(--th-muted,#6c757d)" }}>{t.tgl}</td>
                            <td><button className="act-btn del" onClick={() => deleteTicket(t.id)}><i className="fas fa-trash" /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Tiket Sales (Survey) ── */}
              {tiketFilter === "sales" && (
                <div className="dash-card">
                  <div className="dash-card-head">
                    <h3>Daftar Tiket Survey (Sales)</h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="th-btn th-btn-accent th-btn-sm" onClick={exportTiket}>
                        <i className="fas fa-file-excel" /> Export Excel
                      </button>
                      <button className="th-btn th-btn-primary th-btn-sm"
                        onClick={() => setTicketModal({ open: true, from: null, isSales: true })}>
                        <i className="fas fa-plus" /> Buat Tiket Sales
                      </button>
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table className="th-table">
                      <thead><tr><th>ID</th><th>Pelanggan</th><th>HP</th><th>Alamat</th><th>Prioritas</th><th>Sales</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                      <tbody>
                        {tiketSalesFiltered.length === 0 ? (
                          <tr><td colSpan={9}><div className="empty-state"><i className="fas fa-map-marked-alt" /><p>Tidak ada tiket survey{tiketBulan || tiketTahun ? " pada periode ini" : ""}</p></div></td></tr>
                        ) : tiketSalesFiltered.map((t) => (
                          <tr key={t.id}><td>{t.id}</td><td>{t.pel}</td><td>{t.hp}</td>
                            <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.alm}</td>
                            <td><span className={`th-badge ${t.pri === "Tinggi" ? "badge-danger" : t.pri === "Sedang" ? "badge-warning" : "badge-info"}`}>{t.pri}</span></td>
                            <td>{t.tek}</td>
                            <td><span className={`th-badge ${stBadge(t.st)}`}>{t.st}</span></td>
                            <td style={{ fontSize: ".82rem", color: "var(--th-muted,#6c757d)" }}>{t.tgl}</td>
                            <td><button className="act-btn del" onClick={() => deleteTicket(t.id)}><i className="fas fa-trash" /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CALON PELANGGAN ── */}
          {tab === "calon" && (
            <>
              <h2>Calon Pelanggan</h2>
              <p className="subtitle">Pendaftar baru yang menunggu diproses</p>
              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>Daftar Calon</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <FilterBulan
                      bulan={calonBulan}
                      tahun={calonTahun}
                      onChange={(b, t) => { setCalonBulan(b); setCalonTahun(t); }}
                    />
                    <button className="th-btn th-btn-accent th-btn-sm" onClick={exportCalon}>
                      <i className="fas fa-file-excel" /> Export Excel
                    </button>
                  </div>
                </div>
                {(calonBulan || calonTahun) && (
                  <div style={{
                    padding: "6px 16px", fontSize: ".8rem",
                    color: "var(--th-muted,#6c757d)",
                    borderBottom: "1px solid var(--th-border,#dee2e6)",
                  }}>
                    Menampilkan <strong>{calonFiltered.length}</strong> dari <strong>{calon.length}</strong> calon pelanggan
                  </div>
                )}
                <div className="table-wrap">
                  <table className="th-table">
                    <thead><tr><th>Tanggal</th><th>Nama</th><th>HP</th><th>Paket</th><th>Status</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {calonFiltered.length === 0 ? (
                        <tr><td colSpan={6}><div className="empty-state"><i className="fas fa-inbox" /><p>Tidak ada calon{calonBulan || calonTahun ? " pada periode ini" : ""}</p></div></td></tr>
                      ) : calonFiltered.map((c) => (
                        <tr key={c.id}><td>{c.tgl}</td><td>{c.nama}</td><td>{c.hp}</td><td>{c.paket}</td>
                          <td><span className={`th-badge ${stBadge(c.status)}`}>{c.status}</span></td>
                          <td>
                            {c.status === "baru" && (
                              <button className="act-btn upd" onClick={async () => {
                                const cl = await prosesCalon(c.id);
                                if (cl) setTicketModal({ open: true, from: cl });
                              }}><i className="fas fa-paper-plane" /> Buat Tiket</button>
                            )}
                            <button className="act-btn del" onClick={() => deleteCalon(c.id)}>
                              <i className="fas fa-trash" /> Hapus
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

          {/* ── KELUHAN ── */}
          {tab === "keluhan" && (
            <>
              <h2>Keluhan Pelanggan</h2>
              <p className="subtitle">Tindak lanjuti keluhan masuk</p>
              <div className="dash-card">
                <div className="table-wrap">
                  <table className="th-table">
                    <thead><tr><th>Tanggal</th><th>Nama</th><th>HP</th><th>Pesan</th><th>Status</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {keluhan.map((k) => (
                        <tr key={k.id}><td>{k.tgl}</td><td>{k.nama}</td><td>{k.hp}</td><td>{k.pesan}</td>
                          <td><span className={`th-badge ${stBadge(k.status)}`}>{k.status}</span></td>
                          <td><button className="act-btn upd" onClick={() => cycleKeluhan(k.id)}>
                            <i className="fas fa-sync" /> Update
                          </button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── LAPORAN ── */}
          {tab === "laporan" && (
            <>
              <h2>Laporan</h2>
              <p className="subtitle">Laporan teknisi & laporan survey sales</p>

              {/* ── Laporan Teknisi ── */}
              {lapFilter === "teknisi" && (
                <div className="dash-card">
                  <div className="table-wrap">
                    <table className="th-table">
                      <thead><tr><th>Tgl</th><th>Tiket</th><th>Pelanggan</th><th>Jenis</th><th>Teknisi</th><th>Rating</th><th>TTD</th><th>Aksi</th></tr></thead>
                      <tbody>
                        {laporan.length === 0 ? (
                          <tr><td colSpan={8}><div className="empty-state"><i className="fas fa-file-alt" /><p>Belum ada laporan teknisi</p></div></td></tr>
                        ) : laporan.map((l) => (
                          <tr key={l.id}><td>{l.tgl}</td><td>{l.ticketId}</td><td>{l.pel}</td><td>{l.jenis}</td>
                            <td>{l.tekName}</td><td><StarsStatic n={l.rating} /></td>
                            <td>{l.ttd ? <img src={l.ttd} alt="ttd" style={{ height: 32 }} /> : "-"}</td>
                            <td>
                              <button className="act-btn upd" onClick={() => setDetailLaporan(l)}>
                                <i className="fas fa-eye" /> Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Laporan Sales ── */}
              {lapFilter === "sales" && (
                <div className="dash-card">
                  <div className="table-wrap">
                    <table className="th-table">
                      <thead><tr><th>Tgl</th><th>Tiket</th><th>Calon Pelanggan</th><th>Sinyal</th><th>Minat</th><th>Rekomendasi</th><th>Sales</th><th>Aksi</th></tr></thead>
                      <tbody>
                        {surveyLaporan.length === 0 ? (
                          <tr><td colSpan={8}><div className="empty-state"><i className="fas fa-map-marked-alt" /><p>Belum ada laporan survey</p></div></td></tr>
                        ) : surveyLaporan.map((l) => (
                          <tr key={l.id}>
                            <td>{l.tgl}</td>
                            <td>{l.ticketId}</td>
                            <td><strong>{l.calon}</strong><br /><small>{l.hp}</small></td>
                            <td>
                              <span className={`th-badge ${l.sinyal === "kuat" ? "badge-success" : l.sinyal === "sedang" ? "badge-warning" : "badge-danger"}`}>
                                {l.sinyal === "kuat" ? "🟢 Kuat" : l.sinyal === "sedang" ? "🟡 Sedang" : "🔴 Lemah"}
                              </span>
                            </td>
                            <td>
                              <span className={`th-badge ${{ sangat_minat: "badge-success", minat: "badge-info", ragu: "badge-warning", tidak_minat: "badge-danger" }[l.minat] || "badge-info"}`}>
                                {{ sangat_minat: "Sangat Minat", minat: "Minat", ragu: "Ragu-ragu", tidak_minat: "Tidak Minat" }[l.minat]}
                              </span>
                            </td>
                            <td>
                              <span className={`th-badge ${{ layak: "badge-success", perlu_review: "badge-warning", tidak_layak: "badge-danger" }[l.rekomendasi] || "badge-info"}`}>
                                {{ layak: "Layak", perlu_review: "Perlu Review", tidak_layak: "Tidak Layak" }[l.rekomendasi]}
                              </span>
                            </td>
                            <td>{l.salesName}</td>
                            <td>
                              <button className="act-btn upd" onClick={() => setDetailSurveyLap(l)}>
                                <i className="fas fa-eye" /> Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── GALERI ── */}
          {tab === "galeri" && (
            <>
              <h2>Manajemen Galeri</h2>
              <p className="subtitle">Tambah atau hapus foto dokumentasi kegiatan</p>
              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>{editGalId ? "Edit Judul Foto" : "Upload Foto Baru"}</h3>
                  {editGalId && (
                    <button className="th-btn th-btn-outline th-btn-sm" onClick={() => { setEditGalId(null); setGalTitle(""); }}>
                      Batal
                    </button>
                  )}
                </div>
                <div style={{ padding: 20, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div className="form-group" style={{ margin: 0, flex: "1 1 200px" }}>
                    <label>Judul Foto *</label>
                    <input className="form-control" value={galTitle} placeholder="Contoh: Pemasangan Baru"
                      onChange={(e) => setGalTitle(e.target.value)} />
                  </div>
                  {!editGalId && (
                    <div className="form-group" style={{ margin: 0, flex: "1 1 200px" }}>
                      <label>File Gambar *</label>
                      <input className="form-control" type="file" accept="image/*" ref={fileRef} />
                    </div>
                  )}
                  <button className="th-btn th-btn-primary th-btn-sm" onClick={handleGallerySubmit}
                    style={{ height: 42 }}>
                    <i className={`fas ${editGalId ? "fa-save" : "fa-upload"}`} /> {editGalId ? "Simpan" : "Upload"}
                  </button>
                </div>
              </div>
              <div className="dash-card" style={{ marginTop: 20 }}>
                <div className="dash-card-head"><h3>Daftar Foto ({gallery.length})</h3></div>
                <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                  {gallery.map((g) => (
                    <div key={g.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", boxShadow: "var(--th-shadow-sm)", background: "#f8f9fa" }}>
                      <img src={g.img} alt={g.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                      <div style={{ padding: "8px 12px", fontSize: ".85rem", fontWeight: 600 }}>{g.title}</div>
                      <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
                        <button className="act-btn edit"
                          style={{ background: "rgba(13,110,253,.9)", color: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: ".75rem", border: "none", cursor: "pointer" }}
                          onClick={() => startEditGallery(g)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button className="act-btn del"
                          style={{ background: "rgba(220,53,69,.9)", color: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: ".75rem", border: "none", cursor: "pointer" }}
                          onClick={() => deleteGallery(g.id)}>
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── AKUN ── */}
          {tab === "akun" && (
            <>
              <h2>Manajemen Akun</h2>
              <p className="subtitle">Buat dan kelola akun teknisi & sales</p>
              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>{editAccId ? "Edit Akun" : "Buat Akun Baru"}</h3>
                  {editAccId && (
                    <button className="th-btn th-btn-outline th-btn-sm" onClick={() => { setEditAccId(null); setAccForm({ username: "", password: "", name: "", role: "teknisi" }); }}>
                      Batal
                    </button>
                  )}
                </div>
                <div style={{ padding: 20 }}>
                  <form onSubmit={handleAccountSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
                      <label>Username *</label>
                      <input className="form-control" required value={accForm.username}
                        onChange={(e) => setAccForm((p) => ({ ...p, username: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: "1 1 140px" }}>
                      <label>Password *</label>
                      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input className="form-control" required
                          type={showAccPass ? "text" : "password"}
                          value={accForm.password}
                          style={{ paddingRight: 40 }}
                          onChange={(e) => setAccForm((p) => ({ ...p, password: e.target.value }))} />
                        <button type="button"
                          onClick={() => setShowAccPass((v) => !v)}
                          style={{
                            position: "absolute", right: 10, background: "none", border: "none",
                            cursor: "pointer", color: "var(--th-muted, #6c757d)", padding: 0, fontSize: "1rem",
                            display: "flex", alignItems: "center",
                          }}>
                          <i className={`fas ${showAccPass ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: "1 1 160px" }}>
                      <label>Nama Lengkap *</label>
                      <input className="form-control" required value={accForm.name}
                        onChange={(e) => setAccForm((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: "1 1 120px" }}>
                      <label>Role *</label>
                      <select className="form-control" value={accForm.role}
                        onChange={(e) => setAccForm((p) => ({ ...p, role: e.target.value as Role }))}>
                        <option value="">Pilih Role</option>
                        <option value="teknisi">Teknisi</option>
                        <option value="sales">Sales</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button type="submit" className="th-btn th-btn-primary th-btn-sm" style={{ height: 42 }}>
                      <i className={`fas ${editAccId ? "fa-save" : "fa-plus"}`} /> {editAccId ? "Simpan" : "Buat Akun"}
                    </button>
                  </form>
                </div>
              </div>
              <div className="dash-card" style={{ marginTop: 20 }}>
                <div className="dash-card-head"><h3>Daftar Akun ({accounts.length})</h3></div>
                <div className="table-wrap">
                  <table className="th-table">
                    <thead><tr><th>Username</th><th>Nama</th><th>Role</th><th>Staff ID</th><th>Aksi</th></tr></thead>
                    <tbody>
                      {accounts.map((a) => (
                        <tr key={a.id}>
                          <td>{a.username}</td>
                          <td>{a.name}</td>
                          <td><span className={`th-badge ${a.role === "admin" ? "badge-danger" : a.role === "teknisi" ? "badge-info" : "badge-success"}`}>{a.role}</span></td>
                          <td>{a.staffId || "-"}</td>
                          <td>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="act-btn upd" onClick={() => startEditAccount(a)}>
                                <i className="fas fa-edit" /> Edit
                              </button>
                              {a.role !== "admin" && (
                                <button className="act-btn del" onClick={() => deleteAccount(a.id)}>
                                  <i className="fas fa-trash" /> Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <PaketModal open={paketModal.open} editing={paketModal.editing}
        onClose={() => setPaketModal({ open: false, editing: null })} />
      <TicketModal open={ticketModal.open} fromCalon={ticketModal.from}
        isSalesTicket={ticketModal.isSales}
        onClose={() => setTicketModal((prev) => ({ ...prev, open: false }))} />

      {detailLaporan && (
        <div className="lightbox" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: 620, background: "#fff", padding: 24, borderRadius: 12, position: "relative" }}>
            <span className="lightbox-close" onClick={() => setDetailLaporan(null)} style={{ color: "#333", background: "#f0f0f0" }}>
              <i className="fas fa-times" />
            </span>

            {/* Header modal */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  {detailLaporan.jenis === "pemasangan" ? (
                    <><i className="fas fa-file-contract" style={{ color: "#0e7490", marginRight: 8 }} />Berita Acara Instalasi</>
                  ) : (
                    <><i className="fas fa-wrench" style={{ color: "#b45309", marginRight: 8 }} />Laporan Instalasi — Pemeliharaan</>
                  )}
                </h3>
                <small style={{ color: "#999" }}>Tiket #{detailLaporan.ticketId} · {detailLaporan.tgl}</small>
              </div>
              {/* Tombol Download PDF */}
              <button
                onClick={() =>
                  detailLaporan.jenis === "pemasangan"
                    ? downloadPdfPemasangan(detailLaporan)
                    : downloadPdfPemeliharaan(detailLaporan)
                }
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: detailLaporan.jenis === "pemasangan"
                    ? "linear-gradient(135deg, #0e7490, #0891b2)"
                    : "linear-gradient(135deg, #b45309, #d97706)",
                  color: "#fff", fontWeight: 600, fontSize: ".85rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                <i className="fas fa-file-pdf" />
                Download PDF
              </button>
            </div>

            {/* Data umum */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div><small style={{ color: "#666" }}>Tiket ID:</small><div><strong>{detailLaporan.ticketId}</strong></div></div>
              <div><small style={{ color: "#666" }}>Tanggal:</small><div>{detailLaporan.tgl}</div></div>
              <div><small style={{ color: "#666" }}>Pelanggan:</small><div>{detailLaporan.pel}</div></div>
              <div><small style={{ color: "#666" }}>Teknisi:</small><div>{detailLaporan.tekName}</div></div>
              <div><small style={{ color: "#666" }}>Paket:</small><div>{detailLaporan.paket}</div></div>
              <div><small style={{ color: "#666" }}>ODP:</small><div>{detailLaporan.odp}</div></div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Titik / Lokasi:</small><div>{detailLaporan.titik}</div></div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Keterangan Laporan:</small><div>{detailLaporan.keterangan}</div></div>
            </div>




            {detailLaporan.jenis === "pemeliharaan" && (
              <div style={{ background: "#f8f9fa", padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <small style={{ color: "#666", display: "block" }}>Saran dan Kritik Pelanggan:</small>
                  <div>{detailLaporan.saranKritik || <em style={{ color: "#999" }}>Tidak ada</em>}</div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <small style={{ color: "#666", display: "block", marginBottom: 8 }}>Foto Pemeliharaan:</small>
                    {detailLaporan.fotoPemeliharaan && detailLaporan.fotoPemeliharaan.length > 0 ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {detailLaporan.fotoPemeliharaan.map((foto, i) => (
                          <div key={i} style={{ width: 80, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd" }}>
                            <img src={foto} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ))}
                      </div>
                    ) : <em style={{ color: "#999" }}>Tidak ada foto</em>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <small style={{ color: "#666", display: "block", marginBottom: 8 }}>File Laporan (PDF/Doc):</small>
                    {detailLaporan.filePemeliharaan && detailLaporan.filePemeliharaan.length > 0 ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {detailLaporan.filePemeliharaan.map((_, i) => (
                          <div key={i} style={{ width: 80, height: 80, borderRadius: 6, overflow: "hidden", border: "1px solid #ddd" }}>
                            <div style={{ background: "#eee", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#666" }}><i className="fas fa-file-alt" /></div>
                          </div>
                        ))}
                      </div>
                    ) : <em style={{ color: "#999" }}>Tidak ada file</em>}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: 16 }}>
              <div>
                <small style={{ color: "#666", display: "block" }}>Rating:</small>
                <StarsStatic n={detailLaporan.rating} />
              </div>
              <div>
                <small style={{ color: "#666", display: "block", textAlign: "right" }}>Tanda Tangan:</small>
                {detailLaporan.ttd && <img src={detailLaporan.ttd} alt="TTD" style={{ height: 40 }} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Laporan Survey Sales ── */}
      {detailSurveyLap && (
        <div className="lightbox" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: 640, background: "#fff", padding: 24, borderRadius: 12, position: "relative" }}>
            <span className="lightbox-close" onClick={() => setDetailSurveyLap(null)} style={{ color: "#333", background: "#f0f0f0" }}>
              <i className="fas fa-times" />
            </span>

            {/* Header modal survey */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0 }}>
                  <i className="fas fa-map-marked-alt" style={{ color: "#1d4ed8", marginRight: 8 }} />
                  Laporan Survey — Calon Pelanggan
                </h3>
                <small style={{ color: "#999" }}>Tiket #{detailSurveyLap.ticketId} · {detailSurveyLap.tgl}</small>
              </div>
              {/* Tombol Download PDF Survey */}
              <button
                onClick={() => downloadPdfSurvey(detailSurveyLap)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "#fff", fontWeight: 600, fontSize: ".85rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                <i className="fas fa-file-pdf" />
                Download PDF
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", fontSize: ".88rem", marginBottom: 14 }}>
              <div><small style={{ color: "#666" }}>Tiket ID:</small><div><strong>{detailSurveyLap.ticketId}</strong></div></div>
              <div><small style={{ color: "#666" }}>Tanggal:</small><div>{detailSurveyLap.tgl}</div></div>
              <div><small style={{ color: "#666" }}>Calon Pelanggan:</small><div><strong>{detailSurveyLap.calon}</strong></div></div>
              <div><small style={{ color: "#666" }}>HP:</small><div>{detailSurveyLap.hp}</div></div>
              <div><small style={{ color: "#666" }}>Sales:</small><div>{detailSurveyLap.salesName}</div></div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Alamat:</small><div>{detailSurveyLap.alamat}</div></div>
            </div>
            <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 14, marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: ".88rem" }}>
              <div><small style={{ color: "#666" }}>Jarak ke ODP:</small><div>{detailSurveyLap.jarakOdp}</div></div>
              <div>
                <small style={{ color: "#666" }}>Kualitas Sinyal:</small>&nbsp;
                <span className={`th-badge ${detailSurveyLap.sinyal === "kuat" ? "badge-success" : detailSurveyLap.sinyal === "sedang" ? "badge-warning" : "badge-danger"}`}>
                  {detailSurveyLap.sinyal}
                </span>
              </div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Kondisi Lokasi:</small><div>{detailSurveyLap.kondisiLokasi}</div></div>
            </div>
            <div style={{ background: "#f0f7ff", borderRadius: 8, padding: 14, marginBottom: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: ".88rem" }}>
              <div>
                <small style={{ color: "#666" }}>Minat Berlangganan:</small>&nbsp;
                <span className={`th-badge ${{ sangat_minat: "badge-success", minat: "badge-info", ragu: "badge-warning", tidak_minat: "badge-danger" }[detailSurveyLap.minat] || "badge-info"}`}>
                  {{ sangat_minat: "Sangat Minat", minat: "Minat", ragu: "Ragu-ragu", tidak_minat: "Tidak Minat" }[detailSurveyLap.minat]}
                </span>
              </div>
              <div><small style={{ color: "#666" }}>Paket Diminati:</small><div>{detailSurveyLap.paketDiminati || "-"}</div></div>
              <div style={{ gridColumn: "1 / -1" }}><small style={{ color: "#666" }}>Catatan:</small><div>{detailSurveyLap.catatan}</div></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: 14, fontSize: ".88rem" }}>
              <div>
                <small style={{ color: "#666" }}>Rekomendasi:</small><br />
                <span className={`th-badge ${{ layak: "badge-success", perlu_review: "badge-warning", tidak_layak: "badge-danger" }[detailSurveyLap.rekomendasi] || "badge-info"}`}>
                  {{ layak: "Layak Dipasang", perlu_review: "Perlu Review Lanjut", tidak_layak: "Tidak Layak" }[detailSurveyLap.rekomendasi]}
                </span>
              </div>
              {detailSurveyLap.tglRencana && (
                <div style={{ textAlign: "right" }}>
                  <small style={{ color: "#666" }}>Rencana Tindak Lanjut:</small><br />
                  <strong>{detailSurveyLap.tglRencana}</strong>
                </div>
              )}
            </div>
            {detailSurveyLap.fotoLokasi && detailSurveyLap.fotoLokasi.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <small style={{ color: "#666" }}>Foto Lokasi:</small>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {detailSurveyLap.fotoLokasi.map((f, i) => (
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

function Stat({ ic, icon, v, l }: { ic: string; icon: string; v: number; l: string }) {
  return (
    <div className="dash-stat">
      <div className={`ic ${ic}`}><i className={`fas ${icon}`} /></div>
      <div><h3>{v}</h3><p>{l}</p></div>
    </div>
  );
}
