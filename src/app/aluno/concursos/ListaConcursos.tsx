// src/app/aluno/concursos/ListaConcursos.tsx
"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  Building2,
  GraduationCap,
  CircleDollarSign,
  Users,
  ExternalLink,
  FileText,
  Clock,
  Search,
  GalleryVerticalEnd,
  CircleDashed,
  Bell,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

function extrairSalario(texto: string | null): number {
  if (!texto) return 0;
  // Expressão regular para achar padrões monetários
  const numeros = texto.match(/\d{1,3}(\.\d{3})*(,\d{2})?/g);
  if (!numeros) return 0;

  // Converte todos os resultados encontrados para número e pega o maior
  const valores = numeros.map((n) =>
    parseFloat(n.replace(/\./g, "").replace(",", ".")),
  );
  return Math.max(...valores);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConcursoCard({ concurso }: { concurso: any }) {
  const isEmBreve =
    concurso.status === "Em Breve" || concurso.status === "Edital Em Breve";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Inscrições Abertas":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Em Breve":
      case "Edital Em Breve":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Inscrições Encerradas":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Encerrado":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-300 group h-full">
      <div className="p-5 border-b border-neutral-800/50 flex items-center justify-between bg-neutral-950/30">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
            concurso.status,
          )}`}
        >
          {concurso.status}
        </span>
        <div className="flex gap-1 items-center justify-center text-sm font-medium text-neutral-500">
          Banca:
          <span className="text-xs font-bold text-neutral-500 bg-neutral-800 px-2.5 py-1 rounded-md">
            {concurso.banca}
          </span>
        </div>
      </div>

      <div className="flex px-6 pt-4 ">
        <button className="bg-neutral-800 flex gap-2 font-medium items-center py-1 px-2 text-xs rounded-md text-neutral-500 hover:text-neutral-200 duration-300 shadow-sm hover:shadow-md cursor-pointer">
          <Bell className="h-3 w-3" /> Ativar Lembrete
        </button>
      </div>

      <div className="px-6 py-4 flex-1 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-200 group-hover:text-emerald-400 transition-colors leading-tight">
            {concurso.orgao}
          </h2>
          <p className="text-emerald-500 font-medium text-sm mt-1">
            {concurso.cargo}
          </p>
        </div>

        {concurso.descricao && (
          <p className="text-sm text-neutral-400 line-clamp-2">
            {concurso.descricao}
          </p>
        )}

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-2">
          <div className="flex items-center gap-2 text-neutral-300">
            <CircleDollarSign className="w-4 h-4 text-neutral-500 shrink-0" />
            <span
              className="text-xs font-medium truncate"
              title={concurso.salario || ""}
            >
              {concurso.salario || "A definir"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Users className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-xs font-medium truncate">
              {concurso.vagas || "Cadastro Reserva"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 col-span-2">
            <GraduationCap className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-xs font-medium truncate">
              {concurso.escolaridade || "Não informado"}
            </span>
          </div>
        </div>

        {(concurso.periodoInscricao || concurso.periodoIsencao) && (
          <div className="border-t border-neutral-800/60 pt-4 mt-2 space-y-2">
            {concurso.periodoInscricao && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-neutral-400 leading-tight">
                  <span className="font-bold text-neutral-300 block">
                    Período de Inscrição:
                  </span>
                  {concurso.periodoInscricao}
                </p>
              </div>
            )}
            {concurso.periodoIsencao && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-neutral-400 leading-tight">
                  <span className="font-bold text-neutral-300 block">
                    Período de Isenção:
                  </span>
                  {concurso.periodoIsencao}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 pt-0 mt-auto flex flex-col gap-3">
        {/* BOTÃO PRINCIPAL (Inscrições vs Em Breve) */}
        {isEmBreve ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-neutral-800/50 text-neutral-500 cursor-not-allowed border border-neutral-800"
          >
            Em Breve...
          </button>
        ) : (
          <a
            href={concurso.linkInscricao || "#"}
            target={concurso.linkInscricao ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              concurso.status === "Inscrições Abertas"
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
            }`}
          >
            {concurso.status === "Inscrições Abertas"
              ? "Fazer Inscrição"
              : "Ver Detalhes da Inscrição"}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* LÓGICA ATUALIZADA DOS LINKS INFERIORES */}
        {isEmBreve ? (
          <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
            <Link
              href="/aluno/noticias"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500/80 hover:text-neutral-400 transition-colors py-1 group/noticia"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="group-hover/noticia:underline underline-offset-2">
                Acompanhe as Notícias
              </span>
            </Link>

            {/* Lógica: Só mostra se houver linkEdital */}
            {concurso.linkEdital && (
              <a
                href={concurso.linkEdital}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-400 transition-colors py-1 group/noticia"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="group-hover/noticia:underline underline-offset-2">
                  Ver Edital Passado
                </span>
              </a>
            )}
          </div>
        ) : (
          concurso.linkEdital && (
            <a
              href={concurso.linkEdital}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-emerald-400 transition-colors py-1 group/edital"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="group-hover/edital:underline underline-offset-2">
                Acessar Edital Oficial
              </span>
            </a>
          )
        )}
      </div>
    </div>
  );
}

