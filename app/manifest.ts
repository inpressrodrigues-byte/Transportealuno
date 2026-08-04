import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rota Segura - Transporte Escolar",
    short_name: "Rota Segura",
    description: "Acompanhe transporte, pagamentos, avisos e check-ins dos alunos.",
    start_url: "/login",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    lang: "pt-BR",
    orientation: "portrait",
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
