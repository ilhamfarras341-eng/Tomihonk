import jsPDF from "jspdf";
import type { Laporan, SurveyLaporan } from "@/lib/types";
import logoUrl from "@/assets/logo.png";

const C = {
  primary: [255, 255, 255] as [number, number, number],
  amber: [255, 255, 255] as [number, number, number],
  blue: [255, 255, 255] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  dark: [30, 30, 30] as [number, number, number],
  light: [245, 245, 245] as [number, number, number],
  star: [30, 30, 30] as [number, number, number],
  green: [30, 30, 30] as [number, number, number],
  orange: [80, 80, 80] as [number, number, number],
  red: [30, 30, 30] as [number, number, number],
};

/** Garis horizontal tipis */
function hLine(doc: jsPDF, y: number, margin = 14) {
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 210 - margin, y);
}

/** Label abu + nilai hitam, satu baris */
function fieldRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  lx = 14,
  vx = 72,
  maxW = 120,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.gray);
  doc.text(label, lx, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.dark);
  const lines = doc.splitTextToSize(value || "-", maxW);
  doc.text(lines, vx, y);
  return lines.length > 1 ? (lines.length - 1) * 3.8 : 0; // extra height
}

/** Judul seksi (hitam-putih) */
function sectionTitle(
  doc: jsPDF,
  label: string,
  y: number,
  _bg: [number, number, number],
  _fg: [number, number, number] = C.white,
) {
  // Background abu-abu muda, teks hitam
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(14, y, 182, 6, 1.5, 1.5, "F");
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, 6, 1.5, 1.5, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.dark);
  doc.text(label, 18, y + 4.2);
}

// ─── Header Kop Surat ───────────────────────────────────────────────────────
function drawHeader(
  doc: jsPDF,
  jenisDoc: string,
  noTiket: string,
  tgl: string,
  _accentColor: [number, number, number],
) {
  // Border header hitam-putih (tanpa background warna)
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.8);
  doc.rect(0, 0, 210, 38, "S");

  // Logo (tanpa background berwarna)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(5, 4, 28, 30, 3, 3, "F");
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(5, 4, 28, 30, 3, 3, "S");
  try {
    doc.addImage(logoUrl, "PNG", 6, 5, 26, 28);
  } catch (_) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.dark);
    doc.text("TNN", 12, 21);
  }

  // Nama perusahaan
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text("PT Tomihonk Network Nusantara", 37, 13);

  // Alamat
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text("Jl. Raya Tomohon · Telp: (0431) 000-000 · tomihonk.id", 37, 19.5);

  // Garis pemisah
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.25);
  doc.line(37, 23, 196, 23);

  // Judul dokumen
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text(jenisDoc, 37, 29.5);

  // Sub-judul (no tiket + tgl)
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text(`No. Tiket: ${noTiket}   |   Tanggal: ${tgl}`, 37, 35.5);
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, page: number) {
  const h = doc.internal.pageSize.height;
  // Footer hitam-putih: hanya garis atas dan teks
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(14, h - 12, 196, h - 12);
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Tomihonk Internet Service Provider — Dokumen resmi, harap disimpan.",
    14,
    h - 4,
  );
  doc.text(`Halaman ${page}`, 196, h - 4, { align: "right" });
}

// ─── Blok tanda tangan (dipakai di semua jenis) ─────────────────────────────
function drawSignBlock(
  doc: jsPDF,
  y: number,
  leftLabel: string,
  leftName: string,
  rightLabel: string,
  rightName: string,
  ttdBase64?: string,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.dark);
  doc.text(leftLabel, 14, y);
  doc.text(rightLabel, 112, y);
  y += 4;

  // Kotak ttd kiri
  if (ttdBase64) {
    try {
      doc.addImage(ttdBase64, "PNG", 14, y, 68, 30);
    } catch (_) {
      doc.setDrawColor(180, 180, 180);
      doc.rect(14, y, 68, 30);
    }
  } else {
    doc.setDrawColor(180, 180, 180);
    doc.rect(14, y, 68, 30);
  }
  // Kotak ttd kanan (teknisi/sales)
  doc.setDrawColor(180, 180, 180);
  doc.rect(112, y, 68, 30);

  y += 33;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...C.gray);
  doc.text(leftName, 48, y, { align: "center" });
  doc.text(rightName, 146, y, { align: "center" });

  return y + 4;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. BERITA ACARA INSTALASI — PEMASANGAN BARU