export function ListaConcursos({
  concursosIniciais,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  concursosIniciais: any[];
}) {
  // 1. ESTADOS DOS FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroBanca, setFiltroBanca] = useState<string | null>(null);
  const [filtroEscolaridade, setFiltroEscolaridade] = useState<string | null>(
    null,
  );
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  // Array de [min, max] para a faixa salarial
  const [filtroSalario, setFiltroSalario] = useState<number[] | null>(null);

  // 2. EXTRAÇÃO DINÂMICA DAS OPÇÕES
  const opcoesBancas = Array.from(
    new Set(concursosIniciais.map((c) => c.banca).filter(Boolean)),
  );
  const opcoesEscolaridade = Array.from(
    new Set(concursosIniciais.map((c) => c.escolaridade).filter(Boolean)),
  );
  const opcoesStatus = Array.from(
    new Set(concursosIniciais.map((c) => c.status).filter(Boolean)),
  );

  // Descobre automaticamente qual é o maior salário da plataforma
  const sliderMax = useMemo(() => {
    const max = Math.max(
      0,
      ...concursosIniciais.map((c) => extrairSalario(c.salario)),
    );
    return Math.max(10000, Math.ceil(max / 5000) * 5000); // Garante mínimo de 10k e arredonda
  }, [concursosIniciais]);

  // 3. LÓGICA DE FILTRAGEM COMBINADA
  const concursosFiltrados = useMemo(() => {
    return concursosIniciais.filter((c) => {
      // Texto
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        c.orgao.toLowerCase().includes(lowerSearch) ||
        c.cargo.toLowerCase().includes(lowerSearch);

      // Dropdowns
      const matchBanca = !filtroBanca || c.banca === filtroBanca;
      const matchEscolaridade =
        !filtroEscolaridade || c.escolaridade === filtroEscolaridade;
      const matchStatus = !filtroStatus || c.status === filtroStatus;

      // Remuneração (Slider)
      let matchSalario = true;
      if (filtroSalario) {
        const salarioReal = extrairSalario(c.salario);
        // Se extrairSalario retornar 0 ("A definir"), nós os mantemos APENAS se o filtro mínimo for 0
        if (salarioReal === 0 && filtroSalario[0] > 0) {
          matchSalario = false;
        } else {
          matchSalario =
            salarioReal >= filtroSalario[0] && salarioReal <= filtroSalario[1];
        }
      }

      return (
        matchSearch &&
        matchBanca &&
        matchEscolaridade &&
        matchStatus &&
        matchSalario
      );
    });
  }, [
    concursosIniciais,
    searchTerm,
    filtroBanca,
    filtroEscolaridade,
    filtroStatus,
    filtroSalario,
  ]);

  // 4. DIVISÃO DAS SEÇÕES
  const concursosAbertos = concursosFiltrados.filter(
    (c) => c.status === "Inscrições Abertas",
  );
  const concursosEmBreve = concursosFiltrados.filter(
    (c) => c.status === "Em Breve" || c.status === "Edital Em Breve",
  );

  // Formatar Moeda Helper
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <>
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
              placeholder="Pesquisar por órgão ou cargo..."
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

        <div className="w-1 border-r h-10 border-neutral-800"></div>

        {/* DROPDOWNS DINÂMICOS */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-neutral-700 font-medium text-sm">Filtros:</span>
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

          {/* ESCOLARIDADE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-neutral-900 cursor-pointer duration-300 hover:ring-[0.6px] ring-neutral-700 py-5 rounded-full px-4 border-none shadow-none ${
                  filtroEscolaridade
                    ? " text-neutral-300 hover:bg-neutral-900"
                    : " text-neutral-500"
                }`}
              >
                <GraduationCap className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-37.5">
                  {filtroEscolaridade || "Escolaridade"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border border-neutral-800 text-neutral-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-neutral-500">
                  Nível Exigido
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroEscolaridade(null)}
                  className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                >
                  Qualquer Escolaridade
                </DropdownMenuItem>
                {opcoesEscolaridade.map((nivel) => (
                  <DropdownMenuItem
                    key={nivel as string}
                    onClick={() => setFiltroEscolaridade(nivel as string)}
                    className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                  >
                    {nivel as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* STATUS */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-neutral-900 hover:ring-[0.6px] ring-neutral-700 cursor-pointer duration-300 py-5 rounded-full px-4 border-none shadow-none ${
                  filtroStatus
                    ? "text-neutral-300 hover:bg-neutral-900"
                    : " text-neutral-500"
                }`}
              >
                <CircleDashed className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-35">
                  {filtroStatus || "Status"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-neutral-300 border ">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-neutral-500">
                  Situação
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroStatus(null)}
                  className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                >
                  Todos os Status
                </DropdownMenuItem>
                {opcoesStatus.map((status) => (
                  <DropdownMenuItem
                    key={status as string}
                    onClick={() => setFiltroStatus(status as string)}
                    className="cursor-pointer focus:bg-neutral-800 border-t rounded-none border-neutral-700/70 focus:text-white py-3 duration-200"
                  >
                    {status as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* REMUNERAÇÃO (SLIDER) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-neutral-900 cursor-pointer duration-300 py-5 hover:ring-[0.6px] ring-neutral-700 rounded-full px-4 border-none shadow-none ${
                  filtroSalario
                    ? "text-neutral-300 hover:bg-neutral-900"
                    : " text-neutral-500"
                }`}
              >
                <CircleDollarSign className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-35">
                  {filtroSalario
                    ? `${filtroSalario[0] / 1000}k a ${filtroSalario[1] / 1000}k`
                    : "Remuneração"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-900 border border-neutral-800 text-neutral-300 w-80 p-5 rounded-2xl shadow-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-neutral-200">
                    Faixa Salarial
                  </span>
                  <button
                    onClick={() => setFiltroSalario(null)}
                    className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    Limpar
                  </button>
                </div>

                <div className="px-2">
                  <Slider
                    value={filtroSalario || [0, sliderMax]}
                    min={0}
                    max={sliderMax}
                    step={500}
                    onValueChange={(val) => setFiltroSalario(val)}
                    className="py-2"
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-medium text-neutral-400 bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-800 shadow-inner">
                  <span>
                    {formatarMoeda((filtroSalario || [0, sliderMax])[0])}
                  </span>
                  <span className="text-neutral-600">-</span>
                  <span>
                    {formatarMoeda((filtroSalario || [0, sliderMax])[1])}
                  </span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* RENDERIZAÇÃO DOS CARDS */}
      {concursosFiltrados.length === 0 ? (
        <div className="text-center p-16 bg-neutral-900 rounded-3xl border border-neutral-800">
          <Building2 className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-300">
            Nenhum concurso encontrado.
          </h3>
          <p className="text-neutral-500 mt-2">
            Verifique seus filtros ou pesquise por um termo diferente.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {concursosAbertos.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center pb-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Inscrições Abertas:
                </h2>
                <span className="ml-2 rounded-md bg-neutral-800 px-2 py-0.5 text-xs font-bold text-neutral-400">
                  {concursosAbertos.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {concursosAbertos.map((concurso) => (
                  <ConcursoCard key={concurso.id} concurso={concurso} />
                ))}
              </div>
            </section>
          )}

          {concursosEmBreve.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center border-b border-neutral-800 pb-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Próximos Concursos:
                </h2>
                <span className="ml-2 rounded-md bg-neutral-800 px-2 py-0.5 text-xs font-bold text-neutral-400">
                  {concursosEmBreve.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {concursosEmBreve.map((concurso) => (
                  <ConcursoCard key={concurso.id} concurso={concurso} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
