"use client";

import { Search, X, CopyPlus, Video, NotepadText } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Adaptado para o contexto de uma Plataforma de Concursos
type SearchItem = {
  id: string;
  name: string;
  type: "simulado" | "aula" | "edital";
  url: string;
  tag: string;
};

// Dados "mockados" por enquanto
const mockData: SearchItem[] = [
  {
    id: "1",
    name: "Simulado PMCE - Reta Final",
    type: "simulado",
    url: "/aluno/simulados/novo",
    tag: "Novo",
  },
  {
    id: "2",
    name: "História do Ceará - Ciclo do Ouro",
    type: "aula",
    url: "/aluno/aulas",
    tag: "Vídeo",
  },
  {
    id: "3",
    name: "Edital TJCE 2026 Publicado",
    type: "edital",
    url: "/aluno/noticias",
    tag: "Urgente",
  },
  {
    id: "4",
    name: "Criar Simulado Personalizado",
    type: "simulado",
    url: "/aluno/simulados/novo",
    tag: "Ferramenta",
  },
  {
    id: "5",
    name: "Meus Simulados Feitos",
    type: "simulado",
    url: "/aluno/simulados",
    tag: "Histórico",
  },
];

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Controle de Hidratação sem erro do ESLint
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Usar um setTimeout de 0ms tira a execução do fluxo síncrono do React,
    // o que resolve o erro "react-hooks/set-state-in-effect" perfeitamente.
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredItems =
    query === ""
      ? mockData
      : mockData.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase()),
        );

  const getIconForType = (type: string) => {
    switch (type) {
      case "simulado":
        return (
          <CopyPlus className="w-4 h-4 text-[#009966] dark:text-emerald-500 transition-colors duration-300" />
        );
      case "aula":
        return (
          <Video className="w-4 h-4 text-blue-600 dark:text-blue-500 transition-colors duration-300" />
        );
      case "edital":
        return (
          <NotepadText className="w-4 h-4 text-amber-500 dark:text-amber-500 transition-colors duration-300" />
        );
      default:
        return (
          <Search className="w-4 h-4 text-gray-500 dark:text-neutral-500 transition-colors duration-300" />
        );
    }
  };

  const modalContent = isOpen ? (
    // Corrigido para z-9999 conforme sugestão do Tailwind
    <div className="fixed inset-0 z-9999 flex items-start justify-center pt-20 sm:pt-32">
      {/* Overlay Escuro com blur */}
      <div
        className="fixed inset-0 bg-gray-900/50 dark:bg-neutral-950/80 backdrop-blur-sm transition-all duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* O Card do Modal */}
      <div className="animate-in fade-in zoom-in-95 relative mx-4 w-full max-w-2xl transform overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300">
        {/* Header do Modal (Input) */}
        <div className="flex items-center border-b border-gray-200 dark:border-neutral-800 px-4 py-4 transition-colors duration-300">
          <Search className="h-5 w-5 text-gray-500 dark:text-neutral-500 shrink-0 transition-colors duration-300" />
          <input
            ref={inputRef}
            type="text"
            className="ml-3 flex-1 bg-transparent text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 outline-none transition-colors duration-300"
            placeholder="Pesquisar simulados, aulas, notícias..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 text-gray-500 dark:text-neutral-500 transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Modal (Resultados) */}
        <div className="max-h-[60vh] overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500 dark:text-neutral-500 transition-colors duration-300">
              Nenhum resultado encontrado para &quot;{query}&quot;
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                {query === "" ? "Sugestões Rápidas" : "Resultados"}
              </div>

              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between px-3 py-3 rounded-xl duration-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 flex items-center justify-center shrink-0 transition-colors duration-300">
                      {getIconForType(item.type)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-neutral-200 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {item.name}
                    </span>
                  </div>

                  <span className="rounded bg-gray-100 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-2 py-1 text-[10px] font-bold tracking-wider text-gray-500 dark:text-neutral-400 uppercase transition-colors duration-300">
                    {item.tag}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        <div className="flex items-center border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
          <span className="mr-3 flex items-center gap-1.5">
            <kbd className="rounded border border-gray-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-1.5 py-0.5 text-gray-600 dark:text-neutral-400 transition-colors duration-300">
              ESC
            </kbd>{" "}
            para fechar
          </span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="group relative hidden h-9 w-64 cursor-text items-center justify-between rounded-full bg-gray-100 dark:bg-neutral-900 px-3 transition-all duration-300 hover:ring-1 hover:ring-gray-300 dark:hover:ring-neutral-800 md:flex"
      >
        <div className="flex items-center">
          <Search className="mr-2 h-3 w-3 text-gray-500 dark:text-neutral-500 transition-colors duration-300" />

          <span className="text-xs font-medium text-gray-500 dark:text-neutral-500 transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-neutral-400 hidden sm:block">
            Pesquisar na plataforma...
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-neutral-600 transition-colors duration-300">
          <kbd className="rounded bg-gray-200 dark:bg-neutral-800 px-1.5 py-0.5 font-sans transition-colors duration-300">
            ⌘
          </kbd>
          <kbd className="rounded bg-gray-200 dark:bg-neutral-800 px-1.5 py-0.5 font-sans transition-colors duration-300">
            K
          </kbd>
        </div>
      </div>

      {mounted && typeof document !== "undefined"
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
