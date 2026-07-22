export type Role = "admin" | "teknisi" | "sales";

export type CurrentUser = {
  role: Role;
  name: string;
  id: string | null;
};

export type Customer = { n: string; p: string; s: "aktif" | "pending" | "nonaktif" };
export type Teknisi = { id: string; name: string };

export type Paket = {
  id: number | string;
  nama: string;
  speed: number;
  harga: number;
  kat: string;
  desc: string;
};

export type Ticket = {
  id: string;
  pel: string;
  hp: string;
  alm: string;
  jenis: "pemasangan" | "pemeliharaan" | "survey" | "dismantle";
  mas: string;
  pri: "Rendah" | "Sedang" | "Tinggi";
  st: "pending" | "proses" | "selesai";
  tek: string;
  tgl: string;
  // Field khusus survey calon pelanggan
  tglSurvey?: string;    // Tanggal rencana survey
};

export type Calon = {
  id: number | string;
  nik?: string;
  nama: string;
  hp: string;
  email?: string;
  alamat: string;
  paket: string;
  sumber?: string;
  ktp?: string;
  rumah?: string;
  tgl: string;
  status: "baru" | "diproses" | "selesai";
};

export type Keluhan = {
  id: number | string;
  tgl: string;
  nama: string;
  email: string;
  hp: string;
  pesan: string;
  status: "baru" | "ditangani" | "selesai";
};

export type Laporan = {
  id: number | string;
  jenis: "pemasangan" | "pemeliharaan" | "survey" | "dismantle";
  tgl: string;
  ticketId: string;
  pel: string;
  paket: string;
  odp: string;
  titik: string;
  keterangan: string;
  rating: number;
  ttd: string;
  tek: string;
  tekName: string;
  saranKritik?: string;
  fotoPemeliharaan?: string[];
  filePemeliharaan?: string[];
  // ── Field tambahan untuk BERITA ACARA INSTALASI ──
  hp?: string;            // Nomor HP pelanggan
  noPelanggan?: string;   // Nomor Pelanggan
  marketing?: string;     // Marketing / Sales yang mereferensikan
  serialONU?: string;     // Serial Number ONU/ONT
  macAddress?: string;    // MAC Address ONU
  panjangKabel?: string;  // Panjang kabel (meter)
  redaman?: string;       // Redaman akhir (dBm)
  usernamePPPoE?: string; // Username PPPoE
  passwordPPPoE?: string; // Password PPPoE
  hasilSpeedtest?: string;// Hasil speedtest
  statusKoneksi?: string; // Status koneksi: "Normal" | "Belum Normal"
  fotoInstalasi?: string[];// Foto-foto dokumentasi instalasi
};

export type GalleryItem = {
  id: number | string;
  title: string;
  img: string;
};

export type Account = {
  id: number | string;
  username: string;
  password: string;
  name: string;
  role: Role;
  staffId?: string;
};

export type SalesVisit = {
  id: string;
  ticketId?: string;       // Tiket asal (jika dibuat dari tiket survey)
  calon: string;
  hp: string;
  alamat: string;
  tujuan: string;
  catatan: string;
  st: "dijadwalkan" | "dikunjungi" | "selesai";
  hasil: "" | "tertarik" | "closing" | "menolak";
  sales: string;
  salesName: string;
  tgl: string;
};

export type NotifTarget = "admin" | "tech" | "sales";
export type Notif = {
  id: number;
  title: string;
  desc: string;
  time: number;
  read: boolean;
};

export type SurveyLaporan = {
  id: number | string;
  ticketId: string;
  visitId?: string;
  tgl: string;
  calon: string;
  hp: string;
  alamat: string;
  // Info lokasi
  kondisiLokasi: string;        // kondisi lokasi / lingkungan
  jarakOdp: string;             // estimasi jarak ke ODP
  sinyal: "kuat" | "sedang" | "lemah"; // kualitas sinyal
  // Info calon pelanggan
  minat: "sangat_minat" | "minat" | "ragu" | "tidak_minat";
  paketDiminati: string;
  catatan: string;
  // Foto dokumentasi
  fotoLokasi: string[];
  // Info petugas
  salesId: string;
  salesName: string;
  // Rekomendasi
  rekomendasi: "layak" | "perlu_review" | "tidak_layak";
  tglRencana: string;           // rencana tindak lanjut
  ttd?: string;                 // tanda tangan calon pelanggan (base64)
};
