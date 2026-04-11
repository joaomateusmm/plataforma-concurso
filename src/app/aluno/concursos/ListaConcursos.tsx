/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// 1. IMPORTAÇÃO CORRIGIDA PARA toggleLembrete
import { toggleLembrete } from "@/actions/lembretes";
import { toast } from "sonner";
import { BellRing, Loader2 } from "lucide-react";

// 2. IMPORTAÇÃO DO AUTH-CLIENT PARA PEGAR O USER ID
import { authClient } from "@/lib/auth-client";

import Image from "next/image";
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
  CalendarDays,
  Briefcase,
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

// --------------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// --------------------------------------------------------------------------------
function extrairSalario(texto: string | null): number {
  if (!texto) return 0;
  const numeros = texto.match(/\d{1,3}(\.\d{3})*(,\d{2})?/g);
  if (!numeros) return 0;
  const valores = numeros.map((n) =>
    parseFloat(n.replace(/\./g, "").replace(",", ".")),
  );
  return Math.max(...valores);
}

// ATUALIZADO: Suporte para os novos status com light/dark themes
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Inscrições Abertas":
    case "Edital Lançado":
      return "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10 transition-colors duration-300";
    case "Concurso Autorizado":
    case "Banca Definida":
    case "Edital Iminente":
    case "Em Breve":
    case "Edital Em Breve":
      return "text-gray-600 bg-gray-100 border border-gray-200 dark:text-neutral-300 dark:border-neutral-500/30 dark:bg-neutral-500/10 transition-colors duration-300";
    case "Inscrições Encerradas":
    case "Concurso Encerrado":
    case "Encerrado":
      return "text-gray-500 bg-gray-100 border border-gray-200 dark:text-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 transition-colors duration-300";
    default:
      return "text-gray-600 border border-transparent dark:text-neutral-300 dark:border-none transition-colors duration-300";
  }
};

