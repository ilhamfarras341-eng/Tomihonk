import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import type { Account, Calon, CurrentUser, Customer, GalleryItem, Keluhan, Laporan, Notif, NotifTarget, Paket, Role, SalesVisit, SurveyLaporan, Ticket } from "@/lib/types";

interface AppContextValue {
  // auth
  currentUser: CurrentUser | null;
  login: (u: string, p: string, role: Role) => Promise<boolean>;
  logout: () => void;
  // data
  customers: Customer[];
  deleteCustomer: (i: number) => void;
  paketList: Paket[];
  savePaket: (data: Omit<Paket, "id"> & { id?: number }) => void;
  deletePaket: (id: number) => void;
  tickets: Ticket[];
  refreshTickets: () => void;
  createTicket: (t: Omit<Ticket, "id" | "st" | "tgl">) => string;
  deleteTicket: (id: string) => void;
  cycleTicketStatus: (id: string) => void;
  calon: Calon[];
  addCalon: (c: Omit<Calon, "id" | "tgl" | "status">) => void;
  prosesCalon: (id: number | string) => Promise<Calon | undefined>;
  deleteCalon: (id: number | string) => void;
  keluhan: Keluhan[];
  addKeluhan: (k: Omit<Keluhan, "id" | "tgl" | "status">) => void;
  cycleKeluhan: (id: number | string) => void;
  laporan: Laporan[];
  addLaporan: (l: Omit<Laporan, "id" | "tgl">) => void;
  // survey laporan (sales)
  surveyLaporan: SurveyLaporan[];
  addSurveyLaporan: (l: Omit<SurveyLaporan, "id" | "tgl">) => void;
  deleteSurveyLaporan: (id: number | string) => void;
  // gallery
  gallery: GalleryItem[];
  addGallery: (title: string, imgDataUrl: string) => void;
  editGallery: (id: number | string, title: string) => void;
  deleteGallery: (id: number | string) => void;
  // accounts
  accounts: Account[];
  addAccount: (a: Omit<Account, "id">) => void;
  editAccount: (id: number | string, a: Omit<Account, "id">) => void;
  deleteAccount: (id: number | string) => void;
  // sales visits
  salesVisits: SalesVisit[];
  createSalesVisit: (v: Omit<SalesVisit, "id" | "st" | "hasil" | "tgl">) => string;
  cycleSalesVisitStatus: (id: string) => void;
  updateSalesVisitHasil: (id: string, hasil: SalesVisit["hasil"]) => void;
  deleteSalesVisit: (id: string) => void;
  // notif
  notifications: Record<NotifTarget, Notif[]>;
  pushNotif: (target: NotifTarget, title: string, desc: string) => void;
  markRead: (target: NotifTarget, id: number) => void;
  markAllRead: (target: NotifTarget) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = sessionStorage.getItem("currentUser");
      return saved ? (JSON.parse(saved) as CurrentUser) : null;
    } catch {
      return null;
    }
  });
  const [customers, setCustomers] = useState<Customer[]>([
  { n: "Ahmad Fauzi", p: "Paket Bisnis 200Mbps", s: "aktif" },
  { n: "Siti Nurhaliza", p: "Paket Rumahan 50Mbps", s: "aktif" },
  { n: "Budi Pratama", p: "Paket Enterprise 1Gbps", s: "aktif" },
  { n: "Dewi Kartika", p: "Paket Rumahan 50Mbps", s: "pending" },
  { n: "Rizky Maulana", p: "Paket Bisnis 200Mbps", s: "aktif" },
  { n: "Lestari Wulandari", p: "Paket Rumahan 50Mbps", s: "nonaktif" },
  { n: "Hendra Wijaya", p: "Paket Enterprise 1Gbps", s: "aktif" },
  { n: "Maya Anggraini", p: "Paket Bisnis 200Mbps", s: "pending" },
  ]);
  const [paketList, setPaketList] = useState<Paket[]>([]);

  // Fetch initial data from backend
  useEffect(() => {
    fetch("https://api.tomihonk.co.id/api/paket")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPaketList(data);
      })
      .catch(err => console.error("Failed to fetch paket:", err));
  }, []);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets from backend
  const fetchTickets = useCallback(() => {
    fetch("https://api.tomihonk.co.id/api/tickets")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTickets(data);
      })
      .catch(err => console.error("Failed to fetch tickets:", err));
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  const refreshTickets = fetchTickets;
  const [calon, setCalon] = useState<Calon[]>([]);

  // Fetch calon pelanggan dari backend
  useEffect(() => {
    fetch("https://api.tomihonk.co.id/api/calon")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCalon(data);
      })
      .catch(err => console.error("Failed to fetch calon:", err));
  }, []);
  const [keluhan, setKeluhan] = useState<Keluhan[]>([]);

  // Fetch keluhan dari backend
  useEffect(() => {
    fetch("https://api.tomihonk.co.id/api/keluhan")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setKeluhan(data);
      })
      .catch(err => console.error("Failed to fetch keluhan:", err));
  }, []);
  const [laporan, setLaporan] = useState<Laporan[]>([]);

  // Fetch laporan dari backend
  useEffect(() => {
    fetch("https://api.tomihonk.co.id/api/laporan")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLaporan(data);
      })
      .catch(err => console.error("Failed to fetch laporan:", err));
  }, []);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Fetch galeri dari backend
  useEffect(() => {
    fetch("https://api.tomihonk.co.id/api/galeri")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGallery(data);
      })
      .catch(err => console.error("Failed to fetch galeri:", err));
  }, []);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [surveyLaporan, setSurveyLaporan] = useState<SurveyLaporan[]>([]);

  // Fetch surveyLaporan dari backend
  useEffect(() => {
    fetch("https://api.tomihonk.co.id/api/survey-laporan")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSurveyLaporan(data);
      })
      .catch(err => console.error("Failed to fetch survey laporan:", err));
  }, []);

  // Fetch accounts dari backend
  useEffect(() => {
    fetch("https://api.tomihonk.co.id/api/auth/users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAccounts(data);
      })
      .catch(err => console.error("Failed to fetch accounts:", err));
  }, []);
  const [salesVisits, setSalesVisits] = useState<SalesVisit[]>([
    { id: "SV-1001", calon: "Andi Wijaya", hp: "081200001111", alamat: "Jl. Raya Bogor No.15", tujuan: "Penawaran paket Home", catatan: "", st: "dijadwalkan", hasil: "", sales: "dewi", salesName: "Dewi Anggraini", tgl: "2025-04-22" },
    { id: "SV-1002", calon: "Sari Melati", hp: "082333445566", alamat: "Jl. Sudirman No.8", tujuan: "Follow up registrasi", catatan: "Sudah tanya via WA", st: "dikunjungi", hasil: "tertarik", sales: "dewi", salesName: "Dewi Anggraini", tgl: "2025-04-21" },
  ]);
  const [notifications, setNotifications] = useState<Record<NotifTarget, Notif[]>>({
    admin: [],
    tech: [],
    sales: [],
  });

  const seqRef = useMemoSeq();

  const pushNotif = useCallback((target: NotifTarget, title: string, desc: string) => {
    setNotifications((prev) => ({
      ...prev,
      [target]: [{ id: seqRef.next(), title, desc, time: Date.now(), read: false }, ...prev[target]],
    }));
  }, [seqRef]);

  const markRead = useCallback((target: NotifTarget, id: number) => {
    setNotifications((prev) => ({ ...prev, [target]: prev[target].map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  }, []);

  const markAllRead = useCallback((target: NotifTarget) => {
    setNotifications((prev) => ({ ...prev, [target]: prev[target].map((n) => ({ ...n, read: true })) }));
  }, []);

  const login = useCallback(async (u: string, p: string, role: Role): Promise<boolean> => {
    try {
      const res = await fetch("https://api.tomihonk.co.id/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p, role }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error("Login Gagal", { description: result.error || "Username atau password salah!" });
        return false;
      }
      const acc = result.user;
      const user: CurrentUser = { role, name: acc.name, id: acc.staffId || acc.username };
      setCurrentUser(user);
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      // Hapus tab state agar dashboard selalu mulai dari halaman awal saat login
      // localStorage.removeItem("admin_tab");
      // localStorage.removeItem("admin_lapFilter");
      // localStorage.removeItem("admin_tiketFilter");
      // localStorage.removeItem("teknisi_tab");
      // localStorage.removeItem("sales_tab");
      toast.success("Login Berhasil", { description: `Selamat datang, ${acc.name}!` });
      return true;
    } catch {
      toast.error("Login Gagal", { description: "Tidak dapat terhubung ke server" });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem("currentUser");
    // Hapus juga tab state agar fresh saat login berikutnya
    // localStorage.removeItem("admin_tab");
    // localStorage.removeItem("admin_lapFilter");
    // localStorage.removeItem("admin_tiketFilter");
    // localStorage.removeItem("teknisi_tab");
    // localStorage.removeItem("sales_tab");
    toast.success("Logout", { description: "Anda berhasil keluar dari sistem" });
  }, []);

  const deleteCustomer = useCallback((i: number) => {
    setCustomers((prev) => prev.filter((_, idx) => idx !== i));
    toast.success("Terhapus", { description: "Data pelanggan dihapus" });
  }, []);

  const savePaket = useCallback(async (data: Omit<Paket, "id"> & { id?: number | string }) => {
    try {
      if (data.id) {
        const res = await fetch(`https://api.tomihonk.co.id/api/paket/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Gagal update paket");
        setPaketList((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
        toast.success("Tersimpan", { description: "Paket berhasil diperbarui di database!" });
      } else {
        const res = await fetch("https://api.tomihonk.co.id/api/paket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Gagal menambah paket");
        setPaketList((prev) => [...prev, result.data]);
        toast.success("Berhasil", { description: "Paket berhasil ditambahkan ke database!" });
      }
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const deletePaket = useCallback(async (id: number | string) => {
    if (!window.confirm("Hapus paket ini dari database?")) return;
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/paket/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus paket");
      setPaketList((prev) => prev.filter((p) => p.id !== id));
      toast.success("Terhapus", { description: "Paket berhasil dihapus" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const createTicket: AppContextValue["createTicket"] = useCallback(async (t) => {
    try {
      const res = await fetch("https://api.tomihonk.co.id/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat tiket");
      const newTicket: Ticket = { ...t, id: result.data.id, st: "pending", tgl: result.data.tgl };
      setTickets((prev) => [newTicket, ...prev]);
      if (t.jenis === "survey") {
        // Tiket survey teknisi → notif ke teknisi
        pushNotif("tech", `Tiket Survey Baru: ${result.data.id}`, `${t.pel} - ${t.alm}`);
      } else {
        // Tiket lain → notif ke teknisi
        pushNotif("tech", `Tiket Baru: ${result.data.id}`, `${t.pel} - ${t.jenis}`);
      }
      pushNotif("admin", `Tiket Terkirim`, `Tiket ${result.data.id} berhasil dibuat`);
      toast.success("Tiket Terkirim", { description: `Tiket berhasil disimpan ke database` });

      return result.data.id;
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
      return "";
    }
  }, [pushNotif]);

  const deleteTicket = useCallback(async (id: string) => {
    if (!window.confirm("Hapus tiket dari database?")) return;
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/tickets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus tiket");
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.success("Terhapus", { description: "Tiket berhasil dihapus" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const cycleTicketStatus = useCallback(async (id: string) => {
    const order: Ticket["st"][] = ["pending", "proses", "selesai"];
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;
    const next = order[(order.indexOf(ticket.st) + 1) % 3];
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/tickets/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ st: next })
      });
      if (!res.ok) throw new Error("Gagal update status");
      setTickets((prev) =>
        prev.map((t) => t.id === id ? { ...t, st: next } : t)
      );
      toast.success("Status Diperbarui", { description: `Tiket → ${next.toUpperCase()}` });
      if (next === "selesai") pushNotif("admin", `Tiket Selesai: ${id}`, `Tugas diselesaikan`);
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, [pushNotif, tickets]);

  const addCalon: AppContextValue["addCalon"] = useCallback(async (c) => {
    try {
      const res = await fetch("https://api.tomihonk.co.id/api/calon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan pendaftaran");
      const newCalon: Calon = result.data;
      setCalon((prev) => [newCalon, ...prev]);
      pushNotif("admin", "Calon Pelanggan Baru", `${c.nama} mendaftar ${c.paket}`);
      toast.success("Pendaftaran Terkirim", { description: "Tim kami akan segera menghubungi Anda" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, [pushNotif]);

  const prosesCalon = useCallback(async (id: number | string) => {
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/calon/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "diproses" }),
      });
      if (!res.ok) throw new Error("Gagal update status calon");
      let result: Calon | undefined;
      setCalon((prev) => prev.map((c) => {
        if (c.id !== id) return c;
        result = c;
        return { ...c, status: "diproses" };
      }));
      return result;
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
      return undefined;
    }
  }, []);

  const deleteCalon = useCallback(async (id: number | string) => {
    if (!window.confirm("Hapus data calon pelanggan ini?")) return;
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/calon/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data calon");
      setCalon((prev) => prev.filter((c) => c.id !== id));
      toast.success("Terhapus", { description: "Data calon pelanggan berhasil dihapus" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const keluhanSeqRef = useMemoSeq(3);
  const addKeluhan: AppContextValue["addKeluhan"] = useCallback(async (k) => {
    try {
      const res = await fetch("https://api.tomihonk.co.id/api/keluhan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(k),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan keluhan");
      const newK: Keluhan = result.data;
      setKeluhan((prev) => [newK, ...prev]);
      pushNotif("admin", "Keluhan Baru", `${k.nama}: ${k.pesan.slice(0, 40)}...`);
      toast.success("Pesan Terkirim", { description: "Terima kasih! Keluhan Anda telah tercatat." });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, [pushNotif, keluhanSeqRef]);

  const cycleKeluhan = useCallback(async (id: number | string) => {
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/keluhan/${id}/cycle`, { method: "PUT" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal update status");
      const next = result.status as Keluhan["status"];
      setKeluhan((prev) =>
        prev.map((k) => k.id === id ? { ...k, status: next } : k)
      );
      toast.success("Status Diubah", { description: `Keluhan → ${next.toUpperCase()}` });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const lapSeqRef = useMemoSeq(2);
  const addLaporan: AppContextValue["addLaporan"] = useCallback(async (l) => {
    try {
      const res = await fetch("https://api.tomihonk.co.id/api/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(l),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan laporan");
      const newLap: Laporan = result.data;
      setLaporan((prev) => [newLap, ...prev]);
      // Update status tiket via API agar tersimpan di database
      await fetch(`https://api.tomihonk.co.id/api/tickets/${l.ticketId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ st: "selesai" }),
      });
      setTickets((prev) => prev.map((t) => (t.id === l.ticketId ? { ...t, st: "selesai" } : t)));
      pushNotif("admin", `Laporan ${l.jenis.toUpperCase()} Masuk`, `${l.tekName} - ${l.pel}`);
      toast.success("Laporan Tersimpan", { description: "Laporan berhasil dikirim ke admin" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, [pushNotif, lapSeqRef]);

  // Gallery
  const addGallery = useCallback(async (title: string, imgDataUrl: string) => {
    try {
      const res = await fetch("https://api.tomihonk.co.id/api/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, img: imgDataUrl }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan foto");
      const newItem: GalleryItem = result.data;
      setGallery((prev) => [...prev, newItem]);
      toast.success("Berhasil", { description: "Foto berhasil ditambahkan ke galeri" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const editGallery = useCallback(async (id: number | string, title: string) => {
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/galeri/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal memperbarui judul foto");
      }
      setGallery((prev) => prev.map((g) => g.id === id ? { ...g, title } : g));
      toast.success("Berhasil", { description: "Judul foto diperbarui" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const deleteGallery = useCallback(async (id: number | string) => {
    if (!window.confirm("Hapus foto ini dari galeri?")) return;
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/galeri/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal menghapus foto");
      }
      setGallery((prev) => prev.filter((g) => g.id !== id));
      toast.success("Terhapus", { description: "Foto dihapus dari galeri" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  // Accounts
  const addAccount = useCallback(async (a: Omit<Account, "id">) => {
    try {
      const response = await fetch("https://api.tomihonk.co.id/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan ke database");
      }
      // Refresh dari backend untuk mendapatkan data lengkap termasuk staffId
      const refreshed = await fetch("https://api.tomihonk.co.id/api/auth/users").then(r => r.json());
      if (Array.isArray(refreshed)) setAccounts(refreshed);
      toast.success("Berhasil", { description: `Akun ${a.role} "${a.name}" berhasil dibuat di database` });
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal", { description: error.message });
    }
  }, []);

  const editAccount = useCallback(async (id: number | string, a: Omit<Account, "id">) => {
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/auth/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Gagal memperbarui akun");
      }
      // Refresh dari backend untuk mendapatkan staffId terbaru
      const refreshed = await fetch("https://api.tomihonk.co.id/api/auth/users").then(r => r.json());
      if (Array.isArray(refreshed)) setAccounts(refreshed);
      toast.success("Berhasil", { description: `Akun "${a.name}" berhasil diperbarui` });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const deleteAccount = useCallback(async (id: number | string) => {
    if (!window.confirm("Hapus akun ini dari database?")) return;
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/auth/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus akun");
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Terhapus", { description: "Akun berhasil dihapus dari database" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  // Sales Visits
  const svSeqRef = useMemoSeq(1003);
  const createSalesVisit: AppContextValue["createSalesVisit"] = useCallback((v) => {
    const id = "SV-" + svSeqRef.next();
    const newVisit: SalesVisit = { ...v, id, st: "dijadwalkan", hasil: "", tgl: new Date().toISOString().slice(0, 10) };
    setSalesVisits((prev) => [newVisit, ...prev]);
    pushNotif("admin", `Kunjungan Sales: ${id}`, `${v.salesName} → ${v.calon}`);
    pushNotif("sales", `Jadwal Baru: ${id}`, `Kunjungi ${v.calon} di ${v.alamat}`);
    toast.success("Kunjungan Dijadwalkan", { description: `${id} untuk ${v.calon}` });
    return id;
  }, [pushNotif, svSeqRef]);

  const cycleSalesVisitStatus = useCallback((id: string) => {
    const order: SalesVisit["st"][] = ["dijadwalkan", "dikunjungi", "selesai"];
    setSalesVisits((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const next = order[(order.indexOf(v.st) + 1) % 3];
        toast.success("Status Diperbarui", { description: `${v.id} → ${next.toUpperCase()}` });
        if (next === "selesai") pushNotif("admin", `Kunjungan Selesai: ${v.id}`, `${v.salesName} - ${v.calon}`);
        return { ...v, st: next };
      })
    );
  }, [pushNotif]);

  const updateSalesVisitHasil = useCallback((id: string, hasil: SalesVisit["hasil"]) => {
    setSalesVisits((prev) =>
      prev.map((v) => v.id === id ? { ...v, hasil } : v)
    );
    toast.success("Hasil Diperbarui", { description: `Hasil kunjungan: ${hasil || "-"}` });
  }, []);

  const deleteSalesVisit = useCallback((id: string) => {
    if (!window.confirm("Hapus kunjungan ini?")) return;
    setSalesVisits((prev) => prev.filter((v) => v.id !== id));
    toast.success("Terhapus", { description: "Kunjungan dihapus" });
  }, []);

  // Survey Laporan
  const addSurveyLaporan = useCallback(async (l: Omit<SurveyLaporan, "id" | "tgl">) => {
    try {
      const res = await fetch("https://api.tomihonk.co.id/api/survey-laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(l),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menyimpan laporan survey");
      const newLap: SurveyLaporan = result.data;
      setSurveyLaporan((prev) => [newLap, ...prev]);

      // ── Auto-selesaikan tiket di backend & state lokal ──
      try {
        await fetch(`https://api.tomihonk.co.id/api/tickets/${l.ticketId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ st: "selesai" }),
        });
      } catch {
        // Jika API gagal, tetap update state lokal
      }
      setTickets((prev) => prev.map((t) => t.id === l.ticketId ? { ...t, st: "selesai" } : t));

      // Update jadwal kunjungan terkait menjadi selesai
      if (l.visitId) {
        setSalesVisits((prev) => prev.map((v) => v.id === l.visitId ? { ...v, st: "selesai", hasil: l.minat === "sangat_minat" || l.minat === "minat" ? "tertarik" : "menolak" } : v));
      }
      pushNotif("admin", `Laporan Survey: ${l.ticketId}`, `${l.salesName} — ${l.calon}`);
      pushNotif("sales", `Tugas Selesai: ${l.ticketId}`, `Laporan survey ${l.calon} berhasil dikirim`);
      toast.success("Laporan Survey Terkirim", { description: `Tiket ${l.ticketId} otomatis ditandai selesai` });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, [pushNotif]);

  const deleteSurveyLaporan = useCallback(async (id: number | string) => {
    if (!window.confirm("Hapus laporan survey ini?")) return;
    try {
      const res = await fetch(`https://api.tomihonk.co.id/api/survey-laporan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus laporan survey");
      setSurveyLaporan((prev) => prev.filter((l) => l.id !== id));
      toast.success("Terhapus", { description: "Laporan survey berhasil dihapus" });
    } catch (err: any) {
      toast.error("Gagal", { description: err.message });
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser, login, logout,
      customers, deleteCustomer,
      paketList, savePaket, deletePaket,
      tickets, refreshTickets, createTicket, deleteTicket, cycleTicketStatus,
      calon, addCalon, prosesCalon, deleteCalon,
      keluhan, addKeluhan, cycleKeluhan,
      laporan, addLaporan,
      surveyLaporan, addSurveyLaporan, deleteSurveyLaporan,
      gallery, addGallery, editGallery, deleteGallery,
      accounts, addAccount, editAccount, deleteAccount,
      salesVisits, createSalesVisit, cycleSalesVisitStatus, updateSalesVisitHasil, deleteSalesVisit,
      notifications, pushNotif, markRead, markAllRead,
    }),
    [currentUser, login, logout, customers, deleteCustomer, paketList, savePaket, deletePaket, tickets, refreshTickets, createTicket, deleteTicket, cycleTicketStatus, calon, addCalon, prosesCalon, deleteCalon, keluhan, addKeluhan, cycleKeluhan, laporan, addLaporan, surveyLaporan, addSurveyLaporan, deleteSurveyLaporan, gallery, addGallery, editGallery, deleteGallery, accounts, addAccount, editAccount, deleteAccount, salesVisits, createSalesVisit, cycleSalesVisitStatus, updateSalesVisitHasil, deleteSalesVisit, notifications, pushNotif, markRead, markAllRead]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

// Helper: monotonic id sequence
function useMemoSeq(start = 1) {
  const [, force] = useState(0);
  const ref = useMemo(() => {
    let n = start;
    return {
      next: () => {
        const v = n++;
        return v;
      },
    };
  }, []);
  void force;
  return ref;
}