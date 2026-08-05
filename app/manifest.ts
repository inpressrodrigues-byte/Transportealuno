import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oziel Turismo - Transporte Escolar",
    short_name: "Oziel Turismo",
    description: "Acompanhe transporte, pagamentos, avisos e check-ins dos alunos.",
    start_url: "/login",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#090909",
    lang: "pt-BR",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
