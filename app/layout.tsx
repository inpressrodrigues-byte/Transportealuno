import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rota Segura — Transporte Escolar",
  description:
    "Transporte escolar com segurança e pontualidade. Acompanhe a rota, converse com o motorista e tenha tranquilidade todos os dias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var theme = stored || 'light';
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cloud text-ink font-body">
        {children}
      </body>
    </html>
  );
}
