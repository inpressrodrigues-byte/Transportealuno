"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Button } from "@/components/ui/Button";
import { Phone, MessageCircle, MapPin, Send, Check } from "lucide-react";
import { InstagramGlyph, FacebookGlyph } from "@/components/ui/SocialIcons";

export function Contato() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contato" className="bg-navy py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Contato" title="Vamos combinar a rota do seu filho" dark />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <MediaFrame
              label="Mapa de atendimento — Toledo, PR"
              icon={<MapPin size={20} />}
              tone="navy"
              className="aspect-[4/3] w-full"
            />
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:+554599999999"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <Phone size={16} className="text-sun" /> (45) 99999-9999
              </a>
              <a
                href="https://wa.me/5545999999999"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <MessageCircle size={16} className="text-sun" /> WhatsApp
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <InstagramGlyph size={16} className="text-sun" /> Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <FacebookGlyph size={16} className="text-sun" /> Facebook
              </a>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-3xl bg-white/[0.04] border border-white/10 p-8"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Seu nome"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sun/50 sm:col-span-1"
              />
              <input
                required
                placeholder="WhatsApp"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sun/50 sm:col-span-1"
              />
              <input
                placeholder="Escola do seu filho"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sun/50 sm:col-span-2"
              />
              <textarea
                placeholder="Bairro e horário de referência"
                rows={4}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sun/50 sm:col-span-2"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="mt-6 w-full">
              {sent ? (
                <>
                  <Check size={16} /> Recebemos sua mensagem
                </>
              ) : (
                <>
                  <Send size={16} /> Entrar em contato
                </>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-white/40">
              Formulário ilustrativo — sem envio real nesta versão.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
