// src/app/aluno/layout.tsx

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlunoSidebar } from "@/components/aluno-sidebar";
import Notice from "@/components/Notice";
import Header from "@/components/Header";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* CONTAINER PRINCIPAL: Uma coluna vertical que ocupa a tela toda */}
      <div className="flex flex-col min-h-screen w-full bg-[#070707]">
        {/* TOPO ABSOLUTO: O Banner ocupa a primeira "linha" da tela */}
        <Notice />

        {/* CONTAINER INFERIOR: O resto da tela, dividido lado a lado (Sidebar + Resto) */}
        <div className="flex flex-1 overflow-hidden">
          {/* LADO ESQUERDO: A Sidebar (ela ocupará toda a altura a partir debaixo do Notice) */}
          <AlunoSidebar />

          {/* LADO DIREITO: O conteúdo central (Header + Páginas) */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />

            {/* Cabeçalho mobile (aparece só em telas pequenas) */}
            <header className="flex h-14 items-center border-b border-neutral-800 bg-neutral-950 px-4 lg:hidden">
              <SidebarTrigger className="text-neutral-400 hover:text-emerald-500 transition-colors" />
              <span className="ml-4 font-bold text-neutral-200">
                Área do Aluno
              </span>
            </header>

            {/* CONTEÚDO DA PÁGINA (Aulas, Simulados, etc): Rola de forma independente */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
