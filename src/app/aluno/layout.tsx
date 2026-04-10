// src/app/aluno/layout.tsx

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AlunoSidebar } from "@/components/aluno-sidebar";
import TopNavbar from "@/components/TopNavbar";
import { TimerProvider } from "@/contexts/TimerContext";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TimerProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#F8F9FA] dark:bg-[#070707] transition-colors duration-300">
          <TopNavbar />

          <AlunoSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center px-4 lg:hidden mt-23 transition-colors duration-300">
              <SidebarTrigger className="text-gray-500 dark:text-neutral-400 hover:text-[#009966] dark:hover:text-[#009966] transition-colors duration-300" />
              <span className="ml-4 font-bold text-gray-900 dark:text-neutral-200 transition-colors duration-300">
                Área do Aluno
              </span>
            </header>
            <main className="flex-1 overflow-y-auto p-6 pt-28 lg:p-10 lg:pt-28">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TimerProvider>
  );
}
