import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Sobre } from "@/components/sections/Sobre";
import { Van } from "@/components/sections/Van";
import { Escolas } from "@/components/sections/Escolas";
import { Rotas } from "@/components/sections/Rotas";
import { Seguranca } from "@/components/sections/Seguranca";
import { Depoimentos } from "@/components/sections/Depoimentos";
import { Galeria } from "@/components/sections/Galeria";
import { Faq } from "@/components/sections/Faq";
import { Contato } from "@/components/sections/Contato";
import { Footer } from "@/components/sections/Footer";
import { WhatsappFloat } from "@/components/sections/WhatsappFloat";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Sobre />
        <Van />
        <Escolas />
        <Rotas />
        <Seguranca />
        <Depoimentos />
        <Galeria />
        <Faq />
        <Contato />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