function ConcursoCard({
  concurso,
  lembretesAtivosIniciais = [],
}: {
  concurso: any;
  lembretesAtivosIniciais?: number[];
}) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const formatarLink = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("/")) return url;
    if (url.includes("mateusdev.shop")) {
      try {
        const parsed = new URL(url);
        return parsed.pathname + parsed.search;
      } catch {
        return url;
      }
    }
    return url;
  };

  const isLinkInterno = (url: string) => {
    if (!url) return true;
    return url.startsWith("/") || url.includes("mateusdev.shop");
  };

  const isEmBreve = [
    "Concurso Autorizado",
    "Banca Definida",
    "Edital Iminente",
    "Em Breve",
    "Edital Em Breve",
  ].includes(concurso.status);

  const isInscricoesEncerradas = concurso.status === "Inscrições Encerradas";
  const isEncerradoTudo =
    concurso.status === "Concurso Encerrado" || concurso.status === "Encerrado";

  const [mostrarDescricaoCompleta, setMostrarDescricaoCompleta] =
    useState(false);

  const [isLembreteAtivo, setIsLembreteAtivo] = useState(
    lembretesAtivosIniciais.includes(concurso.id),
  );
  const [isLoadingLembrete, setIsLoadingLembrete] = useState(false);

  const handleToggleLembrete = async () => {
    if (!userId) {
      toast.error("Você precisa estar logado para ativar lembretes.");
      return;
    }

    setIsLoadingLembrete(true);
    const res = await toggleLembrete(userId, concurso.id);

    if (res.error) {
      toast.error(res.error);
    } else {
      setIsLembreteAtivo(res.active ?? false);

      if (res.active) {
        toast.success("Lembrete ativado com sucesso!", {
          description:
            "Você será avisado no seu e-mail sempre que o status deste concurso for atualizado (ex: edital lançado, inscrições abertas).",
          duration: 6000,
        });
      } else {
        toast.info("Lembrete desativado.", {
          description:
            "Você não receberá mais notificações sobre este concurso.",
        });
      }
    }
    setIsLoadingLembrete(false);
  };

  const exibirEscolaridade = () => {
    if (!concurso.escolaridade) return "Não informado";
    if (concurso.escolaridade === "Técnico" && concurso.cursoTecnico) {
      return `${concurso.cursoTecnico}`;
    }
    return concurso.escolaridade;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border group border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col hover:border-gray-300 dark:hover:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-900/80 transition-colors duration-300 group h-full relative">
      {concurso.thumbnailUrl && (
        <div className="absolute bottom-0 right-0 w-78 h-78 overflow-hidden z-0 pointer-events-none opacity-65 transition-opacity duration-500">
          <Image
            src={concurso.thumbnailUrl}
            alt={concurso.orgao}
            fill
            sizes="(max-width: 768px) 100vw, 350px"
            className="object-cover object-center group-hover:opacity-40 duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-transparent via-white/0 to-white dark:via-neutral-900/40 dark:to-neutral-900 transition-colors duration-300" />
          <div className="absolute inset-0 bg-linear-to-r from-white via-white/0 to-transparent dark:from-neutral-900 dark:via-neutral-900/40 dark:to-transparent transition-colors duration-300" />
        </div>
      )}

      <div className="px-6 py-3 border-b border-gray-100 dark:border-neutral-800/50 flex items-center justify-between bg-gray-50 dark:bg-neutral-950/30 relative z-10 transition-colors duration-300">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-md ${getStatusBadge(
            concurso.status,
          )}`}
        >
          {concurso.status}
        </span>
        <div className="flex gap-1 items-center justify-center text-sm font-medium text-gray-500 dark:text-neutral-500 transition-colors duration-300">
          Banca:
          <span className="text-xs font-semibold text-gray-700 bg-gray-200 dark:text-neutral-300 dark:bg-neutral-800 px-2.5 py-1 rounded-md transition-colors duration-300">
            {concurso.banca}
          </span>
        </div>
      </div>

      <div className="flex px-6 pt-4 relative z-10">
        <button
          onClick={handleToggleLembrete}
          disabled={isLoadingLembrete}
          className={`flex gap-2 font-medium items-center py-1 px-2 text-xs rounded-md transition-colors duration-300 shadow-sm cursor-pointer backdrop-blur-sm border ${
            isLembreteAtivo
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-neutral-500/20 dark:text-neutral-200 dark:border-neutral-500 dark:hover:bg-neutral-500"
              : "bg-white text-gray-500 border-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:bg-neutral-800/80 dark:text-neutral-400 dark:border-neutral-700/50 dark:hover:text-white dark:hover:bg-neutral-700"
          }`}
        >
          {isLoadingLembrete ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isLembreteAtivo ? (
            <BellRing className="h-3.5 w-3.5 fill-emerald-600 dark:fill-white transition-colors duration-300" />
          ) : (
            <Bell className="h-3.5 w-3.5" />
          )}
          {isLembreteAtivo ? "Lembrete Ativo" : "Ativar Lembrete"}
        </button>
      </div>

      <div className="px-6 py-4 flex-1 flex flex-col gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 leading-tight">
            {concurso.orgao}
          </h2>
          <p className="text-emerald-600 dark:text-emerald-500 font-medium text-sm mt-1 transition-colors duration-300">
            {concurso.cargo}
          </p>
        </div>

        {concurso.descricao && (
          <div className="flex flex-col">
            <p
              className={`text-sm text-gray-600 dark:text-neutral-400 transition-colors duration-300 ${
                mostrarDescricaoCompleta ? "" : "line-clamp-2"
              }`}
            >
              {concurso.descricao}
            </p>
            {concurso.descricao.length > 90 && (
              <p
                onClick={() =>
                  setMostrarDescricaoCompleta(!mostrarDescricaoCompleta)
                }
                className="text-gray-500 dark:text-neutral-500 font-medium text-xs mt-1 hover:underline cursor-pointer w-fit transition-colors duration-300"
              >
                {mostrarDescricaoCompleta ? "ver menos..." : "ver mais..."}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-2">
          <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
            <CircleDollarSign className="w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-colors duration-300" />
            <span
              className="text-xs font-medium truncate"
              title={concurso.salario || ""}
            >
              {concurso.salario || "A definir"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
            <Users className="w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-colors duration-300" />
            <span className="text-xs font-medium truncate">
              {concurso.vagas || "Cadastro Reserva"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-neutral-300 col-span-2 transition-colors duration-300">
            <GraduationCap className="w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-colors duration-300" />
            <span className="text-xs font-medium truncate">
              {exibirEscolaridade()}
            </span>
          </div>
        </div>

        {(concurso.periodoInscricao ||
          concurso.periodoIsencao ||
          concurso.dataProva) && (
          <div className="border-t border-gray-200 dark:border-neutral-800/60 md:grid md:grid-cols-2 pt-4 mt-2 space-y-3 transition-colors duration-300">
            {concurso.periodoInscricao && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 mt-0.5 shrink-0 transition-colors duration-300" />
                <p className="text-[11px] text-gray-600 dark:text-neutral-400 font-semibold leading-tight transition-colors duration-300">
                  <span className="font-bold text-gray-800 dark:text-neutral-300 block transition-colors duration-300">
                    Período de Inscrição:
                  </span>
                  {concurso.periodoInscricao}
                </p>
              </div>
            )}
            {concurso.periodoIsencao && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 mt-0.5 shrink-0 transition-colors duration-300" />
                <p className="text-[11px] text-gray-600 font-semibold dark:text-neutral-400 leading-tight transition-colors duration-300">
                  <span className="font-bold text-gray-800 dark:text-neutral-300 block transition-colors duration-300">
                    Período de Isenção:
                  </span>
                  {concurso.periodoIsencao}
                </p>
              </div>
            )}
            {concurso.dataProva && (
              <div className="flex items-start gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 mt-0.5 shrink-0 transition-colors duration-300" />
                <p className="text-[11px] font-semibold text-gray-600 dark:text-neutral-400 leading-tight transition-colors duration-300">
                  <span className="font-bold text-gray-800 dark:text-neutral-300 block transition-colors duration-300">
                    Data da Prova:
                  </span>
                  {concurso.dataProva}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 pt-0 mt-auto flex flex-col gap-3 relative z-10">
        {isEmBreve ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 backdrop-blur-md py-3 rounded-xl font-bold text-sm transition-colors duration-300 bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-white/40"
          >
            Em Breve...
          </button>
        ) : isInscricoesEncerradas ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 backdrop-blur-md py-3 rounded-xl font-bold text-sm transition-colors duration-300 bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-white/40"
          >
            Inscrições Encerradas <ExternalLink className="w-4 h-4" />
          </button>
        ) : isEncerradoTudo ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 backdrop-blur-md py-3 rounded-xl font-bold text-sm transition-colors duration-300 bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-white/40"
          >
            Concurso Encerrado
          </button>
        ) : (
          <Link
            href={formatarLink(concurso.linkInscricao)}
            target={isLinkInterno(concurso.linkInscricao) ? "_self" : "_blank"}
            rel={
              !isLinkInterno(concurso.linkInscricao)
                ? "noopener noreferrer"
                : undefined
            }
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors duration-300 bg-[#009966] text-white hover:bg-[#008055] shadow-lg shadow-[#009966]/20 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:shadow-emerald-900/20"
          >
            Fazer Inscrição <ExternalLink className="w-4 h-4" />
          </Link>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center justify-center mt-1">
          {isEmBreve && (
            <>
              <Link
                href="/aluno/noticias"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 group/link"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span className="group-hover/link:underline underline-offset-2">
                  Acompanhe as Notícias
                </span>
              </Link>
              {concurso.linkEdital && (
                <Link
                  href={formatarLink(concurso.linkEdital)}
                  target={
                    isLinkInterno(concurso.linkEdital) ? "_self" : "_blank"
                  }
                  rel={
                    !isLinkInterno(concurso.linkEdital)
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 group/link"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="group-hover/link:underline underline-offset-2">
                    Ver Edital Passado
                  </span>
                </Link>
              )}
            </>
          )}

          {isInscricoesEncerradas && (
            <>
              {concurso.linkEdital && (
                <Link
                  href={formatarLink(concurso.linkEdital)}
                  target={
                    isLinkInterno(concurso.linkEdital) ? "_self" : "_blank"
                  }
                  rel={
                    !isLinkInterno(concurso.linkEdital)
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 group/link"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="group-hover/link:underline underline-offset-2">
                    Ver edital Atual
                  </span>
                </Link>
              )}
              {concurso.linkCronograma && (
                <Link
                  href={formatarLink(concurso.linkCronograma)}
                  target={
                    isLinkInterno(concurso.linkCronograma) ? "_self" : "_blank"
                  }
                  rel={
                    !isLinkInterno(concurso.linkCronograma)
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 group/link"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="group-hover/link:underline underline-offset-2">
                    Ver cronograma
                  </span>
                </Link>
              )}
            </>
          )}

          {isEncerradoTudo && concurso.linkEdital && (
            <Link
              href={formatarLink(concurso.linkEdital)}
              target={isLinkInterno(concurso.linkEdital) ? "_self" : "_blank"}
              rel={
                !isLinkInterno(concurso.linkEdital)
                  ? "noopener noreferrer"
                  : undefined
              }
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 group/link"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="group-hover/link:underline underline-offset-2">
                Ver Edital Passado
              </span>
            </Link>
          )}

          {!isEmBreve &&
            !isInscricoesEncerradas &&
            !isEncerradoTudo &&
            concurso.linkEdital && (
              <Link
                href={formatarLink(concurso.linkEdital)}
                target={isLinkInterno(concurso.linkEdital) ? "_self" : "_blank"}
                rel={
                  !isLinkInterno(concurso.linkEdital)
                    ? "noopener noreferrer"
                    : undefined
                }
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 py-1 group/link"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="group-hover/link:underline underline-offset-2">
                  Acessar Edital Oficial
                </span>
              </Link>
            )}
        </div>
      </div>
    </div>
  );
}

function SecaoConcursos({
  titulo,
  concursos,
  badgeColor = "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400 transition-colors duration-300",
  lembretesAtivosIniciais = [],
}: {
  titulo: string;
  concursos: any[];
  badgeColor?: string;
  lembretesAtivosIniciais?: number[];
}) {
  if (concursos.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center pb-3 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
          {titulo}
        </h2>
        <span
          className={`ml-2 rounded-md px-2 py-0.5 text-xs font-bold ${badgeColor}`}
        >
          {concursos.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {concursos.map((concurso) => (
          <ConcursoCard
            key={concurso.id}
            concurso={concurso}
            lembretesAtivosIniciais={lembretesAtivosIniciais}
          />
        ))}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------------
// COMPONENTE PRINCIPAL: LISTA CONCURSOS
// --------------------------------------------------------------------------------
export function ListaConcursos({
  concursosIniciais,
  lembretesAtivosIniciais = [],
}: {
  concursosIniciais: any[];
  lembretesAtivosIniciais?: number[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroBanca, setFiltroBanca] = useState<string | null>(null);
  const [filtroCargo, setFiltroCargo] = useState<string | null>(null);
  const [filtroEscolaridade, setFiltroEscolaridade] = useState<string | null>(
    null,
  );
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroSalario, setFiltroSalario] = useState<number[] | null>(null);

  const opcoesBancas = Array.from(
    new Set(concursosIniciais.map((c) => c.banca).filter(Boolean)),
  );
  const opcoesCargos = Array.from(
    new Set(concursosIniciais.map((c) => c.cargo).filter(Boolean)),
  );

  const opcoesEscolaridade = Array.from(
    new Set(
      concursosIniciais
        .map((c) => {
          if (c.escolaridade === "Técnico" && c.cursoTecnico) {
            return `${c.cursoTecnico}`;
          }
          return c.escolaridade;
        })
        .filter(Boolean),
    ),
  );

  const opcoesStatus = Array.from(
    new Set(concursosIniciais.map((c) => c.status).filter(Boolean)),
  );

  const sliderMax = useMemo(() => {
    const max = Math.max(
      0,
      ...concursosIniciais.map((c) => extrairSalario(c.salario)),
    );
    return Math.max(10000, Math.ceil(max / 5000) * 5000);
  }, [concursosIniciais]);

  const concursosFiltrados = useMemo(() => {
    return concursosIniciais.filter((c) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm.trim() ||
        c.orgao.toLowerCase().includes(lowerSearch) ||
        c.cargo.toLowerCase().includes(lowerSearch);

      const matchBanca = !filtroBanca || c.banca === filtroBanca;
      const matchCargo = !filtroCargo || c.cargo === filtroCargo;

      let matchEscolaridade = true;
      if (filtroEscolaridade) {
        if (c.escolaridade === "Técnico" && c.cursoTecnico) {
          matchEscolaridade = `${c.cursoTecnico}` === filtroEscolaridade;
        } else {
          matchEscolaridade = c.escolaridade === filtroEscolaridade;
        }
      }

      const matchStatus = !filtroStatus || c.status === filtroStatus;

      let matchSalario = true;
      if (filtroSalario) {
        const salarioReal = extrairSalario(c.salario);
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
        matchCargo &&
        matchEscolaridade &&
        matchStatus &&
        matchSalario
      );
    });
  }, [
    concursosIniciais,
    searchTerm,
    filtroBanca,
    filtroCargo,
    filtroEscolaridade,
    filtroStatus,
    filtroSalario,
  ]);

  const concursosAbertos = concursosFiltrados.filter(
    (c) => c.status === "Inscrições Abertas" || c.status === "Edital Lançado",
  );
  const concursosEmBreve = concursosFiltrados.filter((c) =>
    [
      "Concurso Autorizado",
      "Banca Definida",
      "Edital Iminente",
      "Em Breve",
      "Edital Em Breve",
    ].includes(c.status),
  );
  const concursosInscricoesEncerradas = concursosFiltrados.filter(
    (c) => c.status === "Inscrições Encerradas",
  );
  const concursosTotalmenteEncerrados = concursosFiltrados.filter(
    (c) => c.status === "Concurso Encerrado" || c.status === "Encerrado",
  );

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <>
      <div className="mb-9 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
        <div className="group relative flex h-10 w-full max-w-md cursor-text items-center justify-between rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-transparent px-4 transition-all duration-300 hover:ring-1 hover:ring-gray-300 dark:hover:ring-neutral-800">
          <div className="flex w-full items-center">
            <Search className="mr-3 h-4 w-4 text-gray-400 dark:text-neutral-500 shrink-0 transition-colors duration-300" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por órgão ou cargo..."
              className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-neutral-200 transition-colors placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-neutral-600 shrink-0 pl-2 transition-colors duration-300">
            <kbd className="rounded bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 font-sans transition-colors duration-300">
              ⌘
            </kbd>
            <kbd className="rounded bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 font-sans transition-colors duration-300">
              K
            </kbd>
          </div>
        </div>

        <div className="w-1 border-r h-10 border-gray-200 dark:border-neutral-800 hidden md:block transition-colors duration-300"></div>

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
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                >
                  Todas as Bancas
                </DropdownMenuItem>
                {opcoesBancas.map((banca) => (
                  <DropdownMenuItem
                    key={banca as string}
                    onClick={() => setFiltroBanca(banca as string)}
                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                  >
                    {banca as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CARGO */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-white dark:bg-neutral-900 cursor-pointer transition-all duration-300 hover:ring-[0.6px] ring-gray-300 dark:ring-neutral-700 py-5 rounded-full px-4 border border-gray-200 dark:border-none shadow-sm dark:shadow-none ${
                  filtroCargo
                    ? " text-gray-900 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                    : " text-gray-500 dark:text-neutral-500"
                }`}
              >
                <Briefcase className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-30">
                  {filtroCargo || "Cargo"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                  Filtrar por Cargo
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroCargo(null)}
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                >
                  Todos os Cargos
                </DropdownMenuItem>
                {opcoesCargos.map((cargo) => (
                  <DropdownMenuItem
                    key={cargo as string}
                    onClick={() => setFiltroCargo(cargo as string)}
                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                  >
                    {cargo as string}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ESCOLARIDADE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`bg-white dark:bg-neutral-900 cursor-pointer transition-all duration-300 hover:ring-[0.6px] ring-gray-300 dark:ring-neutral-700 py-5 rounded-full px-4 border border-gray-200 dark:border-none shadow-sm dark:shadow-none ${
                  filtroEscolaridade
                    ? " text-gray-900 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                    : " text-gray-500 dark:text-neutral-500"
                }`}
              >
                <GraduationCap className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-37.5">
                  {filtroEscolaridade || "Escolaridade"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                  Nível Exigido
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroEscolaridade(null)}
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                >
                  Qualquer Escolaridade
                </DropdownMenuItem>
                {opcoesEscolaridade.map((nivel) => (
                  <DropdownMenuItem
                    key={nivel as string}
                    onClick={() => setFiltroEscolaridade(nivel as string)}
                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
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
                className={`bg-white dark:bg-neutral-900 transition-all duration-300 hover:ring-[0.6px] ring-gray-300 dark:ring-neutral-700 cursor-pointer py-5 rounded-full px-4 border border-gray-200 dark:border-none shadow-sm dark:shadow-none ${
                  filtroStatus
                    ? "text-gray-900 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                    : " text-gray-500 dark:text-neutral-500"
                }`}
              >
                <CircleDashed className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate max-w-35">
                  {filtroStatus || "Status"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 border transition-colors duration-300">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                  Situação
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setFiltroStatus(null)}
                  className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                >
                  Todos os Status
                </DropdownMenuItem>
                {opcoesStatus.map((status) => (
                  <DropdownMenuItem
                    key={status as string}
                    onClick={() => setFiltroStatus(status as string)}
                    className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
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
                className={`bg-white dark:bg-neutral-900 cursor-pointer transition-all duration-300 py-5 hover:ring-[0.6px] ring-gray-300 dark:ring-neutral-700 rounded-full px-4 border border-gray-200 dark:border-none shadow-sm dark:shadow-none ${
                  filtroSalario
                    ? "text-gray-900 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-900"
                    : " text-gray-500 dark:text-neutral-500"
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
            <DropdownMenuContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 w-80 p-5 rounded-2xl shadow-xl dark:shadow-2xl transition-colors duration-300">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-neutral-200 transition-colors duration-300">
                    Faixa Salarial
                  </span>
                  <button
                    onClick={() => setFiltroSalario(null)}
                    className="text-[11px] font-bold text-[#009966] dark:text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
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
                <div className="flex justify-between items-center text-xs font-medium text-gray-600 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-950 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-inner transition-colors duration-300">
                  <span>
                    {formatarMoeda((filtroSalario || [0, sliderMax])[0])}
                  </span>
                  <span className="text-gray-400 dark:text-neutral-600 transition-colors duration-300">
                    -
                  </span>
                  <span>
                    {formatarMoeda((filtroSalario || [0, sliderMax])[1])}
                  </span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {concursosFiltrados.length === 0 ? (
        <div className="text-center p-16 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
          <Building2 className="w-16 h-16 text-gray-300 dark:text-neutral-800 mx-auto mb-4 transition-colors duration-300" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-neutral-300 transition-colors duration-300">
            Nenhum concurso encontrado.
          </h3>
          <p className="text-gray-500 dark:text-neutral-500 mt-2 transition-colors duration-300">
            Verifique seus filtros ou pesquise por um termo diferente.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          <SecaoConcursos
            titulo="Em Andamento (Inscrições Fechadas):"
            concursos={concursosInscricoesEncerradas}
            badgeColor="bg-gray-100 text-gray-600 border border-gray-200 dark:bg-neutral-500/10 dark:text-neutral-400 dark:border-neutral-500/20 transition-colors duration-300"
            lembretesAtivosIniciais={lembretesAtivosIniciais}
          />
          <SecaoConcursos
            titulo="Inscrições Abertas:"
            concursos={concursosAbertos}
            badgeColor="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors duration-300"
            lembretesAtivosIniciais={lembretesAtivosIniciais}
          />
          <SecaoConcursos
            titulo="Próximos Concursos:"
            concursos={concursosEmBreve}
            badgeColor="bg-gray-100 text-gray-600 border border-gray-200 dark:bg-neutral-500/10 dark:text-neutral-400 dark:border-neutral-500/20 transition-colors duration-300"
            lembretesAtivosIniciais={lembretesAtivosIniciais}
          />
          <SecaoConcursos
            titulo="Concursos Encerrados (Histórico):"
            concursos={concursosTotalmenteEncerrados}
            badgeColor="bg-gray-100 text-gray-500 border border-gray-200 dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700 transition-colors duration-300"
            lembretesAtivosIniciais={lembretesAtivosIniciais}
          />
        </div>
      )}
    </>
  );
}
