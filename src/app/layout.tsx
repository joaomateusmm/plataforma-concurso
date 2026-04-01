// src/app/layout.tsx

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Montserrat } from "next/font/google";
import "./globals.css";

// 2. Configuramos a fonte
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat", // Este nome é a chave!
});

export const metadata: Metadata = {
  title: "Plataforma de Aprovação",
  description: "Aula + Questão + Simulado + Revisão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${montserrat.variable} h-full antialiased`}
    >
      <body
        className={`${montserrat.className}  min-h-full flex flex-col`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
