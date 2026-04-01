// src/components/app-sidebar.tsx
"use client";

import {
  BookOpen,
  CircleFadingPlus,
  FileText,
  Home,
  Layers,
  Library,
} from "lucide-react";
import Link from "next/link";
// 1. Importamos o usePathname para saber em que página estamos
import { usePathname } from "next/navigation";

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
} from "@/components/ui/sidebar";

const nav2Items = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Gerenciar Questões", url: "/admin/questoes", icon: FileText },
  { title: "Gerenciar Bancas", url: "/admin/bancas", icon: Library },
  { title: "Gerenciar Matérias", url: "/admin/materias", icon: Layers },
  { title: "Gerenciar Assuntos", url: "/admin/assuntos", icon: BookOpen },
];

export function AppSidebar() {
  // 2. Lemos a URL atual do navegador (Ex: "/admin/materias")
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-5 border-b border-gray-100 flex flex-row">
        <Link
          className="flex items-center justify-center gap-2 hover:scale-[1.02] duration-300"
          href="/"
        >
          <div className="w-10 h-10 bg-green-600 rounded-md shadow-md flex items-center justify-center text-white">
            <CircleFadingPlus />
          </div>
          <span className="text-lg font-bold text-green-600">+Aprovado</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu de Visualização</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav2Items.map((item) => {
                // 3. Verificamos se este item é a página ativa
                // Fazemos uma verificação exata para o Dashboard ("/") e "começa com" para as outras rotas (para manter ativo mesmo ao editar ?edit=1)
                const isActive =
                  item.url === "/admin"
                    ? pathname === "/admin"
                    : pathname?.startsWith(item.url);

                return (
                  <SidebarMenuItem
                    // 4. Usamos crases (template literals) para injetar classes condicionais no Tailwind
                    className={`my-1.5 active:scale-95 p-1 font-medium duration-200 mx-1 rounded-md shadow-sm ${
                      isActive
                        ? "bg-neutral-100/30 text-neutral-800 shadow-neutral-200 hover:bg-neutral-200" // ESTILO QUANDO ATIVO
                        : "bg-neutral-100/30 text-neutral-800 shadow-neutral-200 hover:bg-neutral-200" // ESTILO QUANDO INATIVO
                    }`}
                    key={item.title}
                  >
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
