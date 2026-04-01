// src/app/admin/layout.tsx

// Documentação do Código:
// 1. Importamos o Provider (que gerencia o estado aberto/fechado) e o Trigger (o botão de abrir/fechar).
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// 2. Importamos a Sidebar que acabamos de montar no Passo 2.
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // O SidebarProvider deve envolver todo o layout que usará a barra
    <SidebarProvider>
      {/* Renderiza a barra lateral que criamos */}
      <AppSidebar />

      {/* Conteúdo Principal */}
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="mb-6 flex items-center">
          <SidebarTrigger className="text-gray-500 hover:text-gray-800" />
        </div>

        {/* Aqui é onde o Next.js injeta a página atual (page.tsx) */}
        {children}
      </main>
    </SidebarProvider>
  );
}
