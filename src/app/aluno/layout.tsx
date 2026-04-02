// src/app/aluno/layout.tsx

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlunoSidebar } from "@/components/aluno-sidebar";
import TopNavbar from "@/components/TopNavbar";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#070707]">
        <TopNavbar />

        <AlunoSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 border-b border-neutral-800 bg-neutral-950 flex items-center px-4 lg:hidden mt-23">
            <SidebarTrigger className="text-neutral-400 hover:text-emerald-500" />
            <span className="ml-4 font-bold text-neutral-200">
              Área do Aluno
            </span>
          </header>
          <main className="flex-1 overflow-y-auto p-6 pt-28 lg:p-10 lg:pt-28">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
