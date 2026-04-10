// src/app/layout.tsx

import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Montserrat } from "next/font/google";
import "./globals.css";
import FloatingScrollbar from "@/components/ui/FloatingScroll";
import { ThemeProvider } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/ui/SmoothScroll";

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
      className={`${montserrat.variable} h-full antialiased scroll-smooth`}
    >
      <body
        className={`${montserrat.className}  min-h-full flex flex-col`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Define o tema escuro como padrão
          enableSystem // Permite seguir o tema do Windows/Mac do utilizador
          disableTransitionOnChange // Evita transições feias ao recarregar a página
        >
          <SmoothScroll lerp={0.08} duration={1.2} wheelMultiplier={1}>
            <FloatingScrollbar />
            {children}
            <Toaster position="top-right" />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
