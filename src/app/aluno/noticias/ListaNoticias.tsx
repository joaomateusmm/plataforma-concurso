"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Sparkles,
  Filter,
  MapPin,
  Map,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ListaNoticias({
  noticiasIniciais,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  noticiasIniciais: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
  const [filtroMunicipio, setFiltroMunicipio] = useState("");

  // Extrai as categorias e estados únicos que vieram do banco para os filtros
  const opcoesTipos = useMemo(() => {
    return Array.from(
      new Set(noticiasIniciais.map((n) => n.tipoConcurso).filter(Boolean)),
    );
  }, [noticiasIniciais]);

  const opcoesEstados = useMemo(() => {
    return Array.from(
      new Set(noticiasIniciais.map((n) => n.estado).filter(Boolean)),
    ).sort(); // Ordena alfabeticamente
  }, [noticiasIniciais]);

  const noticiasFiltradas = useMemo(() => {
    return noticiasIniciais.filter((n) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        n.titulo.toLowerCase().includes(lowerSearch) ||
        n.conteudo.toLowerCase().includes(lowerSearch);

      const matchTipo = !filtroTipo || n.tipoConcurso === filtroTipo;

      const matchEstado = !filtroEstado || n.estado === filtroEstado;

      const matchMunicipio =
        !filtroMunicipio.trim() ||
        (n.municipio &&
          n.municipio.toLowerCase().includes(filtroMunicipio.toLowerCase()));

      return matchSearch && matchTipo && matchEstado && matchMunicipio;
    });
  }, [noticiasIniciais, searchTerm, filtroTipo, filtroEstado, filtroMunicipio]);

  return (
    <>
      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="mb-9 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
        {/* BUSCA EM TEXTO GERAL */}
        <div className="group relative flex h-10 w-full max-w-md cursor-text items-center justify-between rounded-full bg-neutral-900 px-4 duration-300 hover:ring-1 hover:ring-neutral-800">
          <div className="flex w-full items-center">
            <Search className="mr-3 h-4 w-4 text-neutral-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar notícias..."
              className="w-full bg-transparent text-sm font-medium text-neutral-200 transition-colors placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="w-1 border-r h-10 border-neutral-800 hidden md:block"></div>

        {/* GRUPO DE FILTROS */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-neutral-700 font-medium text-sm hidden sm:block">
            Filtros:
          </span>

          {/* FILTRO: ÁREA/TIPO */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-neutral-900 cursor-pointer duration-300 hover:ring-[0.6px] ring-neutral-700 py-5 rounded-full pl-3 pr-4 border-none shadow-none ${
                  filtroTipo
                    ? " text-neutral-300 hover:bg-neutral-900"
                    : " text-neutral-500"
                }`}
              >
                <Filter className="mr-0.5 h-4 w-4 shrink-0" />
                <span>{filtroTipo || "Área do Concurso"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border border-neutral-800 text-neutral-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-neutral-500">
                  Selecione a Área
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroTipo(null)}
                  className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                >
                  Todas as Áreas
                </DropdownMenuItem>
                {opcoesTipos.map((tipo) => (
                  <DropdownMenuItem
                    key={tipo as string}
                    onClick={() => setFiltroTipo(tipo as string)}
                    className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                  >
                    {tipo as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* FILTRO: ESTADO */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-neutral-900 cursor-pointer duration-300 hover:ring-[0.6px] ring-neutral-700 py-5 rounded-full pl-3 pr-4 border-none shadow-none ${
                  filtroEstado
                    ? " text-neutral-300 hover:bg-neutral-900"
                    : " text-neutral-500"
                }`}
              >
                <MapPin className="mr-0.5 h-4 w-4 shrink-0" />
                <span>{filtroEstado || "Estado"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border border-neutral-800 text-neutral-300 max-h-64 overflow-y-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-neutral-500">
                  Filtrar por Estado
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroEstado(null)}
                  className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                >
                  Brasil Inteiro
                </DropdownMenuItem>
                {opcoesEstados.map((uf) => (
                  <DropdownMenuItem
                    key={uf as string}
                    onClick={() => setFiltroEstado(uf as string)}
                    className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                  >
                    {uf as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* FILTRO: MUNICÍPIO */}
          <div className="group relative flex h-10 w-35 cursor-text items-center justify-between rounded-full bg-neutral-900 px-4 gap-2.5 duration-300 hover:ring-1 hover:ring-neutral-800">
            <Map className=" h-4 w-4 shrink-0 text-neutral-500" />
            <input
              type="text"
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              placeholder="Município..."
              className="w-full bg-transparent text-sm font-medium  text-neutral-200 transition-colors placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {noticiasFiltradas.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-neutral-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Nenhuma notícia encontrada
          </h3>
          <p className="text-neutral-400 max-w-md">
            Tente pesquisar por outro termo ou limpar os filtros para ver o feed
            completo.
          </p>
          {(searchTerm || filtroTipo || filtroEstado || filtroMunicipio) && (
            <Button
              onClick={() => {
                setSearchTerm("");
                setFiltroTipo(null);
                setFiltroEstado(null);
                setFiltroMunicipio("");
              }}
              variant="outline"
              className="mt-6 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {noticiasFiltradas.map((noticia) => {
            const dataFormatada = format(
              new Date(noticia.dataPublicacao),
              "dd/MM/yyyy 'às' HH:mm",
              { locale: ptBR },
            );
            const localizacaoTexto = [noticia.estado, noticia.municipio]
              .filter(Boolean)
              .join(" - ");

            // CORREÇÃO: ufLink é gerado dinamicamente para CADA notícia aqui dentro do map
            const ufLink = noticia.estado ? noticia.estado.toLowerCase() : "br";

            return (
              <Link
                href={`/aluno/noticias/${ufLink}/${noticia.slug}`}
                key={noticia.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row overflow-hidden hover:ring-1 ring-neutral-700 duration-300 group relative"
              >
                {noticia.thumbnailUrl && (
                  <div className="relative w-full md:w-1/4 xl:w-1/5 h-48 md:h-auto overflow-hidden z-0 bg-neutral-950 shrink-0">
                    <Image
                      src={noticia.thumbnailUrl}
                      alt={noticia.titulo}
                      fill
                      unoptimized
                      className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="hidden md:block absolute inset-0 bg-linear-to-l from-neutral-900 via-transparent to-transparent" />
                    <div className="md:hidden absolute inset-0 bg-linear-to-t from-neutral-900 via-transparent to-transparent" />
                  </div>
                )}

                <div className="relative z-10 p-5 md:p-6 flex-1 flex flex-col bg-neutral-900 justify-center">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    {/* Agrupamento de Badges (Área e Localização) */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-md shadow-neutral-950/80 tracking-wider rounded-md bg-neutral-950/60  text-neutral-500">
                        {noticia.tipoConcurso}
                      </span>

                      {/* Badge Minimalista de Localização */}
                      {localizacaoTexto && (
                        <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-md shadow-neutral-950/80 tracking-wider rounded-md bg-neutral-950/60  text-neutral-500">
                          {localizacaoTexto}
                        </span>
                      )}
                    </div>

                    {/* Meta (Data exata e Autor) */}
                    <div className="flex flex-wrap flex-col items-end text-[11px] font-medium text-neutral-500">
                      <span className="flex items-center gap-1">
                        {dataFormatada}
                      </span>
                      <span className="text-neutral-500">
                        Por: {noticia.publicadoPor}
                      </span>
                    </div>
                  </div>

                  {/* Título e Resumo */}
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 duration-300">
                    {noticia.titulo}
                  </h3>

                  <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                    {noticia.conteudo}
                  </p>

                  {/* Botão Inferior Falso (Apenas Visual) */}
                  <div className="mt-auto flex items-center justify-start gap-2.5">
                    <span className="text-sm font-bold text-neutral-400 group-hover:text-neutral-300 duration-300">
                      Ler Artigo
                    </span>
                    <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center group-hover:text-neutral-400 text-neutral-500 transition-all duration-300 group-hover:translate-x-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}