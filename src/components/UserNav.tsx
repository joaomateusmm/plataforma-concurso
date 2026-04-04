// src/components/UserNav.tsx
"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  UserPlus,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function UserNav() {
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  if (isPending)
    return (
      <div className="h-7 w-7 animate-pulse rounded-full bg-neutral-900" />
    );

  return (
    <div
      className="relative z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        onClick={toggleMenu}
        className={`flex cursor-pointer items-center gap-2 rounded-full border bg-neutral-900 p-1 pr-3 duration-300 ${
          isOpen
            ? "border-neutral-700 ring-1 ring-neutral-700"
            : "border-transparent hover:border-neutral-700"
        }`}
      >
        {session ? (
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-[10px] font-bold text-white ring-1 ring-neutral-700">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                fill
                className="object-cover"
                sizes="28px"
              />
            ) : (
              session.user.name?.charAt(0).toUpperCase()
            )}
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 ring-1 ring-neutral-700">
            <UserRound size={12} />
          </div>
        )}

        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-500 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </div>

      {/* --- DROPDOWN MENU --- */}
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 w-60 pt-2 duration-200">
          {/* Espaço invisível para não perder o hover ao mover o rato */}
          <div className="absolute -top-2 right-0 left-0 h-2" />

          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Informações da Conta */}
            <div className="mb-1 border-b border-neutral-800/50 px-3 py-2.5">
              {session ? (
                <>
                  <p className="truncate text-xs font-bold text-white">
                    {session.user.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-neutral-500">
                    {session.user.email}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-white">Visitante</p>
                  <p className="mt-0.5 text-[10px] text-neutral-500 leading-tight">
                    Faça login para acessar os simulados.
                  </p>
                </>
              )}
            </div>

            {/* Links de Navegação */}
            <div className="space-y-1">
              <MenuLink
                href="/aluno"
                icon={<LayoutDashboard size={14} />}
                label="Painel de Estudos"
                onClick={() => setIsOpen(false)}
              />

              {session && (
                <>
                  <MenuLink
                    href="/aluno/perfil"
                    icon={<UserRound size={14} />}
                    label="Meu Perfil"
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuLink
                    href="/aluno/configuracoes"
                    icon={<Settings size={14} />}
                    label="Configurações"
                    onClick={() => setIsOpen(false)}
                  />
                </>
              )}
            </div>

            {/* Ações (Sair / Entrar) */}
            <div className="mt-1.5 border-t border-neutral-800/50 pt-1">
              {session ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut size={14} />
                  Sair da conta
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-1 py-1">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-neutral-800 py-2 text-[11px] font-bold text-white duration-300 hover:bg-neutral-700"
                  >
                    <LogIn size={12} />
                    Entrar
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-[11px] font-bold text-white duration-300 hover:bg-emerald-500"
                  >
                    <UserPlus size={12} />
                    Criar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para os links
function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-neutral-400 transition-all hover:bg-neutral-800/80 hover:text-white"
    >
      <span className="text-neutral-500 transition-colors group-hover:text-emerald-500">
        {icon}
      </span>
      {label}
    </Link>
  );
}
