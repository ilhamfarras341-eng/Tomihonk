import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsSection from "@/components/landing/StatsSection";
import Partners from "@/components/landing/Partners";
import Features from "@/components/landing/Features";
import Profil from "@/components/landing/Profil";
import Layanan from "@/components/landing/Layanan";
import Galeri from "@/components/landing/Galeri";
import Kontak from "@/components/landing/Kontak";
import Footer from "@/components/landing/Footer";

import CalonModal from "@/components/modals/CalonModal";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TeknisiDashboard from "@/components/dashboard/TeknisiDashboard";
import SalesDashboard from "@/components/dashboard/SalesDashboard";
import ChatbotWidget from "@/components/dashboard/ChatbotWidget";
import { useApp } from "@/context/AppContext";

const Index = () => {
  const { currentUser } = useApp();
  const [calonOpen, setCalonOpen] = useState(false);
  const [defaultPaket, setDefaultPaket] = useState<string | undefined>();

  if (currentUser?.role === "admin") return <AdminDashboard />;
  if (currentUser?.role === "teknisi") return <TeknisiDashboard />;
  if (currentUser?.role === "sales") return <SalesDashboard />;

  return (
    <>
      <Navbar />
      <Hero />
      <StatsSection />
      {/* <Partners /> */}
      <Features />
      <Profil />
      <Layanan onDaftar={(p) => { setDefaultPaket(p); setCalonOpen(true); }} />
      <Galeri />
      <Kontak />
      <Footer />
      <CalonModal open={calonOpen} defaultPaket={defaultPaket} onClose={() => setCalonOpen(false)} />
      <ChatbotWidget />
    </>
  );
};

export default Index;
