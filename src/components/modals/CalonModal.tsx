import { useState } from "react";
import { Modal, ModalHeader } from "@/components/Modal";
import { useApp } from "@/context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultPaket?: string;
}

const PAKET_OPTIONS = {
  HOME: [
    { v: "HOME 11 MBPS - Rp 155.000", l: "11 MBPS - Rp 155.000" },
    { v: "HOME 16 MBPS - Rp 175.000", l: "16 MBPS - Rp 175.000" },
    { v: "HOME 21 MBPS - Rp 195.000", l: "21 MBPS - Rp 195.000" },
    { v: "HOME 31 MBPS - Rp 215.000", l: "31 MBPS - Rp 215.000" },
  ],
  GAMERS: [
    { v: "GAMERS 40 MBPS - Rp 285.000", l: "40 MBPS - Rp 285.000" },
    { v: "GAMERS 50 MBPS - Rp 320.000", l: "50 MBPS - Rp 320.000" },
    { v: "GAMERS 75 MBPS - Rp 360.000", l: "75 MBPS - Rp 360.000" },
    { v: "GAMERS 100 MBPS - Rp 405.000", l: "100 MBPS - Rp 405.000" },
  ],
};

const TERMS = [
  "Pelanggan wajib menyediakan listrik dan tempat untuk pemasangan perangkat.",
  "Perangkat (modem/router/ONT) yang dipinjamkan adalah milik PT TNN dan wajib dijaga oleh PELANGGAN.",
  "Tagihan dibayar maksimal tanggal 20 setiap bulan, jika telat maka layanan akan diisolir.",
  "Jika perangkat rusak karena kelalaian PELANGGAN, maka biaya perbaikan/penggantian dibebankan kepada PELANGGAN.",
  "Layanan internet dapat terganggu karena gangguan teknis, cuaca, atau pemeliharaan jaringan.",
  "PELANGGAN yang ingin berhenti berlangganan wajib memberikan pemberitahuan 1 bulan sebelumnya. Jika PELANGGAN tidak melakukan pemberitahuan, maka PELANGGAN wajib membayar tagihan di bulan berjalan.",
  "Jangka waktu berlangganan minimal adalah 1 Tahun, jika PELANGGAN memutuskan langganan sebelum 1 Tahun maka PELANGGAN wajib melunasi biaya Penalti Rp.500.000,00-",
  "Layanan home dan Gamers TIDAK BOLEH diperjual belikan, jika PELANGGAN melanggar maka akan dikenakan denda Rp. 25.000.000,00-",
];

export default function CalonModal({ open, onClose, defaultPaket }: Props) {
  const { addCalon } = useApp();
  const [form, setForm] = useState({
    nik: "", nama: "", alamat: "", hp: "", email: "",
    paket: defaultPaket || "",
    sumber: "", sumberDetail: "",
    ktp: "", rumah: "",
    setuju: false,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.setuju) return;
    let sumber = form.sumber;
    if (form.sumber === "Karyawan" && form.sumberDetail) sumber = `Karyawan: ${form.sumberDetail}`;
    if (form.sumber === "Lainnya" && form.sumberDetail) sumber = `Lainnya: ${form.sumberDetail}`;
    addCalon({
      nik: form.nik, nama: form.nama, hp: form.hp, email: form.email,
      alamat: form.alamat, paket: form.paket, sumber,
      ktp: form.ktp, rumah: form.rumah,
    });
    setForm({
      nik: "", nama: "", alamat: "", hp: "", email: "",
      paket: "", sumber: "", sumberDetail: "", ktp: "", rumah: "", setuju: false,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <ModalHeader
        icon="fa-user-plus"
        title="Pendaftaran Pelanggan Baru"
        subtitle="Isi data berikut untuk mendaftar layanan"
        onClose={onClose}
      />
      <div className="modal-body">
        <form onSubmit={submit}>
          <div className="form-group">
            <label>NIK *</label>
            <input className="form-control" required pattern="\d{8,20}" maxLength={20}
              value={form.nik} onChange={(e) => set("nik", e.target.value)} placeholder="NIK KTP (8-20 digit)" />
          </div>
          <div className="form-group">
            <label>Nama Lengkap *</label>
            <input className="form-control" required maxLength={100}
              value={form.nama} onChange={(e) => set("nama", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Alamat Pemasangan *</label>
            <textarea className="form-control" required maxLength={300}
              value={form.alamat} onChange={(e) => set("alamat", e.target.value)} />
          </div>
          <div className="form-group">
            <label>No. Telepon *</label>
            <input className="form-control" required type="tel" maxLength={20}
              value={form.hp} onChange={(e) => set("hp", e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input className="form-control" required type="email" maxLength={255}
              value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Pilih Layanan Internet *</label>
            <select className="form-control" required value={form.paket}
              onChange={(e) => set("paket", e.target.value)}>
              <option value="">-- Pilih Paket --</option>
              <optgroup label="Layanan Internet - HOME">
                {PAKET_OPTIONS.HOME.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </optgroup>
              <optgroup label="Layanan Internet - GAMERS">
                {PAKET_OPTIONS.GAMERS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="form-group">
            <label>Darimana Anda tahu mengenai PT TNN? *</label>
            <select className="form-control" required value={form.sumber}
              onChange={(e) => { set("sumber", e.target.value); set("sumberDetail", ""); }}>
              <option value="">-- Pilih --</option>
              <option value="Teman">Teman atau Saudara</option>
              <option value="Karyawan">Karyawan Tomihonk</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          {(form.sumber === "Karyawan" || form.sumber === "Lainnya") && (
            <div className="form-group">
              <label>{form.sumber === "Karyawan" ? "Nama Teknisi" : "Sebutkan"} *</label>
              <input className="form-control" required maxLength={100}
                value={form.sumberDetail} onChange={(e) => set("sumberDetail", e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label>Upload KTP *</label>
            <input className="form-control" type="file" accept="image/*" required
              onChange={(e) => set("ktp", e.target.files?.[0]?.name || "")} />
          </div>
          <div className="form-group">
            <label>Upload Foto Rumah *</label>
            <input className="form-control" type="file" accept="image/*" required
              onChange={(e) => set("rumah", e.target.files?.[0]?.name || "")} />
          </div>

          <div className="terms-box" style={{
            background: "var(--th-bg)", border: "1px solid var(--th-border)",
            borderRadius: 10, padding: 16, marginBottom: 16, maxHeight: 220, overflowY: "auto",
          }}>
            <h4 style={{ color: "var(--th-primary)", marginBottom: 10, fontSize: ".95rem" }}>
              <i className="fas fa-file-contract" /> Ketentuan Layanan
            </h4>
            <ol style={{ paddingLeft: 18, fontSize: ".82rem", color: "var(--th-text)", lineHeight: 1.6 }}>
              {TERMS.map((t, i) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}
            </ol>
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <input id="setujuTerms" type="checkbox" required style={{ marginTop: 4 }}
              checked={form.setuju} onChange={(e) => set("setuju", e.target.checked)} />
            <label htmlFor="setujuTerms" style={{ fontSize: ".88rem" }}>
              Saya menyetujui seluruh Ketentuan Layanan di atas dan bersedia mematuhinya.
            </label>
          </div>

          <button type="submit" className="th-btn th-btn-primary" style={{ width: "100%" }}
            disabled={!form.setuju}>
            <i className="fas fa-paper-plane" /> Setuju & Kirim Pendaftaran
          </button>
        </form>
      </div>
    </Modal>
  );
}
