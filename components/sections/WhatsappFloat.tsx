"use client";

import { MessageCircle } from "lucide-react";

export function WhatsappFloat() {
  return (
    <a
      href="https://wa.me/5545999999999"
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 float-slow"
    >
      <MessageCircle size={24} fill="white" strokeWidth={0} />
    </a>
  );
}
