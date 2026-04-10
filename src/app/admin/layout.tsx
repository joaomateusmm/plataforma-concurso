// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Busca a sessão atual no lado do servidor
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Regra de Ouro: Se não estiver logado, OU se a role não for "admin", bloqueia o acesso!
  if (!session?.user || session.user.role !== "admin") {
    // Redireciona o usuário comum (ou deslogado) de volta para o painel de alunos
    redirect("/aluno");
  }

  return (
    // O SidebarProvider deve envolver todo o layout que usará a barra
    <SidebarProvider>
      {/* Renderiza a barra lateral que criamos */}
      <AppSidebar />

      {/* Conteúdo Principal adaptado para o Dark Mode */}
      <main className="flex-1 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen transition-colors duration-300">
        <div className="mb-6 flex items-center p-4 md:p-6 pb-0">
          <SidebarTrigger className="text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 transition-colors duration-300" />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
