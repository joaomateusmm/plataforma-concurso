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
    return Array.from(new Set(editais.map((e) => e.banca).filter(Boolean)));
  }, [editais]);

  // 1. Lógica de Filtragem Base
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

  // 2. LÓGICA DE AGRUPAMENTO POR ANO
  const editaisAgrupadosPorAno = useMemo(() => {
    const grupos: Record<string, any[]> = {};

    editaisFiltrados.forEach((edital) => {
      const ano = edital.ano ? edital.ano.toString() : "Sem Ano Definido";
      if (!grupos[ano]) {
        grupos[ano] = [];
      }
      grupos[ano].push(edital);
    });

    // Ordenar os anos decrescentemente (mais recente primeiro)
    const anosOrdenados = Object.keys(grupos).sort((a, b) => {
      // Se não tiver ano, vai pro final da lista
      if (a === "Sem Ano Definido") return 1;
      if (b === "Sem Ano Definido") return -1;
      // Ordenação numérica decrescente
      return parseInt(b) - parseInt(a);
    });

    return { grupos, anosOrdenados };
  }, [editaisFiltrados]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#009966] dark:text-emerald-500 transition-colors duration-300" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 mb-12 animate-in fade-in duration-500">
      {/* CABEÇALHO HERO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2 transition-colors duration-300">
            <NotepadText className="w-8 h-8 text-[#009966] dark:text-emerald-500 transition-colors duration-300" />
            Editais
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 transition-colors duration-300">
            Escolha o seu concurso alvo e acesse o raio-x completo do edital.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-gray-200 dark:border-neutral-800 transition-colors duration-300"></div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="mb-9 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
        {/* BUSCA EM TEXTO */}
        <div className="group relative flex h-10 w-full max-w-md cursor-text items-center justify-between rounded-full bg-white dark:bg-neutral-900 px-4 transition-all duration-300 hover:ring-1 hover:ring-gray-300 dark:hover:ring-neutral-800 border border-gray-200 dark:border-transparent">
          <div className="flex w-full items-center">
            <Search className="mr-3 h-4 w-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-colors duration-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título ou palavras-chave..."
              className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-neutral-200 transition-colors placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-neutral-600 shrink-0 pl-2 transition-colors duration-300">
            <kbd className="rounded bg-gray-200 dark:bg-neutral-800 px-1.5 py-0.5 font-sans transition-colors duration-300">
              ⌘
            </kbd>
            <kbd className="rounded bg-gray-200 dark:bg-neutral-800 px-1.5 py-0.5 font-sans transition-colors duration-300">
              K
            </kbd>
          </div>
        </div>

        <div className="w-1 border-r h-10 border-gray-200 dark:border-neutral-800 hidden md:block transition-colors duration-300"></div>

        {/* DROPDOWNS DINÂMICOS */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-600 dark:text-neutral-700 font-medium text-sm hidden sm:block transition-colors duration-300">
            Filtros:
          </span>

          {/* BANCA */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-white dark:bg-neutral-900 cursor-pointer transition-all duration-300 hover:ring-[0.6px] ring-gray-300 dark:ring-neutral-700 py-5 rounded-full px-4 border border-gray-200 dark:border-none shadow-sm dark:shadow-none ${
                  filtroBanca
                    ? " text-gray-900 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                    : " text-gray-500 dark:text-neutral-500"
                }`}
              >
                <GalleryVerticalEnd className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-30">
                  {filtroBanca || "Banca"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                  Filtrar por Banca
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroBanca(null)}
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 transition-colors duration-300"
                >
                  Todas as Bancas
                </DropdownMenuItem>
                {opcoesBancas.map((banca) => (
                  <DropdownMenuItem
                    key={banca as string}
                    onClick={() => setFiltroBanca(banca as string)}
                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 transition-colors duration-300"
                  >
                    {banca as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* LISTAGEM DE EDITAIS AGRUPADOS POR ANO */}
      {editaisFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm transition-colors duration-300">
          <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
            <Sparkles className="w-10 h-10 text-gray-400 dark:text-neutral-600 transition-colors duration-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Nenhum edital encontrado
          </h3>
          <p className="text-gray-500 dark:text-neutral-400 max-w-md transition-colors duration-300">
            Tente pesquisar por outro termo ou limpar os filtros para ver todos
            os editais.
          </p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setFiltroBanca(null);
            }}
            variant="outline"
            className="mt-6 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-300"
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="space-y-16">
          {/* ITERA SOBRE OS ANOS ENCONTRADOS */}
          {editaisAgrupadosPorAno.anosOrdenados.map((ano) => (
            <div key={ano} className="space-y-6">
              {/* TÍTULO DA SEÇÃO (ANO) */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {ano !== "Sem Ano Definido" ? `Concursos ${ano}` : ano}
                  </h2>
                </div>
                <div className="h-px bg-gray-200 dark:bg-neutral-800 flex-1 mt-1 transition-colors duration-300"></div>
              </div>

              {/* GRID DE EDITAIS DESSE ANO */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {editaisAgrupadosPorAno.grupos[ano].map((edital) => (
                  <div
                    key={edital.id}
                    className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl flex flex-col overflow-hidden hover:ring-1 hover:ring-gray-300 dark:hover:ring-neutral-700 transition-all duration-300 group relative min-h-80"
                  >
                    {edital.thumbnailUrl && (
                      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <Image
                          src={edital.thumbnailUrl}
                          alt={edital.titulo}
                          fill
                          unoptimized
                          className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent transition-colors duration-300" />
                        <div className="absolute inset-0 bg-linear-to-t from-white dark:from-neutral-900 via-white/40 dark:via-neutral-900/40 to-transparent transition-colors duration-300" />
                      </div>
                    )}

                    {/* CONTEÚDO DO CARD */}
                    <div className="relative z-10 p-6 flex-1 flex flex-col">
                      {/* Meta Header */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-wrap gap-2">
                          {edital.banca && (
                            <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-gray-100/50 dark:bg-neutral-950/20 shadow-sm backdrop-blur-sm border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 flex items-center gap-1.5 dark:shadow-neutral-950 transition-colors duration-300">
                              {edital.banca}
                            </span>
                          )}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {edital.logoOrgao ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={edital.logoOrgao}
                              alt="Logo do Órgão"
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <span></span>
                          )}
                        </div>
                      </div>

                      {/* Título e Descrição */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-[#009966] dark:group-hover:text-emerald-400 transition-colors duration-300 drop-shadow-md">
                        {edital.titulo}
                      </h3>

                      {edital.descricao ? (
                        <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-3 mb-6 leading-relaxed drop-shadow-sm transition-colors duration-300">
                          {edital.descricao}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-neutral-600 italic mb-6 transition-colors duration-300">
                          Sem descrição adicional fornecida para este edital.
                        </p>
                      )}

                      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-neutral-800/60 relative transition-colors duration-300">
                        <Link
                          href={`/aluno/editais/${edital.id}`}
                          className="w-full flex items-center justify-between group/btn"
                        >
                          <span className="text-sm font-bold text-gray-700 dark:text-neutral-300 group-hover/btn:text-[#009966] dark:group-hover/btn:text-emerald-400 transition-colors duration-300">
                            Explorar Edital
                          </span>
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center group-hover/btn:bg-[#009966] dark:group-hover/btn:bg-emerald-500 group-hover/btn:text-white dark:group-hover/btn:text-neutral-950 text-gray-500 dark:text-neutral-400 transition-all duration-300 group-hover/btn:translate-x-1">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
