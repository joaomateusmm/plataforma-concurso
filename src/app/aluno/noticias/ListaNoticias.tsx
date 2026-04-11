"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, Filter, MapPin, Map } from "lucide-react";
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

  const opcoesTipos = useMemo(() => {
    return Array.from(
      new Set(noticiasIniciais.map((n) => n.tipoConcurso).filter(Boolean)),
    );
  }, [noticiasIniciais]);

  const opcoesEstados = useMemo(() => {
    return Array.from(
      new Set(noticiasIniciais.map((n) => n.estado).filter(Boolean)),
    ).sort();
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
      <div className="mb-9 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
        <div className="group relative flex h-10 w-full max-w-md cursor-text items-center justify-between rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-transparent px-4 duration-300 hover:ring-1 hover:ring-gray-300 dark:hover:ring-neutral-800 transition-colors">
          <div className="flex w-full items-center">
            <Search className="mr-3 h-4 w-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-colors duration-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar notícias..."
              className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-neutral-200 transition-colors duration-300 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="w-1 border-r h-10 border-gray-200 dark:border-neutral-800 hidden md:block transition-colors duration-300"></div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-700 dark:text-neutral-300 font-medium text-sm hidden sm:block transition-colors duration-300">
            Filtros:
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-white dark:bg-neutral-900 cursor-pointer duration-300 hover:ring-[0.6px] ring-gray-300 dark:ring-neutral-700 py-5 rounded-full pl-3 pr-4 border border-gray-200 dark:border-none shadow-sm dark:shadow-none transition-colors ${
                  filtroTipo
                    ? "text-gray-900 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                    : "text-gray-500 dark:text-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-900"
                }`}
              >
                <Filter className="mr-0.5 h-4 w-4 shrink-0" />
                <span>{filtroTipo || "Área do Concurso"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                  Selecione a Área
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroTipo(null)}
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                >
                  Todas as Áreas
                </DropdownMenuItem>
                {opcoesTipos.map((tipo) => (
                  <DropdownMenuItem
                    key={tipo as string}
                    onClick={() => setFiltroTipo(tipo as string)}
                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                  >
                    {tipo as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-white dark:bg-neutral-900 cursor-pointer duration-300 hover:ring-[0.6px] ring-gray-300 dark:ring-neutral-700 py-5 rounded-full pl-3 pr-4 border border-gray-200 dark:border-none shadow-sm dark:shadow-none transition-colors ${
                  filtroEstado
                    ? "text-gray-900 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                    : "text-gray-500 dark:text-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-900"
                }`}
              >
                <MapPin className="mr-0.5 h-4 w-4 shrink-0" />
                <span>{filtroEstado || "Estado"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 max-h-64 overflow-y-auto transition-colors duration-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                  Filtrar por Estado
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroEstado(null)}
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                >
                  Brasil Inteiro
                </DropdownMenuItem>
                {opcoesEstados.map((uf) => (
                  <DropdownMenuItem
                    key={uf as string}
                    onClick={() => setFiltroEstado(uf as string)}
                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                  >
                    {uf as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="group relative flex h-10 w-35 cursor-text items-center justify-between rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-transparent px-4 gap-2.5 duration-300 hover:ring-1 hover:ring-gray-300 dark:hover:ring-neutral-800 transition-colors">
            <Map className="h-4 w-4 shrink-0 text-gray-400 dark:text-neutral-500 transition-colors duration-300" />
            <input
              type="text"
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              placeholder="Município..."
              className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-neutral-200 transition-colors duration-300 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {noticiasFiltradas.length === 0 ? (
        <div className="p-32 text-center flex flex-col items-center justify-center shadow-sm transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Nenhuma notícia encontrada
          </h3>
          <p className="text-gray-600 dark:text-neutral-400 max-w-md transition-colors duration-300">
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
              className="mt-6 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-colors duration-300"
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

            const ufLink = noticia.estado ? noticia.estado.toLowerCase() : "br";

            return (
              <Link
                href={`/aluno/noticias/${ufLink}/${noticia.slug}`}
                key={noticia.id}
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl flex flex-col md:flex-row overflow-hidden hover:ring-1 hover:ring-gray-300 dark:hover:ring-neutral-700 duration-300 group relative shadow-sm dark:shadow-none transition-colors"
              >
                {noticia.thumbnailUrl && (
                  <div className="relative w-full md:w-1/4 xl:w-1/5 h-48 md:h-auto overflow-hidden z-0 bg-gray-100 dark:bg-neutral-950 shrink-0 transition-colors duration-300">
                    <Image
                      src={noticia.thumbnailUrl}
                      alt={noticia.titulo}
                      fill
                      unoptimized
                      className="object-cover opacity-90 dark:opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="hidden md:block absolute inset-0 bg-linear-to-l from-white dark:from-neutral-900 via-transparent to-transparent transition-colors duration-300" />
                    <div className="md:hidden absolute inset-0 bg-linear-to-t from-white dark:from-neutral-900 via-transparent to-transparent transition-colors duration-300" />
                  </div>
                )}

                <div className="relative z-10 p-5 md:p-6 flex-1 flex flex-col bg-white dark:bg-neutral-900 justify-center transition-colors duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-sm dark:shadow-md dark:shadow-neutral-950/80 tracking-wider rounded-md bg-gray-100 dark:bg-neutral-950/60 text-gray-600 dark:text-neutral-500 transition-colors duration-300">
                        {noticia.tipoConcurso}
                      </span>

                      {localizacaoTexto && (
                        <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-sm dark:shadow-md dark:shadow-neutral-950/80 tracking-wider rounded-md bg-gray-100 dark:bg-neutral-950/60 text-gray-600 dark:text-neutral-500 transition-colors duration-300">
                          {localizacaoTexto}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap flex-col items-end text-[11px] font-medium text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                      <span className="flex items-center gap-1">
                        {dataFormatada}
                      </span>
                      <span className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                        Por: {noticia.publicadoPor}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-[#009966] dark:group-hover:text-emerald-400 duration-300 transition-colors">
                    {noticia.titulo}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4 transition-colors duration-300">
                    {noticia.conteudo}
                  </p>

                  <div className="mt-auto flex items-center justify-start gap-2.5">
                    <span className="text-sm font-bold text-gray-600 dark:text-neutral-400 group-hover:text-gray-900 dark:group-hover:text-neutral-300 duration-300 transition-colors">
                      Ler Artigo
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 dark:text-neutral-500 group-hover:text-gray-900 dark:group-hover:text-neutral-400 transition-all duration-300 group-hover:translate-x-1">
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