//    Template sesuai LaporanInstalasi.docx PT Tomihonk Network Nusantara
// ══════════════════════════════════════════════════════════════════════════════
export function downloadPdfPemasangan(l: Laporan) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const PW = 297; // page width landscape
  const PH = 210; // page height landscape
  const ML = 14;  // margin left
  const MR = 14;  // margin right
  const CW = PW - ML - MR; // content width = 269

  // ── KOP SURAT (layout sesuai template resmi) ──────────────────────────────
  // Logo di kiri atas (tanpa border kotak)
  try {
    doc.addImage(logoUrl, "PNG", ML, 5, 22, 22);
  } catch (_) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.dark);
    doc.text("TNN", ML + 6, 18);
  }

  // Tengah area kanan logo
  const hdrCX = (ML + 24 + (PW - MR)) / 2;

  // Nama perusahaan (tengah, bold, uppercase)
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text("PT. TOMIHONK NETWORK NUSANTARA", hdrCX, 11, { align: "center" });

  // Alamat baris 1 (tengah)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text("JL. ProjoSumarto I Desa Kaligayam Rt.07 Rw.02", hdrCX, 16.5, { align: "center" });

  // Alamat baris 2 (tengah)
  doc.text("Kec.Talang Kab.Tegal", hdrCX, 21, { align: "center" });

  // Web & Telp (tengah)
  doc.text("Web : info@tomihonk.co.id  Telp : 085138222298", hdrCX, 25.5, { align: "center" });

  // ── Garis ganda pemisah kop ───────────────────────────────────────────────
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.8);
  doc.line(ML, 30, PW - MR, 30);
  doc.setLineWidth(0.3);
  doc.line(ML, 32, PW - MR, 32);

  // ── Judul dokumen (tengah, berwarna biru tua) ─────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 139);
  doc.text("BERITA ACARA AKTIVASI", PW / 2, 39, { align: "center" });

  // Sub-judul (tengah, hitam, bold)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.dark);
  doc.text("LAYANAN INTERNET PT TOMIHONK NETWORK NUSANTARA", PW / 2, 45, { align: "center" });

  // Intro text (satu baris penuh)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...C.gray);
  const introText = "Dokumen ini digunakan sebagai bukti resmi bahwa layanan internet pelanggan telah berhasil diaktivasi dan dapat digunakan dengan normal.";
  const introLines = doc.splitTextToSize(introText, CW);
  doc.text(introLines, ML, 51);

  let y = 51 + introLines.length * 4.5 + 4;

  // ── Helper: row tabel 2-kolom ──────────────────────────────────────────────
  function tableRow2(
    label: string,
    value: string,
    rowY: number,
    startX: number,
    colW: number,
    labelW = 55,
    shade = false,
  ) {
    const rowH = 5.5;
    if (shade) {
      doc.setFillColor(245, 245, 245);
      doc.rect(startX, rowY, colW, rowH, "F");
    }
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(startX, rowY, labelW, rowH);
    doc.rect(startX + labelW, rowY, colW - labelW, rowH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.gray);
    doc.text(label, startX + 2, rowY + 3.8);
    doc.text(":", startX + labelW - 5, rowY + 3.8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.dark);
    const valLines = doc.splitTextToSize(value || "-", colW - labelW - 6);
    doc.text(valLines, startX + labelW + 3, rowY + 3.8);
    return rowH;
  }

  // ── Helper: section header bar ─────────────────────────────────────────────
  function secHdr(label: string, secY: number, startX: number, w: number) {
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(startX, secY, w, 6, 1.5, 1.5, "F");
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.roundedRect(startX, secY, w, 6, 1.5, 1.5, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.dark);
    doc.text(label, startX + 3, secY + 4.2);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LAYOUT 2 KOLOM: KIRI = Data Pelanggan | KANAN = Detail Instalasi
  // ══════════════════════════════════════════════════════════════════════════
  const GAP = 6;          // jarak antar kolom
  const colW = (CW - GAP) / 2; // lebar masing-masing kolom ~131mm
  const leftX = ML;
  const rightX = ML + colW + GAP;
  const labelW = 50;      // lebar kolom label dalam tabel

  // ── Kolom Kiri: DATA PELANGGAN ────────────────────────────────────────────
  secHdr("1.  DATA PELANGGAN", y, leftX, colW);
  let yL = y + 6;

  const dataRows: [string, string][] = [
    ["Nama Pelanggan", l.pel],
    ["No. Pelanggan", l.noPelanggan || "-"],
    ["Nomor HP", l.hp || "-"],
    ["Alamat Instalasi", l.titik],
    ["Paket Internet", l.paket],
    ["Tgl. Instalasi", l.tgl],
    ["Marketing", l.marketing || "-"],
    ["Teknisi Instalasi", l.tekName],
  ];
  dataRows.forEach(([lbl, val], i) => {
    yL += tableRow2(lbl, val, yL, leftX, colW, labelW, i % 2 === 1);
  });

  // ── Kolom Kanan: DETAIL INSTALASI ─────────────────────────────────────────
  secHdr("2.  DETAIL INSTALASI", y, rightX, colW);
  let yR = y + 6;

  const detailRows: [string, string][] = [
    ["ODP / Port", l.odp || "-"],
    ["Serial ONU/ONT", l.serialONU || "-"],
    ["MAC Address ONU", l.macAddress || "-"],
    ["Panjang Kabel", l.panjangKabel || "-"],
    ["Redaman Akhir", l.redaman || "-"],
    ["Username PPPoE", l.usernamePPPoE || "-"],
    ["Password PPPoE", l.passwordPPPoE || "-"],
    ["Hasil Speedtest", l.hasilSpeedtest || "-"],
  ];
  detailRows.forEach(([lbl, val], i) => {
    yR += tableRow2(lbl, val, yR, rightX, colW, labelW, i % 2 === 1);
  });

  // Status Koneksi (di kolom kanan, baris terakhir)
  const statusVal = l.statusKoneksi || "Normal";
  const shadeStatus = detailRows.length % 2 === 1;
  if (shadeStatus) { doc.setFillColor(245, 245, 245); doc.rect(rightX, yR, colW, 5.5, "F"); }
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
  doc.rect(rightX, yR, labelW, 5.5);
  doc.rect(rightX + labelW, yR, colW - labelW, 5.5);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.gray);
  doc.text("Status Koneksi", rightX + 2, yR + 3.8);
  doc.text(":", rightX + labelW - 5, yR + 3.8);
  doc.setDrawColor(100, 100, 100); doc.setLineWidth(0.4);
  doc.roundedRect(rightX + labelW + 3, yR + 0.8, 28, 4, 1, 1, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...C.dark);
  doc.text(statusVal, rightX + labelW + 17, yR + 3.8, { align: "center" });
  yR += 5.5;

  // Keterangan tambahan (kanan, multi-baris)
  const ketShade = (detailRows.length + 1) % 2 === 1;
  const ketH = 9;
  if (ketShade) { doc.setFillColor(245, 245, 245); doc.rect(rightX, yR, colW, ketH, "F"); }
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
  doc.rect(rightX, yR, labelW, ketH);
  doc.rect(rightX + labelW, yR, colW - labelW, ketH);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.gray);
  doc.text("Keterangan", rightX + 2, yR + 3.8);
  doc.text(":", rightX + labelW - 5, yR + 3.8);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  const ketLines2 = doc.splitTextToSize(l.keterangan || "-", colW - labelW - 6);
  doc.text(ketLines2, rightX + labelW + 3, yR + 3.8);
  yR += ketH;

  // Lanjutkan y dari kolom yang lebih panjang
  y = Math.max(yL, yR) + 4;

  // ══════════════════════════════════════════════════════════════════════════
  // SEKSI 3: CHECKLIST PEKERJAAN INSTALASI (lebar penuh, 2 kolom checklist)
  // ══════════════════════════════════════════════════════════════════════════
  secHdr("3.  CHECKLIST PEKERJAAN INSTALASI", y, ML, CW);
  y += 6;

  const checklist = [
    "Penarikan kabel sudah rapi",
    "Clamp dan aksesoris terpasang dengan baik",
    "ONU/ONT sudah aktif",
    "Internet sudah bisa digunakan",
    "Speedtest normal",
    "Pelanggan sudah menerima informasi WiFi",
    "Pelanggan sudah menerima penjelasan pembayaran",
    "Dokumentasi instalasi sudah lengkap",
  ];

  // 2 kolom checklist
  const chkColW = (CW - GAP) / 2;
  const chkCheckW = 14;
  const chkItemW = chkColW - chkCheckW;

  // Header checklist (2 kolom)
  [ML, ML + chkColW + GAP].forEach((cx) => {
    doc.setFillColor(230, 230, 230);
    doc.rect(cx, y, chkItemW, 5, "F");
    doc.rect(cx + chkItemW, y, chkCheckW, 5, "F");
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
    doc.rect(cx, y, chkItemW, 5);
    doc.rect(cx + chkItemW, y, chkCheckW, 5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.dark);
    doc.text("PEKERJAAN", cx + 2, y + 3.5);
    doc.text("CHECK", cx + chkItemW + chkCheckW / 2, y + 3.5, { align: "center" });
  });
  y += 5;

  const half = Math.ceil(checklist.length / 2);
  const leftItems = checklist.slice(0, half);
  const rightItems = checklist.slice(half);
  const maxItems = Math.max(leftItems.length, rightItems.length);

  for (let i = 0; i < maxItems; i++) {
    const shade = i % 2 === 1;
    [[leftItems[i], ML], [rightItems[i], ML + chkColW + GAP]].forEach(([item, cx]) => {
      if (!item) return;
      const cxN = cx as number;
      if (shade) { doc.setFillColor(245, 245, 245); doc.rect(cxN, y, chkItemW, 5, "F"); doc.rect(cxN + chkItemW, y, chkCheckW, 5, "F"); }
      doc.setDrawColor(200, 200, 200);
      doc.rect(cxN, y, chkItemW, 5);
      doc.rect(cxN + chkItemW, y, chkCheckW, 5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...C.dark);
      doc.text(item as string, cxN + 2, y + 3.5);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.green);
      doc.text("[✓]", cxN + chkItemW + chkCheckW / 2, y + 3.5, { align: "center" });
    });
    y += 5;
  }
  y += 3;

  // ══════════════════════════════════════════════════════════════════════════
  // SEKSI 4: DOKUMEN WAJIB LAMPIR (checklist)
  // ══════════════════════════════════════════════════════════════════════════
  secHdr("4.  DOKUMEN WAJIB LAMPIR", y, ML, CW);
  y += 8;

  const dokumenList = [
    "Berita Acara Survey",
    "Berita Acara Instalasi",
    "Foto Speedtest",
    "Foto ONU/ONT",
    "Foto Rumah Pelanggan",
    "Kontrak Berlangganan",
    "Foto Tanda Tangan Pelanggan",
  ];

  // 2 kolom dokumen checklist
  const dkColW = (CW - 6) / 2;
  const dkLeft  = dokumenList.slice(0, Math.ceil(dokumenList.length / 2));
  const dkRight = dokumenList.slice(Math.ceil(dokumenList.length / 2));
  const dkMax   = Math.max(dkLeft.length, dkRight.length);
  const dkRowH  = 6;

  for (let i = 0; i < dkMax; i++) {
    [[dkLeft[i], ML], [dkRight[i], ML + dkColW + 6]].forEach(([item, cx]) => {
      if (!item) return;
      const cxN = cx as number;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      // kotak checkbox
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.4);
      doc.rect(cxN, y + 0.5, 3.5, 3.5);
      // teks
      doc.text(item as string, cxN + 6, y + 3.8);
    });
    y += dkRowH;
  }
  y += 6;

  // ══════════════════════════════════════════════════════════════════════════
  // SEKSI 5: CATATAN AKTIVASI
  // ══════════════════════════════════════════════════════════════════════════
  secHdr("5.  CATATAN AKTIVASI", y, ML, CW);
  y += 10;

  // 3 baris kosong untuk catatan
  for (let i = 0; i < 3; i++) {
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.4);
    doc.line(ML, y, ML + CW, y);
    y += 8;
  }
  y += 6;



  // ── Disclaimer ────────────────────────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(ML, y, CW, 8, 2, 2, "F");
  doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.5);
  doc.roundedRect(ML, y, CW, 8, 2, 2, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...C.dark);
  const disclaimer = "Dokumen Berita Acara Instalasi ini WAJIB dilampirkan pada ticketing instalasi pelanggan dan menjadi syarat proses aktivasi layanan internet.";
  const disLines = doc.splitTextToSize(disclaimer, CW - 8);
  doc.text(disLines, ML + 4, y + 3.5);
  y += 8 + 5;

  // ══════════════════════════════════════════════════════════════════════════
  // SEKSI 5: TANDA TANGAN (3 kolom lebar penuh)
  // ══════════════════════════════════════════════════════════════════════════
  if (y + 45 > PH - 15) { doc.addPage(); y = 15; }

  secHdr("6.  TANDA TANGAN", y, ML, CW);
  y += 7;

  const colW3 = CW / 3;
  const labels3 = ["Pelanggan", "Teknisi", "Leader Team Area"];
  const names3 = [l.pel, l.tekName, ""];

  labels3.forEach((lbl, i) => {
    const cx = ML + i * colW3;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.dark);
    doc.text(lbl, cx + colW3 / 2, y, { align: "center" });
  });
  y += 4;

  labels3.forEach((_, i) => {
    const cx = ML + i * colW3;
    if (i === 0 && l.ttd) {
      try { doc.addImage(l.ttd, "PNG", cx + 4, y, colW3 - 8, 28); }
      catch (_) { doc.setDrawColor(180, 180, 180); doc.rect(cx + 4, y, colW3 - 8, 28); }
    } else {
      doc.setDrawColor(180, 180, 180);
      doc.rect(cx + 4, y, colW3 - 8, 28);
    }
  });
  y += 31;

  labels3.forEach((_, i) => {
    const cx = ML + i * colW3;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...C.gray);
    doc.text(`(${names3[i] || ".................."})`, cx + colW3 / 2, y, { align: "center" });
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.3);
  doc.line(ML, PH - 10, PW - MR, PH - 10);
  doc.setFont("helvetica", "italic"); doc.setFontSize(6.5); doc.setTextColor(140, 140, 140);
  doc.text("PT Tomihonk Network Nusantara — Dokumen Berita Acara Instalasi — Harap disimpan sebagai arsip.", ML, PH - 4);
  doc.text("Hal. 1", PW - MR, PH - 4, { align: "right" });

  doc.save(`BeritaAcara_Instalasi_${l.ticketId}_${l.tgl}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. LAPORAN INSTALASI — PEMELIHARAAN
//    Field: paket, odp, titik, keterangan, saranKritik,
//           fotoPemeliharaan, filePemeliharaan, rating, ttd
//    (dari LaporanModal.tsx — jenis "pemeliharaan")
// ══════════════════════════════════════════════════════════════════════════════
export function downloadPdfPemeliharaan(l: Laporan) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(doc, "LAPORAN INSTALASI — PEMELIHARAAN", l.ticketId, l.tgl, C.amber);

  let y = 46;

  // ── Ringkasan Tiket (hitam-putih) ─────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, y, 182, 28, 3, 3, "F");
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, 28, 3, 3, "S");

  doc.setFont("helvetica", "bold"); doc.setTextColor(...C.dark);
  doc.setFontSize(8);
  doc.text("Ringkasan Tiket", 18, y + 6);

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
  doc.text("ID Tiket", 18, y + 13);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  doc.text(l.ticketId, 42, y + 13);

  doc.setFont("helvetica", "bold"); doc.setTextColor(...C.gray);
  doc.text("Jenis", 18, y + 20);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  doc.text("Pemeliharaan / Perbaikan", 42, y + 20);

  doc.setFont("helvetica", "bold"); doc.setTextColor(...C.gray);
  doc.text("Pelanggan", 108, y + 13);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  doc.text(l.pel, 132, y + 13);

  doc.setFont("helvetica", "bold"); doc.setTextColor(...C.gray);
  doc.text("Teknisi", 108, y + 20);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  doc.text(l.tekName, 132, y + 20);
  y += 34;

  // ── SEKSI 1: Paket Layanan ────────────────────────────────────────────────
  sectionTitle(doc, "PAKET LAYANAN", y, C.amber);
  y += 11;
  const e1 = fieldRow(doc, "Paket Internet", l.paket, y);
  y += 7 + e1;
  hLine(doc, y); y += 7;

  // ── SEKSI 2: Informasi Pekerjaan ─────────────────────────────────────────
  sectionTitle(doc, "INFORMASI PEKERJAAN", y, C.amber);
  y += 11;
  fieldRow(doc, "ODP / Port", l.odp, y); y += 7;
  const e2 = fieldRow(doc, "Titik / Lokasi", l.titik, y);
  y += 7 + e2;
  hLine(doc, y); y += 7;

  // ── SEKSI 3: Keterangan Pekerjaan ─────────────────────────────────────────
  sectionTitle(doc, "KETERANGAN PEKERJAAN", y, C.amber);
  y += 11;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.dark);
  const ketLines = doc.splitTextToSize(l.keterangan || "-", 178);
  doc.text(ketLines, 14, y);
  y += ketLines.length * 4.8 + 5;
  hLine(doc, y); y += 7;

  // ── SEKSI 4: Saran & Kritik Pelanggan ────────────────────────────────────
  // (textarea "Saran dan Kritik Pelanggan" dari LaporanModal pemeliharaan)
  sectionTitle(doc, "SARAN & KRITIK PELANGGAN", y, C.amber);
  y += 11;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.dark);
  const sarLines = doc.splitTextToSize(l.saranKritik || "(tidak ada)", 178);
  doc.text(sarLines, 14, y);
  y += sarLines.length * 4.8 + 5;
  hLine(doc, y); y += 7;

  // ── SEKSI 5: Foto Pemeliharaan ────────────────────────────────────────────
  // (input "Foto Pemeliharaan" dari LaporanModal pemeliharaan)
  sectionTitle(doc, "FOTO PEMELIHARAAN", y, C.amber);
  y += 11;
  const fotos = l.fotoPemeliharaan ?? [];
  if (fotos.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.gray);
    doc.text("Tidak ada foto pemeliharaan", 14, y);
    y += 7;
  } else {
    let fx = 14;
    const fSize = 38;
    fotos.slice(0, 4).forEach((src, i) => {
      try {
        doc.addImage(src, "JPEG", fx + i * (fSize + 4), y, fSize, fSize);
        // border
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(fx + i * (fSize + 4), y, fSize, fSize, 2, 2, "S");
      } catch (_) {
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(fx + i * (fSize + 4), y, fSize, fSize, 2, 2, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.gray);
        doc.text("Foto", fx + i * (fSize + 4) + fSize / 2, y + fSize / 2, { align: "center" });
      }
    });
    y += fSize + 5;
    if (fotos.length > 4) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.gray);
      doc.text(`... dan ${fotos.length - 4} foto lainnya`, 14, y);
      y += 6;
    }
  }
  hLine(doc, y); y += 7;

  // ── SEKSI 6: Informasi Teknisi ────────────────────────────────────────────
  sectionTitle(doc, "INFORMASI TEKNISI", y, C.amber);
  y += 11;
  fieldRow(doc, "Nama Teknisi", l.tekName, y); y += 7;
  fieldRow(doc, "ID Teknisi", l.tek, y); y += 7;
  fieldRow(doc, "Tanggal", l.tgl, y); y += 7;
  hLine(doc, y); y += 7;

  // ── SEKSI 7: Rating Pelanggan ─────────────────────────────────────────────
  sectionTitle(doc, "RATING PELANGGAN", y, C.amber);
  y += 11;
  const stars = "★".repeat(l.rating) + "☆".repeat(5 - l.rating);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(...C.star);
  doc.text(stars, 14, y);
  doc.setFontSize(8.5);
  doc.setTextColor(...C.gray);
  doc.text(`(${l.rating} / 5)`, 52, y);
  y += 10;
  hLine(doc, y); y += 8;

  // ── Blok Tanda Tangan ─────────────────────────────────────────────────────
  sectionTitle(doc, "TANDA TANGAN", y, C.amber);
  y += 10;
  drawSignBlock(doc, y, "Tanda Tangan Pelanggan", l.pel, "Tanda Tangan Teknisi", l.tekName, l.ttd);

  drawFooter(doc, 1);
  doc.save(`Laporan_Pemeliharaan_${l.ticketId}_${l.tgl}.pdf`);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. LAPORAN SURVEY — SURVEY CALON PELANGGAN
//    Field: kondisiLokasi, jarakOdp, sinyal, minat, paketDiminati,
//           catatan, fotoLokasi, rekomendasi, tglRencana, ttd, salesName
//    (dari SurveyLaporanModal.tsx)
// ══════════════════════════════════════════════════════════════════════════════
export function downloadPdfSurvey(l: SurveyLaporan) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Label helper ──
  const minatLabel: Record<string, string> = {
    sangat_minat: "Sangat Minat",
    minat: "Minat",
    ragu: "Ragu-ragu",
    tidak_minat: "Tidak Minat",
  };
  const rekLabel: Record<string, string> = {
    layak: "Layak Dipasang",
    perlu_review: "Perlu Review Lanjut",
    tidak_layak: "Tidak Layak",
  };
  const sinyalLabel: Record<string, string> = {
    kuat: "Kuat",
    sedang: "Sedang",
    lemah: "Lemah",
  };
  const rekColors: Record<string, [number, number, number]> = {
    layak: C.green,
    perlu_review: C.orange,
    tidak_layak: C.red,
  };

  drawHeader(doc, "LAPORAN SURVEY — CALON PELANGGAN", l.ticketId, l.tgl, C.blue);

  let y = 46;

  // ── Referensi Tiket (hitam-putih) ─────────────────────────────────────────
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, y, 182, 34, 3, 3, "F");
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, 34, 3, 3, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.dark);
  doc.text("Referensi Tiket", 18, y + 6);

  const refItems = [
    ["ID Tiket", l.ticketId, 18, 42],
    ["Tanggal", l.tgl, 18, 42],
    ["Calon Pelanggan", l.calon, 108, 140],
    ["No HP", l.hp, 108, 140],
  ];
  let ry = y + 13;
  refItems.forEach(([lb, val, lx, vx], i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
    doc.text(String(lb), col === 0 ? 18 : 108, ry + row * 7);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
    doc.text(String(val || "-"), col === 0 ? Number(lx) : Number(vx), ry + row * 7);
  });
  // Alamat baris penuh
  doc.setFont("helvetica", "bold"); doc.setTextColor(...C.gray);
  doc.text("Alamat", 18, y + 28);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  const almLines = doc.splitTextToSize(l.alamat || "-", 130);
  doc.text(almLines, 42, y + 28);
  y += 40;

  // ═══════════════════════════════════════════════════════
  // SEKSI 1: Kondisi Lokasi
  // (dari SurveyLaporanModal — Seksi "Kondisi Lokasi")
  // ═══════════════════════════════════════════════════════
  sectionTitle(doc, "KONDISI LOKASI", y, C.blue);
  y += 11;

  // Kondisi Lokasi / Lingkungan (textarea)
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
  doc.text("Kondisi Lokasi / Lingkungan", 14, y);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  const kondLines = doc.splitTextToSize(l.kondisiLokasi || "-", 178);
  doc.text(kondLines, 14, y);
  y += kondLines.length * 4.8 + 4;

  // Jarak ODP + Kualitas Sinyal (2 kolom)
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
  doc.text("Estimasi Jarak ke ODP", 14, y);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  doc.text(l.jarakOdp || "-", 70, y);

  doc.setFont("helvetica", "bold"); doc.setTextColor(...C.gray);
  doc.text("Kualitas Sinyal", 108, y);
  // Badge sinyal (hitam-putih: border saja)
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.4);
  doc.roundedRect(136, y - 4.5, 32, 6.5, 2, 2, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.dark);
  doc.text(sinyalLabel[l.sinyal] ?? l.sinyal, 152, y, { align: "center" });
  y += 8;

  hLine(doc, y); y += 7;

  // ═══════════════════════════════════════════════════════
  // SEKSI 2: Foto Dokumentasi Lokasi
  // (dari SurveyLaporanModal — input "Foto Dokumentasi Lokasi")
  // ═══════════════════════════════════════════════════════
  sectionTitle(doc, "FOTO DOKUMENTASI LOKASI", y, C.blue);
  y += 11;
  const fotoLokasi = l.fotoLokasi ?? [];
  if (fotoLokasi.length === 0) {
    doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
    doc.text("Tidak ada foto lokasi", 14, y);
    y += 7;
  } else {
    const fSize = 38;
    fotoLokasi.slice(0, 4).forEach((src, i) => {
      try {
        doc.addImage(src, "JPEG", 14 + i * (fSize + 4), y, fSize, fSize);
        doc.setDrawColor(200, 200, 200);
        doc.roundedRect(14 + i * (fSize + 4), y, fSize, fSize, 2, 2, "S");
      } catch (_) {
        doc.setFillColor(230, 230, 230);
        doc.roundedRect(14 + i * (fSize + 4), y, fSize, fSize, 2, 2, "F");
        doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...C.gray);
        doc.text("Foto", 14 + i * (fSize + 4) + fSize / 2, y + fSize / 2, { align: "center" });
      }
    });
    y += fSize + 5;
    if (fotoLokasi.length > 4) {
      doc.setFont("helvetica", "italic"); doc.setFontSize(7.5); doc.setTextColor(...C.gray);
      doc.text(`... dan ${fotoLokasi.length - 4} foto lainnya`, 14, y);
      y += 6;
    }
  }
  hLine(doc, y); y += 7;

  // ═══════════════════════════════════════════════════════
  // SEKSI 3: Info Calon Pelanggan
  // (dari SurveyLaporanModal — Seksi "Info Calon Pelanggan")
  // ═══════════════════════════════════════════════════════
  sectionTitle(doc, "INFO CALON PELANGGAN", y, C.blue);
  y += 11;

  // Minat Berlangganan (select) - hitam-putih
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
  doc.text("Minat Berlangganan", 14, y);
  // Badge hitam-putih: border saja
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.4);
  doc.roundedRect(64, y - 4.5, 46, 6.5, 2, 2, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.dark);
  doc.text(minatLabel[l.minat] ?? l.minat, 87, y, { align: "center" });
  y += 8;

  // Paket yang Diminati (select)
  const e3 = fieldRow(doc, "Paket yang Diminati", l.paketDiminati || "(belum ditentukan)", y);
  y += 7 + e3;

  // Catatan Survey (textarea)
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
  doc.text("Catatan Survey", 14, y);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setTextColor(...C.dark);
  const catLines = doc.splitTextToSize(l.catatan || "-", 178);
  doc.text(catLines, 14, y);
  y += catLines.length * 4.8 + 5;
  hLine(doc, y); y += 7;

  // ═══════════════════════════════════════════════════════
  // SEKSI 4: Rekomendasi & Tindak Lanjut
  // (dari SurveyLaporanModal — Seksi "Rekomendasi & Tindak Lanjut")
  // ═══════════════════════════════════════════════════════
  sectionTitle(doc, "REKOMENDASI & TINDAK LANJUT", y, C.blue);
  y += 11;

  // Rekomendasi Pemasangan (radio button)
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...C.gray);
  doc.text("Rekomendasi Pemasangan", 14, y);
  y += 5;
  // Badge rekomendasi hitam-putih
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, 72, 9, 3, 3, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...C.dark);
  doc.text(rekLabel[l.rekomendasi] ?? l.rekomendasi, 50, y + 6, { align: "center" });
  y += 14;

  // Rencana Tanggal Tindak Lanjut (date input)
  const e4 = fieldRow(doc, "Rencana Tindak Lanjut", l.tglRencana || "(belum ditentukan)", y);
  y += 7 + e4;

  hLine(doc, y); y += 7;

  // ── Informasi Petugas Survey ──────────────────────────────────────────────
  sectionTitle(doc, "INFORMASI PETUGAS SURVEY", y, C.blue);
  y += 11;
  fieldRow(doc, "Nama Sales", l.salesName, y); y += 7;
  fieldRow(doc, "ID Sales", l.salesId, y); y += 7;
  fieldRow(doc, "Tanggal", l.tgl, y); y += 7;
  hLine(doc, y); y += 8;

  // ── Blok Tanda Tangan ─────────────────────────────────────────────────────
  // (canvas TTD dari SurveyLaporanModal — "Tanda Tangan Calon Pelanggan")
  sectionTitle(doc, "TANDA TANGAN", y, C.blue);
  y += 10;
  drawSignBlock(
    doc, y,
    "Tanda Tangan Calon Pelanggan", l.calon,
    "Tanda Tangan Petugas Survey", l.salesName,
    l.ttd,
  );

  drawFooter(doc, 1);
  doc.save(`Laporan_Survey_${l.ticketId}_${l.tgl}.pdf`);
}
