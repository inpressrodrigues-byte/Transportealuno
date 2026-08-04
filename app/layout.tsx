import type { Metadata } from "next";
import "./globals.css";
import { ThemeRuntime } from "@/components/system/ThemeRuntime";
import { PwaRuntime } from "@/components/system/PwaRuntime";

export const metadata: Metadata = {
  title: "Rota Segura - Transporte Escolar",
  description:
    "Transporte escolar com seguranca e pontualidade. Acompanhe a rota, converse com o motorista e tenha tranquilidade todos os dias.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/app-icon.svg", apple: "/app-icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased" data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme-mode') || localStorage.getItem('theme');
                  var theme = stored || 'light';
                  var hour = new Date().getHours();
                  var autoDark = theme === 'auto' && (hour >= 18 || hour < 6);
                  if (theme === 'dark' || autoDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cloud text-ink font-body">
        <ThemeRuntime />
        <PwaRuntime />
        {children}
      </body>
    </html>
  );
}
