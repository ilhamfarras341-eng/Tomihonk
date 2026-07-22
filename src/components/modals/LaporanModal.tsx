import { useEffect, useRef, useState } from "react";
import { Modal, ModalHeader } from "@/components/Modal";
import { useApp } from "@/context/AppContext";
import type { Ticket } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

export default function LaporanModal({ open, onClose, ticket }: Props) {
  const { addLaporan, currentUser, customers, calon, accounts } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);

  // ── State form laporan reguler (pemasangan / pemeliharaan) ──
  const [form, setForm] = useState({
    paket: "", odp: "", titik: "", keterangan: "", rating: 0,
    saranKritik: "", fotoPemeliharaan: [] as string[], filePemeliharaan: [] as string[],
    // Field tambahan BERITA ACARA INSTALASI
    noPelanggan: "", marketing: "",
    serialONU: "", macAddress: "", panjangKabel: "", redaman: "",
    usernamePPPoE: "", passwordPPPoE: "",
    hasilSpeedtest: "", statusKoneksi: "Normal",
    fotoInstalasi: [] as string[],
  });

  // ── State form laporan survey ──
  const [surveyForm, setSurveyForm] = useState({
    namaPelanggan: "", alamat: "", noHp: "",
    tanggalSurvey: "", marketing: "", teknisiSurvey: "", paketInternet: "",
    catatan: "",
  });

  const isSurvey = ticket?.jenis === "survey";
  const salesList = accounts.filter((a) => a.role === "sales");

  // ── Reset & auto-fill saat modal dibuka ──
  useEffect(() => {
    if (!open || !canvasRef.current) return;

    const c = canvasRef.current;
    c.width = c.offsetWidth;
    c.height = c.offsetHeight;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    setHasSig(false);

    if (isSurvey && ticket) {
      // Auto-fill form survey dari data tiket
      let paketAuto = "";
      const matchCalon = calon.find((c) => c.nama.toLowerCase() === ticket.pel.toLowerCase());
      if (matchCalon) paketAuto = matchCalon.paket;

      setSurveyForm({
        namaPelanggan: ticket.pel,
        alamat: ticket.alm,
        noHp: ticket.hp,
        tanggalSurvey: ticket.tglSurvey || "",
        marketing: "",
        teknisiSurvey: currentUser ? `${currentUser.name} (${currentUser.id})` : "",
        paketInternet: paketAuto,
        catatan: "",
      });
    } else if (ticket) {
      // Auto-fill form reguler
      let paketAuto = "";
      const matchCustomer = customers.find((c) => c.n.toLowerCase() === ticket.pel.toLowerCase());
      if (matchCustomer) {
        paketAuto = matchCustomer.p;
      } else {
        const matchCalon = calon.find((c) => c.nama.toLowerCase() === ticket.pel.toLowerCase());
        paketAuto = matchCalon ? matchCalon.paket : ticket.mas || "";
      }

      const keteranganAuto = ticket.jenis === "pemasangan"
        ? `Pemasangan jaringan internet selesai dilakukan di lokasi pelanggan ${ticket.pel}. Semua perangkat terpasang dan koneksi berjalan normal.`
        : `Pemeliharaan/perbaikan jaringan pada pelanggan ${ticket.pel} telah selesai dilakukan. ${ticket.mas}`;

      setForm({
        paket: paketAuto, odp: "", titik: ticket.alm,
        keterangan: keteranganAuto, rating: 0, saranKritik: "",
        fotoPemeliharaan: [], filePemeliharaan: [],
        noPelanggan: "", marketing: "",
        serialONU: "", macAddress: "", panjangKabel: "", redaman: "",
        usernamePPPoE: "", passwordPPPoE: "",
        hasilSpeedtest: "", statusKoneksi: "Normal",
        fotoInstalasi: [],
      });
    }
  }, [open, ticket, isSurvey, customers, calon, currentUser]);

  // ── Upload foto / file (pemeliharaan) ──
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setForm((prev) => ({ ...prev, fotoPemeliharaan: [...prev.fotoPemeliharaan, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setForm((prev) => ({ ...prev, filePemeliharaan: [...prev.filePemeliharaan, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };
  const removeFoto = (i: number) =>
    setForm((prev) => ({ ...prev, fotoPemeliharaan: prev.fotoPemeliharaan.filter((_, idx) => idx !== i) }));
  const removeFile = (i: number) =>
    setForm((prev) => ({ ...prev, filePemeliharaan: prev.filePemeliharaan.filter((_, idx) => idx !== i) }));

  // ── Upload foto instalasi (pemasangan) ──
  const handleFotoInstalasiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setForm((prev) => ({ ...prev, fotoInstalasi: [...prev.fotoInstalasi, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };
  const removeFotoInstalasi = (i: number) =>
    setForm((prev) => ({ ...prev, fotoInstalasi: prev.fotoInstalasi.filter((_, idx) => idx !== i) }));

  // ── Signature canvas ──
  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const t = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    setDrawing(true);
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#0057B7";
    ctx.lineTo(x, y); ctx.stroke();
    setHasSig(true);
  };
  const end = () => setDrawing(false);
  const clearSig = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    setHasSig(false);
  };

  // ── Submit ──
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !currentUser) return;

    if (isSurvey) {
      // Laporan survey — simpan ke keterangan sebagai teks terstruktur
      if (!hasSig) { alert("Mohon isi tanda tangan"); return; }
      const ttd = canvasRef.current!.toDataURL("image/png");
      const keteranganSurvey = [
        `Nama Pelanggan   : ${surveyForm.namaPelanggan}`,
        `Alamat Lengkap   : ${surveyForm.alamat}`,
        `Nomor HP         : ${surveyForm.noHp}`,
        `Tanggal Survey   : ${surveyForm.tanggalSurvey}`,
        `Marketing        : ${surveyForm.marketing || "-"}`,
        `Teknisi Survey   : ${surveyForm.teknisiSurvey}`,
        `Paket Internet   : ${surveyForm.paketInternet || "-"}`,
        surveyForm.catatan ? `\nCatatan: ${surveyForm.catatan}` : "",
      ].filter(Boolean).join("\n");

      addLaporan({
        jenis: ticket.jenis, ticketId: ticket.id, pel: ticket.pel,
        paket: surveyForm.paketInternet || "-",
        odp: "-", titik: surveyForm.alamat,
        keterangan: keteranganSurvey, rating: 5, ttd,
        tek: currentUser.id || "", tekName: currentUser.name,
      });
    } else {
      // Laporan reguler
      if (!hasSig) { alert("Mohon isi tanda tangan pelanggan"); return; }
      if (!form.rating) { alert("Mohon beri rating"); return; }
      const ttd = canvasRef.current!.toDataURL("image/png");
      addLaporan({
        jenis: ticket.jenis, ticketId: ticket.id, pel: ticket.pel,
        hp: ticket.hp,
        paket: form.paket, odp: form.odp, titik: form.titik,
        keterangan: form.keterangan, rating: form.rating, ttd,
        tek: currentUser.id || "", tekName: currentUser.name,
        saranKritik: ticket.jenis === "pemeliharaan" ? form.saranKritik : undefined,
        fotoPemeliharaan: ticket.jenis === "pemeliharaan" ? form.fotoPemeliharaan : undefined,
        filePemeliharaan: ticket.jenis === "pemeliharaan" ? form.filePemeliharaan : undefined,
        // Field tambahan pemasangan
        ...(ticket.jenis === "pemasangan" ? {
          noPelanggan: form.noPelanggan,
          marketing: form.marketing,
          serialONU: form.serialONU,
          macAddress: form.macAddress,
          panjangKabel: form.panjangKabel,
          redaman: form.redaman,
          usernamePPPoE: form.usernamePPPoE,
          passwordPPPoE: form.passwordPPPoE,
          hasilSpeedtest: form.hasilSpeedtest,
          statusKoneksi: form.statusKoneksi,
          fotoInstalasi: form.fotoInstalasi,
        } : {}),
      });
    }
    onClose();
  };

  // ── Label judul modal ──
  const modalTitle =
    ticket?.jenis === "survey"      ? "Laporan Survey Calon Pelanggan" :
    ticket?.jenis === "pemasangan"  ? "Laporan Pemasangan" :
    ticket?.jenis === "pemeliharaan"? "Laporan Pemeliharaan" :
                                      "Laporan Tugas";

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader
        icon={isSurvey ? "fa-search-location" : "fa-clipboard-check"}
        title={modalTitle}
        subtitle={ticket ? `${ticket.id} - ${ticket.pel}` : ""}
        onClose={onClose}
      />
      <div className="modal-body">
        <form onSubmit={submit}>

          {/* ── Ringkasan tiket ── */}
          {ticket && (
            <div style={{
              background: "var(--th-bg, #f8f9fa)", border: "1px solid var(--th-border, #dee2e6)",
              borderRadius: 8, padding: "12px 16px", marginBottom: 16,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: ".85rem",
            }}>
              <div><span style={{ color: "var(--th-muted, #6c757d)" }}>ID Tiket: </span><strong>{ticket.id}</strong></div>
              <div><span style={{ color: "var(--th-muted, #6c757d)" }}>Jenis: </span><strong style={{ textTransform: "capitalize" }}>{ticket.jenis === "survey" ? "Survey Calon Pelanggan" : ticket.jenis}</strong></div>
              <div><span style={{ color: "var(--th-muted, #6c757d)" }}>Pelanggan: </span><strong>{ticket.pel}</strong></div>
              <div><span style={{ color: "var(--th-muted, #6c757d)" }}>HP: </span><strong>{ticket.hp}</strong></div>
              <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "var(--th-muted, #6c757d)" }}>Deskripsi Tiket: </span><strong>{ticket.mas}</strong></div>
            </div>
          )}

          {/* ════════════ FORM SURVEY ════════════ */}
          {isSurvey ? (
            <>
              <div style={{
                background: "rgba(13,110,253,0.04)", border: "1px solid rgba(13,110,253,0.2)",
                borderRadius: 10, padding: "14px 16px", marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "#0d6efd", fontWeight: 600, fontSize: ".9rem" }}>
                  <i className="fas fa-clipboard-list" /> Data Survey Calon Pelanggan
                </div>

                <div className="form-group">
                  <label>Nama Pelanggan *</label>
                  <input className="form-control" required value={surveyForm.namaPelanggan}
                    onChange={(e) => setSurveyForm((p) => ({ ...p, namaPelanggan: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Alamat Lengkap *</label>
                  <textarea className="form-control" required value={surveyForm.alamat}
                    onChange={(e) => setSurveyForm((p) => ({ ...p, alamat: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Nomor HP *</label>
                  <input className="form-control" required type="tel" value={surveyForm.noHp}
                    onChange={(e) => setSurveyForm((p) => ({ ...p, noHp: e.target.value }))}
                    placeholder="08xxxxxxxxxx" />
                </div>
                <div className="form-group">
                  <label>Tanggal Survey *</label>
                  <input className="form-control" required type="date" value={surveyForm.tanggalSurvey}
                    onChange={(e) => setSurveyForm((p) => ({ ...p, tanggalSurvey: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>
                    Marketing{" "}
                    <span style={{ fontSize: ".8rem", color: "var(--th-muted,#6c757d)", fontWeight: 400 }}>(Sales yang mereferensikan)</span>
                  </label>
                  <select className="form-control" value={surveyForm.marketing}
                    onChange={(e) => setSurveyForm((p) => ({ ...p, marketing: e.target.value }))}>
                    <option value="">-- Pilih Marketing / Sales --</option>
                    {salesList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}{s.staffId ? ` (${s.staffId})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Teknisi Survey</label>
                  <input className="form-control" readOnly value={surveyForm.teknisiSurvey}
                    style={{ background: "var(--th-bg,#f8f9fa)", cursor: "not-allowed" }} />
                </div>
                <div className="form-group">
                  <label>Paket Internet yang Diminati</label>
                  <input className="form-control" value={surveyForm.paketInternet}
                    placeholder="Contoh: HOME 11 MBPS - Rp 155.000"
                    onChange={(e) => setSurveyForm((p) => ({ ...p, paketInternet: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Catatan Tambahan</label>
                  <textarea className="form-control" rows={2} value={surveyForm.catatan} placeholder="Opsional..."
                    onChange={(e) => setSurveyForm((p) => ({ ...p, catatan: e.target.value }))} />
                </div>
              </div>

              {/* Tanda tangan survey */}
              <div className="form-group">
                <label>Tanda Tangan Calon Pelanggan *</label>
                <div className="sig-wrap">
                  <canvas ref={canvasRef} className="sigpad"
                    onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
                    onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
                  <div className="sig-actions">
                    <span>Tanda tangan di area atas</span>
                    <button type="button" onClick={clearSig}><i className="fas fa-eraser" /> Hapus</button>
                  </div>
                </div>
              </div>
            </>

          ) : (
            /* ════════════ FORM REGULER (Pemasangan / Pemeliharaan) ════════════ */
            <>
              <div className="form-group">
                <label>Paket Layanan <span style={{ fontSize: ".8rem", color: "var(--th-muted, #6c757d)", fontWeight: 400 }}>(otomatis dari tiket, bisa diubah)</span> *</label>
                <input className="form-control" required value={form.paket}
                  onChange={(e) => setForm((p) => ({ ...p, paket: e.target.value }))}
                  placeholder="Contoh: HOME 11 MBPS - Rp 155.000" />
              </div>

              {/* ── Field tambahan khusus Pemasangan ── */}
              {ticket?.jenis === "pemasangan" && (
                <>
                  <div style={{
                    background: "rgba(14,116,144,0.06)", border: "1px solid rgba(14,116,144,0.2)",
                    borderRadius: 10, padding: "14px 16px", marginBottom: 16,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#0e7490", fontWeight: 600, fontSize: ".9rem" }}>
                      <i className="fas fa-user" /> Data Pelanggan
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                      <div className="form-group">
                        <label>Nomor Pelanggan</label>
                        <input className="form-control" value={form.noPelanggan}
                          onChange={(e) => setForm((p) => ({ ...p, noPelanggan: e.target.value }))}
                          placeholder="TN-XXXXXX" />
                      </div>
                      <div className="form-group">
                        <label>Marketing <span style={{ fontSize: ".8rem", color: "var(--th-muted,#6c757d)", fontWeight: 400 }}>(Sales)</span></label>
                        <select className="form-control" value={form.marketing}
                          onChange={(e) => setForm((p) => ({ ...p, marketing: e.target.value }))}>
                          <option value="">-- Pilih Marketing --</option>
                          {salesList.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name}{s.staffId ? ` (${s.staffId})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(14,116,144,0.06)", border: "1px solid rgba(14,116,144,0.2)",
                    borderRadius: 10, padding: "14px 16px", marginBottom: 16,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#0e7490", fontWeight: 600, fontSize: ".9rem" }}>
                      <i className="fas fa-network-wired" /> Detail Instalasi
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                      <div className="form-group">
                        <label>ODP / Port *</label>
                        <input className="form-control" required value={form.odp}
                          onChange={(e) => setForm((p) => ({ ...p, odp: e.target.value }))}
                          placeholder="ODP-TM-001 / Port 1" />
                      </div>
                      <div className="form-group">
                        <label>Serial Number ONU/ONT</label>
                        <input className="form-control" value={form.serialONU}
                          onChange={(e) => setForm((p) => ({ ...p, serialONU: e.target.value }))}
                          placeholder="ZTEG12345678" />
                      </div>
                      <div className="form-group">
                        <label>MAC Address ONU</label>
                        <input className="form-control" value={form.macAddress}
                          onChange={(e) => setForm((p) => ({ ...p, macAddress: e.target.value }))}
                          placeholder="00:1A:2B:3C:4D:5E" />
                      </div>
                      <div className="form-group">
                        <label>Panjang Kabel (meter)</label>
                        <input className="form-control" value={form.panjangKabel}
                          onChange={(e) => setForm((p) => ({ ...p, panjangKabel: e.target.value }))}
                          placeholder="50 meter" />
                      </div>
                      <div className="form-group">
                        <label>Redaman Akhir (dBm)</label>
                        <input className="form-control" value={form.redaman}
                          onChange={(e) => setForm((p) => ({ ...p, redaman: e.target.value }))}
                          placeholder="-20 dBm" />
                      </div>
                      <div className="form-group">
                        <label>Hasil Speedtest</label>
                        <input className="form-control" value={form.hasilSpeedtest}
                          onChange={(e) => setForm((p) => ({ ...p, hasilSpeedtest: e.target.value }))}
                          placeholder="Download: 11 Mbps / Upload: 5 Mbps" />
                      </div>
                      <div className="form-group">
                        <label>Username PPPoE</label>
                        <input className="form-control" value={form.usernamePPPoE}
                          onChange={(e) => setForm((p) => ({ ...p, usernamePPPoE: e.target.value }))}
                          placeholder="pelanggan@tomihonk" />
                      </div>
                      <div className="form-group">
                        <label>Password PPPoE</label>
                        <input className="form-control" value={form.passwordPPPoE}
                          onChange={(e) => setForm((p) => ({ ...p, passwordPPPoE: e.target.value }))}
                          placeholder="*****" />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Status Koneksi</label>
                      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                        {["Normal", "Belum Normal"].map((s) => (
                          <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 400 }}>
                            <input type="radio" name="statusKoneksi" value={s} checked={form.statusKoneksi === s}
                              onChange={() => setForm((p) => ({ ...p, statusKoneksi: s }))} />
                            {s}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Foto Dokumentasi Instalasi <span style={{ fontSize: ".8rem", color: "var(--th-muted,#6c757d)", fontWeight: 400 }}>(ODP, ONU, Kabel, Speedtest, Rumah, dll)</span></label>
                    <input className="form-control" type="file" multiple accept="image/*" onChange={handleFotoInstalasiUpload} />
                    {form.fotoInstalasi.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {form.fotoInstalasi.map((foto, i) => (
                          <div key={i} style={{ position: "relative", width: 60, height: 60, border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }}>
                            <img src={foto} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button type="button" onClick={() => removeFotoInstalasi(i)} style={{ position: "absolute", top: 2, right: 2, background: "red", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", cursor: "pointer" }}><i className="fas fa-times" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Field ODP untuk non-pemasangan */}
              {ticket?.jenis !== "pemasangan" && (
                <>
                  <div className="form-group">
                    <label>ODP *</label>
                    <input className="form-control" required value={form.odp}
                      onChange={(e) => setForm((p) => ({ ...p, odp: e.target.value }))}
                      placeholder="ODP-JKT-001" />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Titik Pemasangan / Lokasi *</label>
                <input className="form-control" required value={form.titik}
                  onChange={(e) => setForm((p) => ({ ...p, titik: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Keterangan Laporan <span style={{ fontSize: ".8rem", color: "var(--th-muted, #6c757d)", fontWeight: 400 }}>(otomatis, bisa diubah)</span> *</label>
                <textarea className="form-control" required value={form.keterangan} rows={3}
                  onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value }))} />
              </div>

              {ticket?.jenis === "pemeliharaan" && (
                <>
                  <div className="form-group">
                    <label>Foto Pemeliharaan</label>
                    <input className="form-control" type="file" multiple accept="image/*" onChange={handleFotoUpload} />
                    {form.fotoPemeliharaan.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {form.fotoPemeliharaan.map((foto, i) => (
                          <div key={i} style={{ position: "relative", width: 60, height: 60, border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }}>
                            <img src={foto} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button type="button" onClick={() => removeFoto(i)} style={{ position: "absolute", top: 2, right: 2, background: "red", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", cursor: "pointer" }}><i className="fas fa-times" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>File Pemeliharaan (PDF/Doc)</label>
                    <input className="form-control" type="file" multiple accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                    {form.filePemeliharaan.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {form.filePemeliharaan.map((_, i) => (
                          <div key={i} style={{ position: "relative", width: 60, height: 60, border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#f8f9fa", fontSize: "1.5rem", color: "#6c757d" }}><i className="fas fa-file-alt" /></div>
                            <button type="button" onClick={() => removeFile(i)} style={{ position: "absolute", top: 2, right: 2, background: "red", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", cursor: "pointer" }}><i className="fas fa-times" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Rating Pelanggan *</label>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i key={n} className={`fas fa-star ${form.rating >= n ? "active" : ""}`}
                      onClick={() => setForm((p) => ({ ...p, rating: n }))} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Saran dan Kritik Pelanggan</label>
                <textarea className="form-control" value={form.saranKritik} placeholder="Opsional..."
                  onChange={(e) => setForm((p) => ({ ...p, saranKritik: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Tanda Tangan Pelanggan *</label>
                <div className="sig-wrap">
                  <canvas ref={canvasRef} className="sigpad"
                    onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
                    onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
                  <div className="sig-actions">
                    <span>Tanda tangan di area atas</span>
                    <button type="button" onClick={clearSig}><i className="fas fa-eraser" /> Hapus</button>
                  </div>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="th-btn th-btn-primary" style={{ width: "100%" }}>
            <i className="fas fa-paper-plane" /> {isSurvey ? "Kirim Laporan Survey" : "Kirim Laporan"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
