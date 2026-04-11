/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  BookOpen,
  FileDown,
  CopyPlus,
  Video,
  LayersPlus,
} from "lucide-react";
import { toast } from "sonner";

interface EditalClientViewProps {
  edital: any;
  assuntosDb: any[];
}

export default function EditalClientView({
  edital,
  assuntosDb,
}: EditalClientViewProps) {
  const router = useRouter();
  const [expandedMaterias, setExpandedMaterias] = useState<string[]>([]);

  const handleCriarSimulado = (assuntosParaAdicionar?: any[]) => {
    const baseDeAssuntos = assuntosParaAdicionar || assuntosDb;

    if (baseDeAssuntos.length === 0) {
      toast.error("Não há assuntos mapeados para criar um simulado.");
      return;
    }

    const idsAssuntos = baseDeAssuntos.map((a) => a.id);
    const idsMaterias = Array.from(
      new Set(baseDeAssuntos.map((a) => a.materiaId).filter(Boolean)),
    );

    sessionStorage.setItem(
      "simulado_pre_selecionado",
      JSON.stringify({
        titulo: `Simulado Baseado: ${edital.titulo}`,
        materias: idsMaterias,
        assuntos: idsAssuntos,
      }),
    );

    toast.success("Preparando o seu simulado...");

    router.push("/aluno/simulados/novo");
  };

  const agrupamentoBasico = useMemo(() => {
    const basicos = assuntosDb.filter((a) => a.tipo === "Básico");
    const grupos: Record<string, any[]> = {};
    basicos.forEach((assunto) => {
      const materia = assunto.materiaNome || "Outros / Sem Matéria";
      if (!grupos[materia]) grupos[materia] = [];
      grupos[materia].push(assunto);
    });
    return grupos;
  }, [assuntosDb]);

  const agrupamentoEspecifico = useMemo(() => {
    const especificos = assuntosDb.filter((a) => a.tipo === "Específico");
    const grupos: Record<string, any[]> = {};
    especificos.forEach((assunto) => {
      const materia = assunto.materiaNome || "Outros / Sem Matéria";
      if (!grupos[materia]) grupos[materia] = [];
      grupos[materia].push(assunto);
    });
    return grupos;
  }, [assuntosDb]);

  const toggleMateriaAccordion = (materiaNome: string) => {
    setExpandedMaterias((prev) =>
      prev.includes(materiaNome)
        ? prev.filter((m) => m !== materiaNome)
        : [...prev, materiaNome],
    );
  };

  const estatisticasGerais = useMemo(() => {
    const materiasUnicas = new Set(assuntosDb.map((a) => a.materiaNome));
    return {
      totalMaterias: materiasUnicas.size,
      totalAssuntos: assuntosDb.length,
      totalBasicos: assuntosDb.filter((a) => a.tipo === "Básico").length,
      totalEspecificos: assuntosDb.filter((a) => a.tipo === "Específico")
        .length,
    };
  }, [assuntosDb]);

  const renderizarGrupo = (grupos: Record<string, any[]>) => {
    return (
      <div className="flex flex-col gap-4">
        {Object.entries(grupos).map(([materiaNome, assuntos]) => {
          const isExpanded = expandedMaterias.includes(materiaNome);
          const quantidadeAssuntos = assuntos.length;

          return (
            <div
              key={materiaNome}
              className={`bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                  : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
              }`}
            >
              <div
                onClick={() => toggleMateriaAccordion(materiaNome)}
                className="flex items-center justify-between p-3 cursor-pointer bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors duration-300"
              >
                <div className="flex items-center gap-4">
                  <h3
                    className={`text-sm font-medium transition-colors duration-300 ${isExpanded ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-neutral-300"}`}
                  >
                    {materiaNome}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <button className="text-[11px] font-bold px-2.5 py-1 rounded bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-300">
                    <LayersPlus className="w-4 h-4 text-[#009966]" />
                    Criar Caderno de Questões
                  </button>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 transition-colors duration-300">
                    {quantidadeAssuntos} tópicos
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 dark:text-neutral-500 transition-all duration-300 ${isExpanded ? "rotate-180 text-[#009966]" : ""}`}
                  />
                </div>
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-3 pt-0 border-t border-gray-100 dark:border-neutral-800/50 bg-gray-50/30 dark:bg-neutral-950/30 transition-colors duration-300">
                    <ul className="flex flex-col gap-1 mt-3">
                      {assuntos.map((assunto, index) => {
                        const temAulas =
                          assunto.temAulas ||
                          assunto.qtdAulas > 0 ||
                          (assunto.aulas && assunto.aulas.length > 0);

                        return (
                          <li
                            key={assunto.id}
                            className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors duration-300 group cursor-default"
                          >
                            <span className="text-sm text-gray-500 dark:text-neutral-400 group-hover:text-gray-900 dark:group-hover:text-neutral-200 transition-colors duration-300 leading-relaxed">
                              {index + 1} - {assunto.nome}
                            </span>
                            {temAulas && (
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-gray-300 dark:text-neutral-600 hidden sm:block">
                                  ⟶
                                </span>
                                <Link
                                  href={`/aluno/materiais?assuntoId=${assunto.id}`}
                                  className="text-[11px] cursor-pointer font-bold flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-emerald-500/10 hover:text-[#009966] dark:hover:text-emerald-400 border border-gray-200 dark:border-neutral-800 hover:border-emerald-500/30 transition-all duration-300 bg-gray-50 dark:bg-neutral-950 text-gray-500 dark:text-neutral-400"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  Ver Aulas
                                </Link>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 mb-12 animate-in fade-in duration-500 pb-24">
      <button
        onClick={() => router.push("/aluno/editais")}
        className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 font-medium text-sm w-fit"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar para Editais
      </button>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 transition-colors duration-300">
        <div className="absolute inset-y-0 right-0 w-full md:w-3/4 pointer-events-none hidden md:block">
          <Image
            src={
              edital.thumbnailUrl ||
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
            }
            alt={edital.titulo || "Fundo Edital"}
            fill
            unoptimized
            className="object-cover opacity-10 dark:opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-neutral-900/50 via-transparent to-white/50 dark:to-neutral-900/50" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 dark:from-emerald-950 via-emerald-500/5 dark:via-emerald-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-lg border bg-white/80 dark:bg-neutral-950/80 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 flex items-center gap-1.5 backdrop-blur-sm transition-colors duration-300">
              Edital Verticalizado
            </span>
            {edital.banca && (
              <span className="px-3 py-1.5 gap-1 text-[10px] font-medium uppercase tracking-wider rounded-lg border bg-white/80 dark:bg-neutral-950/80 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 flex items-center backdrop-blur-sm transition-colors duration-300">
                Banca:
                <span className="font-extrabold text-gray-900 dark:text-white">
                  {edital.banca}
                </span>
              </span>
            )}

            {edital.pdfUrl && (
              <a
                href={edital.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-3 py-1.5 text-[10px] cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-900/80 duration-300 font-medium uppercase tracking-wider rounded-lg border bg-white/80 dark:bg-neutral-950/80 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 backdrop-blur-sm"
              >
                <FileDown className="h-4 w-4 mr-1 text-[#009966]" /> Baixar PDF
              </a>
            )}

            <button
              onClick={() => handleCriarSimulado()}
              className="px-3 py-1.5 text-[10px] cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-900/80 duration-300 font-medium uppercase tracking-wider rounded-lg border bg-white/80 dark:bg-neutral-950/80 border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 backdrop-blur-sm"
            >
              <CopyPlus className="h-4 w-4 mr-1 text-[#009966]" /> Criar
              Simulado do Edital
            </button>
          </div>

          <h1 className="text-3xl font-medium mb-4 text-gray-900 dark:text-white tracking-tight leading-tight transition-colors duration-300">
            {edital.titulo}
          </h1>

          <p className="text-gray-600 dark:text-neutral-400 max-w-2xl text-sm leading-relaxed drop-shadow-md transition-colors duration-300">
            {edital.descricao ||
              "Este é o mapeamento oficial dos assuntos cobrados neste concurso. Utilize esta estrutura como o seu guia principal de estudos."}
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-4 min-w-60 shrink-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl transition-colors duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                Matérias
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                {estatisticasGerais.totalMaterias}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                Assuntos
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                {estatisticasGerais.totalAssuntos}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(agrupamentoBasico).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-300">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white transition-colors duration-300">
                Conhecimentos Básicos:
              </h2>
              <span className="ml-2 px-2 py-1 rounded-md bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-500 text-[10px] font-bold transition-colors duration-300">
                {estatisticasGerais.totalBasicos} Assuntos
              </span>
            </div>
            {renderizarGrupo(agrupamentoBasico)}
          </div>
        )}

        {Object.keys(agrupamentoEspecifico).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-300">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white transition-colors duration-300">
                Conhecimentos Específicos:
              </h2>
              <span className="ml-2 px-2 py-1 rounded-md bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-500 text-[10px] font-bold transition-colors duration-300">
                {estatisticasGerais.totalEspecificos} Assuntos
              </span>
            </div>
            {renderizarGrupo(agrupamentoEspecifico)}
          </div>
        )}

        {Object.keys(agrupamentoBasico).length === 0 &&
          Object.keys(agrupamentoEspecifico).length === 0 && (
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-16 text-center shadow-sm transition-colors duration-300">
              <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <BookOpen className="w-6 h-6 text-gray-400 dark:text-neutral-600" />
              </div>
              <p className="text-lg font-bold text-gray-700 dark:text-neutral-300 mb-1 transition-colors duration-300">
                Nada mapeado por aqui
              </p>
              <p className="text-sm text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                Nenhum assunto foi adicionado a este edital até ao momento.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
