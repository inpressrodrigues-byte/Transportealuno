import type { Metadata } from "next";
import "./globals.css";
import { ThemeRuntime } from "@/components/system/ThemeRuntime";
import { PwaRuntime } from "@/components/system/PwaRuntime";

export const metadata: Metadata = {
  title: {
    default: "Oziel Turismo | Transporte Escolar",
    template: "%s | Oziel Turismo",
  },
  applicationName: "Oziel Turismo",
  description:
    "Transporte escolar em Toledo com seguranca, pontualidade e acompanhamento em tempo real.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
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
