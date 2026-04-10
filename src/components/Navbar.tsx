"use client";

import Link from "next/link";
import Image from "next/image";
import { SplitHoverText } from "@/components/ui/SplitHoverText";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const titleColor = isDark ? "#ffffff" : "#101828"; // Branco no escuro, Preto no claro
  const linkColor = isDark ? "#a3a3a3" : "#6a7282"; // Cinza neutro em ambos, mas ajustado
  const hoverColor = "#009966"; // O Verde Esmeralda mantém-se igual!

  return (
    <nav className="flex items-center justify-between md:px-12 px-8 py-6 mx-auto bg-transparent transition-colors duration-300">
      <div>
        <Link
          className="flex items-center group justify-center w-full"
          href="/"
        >
          <Image
            className="mr-2"
            src="/logo.svg"
            width={45}
            height={45}
            alt="Logo +Aprovado"
          />
          <span className="text-2xl font-bold duration-300 tracking-[1px]">
            {mounted ? (
              <SplitHoverText
                text="+Aprovado"
                hoverText="+Aprovado"
                originalColor={titleColor}
                hoverColor={hoverColor}
                animationDuration={0.25}
                delayStep={0.025}
              />
            ) : (
              <span className="text-gray-900 dark:text-white">+Aprovado</span>
            )}
          </span>
        </Link>
      </div>

      <div className="hidden md:flex gap-6 mt-1 text-sm font-semibold text-gray-500 dark:text-neutral-400">
        <Link
          href="/aluno/editais"
          className="hover:text-black dark:hover:text-white"
        >
          {mounted ? (
            <SplitHoverText
              text="Editais"
              hoverText="Editais"
              originalColor={linkColor}
              hoverColor={hoverColor}
              animationDuration={0.25}
              delayStep={0.025}
            />
          ) : (
            <span>Editais</span>
          )}
        </Link>
        <Link
          href="/aluno/concursos"
          className="hover:text-black dark:hover:text-white"
        >
          {mounted ? (
            <SplitHoverText
              text="Concursos Abertos"
              hoverText="Concursos Abertos"
              originalColor={linkColor}
              hoverColor={hoverColor}
              animationDuration={0.25}
              delayStep={0.025}
            />
          ) : (
            <span>Concursos Abertos</span>
          )}
        </Link>
        <Link
          href="/aluno/noticias"
          className="hover:text-black dark:hover:text-white"
        >
          {mounted ? (
            <SplitHoverText
              text="Notícias"
              hoverText="Notícias"
              originalColor={linkColor}
              hoverColor={hoverColor}
              animationDuration={0.25}
              delayStep={0.025}
            />
          ) : (
            <span>Notícias</span>
          )}
        </Link>
        <Link
          href="/aluno/planos"
          className="hover:text-black dark:hover:text-white"
        >
          {mounted ? (
            <SplitHoverText
              text="Planos"
              hoverText="Planos"
              originalColor={linkColor}
              hoverColor={hoverColor}
              animationDuration={0.25}
              delayStep={0.025}
            />
          ) : (
            <span>Planos</span>
          )}
        </Link>
        <div className="-translate-y-1.5">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-semibold hover:underline">
          {mounted ? (
            <SplitHoverText
              text="Entrar"
              hoverText="Entrar"
              originalColor={titleColor}
              hoverColor={hoverColor}
              animationDuration={0.25}
              delayStep={0.025}
            />
          ) : (
            <span className="text-gray-900 dark:text-white">Entrar</span>
          )}
        </Link>
        <Link href="/login">
          <button className="bg-white dark:bg-neutral-900 border cursor-pointer shadow-sm text-[#009966] border-gray-200 dark:border-neutral-800 px-6 py-2 rounded-full text-sm font-bold hover:shadow-md dark:hover:shadow-neutral-900/50 duration-300">
            Criar Conta
          </button>
        </Link>
      </div>
    </nav>
  );
}
