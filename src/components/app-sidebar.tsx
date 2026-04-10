// src/components/app-sidebar.tsx
"use client";

import {
  BookOpen,
  FileText,
  Layers,
  Library,
  Video,
  BellRing,
  NotepadText,
  LayoutDashboard,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";

const nav2Items = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Questões", url: "/admin/questoes", icon: FileText },
  { title: "Bancas", url: "/admin/bancas", icon: Library },
  { title: "Matérias", url: "/admin/materias", icon: Layers },
  { title: "Assuntos", url: "/admin/assuntos", icon: BookOpen },
  { title: "Aulas", url: "/admin/aulas", icon: Video },
  { title: "Concursos", url: "/admin/concursos", icon: BellRing },
  { title: "Editais", url: "/admin/editais", icon: NotepadText },
  { title: "Notícias", url: "/admin/noticias", icon: Megaphone },
];

export function AppSidebar() {
  const pathname = usePathname();

  // Lógica exata usada no Aluno para determinar o link ativo
  const isActive = (url: string) => {
    if (pathname === url) return true;
    if (url === "/admin") return pathname === "/admin";
    return pathname?.startsWith(url);
  };

  return (
    <>
      <style>{`
        .hide-native-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .hide-native-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>

      <Sidebar
        data-lenis-prevent="true"
        className="border-r z-50 border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 h-full flex flex-col shadow-sm transition-colors duration-300"
      >
        {/* CABEÇALHO COM LOGOTIPO */}
        <SidebarHeader className="border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors duration-300">
          <Link
            className="flex items-center justify-center hover:scale-105 duration-300 w-full"
            href="/aluno"
          >
            <Image
              className="mr-2 transition-all duration-300"
              src="/logo.svg"
              width={45}
              height={45}
              alt="Logo +Aprovado"
            />
            <span className="text-xl font-bold text-neutral-700 dark:text-white tracking-tight leading-tight transition-colors duration-300">
              +Aprovado
            </span>
          </Link>
        </SidebarHeader>

        {/* CONTEÚDO (LINKS COM DESIGN DO ALUNO EM TEMA CLARO) */}
        <SidebarContent
          data-force-scroll="true"
          className="hide-native-scroll relative flex-1 overflow-x-hidden overflow-y-auto bg-white dark:bg-neutral-900 transition-colors duration-300"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="px-4 pt-3">
            <SidebarGroup className="mb-8 p-0">
              <SidebarGroupLabel className="mb-3 px-0 text-xs font-bold tracking-widest text-gray-400 dark:text-neutral-500 uppercase bg-transparent hover:bg-transparent transition-colors duration-300">
                Menu de Gestão
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <ul className="ml-2 flex flex-col border-l border-gray-200 dark:border-neutral-800 text-sm transition-colors duration-300">
                  {nav2Items.map((item) => {
                    const active = isActive(item.url);

                    return (
                      <Link href={item.url} key={item.title}>
                        <li
                          className={`group relative -ml-px flex cursor-pointer items-center gap-3 py-2.5 pr-2 pl-4 transition-all duration-200 before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-colors hover:text-gray-900 dark:hover:text-white ${
                            active
                              ? "font-bold text-emerald-600 dark:text-emerald-400 before:bg-emerald-600 dark:before:bg-emerald-400"
                              : "text-gray-500 dark:text-neutral-400 font-medium before:bg-transparent hover:before:bg-gray-300 dark:hover:before:bg-neutral-700"
                          }`}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>

        {/* RODAPÉ */}
        <SidebarFooter className="border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 p-4 transition-colors duration-300">
          <div className="flex items-center justify-between text-gray-400 dark:text-neutral-500 transition-colors duration-300">
            <span className="text-[10px] font-medium truncate pr-2">
              © 2026 +Aprovado. <br />
              Todos os direitos reservados.
            </span>
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
