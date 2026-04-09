/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  Sparkles,
  NotepadText,
  Search,
  GalleryVerticalEnd,
} from "lucide-react";
import { obterEditaisPublicados } from "@/actions/editais";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function EditaisAlunoPage() {
  const [editais, setEditais] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroBanca, setFiltroBanca] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEditais() {
      try {
        const res = await obterEditaisPublicados();
        if (isMounted) {
          if (res.success && res.editais) {
            setEditais(res.editais);
          } else {
            toast.error("Ops!", { description: res.error });
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (isMounted) {
          toast.error("Erro", { description: "Falha ao buscar editais." });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchEditais();

    return () => {
      isMounted = false;
    };
  }, []);

  // Extrai as bancas únicas dos editais que vieram do banco para preencher o Dropdown
  const opcoesBancas = useMemo(() => {
    return Array.from(
      new Set(editais.map((e) => e.banca).filter(Boolean))
    );
  }, [editais]);

  // Lógica de Filtragem
  const editaisFiltrados = useMemo(() => {
    return editais.filter((e) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        e.titulo.toLowerCase().includes(lowerSearch) ||
        (e.descricao && e.descricao.toLowerCase().includes(lowerSearch));

      const matchBanca = !filtroBanca || e.banca === filtroBanca;

      return matchSearch && matchBanca;
    });
  }, [editais, searchTerm, filtroBanca]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 mb-12 animate-in fade-in duration-500">
      {/* CABEÇALHO HERO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <NotepadText className="w-8 h-8 text-emerald-500" />
            Editais
          </h1>
          <p className="text-neutral-400">
            Escolha o seu concurso alvo e acesse o raio-x completo do edital.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="mb-9 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
        {/* BUSCA EM TEXTO */}
        <div className="group relative flex h-10 w-full max-w-md cursor-text items-center justify-between rounded-full bg-neutral-900 px-4 duration-300 hover:ring-1 hover:ring-neutral-800">
          <div className="flex w-full items-center">
            <Search className="mr-3 h-4 w-4 text-neutral-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título ou palavras-chave..."
              className="w-full bg-transparent text-sm font-medium text-neutral-200 transition-colors placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-neutral-600 shrink-0 pl-2">
            <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 font-sans">
              ⌘
            </kbd>
            <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 font-sans">
              K
            </kbd>
          </div>
        </div>

        <div className="w-1 border-r h-10 border-neutral-800 hidden md:block"></div>

        {/* DROPDOWNS DINÂMICOS */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-neutral-700 font-medium text-sm hidden sm:block">
            Filtros:
          </span>

          {/* BANCA */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-neutral-900 cursor-pointer duration-300 hover:ring-[0.6px] ring-neutral-700 py-5 rounded-full px-4 border-none shadow-none ${
                  filtroBanca
                    ? " text-neutral-300 hover:bg-neutral-900"
                    : " text-neutral-500"
                }`}
              >
                <GalleryVerticalEnd className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-30">
                  {filtroBanca || "Banca"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border border-neutral-800 text-neutral-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-neutral-500">
                  Filtrar por Banca
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroBanca(null)}
                  className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                >
                  Todas as Bancas
                </DropdownMenuItem>
                {opcoesBancas.map((banca) => (
                  <DropdownMenuItem
                    key={banca as string}
                    onClick={() => setFiltroBanca(banca as string)}
                    className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                  >
                    {banca as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* LISTAGEM DE EDITAIS EM GRID */}
      {editaisFiltrados.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-neutral-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Nenhum edital encontrado
          </h3>
          <p className="text-neutral-400 max-w-md">
            Tente pesquisar por outro termo ou limpar os filtros para ver todos os editais.
          </p>
          <Button 
            onClick={() => { setSearchTerm(""); setFiltroBanca(null); }}
            variant="outline" 
            className="mt-6 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800"
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {editaisFiltrados.map((edital) => (
            <div
              key={edital.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col overflow-hidden hover:ring-1 ring-neutral-700 duration-300 group relative min-h-80"
            >
              {edital.thumbnailUrl && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <Image
                    src={edital.thumbnailUrl}
                    alt={edital.titulo}
                    fill
                    unoptimized
                    className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                </div>
              )}

              {/* CONTEÚDO DO CARD */}
              <div className="relative z-10 p-6 flex-1 flex flex-col">
                {/* Meta Header */}
                <div className="flex justify-between items-start mb-5">
                  {edital.banca && (
                    <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-neutral-950/20  shadow-sm backdrop-blur-sm border-neutral-800 text-neutral-400 flex items-center gap-1.5 shadow-neutral-950">
                      {edital.banca}
                    </span>
                  )}
                </div>

                {/* Título e Descrição */}
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-emerald-400 duration-300 drop-shadow-md">
                  {edital.titulo}
                </h3>

                {edital.descricao ? (
                  <p className="text-sm text-neutral-400 line-clamp-3 mb-6 leading-relaxed drop-shadow-sm">
                    {edital.descricao}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-600 italic mb-6">
                    Sem descrição adicional fornecida para este edital.
                  </p>
                )}

                <div className="mt-auto pt-6 border-t border-neutral-800/60 relative">
                  <Link
                    href={`/aluno/editais/${edital.id}`}
                    className="w-full flex items-center justify-between group/btn"
                  >
                    <span className="text-sm font-bold text-neutral-300 group-hover/btn:text-emerald-400 transition-colors">
                      Explorar Edital
                    </span>
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover/btn:bg-emerald-500 group-hover/btn:text-neutral-950 text-neutral-400 transition-all duration-300 group-hover/btn:translate-x-1">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}