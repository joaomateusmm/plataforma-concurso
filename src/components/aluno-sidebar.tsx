// src/components/aluno-sidebar.tsx
"use client";

import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  CopyPlus,
  Megaphone,
  Video,
  BellRing,
  NotepadText,
  Sword,
  Layers,
  BookOpenCheck,
  Library,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Links de navegação exclusivos do Aluno
const navItems = [
  { title: "Painel do Aluno", url: "/aluno", icon: LayoutDashboard },
  { title: "Concursos Abertos", url: "/aluno/concursos", icon: BellRing },
  { title: "Editais", url: "/aluno/desempenho", icon: NotepadText },
  { title: "Notícias", url: "/aluno/noticias", icon: Megaphone },
  { title: "Aulas", url: "/aluno/aulas", icon: Video },
  { title: "Desafio", url: "/aluno/desafio", icon: Sword },
];

const navItems2 = [
  { title: "Criar Simulado", url: "/aluno/simulados", icon: CopyPlus },
  { title: "Matérias", url: "/aluno/simulados", icon: Layers },
  { title: "Assuntos", url: "/aluno/simulados", icon: Library },
  { title: "Questões", url: "/aluno/simulados", icon: BookOpenCheck },
];

export function AlunoSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data, isPending } = useSession();
  const user = data?.user;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (url: string) =>
    url === "/aluno" ? pathname === "/aluno" : pathname?.startsWith(url);

  return (
    <>
      {/* CSS para esconder a scrollbar nativa, mantendo a aparência limpa da SwordTools */}
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

      {/* Aplicamos o fundo dark neutral-950 e bordas neutral-800 na raiz da Sidebar */}
      <Sidebar className="border-r z-100 border-neutral-800 bg-neutral-950 text-neutral-300">
        {/* CABEÇALHO */}
        <SidebarHeader className="py-[21.5px] border-b border-neutral-800 flex flex-row items-start">
          <Link
            className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity w-full"
            href="/"
          >
            <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
              <GraduationCap strokeWidth={2.5} className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight leading-tight">
              +Aprovado
            </span>
          </Link>
        </SidebarHeader>

        {/* CONTEÚDO COM SCROLL LIMPO */}
        <SidebarContent className="hide-native-scroll overflow-y-auto px-4 py-8">
          {/* MENU PRINCIPAL */}
          <SidebarGroup className="mb-8 p-0">
            <SidebarGroupLabel className="mb-3 px-0 text-xs font-bold tracking-widest text-neutral-500 uppercase bg-transparent hover:bg-transparent">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {/* O segredo do design: borda esquerda branca com baixa opacidade */}
              <ul className="ml-2 flex flex-col gap-1 border-l border-white/10 text-sm">
                {navItems.map((item) => {
                  const active = isActive(item.url);

                  return (
                    <Link href={item.url} key={item.title}>
                      <li
                        className={`group relative -ml-px flex cursor-pointer items-center gap-3 py-2 pr-2 pl-4 transition-all duration-200 before:absolute before:top-1/2 before:left-0 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:transition-colors hover:text-white ${
                          active
                            ? "font-medium text-green-400 before:bg-white"
                            : "text-neutral-400 before:bg-transparent hover:before:bg-neutral-500"
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

          {/* FERRAMENTAS */}
          <SidebarGroup className="p-0">
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
                            ? "font-medium text-white before:bg-white"
                            : "text-neutral-400 before:bg-transparent hover:before:bg-neutral-500"
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
        </SidebarContent>

        {/* RODAPÉ DARK/SLEEK */}
        <SidebarFooter className="p-5 border-t border-neutral-900 bg-neutral-950">
          {isPending ? (
            // Skeleton Dark
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-neutral-800 rounded w-full" />
                <div className="h-3 bg-neutral-800 rounded w-2/3" />
              </div>
            </div>
          ) : user ? (
            // Perfil Logado (Dark Card)
            <div className="flex items-center gap-3 p-2.5 bg-neutral-900/50 rounded-xl border border-neutral-800 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 font-bold overflow-hidden relative ring-1 ring-neutral-700">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <span className="text-[13px] font-bold text-neutral-200 truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-neutral-500 truncate">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sair da conta"
                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            // Banner Deslogado (Dark Mode)
            <div className="flex flex-col gap-3 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-neutral-200">
                  Acesse sua conta
                </span>
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
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
