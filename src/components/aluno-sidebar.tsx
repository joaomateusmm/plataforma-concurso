// src/components/aluno-sidebar.tsx
"use client";

import {
  LayoutDashboard,
  CopyPlus,
  Megaphone,
  Video,
  BellRing,
  NotepadText,
  Sword,
  NotebookPen,
  ClockFading,
  Grid2x2Check,
  X,
  LayersPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
} from "@/components/ui/sidebar";

// IMPORTAÇÃO DO BADGE DO SHADCN UI
import { Badge } from "@/components/ui/badge";

import FloatingScrollbar from "./ui/FloatingScroll";
import SmoothScroll from "./ui/SmoothScroll";

// 1. CORRIGIMOS A TIPAGEM DOS ARRAYS PARA O TYPESCRIPT NÃO RECLAMAR DO 'STATUS'
type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  status?: "novo" | "em_breve" | string;
};

const navItems: NavItem[] = [
  { title: "Painel do Aluno", url: "/aluno", icon: LayoutDashboard },
  { title: "Concursos Abertos", url: "/aluno/concursos", icon: BellRing },
  { title: "Editais", url: "/aluno/editais", icon: NotepadText },
  {
    title: "Notícias",
    url: "/aluno/noticias",
    icon: Megaphone,
    status: "em_breve",
  },
  { title: "Aulas", url: "/aluno/aulas", icon: Video },
  { title: "Desafio", url: "/aluno/desafio", icon: Sword, status: "em_breve" },
  { title: "Meus Simulados", url: "/aluno/simulados", icon: NotebookPen },
];

const navItems2: NavItem[] = [
  {
    title: "Criar Simulado",
    url: "/aluno/simulados/novo",
    icon: CopyPlus,
    status: "novo",
  },
  {
    title: "Flip Clock",
    url: "/aluno/simulados/relogio",
    icon: ClockFading,
    status: "em_breve",
  },
  {
    title: "Year in pixels",
    url: "/aluno/simulados/year-in-ixels",
    icon: Grid2x2Check,
    status: "em_breve",
  },
  {
    title: "Cadernos",
    url: "/aluno/simulados/relogio",
    icon: LayersPlus,
    status: "em_breve",
  },
];

// 2. FUNÇÃO AUXILIAR PARA RENDERIZAR O BADGE COM CORES DINÂMICAS
const RenderBadge = ({ status }: { status?: string }) => {
  if (!status) return null;

  if (status === "novo") {
    return (
      <Badge
        variant="default"
        className="ml-auto bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider shrink-0"
      >
        Novo
      </Badge>
    );
  }

  if (status === "em_breve") {
    return (
      <Badge
        variant="secondary"
        className="ml-auto bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800/70 border border-neutral-700/50 text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider shrink-0"
      >
        Em breve
      </Badge>
    );
  }

  return null;
};

export function AlunoSidebar() {
  const pathname = usePathname();

  const { isPending, data } = useSession();
  const user = data?.user;

  // ESTADO PARA CONTROLAR A VISIBILIDADE DO CARD DE LOGIN
  const [isLoginCardVisible, setIsLoginCardVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hideLoginCard") !== "true";
    }
    return true;
  });

  const handleDismissLoginCard = () => {
    setIsLoginCardVisible(false);
    localStorage.setItem("hideLoginCard", "true");
  };

  const isActive = (url: string) => {
    if (pathname === url) return true;
    if (url === "/aluno") return pathname === "/aluno";
    if (url === "/aluno/simulados") {
      return (
        pathname?.startsWith("/aluno/simulados/") &&
        pathname !== "/aluno/simulados/novo"
      );
    }

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
        className="border-r z-50 border-neutral-800 bg-neutral-950 text-neutral-300 h-full flex flex-col"
      >
        <SidebarContent
          data-force-scroll="true"
          className="hide-native-scroll relative flex-1 overflow-x-hidden overflow-y-auto"
          style={{ overscrollBehavior: "contain" }}
        >
          <SmoothScroll root={false}>
            <div className="px-4 pt-25">
              <SidebarGroup className="mb-8 p-0">
                <SidebarGroupLabel className="mb-3 px-0 text-xs font-bold tracking-widest text-neutral-500 uppercase bg-transparent hover:bg-transparent">
                  Menu Principal
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <ul className="ml-2 flex flex-col gap-1 border-l border-white/10 text-sm">
                    {navItems.map((item) => {
                      const active = isActive(item.url);

                      return (
                        <Link href={item.url} key={item.title}>
                          <li
                            className={`group relative -ml-px flex cursor-pointer items-center gap-3 py-2 pr-2 pl-4 transition-all duration-200 before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-colors hover:text-white ${
                              active
                                ? "font-medium text-emerald-400 before:bg-white"
                                : "text-neutral-400 before:bg-transparent hover:before:bg-neutral-500"
                            }`}
                          >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.title}</span>
                            {/* RENDERIZA O BADGE SE EXISTIR STATUS */}
                            <RenderBadge status={item.status} />
                          </li>
                        </Link>
                      );
                    })}
                  </ul>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* FERRAMENTAS */}
              <SidebarGroup className="p-0 pb-10">
                <SidebarGroupLabel className="mb-3 px-0 text-xs font-bold tracking-widest text-neutral-500 uppercase bg-transparent hover:bg-transparent">
                  Ferramentas
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <ul className="ml-2 flex flex-col gap-1 border-l border-white/10 text-sm">
                    {navItems2.map((item) => {
                      const active = isActive(item.url);

                      return (
                        <Link href={item.url} key={item.title}>
                          <li
                            className={`group relative -ml-px flex cursor-pointer items-center gap-3 py-2 pr-2 pl-4 transition-all duration-200 before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-colors hover:text-white ${
                              active
                                ? "font-medium text-emerald-400 before:bg-white"
                                : "text-neutral-400 before:bg-transparent hover:before:bg-neutral-500"
                            }`}
                          >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.title}</span>
                            <RenderBadge status={item.status} />
                          </li>
                        </Link>
                      );
                    })}
                  </ul>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </SmoothScroll>

          <FloatingScrollbar />
        </SidebarContent>

        <SidebarFooter className=" border-t border-neutral-900 bg-neutral-950 shrink-0">
          {isPending ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-medium truncate pr-2">
                  © 2026 +Aprovado. <br></br>Todos os direitos reservados.
                </span>
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center p-1 justify-between text-neutral-400">
              <span className="text-[10px] font-medium truncate pr-2">
                © 2026 +Aprovado. <br></br>Todos os direitos reservados.
              </span>
            </div>
          ) : (
            isLoginCardVisible && (
              <div className="flex flex-col gap-3 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-neutral-200">
                      Acesse sua conta
                    </span>
                    <button
                      onClick={handleDismissLoginCard}
                      className="hover:bg-neutral-800 p-1 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 font-bold text-neutral-400 hover:text-white" />
                    </button>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 leading-tight">
                    Faça login para salvar simulados e ver progresso.
                  </span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    href="/aluno"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors text-center shadow-sm"
                  >
                    Entrar agora
                  </Link>
                  <p className="text-[10px] text-center text-neutral-500 mt-1">
                    Não tem conta?{" "}
                    <Link
                      href="/aluno"
                      className="text-emerald-500 hover:text-emerald-400 font-bold hover:underline"
                    >
                      Cadastre-se
                    </Link>
                  </p>
                </div>
              </div>
            )
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
