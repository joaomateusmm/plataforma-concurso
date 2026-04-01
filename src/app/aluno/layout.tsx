// src/app/aluno/layout.tsx

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlunoSidebar } from "@/components/aluno-sidebar";
import Notice from "@/components/Notice";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <Notice />
        <AlunoSidebar />

        {/* O Conteúdo Central da Área do Aluno */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Cabeçalho mobile/simples para abrir a sidebar no celular */}
          <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 lg:hidden">
            <SidebarTrigger className="text-gray-500 hover:text-blue-600" />
            <span className="ml-4 font-bold text-gray-800">Área do Aluno</span>
          </header>

          {/* Onde as páginas (ex: Dashboard, Simulados) vão aparecer */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
