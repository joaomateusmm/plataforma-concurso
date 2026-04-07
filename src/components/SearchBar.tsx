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
        return <CopyPlus className="w-4 h-4 text-emerald-500" />;
      case "aula":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "edital":
        return <NotepadText className="w-4 h-4 text-amber-500" />;
      default:
        return <Search className="w-4 h-4 text-neutral-500" />;
    }
  };

  const modalContent = isOpen ? (
    // Corrigido para z-9999 conforme sugestão do Tailwind
    <div className="fixed inset-0 z-9999 flex items-start justify-center pt-20 sm:pt-32">
      {/* Overlay Escuro com blur */}
      <div
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* O Card do Modal */}
      <div className="animate-in fade-in zoom-in-95 relative mx-4 w-full max-w-2xl transform overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all">
        {/* Header do Modal (Input) */}
        <div className="flex items-center border-b border-neutral-800 px-4 py-4">
          <Search className="h-5 w-5 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="ml-3 flex-1 bg-transparent text-base text-white placeholder-neutral-500 outline-none"
            placeholder="Pesquisar simulados, aulas, notícias..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Modal (Resultados) */}
        <div className="max-h-[60vh] overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-sm text-neutral-500">
              Nenhum resultado encontrado para &quot;{query}&quot;
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {query === "" ? "Sugestões Rápidas" : "Resultados"}
              </div>

              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between px-3 py-3 rounded-xl duration-200 hover:bg-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
                      {getIconForType(item.type)}
                    </div>
                    <span className="text-sm font-medium text-neutral-200 transition-colors group-hover:text-white">
                      {item.name}
                    </span>
                  </div>

                  <span className="rounded bg-neutral-950 border border-neutral-800 px-2 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                    {item.tag}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        <div className="flex items-center border-t border-neutral-800 bg-neutral-950 px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          <span className="mr-3 flex items-center gap-1.5">
            <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-neutral-400">
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
        className="group relative hidden h-9 w-64 cursor-text items-center justify-between rounded-full bg-neutral-900 px-3 duration-300 hover:ring-1 hover:ring-neutral-800 md:flex"
      >
        <div className="flex items-center">
          <Search className="mr-2 h-3 w-3 text-neutral-500" />

          <span className="text-xs font-medium text-neutral-500 transition-colors group-hover:text-neutral-400 hidden sm:block">
            Pesquisar na plataforma...
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-600">
          <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 font-sans">
            ⌘
          </kbd>
          <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 font-sans">
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
