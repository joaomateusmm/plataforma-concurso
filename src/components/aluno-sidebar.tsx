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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Links de navegação exclusivos do Aluno
const navItems = [
  { title: "Painel do Aluno", url: "/aluno", icon: LayoutDashboard },
  { title: "Concursos Abertos", url: "/aluno/materiais", icon: BellRing },
  { title: "Editais", url: "/aluno/desempenho", icon: NotepadText },
  { title: "Notícias", url: "/aluno/materiais", icon: Megaphone },
  { title: "Aulas", url: "/aluno/aulas", icon: Video },
];

const navItems2 = [
  { title: "Criar Simulado", url: "/aluno/simulados", icon: CopyPlus },
  { title: "Matérias", url: "/aluno/simulados", icon: CopyPlus },
  { title: "Assuntos", url: "/aluno/simulados", icon: CopyPlus },
  { title: "Questões", url: "/aluno/simulados", icon: CopyPlus },
];

export function AlunoSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Puxamos os dados da conta logada
  const { data, isPending } = useSession();
  const user = data?.user;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Sidebar className="border-r border-gray-100 bg-neutral-100/60 backdrop-blur-sm">
      <SidebarHeader className="p-5 border-b border-gray-100 flex flex-row items-center">
        <Link
          className="flex items-center justify-center gap-3 hover:scale-[1.02] duration-300 w-full"
          href="/"
        >
          <div className="w-10 h-10 bg-green-600 rounded-xl shadow-md shadow-green-600/20 flex items-center justify-center text-white">
            <GraduationCap strokeWidth={2.5} className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-extrabold text-gray-800 leading-tight">
              +Aprovado
            </span>
            <span className="text-[10px] font-bold tracking-widest text-green-500 uppercase">
              Área do Aluno
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1 mb-2 px-4">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {navItems.map((item) => {
                const isActive =
                  item.url === "/aluno"
                    ? pathname === "/aluno"
                    : pathname?.startsWith(item.url);

                return (
                  <SidebarMenuItem
                    className={`my-1 active:scale-[0.98] p-1 font-medium duration-200 rounded-lg cursor-pointer shadow-sm ${
                      isActive
                        ? "bg-green-50 hover:bg-green-50 text-green-700 hover:text-green-700 shadow-md shadow-neutral-200"
                        : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-transparent"
                    }`}
                    key={item.title}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <item.icon
                          className={`w-5 h-5 ${isActive ? "text-green-600" : "text-gray-400"}`}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {navItems2.map((item) => {
                const isActive =
                  item.url === "/aluno"
                    ? pathname === "/aluno"
                    : pathname?.startsWith(item.url);

                return (
                  <SidebarMenuItem
                    className={`my-1 active:scale-[0.98] p-1 font-medium duration-200 rounded-lg cursor-pointer shadow-sm ${
                      isActive
                        ? "bg-green-50 hover:bg-green-50 text-green-700 shadow-green-100/50 hover:text-green-700"
                        : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-transparent"
                    }`}
                    key={item.title}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <item.icon
                          className={`w-5 h-5 ${isActive ? "text-green-600" : "text-gray-400"}`}
                        />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* RODAPÉ COM PERFIL DO USUÁRIO OU CALL TO ACTION */}
      <SidebarFooter className="p-4 border-t border-gray-100 bg-gray-50/50">
        {isPending ? (
          // 1. CARREGANDO: Efeito Skeleton
          <div className="flex items-center gap-3 animate-pulse px-2 py-1">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ) : user ? (
          // 2. LOGADO: Card do Perfil
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold overflow-hidden relative ring-2 ring-white">
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
              <span
                className="text-sm font-bold text-gray-800 truncate"
                title={user.name}
              >
                {user.name}
              </span>
              <span
                className="text-[11px] text-gray-500 truncate"
                title={user.email}
              >
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
        ) : (
          // 3. DESLOGADO: Banner Bonitão para Convite
          <div className="flex flex-col gap-3 p-4 bg-linear-to-br from-green-50 to-indigo-50/50 rounded-xl border border-green-100/50">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-green-900">
                Acesse sua conta
              </span>
              <span className="text-[11px] text-green-600/80 mt-0.5 leading-tight">
                Faça login para salvar seus simulados e acompanhar seu
                progresso!
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {/* Botão Principal: Entrar */}
              <Link
                href="/aluno/login"
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors text-center shadow-sm shadow-green-600/20"
              >
                Entrar agora
              </Link>

              {/* Link Secundário: Criar Conta */}
              <p className="text-[10px] text-center text-gray-500">
                Não tem conta?{" "}
                <Link
                  href="/aluno/login"
                  className="text-green-600 font-bold hover:underline"
                >
                  Cadastre-se grátis
                </Link>
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
