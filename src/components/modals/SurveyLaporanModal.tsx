import { useEffect, useState } from "react";
import { Modal, ModalHeader } from "@/components/Modal";
import { useApp } from "@/context/AppContext";
import type { Ticket } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  visitId?: string;
}

export default function SurveyLaporanModal({ open, onClose, ticket, visitId }: Props) {
  const { addSurveyLaporan, currentUser, paketList } = useApp();
  const [form, setForm] = useState({
    kondisiLokasi: "",
    jarakOdp: "",
    sinyal: "sedang" as "kuat" | "sedang" | "lemah",
    minat: "minat" as "sangat_minat" | "minat" | "ragu" | "tidak_minat",
    paketDiminati: "",
    catatan: "",
    fotoLokasi: [] as string[],
    rekomendasi: "layak" as "layak" | "perlu_review" | "tidak_layak",
    tglRencana: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        kondisiLokasi: "",
        jarakOdp: "",
        sinyal: "sedang",
        minat: "minat",
        paketDiminati: "",
        catatan: ticket ? `Survey lokasi untuk calon pelanggan ${ticket.pel}` : "",
        fotoLokasi: [],
        rekomendasi: "layak",
        tglRencana: "",
      });
    }
  }, [open, ticket]);

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setForm((p) => ({ ...p, fotoLokasi: [...p.fotoLokasi, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const removeFoto = (i: number) =>
    setForm((p) => ({ ...p, fotoLokasi: p.fotoLokasi.filter((_, idx) => idx !== i) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !currentUser) return;
    addSurveyLaporan({
      ticketId: ticket.id,
      visitId,
      calon: ticket.pel,
      hp: ticket.hp,
      alamat: ticket.alm,
      kondisiLokasi: form.kondisiLokasi,
      jarakOdp: form.jarakOdp,
      sinyal: form.sinyal,
      minat: form.minat,
      paketDiminati: form.paketDiminati,
      catatan: form.catatan,
      fotoLokasi: form.fotoLokasi,
      salesId: currentUser.id || "",
      salesName: currentUser.name,
      rekomendasi: form.rekomendasi,
      tglRencana: form.tglRencana,
    } as any);
    onClose();
  };

  const minatLabel: Record<string, string> = {
    sangat_minat: "Sangat Minat ⭐⭐⭐",
    minat: "Minat ⭐⭐",
    ragu: "Ragu-ragu ⭐",
    tidak_minat: "Tidak Minat ✗",
  };

  const rekomendasiColor: Record<string, string> = {
    layak: "#198754",
    perlu_review: "#fd7e14",
    tidak_layak: "#dc3545",
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader
        icon="fa-map-marked-alt"
        title="Laporan Survey Lokasi"
        subtitle={ticket ? `${ticket.id} — ${ticket.pel}` : ""}
        onClose={onClose}
      />
      <div className="modal-body">
        <form onSubmit={submit}>

          {/* ── Info Referensi Tiket ── */}
          {ticket && (
            <div style={{
              background: "linear-gradient(135deg, #e8f4fd, #f0f7ff)",
              border: "1px solid #bee3f8", borderRadius: 10,
              padding: "12px 16px", marginBottom: 20,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: ".85rem"
            }}>
              <div><span style={{ color: "#6c757d" }}>ID Tiket: </span><strong>{ticket.id}</strong></div>
              <div><span style={{ color: "#6c757d" }}>Tanggal: </span><strong>{ticket.tgl}</strong></div>
              <div><span style={{ color: "#6c757d" }}>Calon Pelanggan: </span><strong>{ticket.pel}</strong></div>
              <div><span style={{ color: "#6c757d" }}>No HP: </span><strong>{ticket.hp}</strong></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "#6c757d" }}>Alamat: </span><strong>{ticket.alm}</strong>
              </div>
            </div>
          )}

          {/* ── SEKSI 1: Kondisi Lokasi ── */}
          <div style={{ marginBottom: 8 }}>
            <h4 style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--th-primary)", borderBottom: "2px solid var(--th-primary)", paddingBottom: 6, marginBottom: 14 }}>
              <i className="fas fa-map-marker-alt" /> Kondisi Lokasi
            </h4>
          </div>

          <div className="form-group">
            <label>Kondisi Lokasi / Lingkungan *</label>
            <textarea className="form-control" required rows={2} value={form.kondisiLokasi}
              placeholder="Contoh: Lokasi berada di perumahan padat, akses jalan baik, tiang listrik tersedia"
              onChange={(e) => setForm((p) => ({ ...p, kondisiLokasi: e.target.value }))} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Estimasi Jarak ke ODP Terdekat *</label>
              <input className="form-control" required value={form.jarakOdp}
                placeholder="Contoh: ± 150 meter"
                onChange={(e) => setForm((p) => ({ ...p, jarakOdp: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Kualitas Sinyal di Lokasi *</label>
              <select className="form-control" value={form.sinyal}
                onChange={(e) => setForm((p) => ({ ...p, sinyal: e.target.value as any }))}>
                <option value="kuat">🟢 Kuat</option>
                <option value="sedang">🟡 Sedang</option>
                <option value="lemah">🔴 Lemah</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Foto Dokumentasi Lokasi</label>
            <input className="form-control" type="file" multiple accept="image/*" onChange={handleFotoUpload} />
            {form.fotoLokasi.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {form.fotoLokasi.map((foto, i) => (
                  <div key={i} style={{ position: "relative", width: 70, height: 70, border: "1px solid #ccc", borderRadius: 6, overflow: "hidden" }}>
                    <img src={foto} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => removeFoto(i)}
                      style={{ position: "absolute", top: 2, right: 2, background: "red", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", cursor: "pointer" }}>
                      <i className="fas fa-times" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SEKSI 2: Info Calon Pelanggan ── */}
          <div style={{ margin: "20px 0 8px" }}>
            <h4 style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--th-primary)", borderBottom: "2px solid var(--th-primary)", paddingBottom: 6, marginBottom: 14 }}>
              <i className="fas fa-user" /> Info Calon Pelanggan
            </h4>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Minat Berlangganan *</label>
              <select className="form-control" value={form.minat}
                onChange={(e) => setForm((p) => ({ ...p, minat: e.target.value as any }))}>
                {Object.entries(minatLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Paket yang Diminati</label>
              <select className="form-control" value={form.paketDiminati}
                onChange={(e) => setForm((p) => ({ ...p, paketDiminati: e.target.value }))}>
                <option value="">-- Belum ditentukan --</option>
                {paketList.map((p) => (
                  <option key={p.id} value={p.nama}>{p.nama} ({p.speed} Mbps)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Catatan Survey *</label>
            <textarea className="form-control" required rows={3} value={form.catatan}
              onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))} />
          </div>

          {/* ── SEKSI 3: Rekomendasi & Tindak Lanjut ── */}
          <div style={{ margin: "20px 0 8px" }}>
            <h4 style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--th-primary)", borderBottom: "2px solid var(--th-primary)", paddingBottom: 6, marginBottom: 14 }}>
              <i className="fas fa-clipboard-check" /> Rekomendasi & Tindak Lanjut
            </h4>
          </div>

          <div className="form-group">
            <label>Rekomendasi Pemasangan *</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(["layak", "perlu_review", "tidak_layak"] as const).map((r) => (
                <label key={r} style={{
                  display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  padding: "8px 16px", borderRadius: 8, border: `2px solid ${form.rekomendasi === r ? rekomendasiColor[r] : "#dee2e6"}`,
                  background: form.rekomendasi === r ? `${rekomendasiColor[r]}18` : "#fff",
                  fontWeight: form.rekomendasi === r ? 600 : 400, fontSize: ".88rem",
                  color: form.rekomendasi === r ? rekomendasiColor[r] : "#495057",
                  transition: "all .2s",
                }}>
                  <input type="radio" name="rekomendasi" value={r} checked={form.rekomendasi === r}
                    onChange={() => setForm((p) => ({ ...p, rekomendasi: r }))}
                    style={{ display: "none" }} />
                  <i className={`fas ${r === "layak" ? "fa-check-circle" : r === "perlu_review" ? "fa-exclamation-circle" : "fa-times-circle"}`} />
                  {r === "layak" ? "Layak Dipasang" : r === "perlu_review" ? "Perlu Review Lanjut" : "Tidak Layak"}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Rencana Tanggal Tindak Lanjut</label>
            <input className="form-control" type="date" value={form.tglRencana}
              onChange={(e) => setForm((p) => ({ ...p, tglRencana: e.target.value }))} />
          </div>


          <button type="submit" className="th-btn th-btn-primary" style={{ width: "100%" }}>
            <i className="fas fa-paper-plane" /> Kirim Laporan Survey
          </button>
        </form>
      </div>
    </Modal>
  );
}
