import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Cartao de visitas | Oziel Turismo" },
  description: "Abra e compartilhe o cartao de visitas da Oziel Turismo.",
};

export default function BusinessCardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
