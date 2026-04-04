/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  FileDown,
} from "lucide-react";
import Link from "next/link";

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
              className={`bg-neutral-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                  : "border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div
                onClick={() => toggleMateriaAccordion(materiaNome)}
                className="flex items-center justify-between p-3 cursor-pointer bg-neutral-900 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <h3
                    className={`text-sm font-medium transition-colors ${isExpanded ? "text-white" : "text-neutral-300"}`}
                  >
                    {materiaNome}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                    {quantidadeAssuntos} tópicos
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${isExpanded ? "rotate-180 text-emerald-500" : ""}`}
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
                  <div className="p-3 pt-0 border-t border-neutral-800/50 bg-neutral-950/30">
                    <ul className="flex flex-col gap-1 mt-3">
                      {assuntos.map((assunto) => (
                        <li
                          key={assunto.id}
                          className="flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-neutral-900 transition-colors group cursor-default"
                        >
                          <span className="text-sm text-neutral-400 group-hover:text-neutral-200 transition-colors leading-relaxed">
                            1 - {assunto.nome}
                          </span>
                        </li>
                      ))}
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
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-medium text-sm w-fit"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar para Editais
      </button>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="absolute inset-y-0 right-0 w-full md:w-3/4 pointer-events-none hidden md:block">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
            alt="Fundo Estudantes"
            fill
            unoptimized
            className="object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-linear-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-neutral-900/50 via-transparent to-neutral-900/50" />
        </div>

        <div className="absolute inset-0 bg-linear-to-br from-emerald-950 via-emerald-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-lg border bg-neutral-950/80 border-neutral-800 text-neutral-400 flex items-center gap-1.5 backdrop-blur-sm">
              Edital Verticalizado
            </span>
            {edital.banca && (
              <span className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded-lg border bg-neutral-950/80 border-neutral-800 text-neutral-400 flex items-center gap-1.5 backdrop-blur-sm">
                Banca<span className="font-extrabold">{edital.banca}</span>
              </span>
            )}
            <span className="px-3 py-1.5 text-[10px] cursor-pointer hover:bg-neutral-900/80 duration-200 font-medium uppercase tracking-wider rounded-lg border bg-neutral-950/80 border-neutral-800 text-neutral-400 hover:text-white flex items-center gap-1.5 backdrop-blur-sm">
              <FileDown className="h-4 w-4 text-red-800" /> Baixar PDF
            </span>
          </div>

          <h1 className="text-3xl  font-medium mb-4 text-white tracking-tight leading-tight">
            {edital.titulo}
          </h1>

          <p className="text-neutral-400 max-w-2xl text-sm leading-relaxed drop-shadow-md">
            {edital.descricao ||
              "Este é o mapeamento oficial dos assuntos cobrados neste concurso. Utilize esta estrutura como o seu guia principal de estudos."}
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-4 min-w-60 shrink-0 bg-neutral-950/80 backdrop-blur-md p-4 rounded-2xl border border-neutral-800 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Matérias
              </p>
              <p className="text-2xl font-black text-white">
                {estatisticasGerais.totalMaterias}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Assuntos
              </p>
              <p className="text-2xl font-black text-white">
                {estatisticasGerais.totalAssuntos}
              </p>
            </div>
          </div>
          {/* <Link
            href="/aluno/simulados/novo"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
          >
            <PlayCircle className="w-4 h-4 fill-current" /> Gerar Simulado
          </Link> */}
        </div>
      </div>

      <div className="space-y-12">
        {Object.keys(agrupamentoBasico).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
              <h2 className="text-2xl font-medium text-white">
                Conhecimentos Básicos:
              </h2>
              <span className="ml-2 px-2 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-500 text-[10px] font-bold">
                {estatisticasGerais.totalBasicos} Assuntos
              </span>
            </div>
            {renderizarGrupo(agrupamentoBasico)}
          </div>
        )}

        {Object.keys(agrupamentoEspecifico).length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
              <h2 className="text-2xl font-medium text-white">
                Conhecimentos Específicos:
              </h2>
              <span className="ml-2 px-2 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-500 text-[10px] font-bold">
                {estatisticasGerais.totalEspecificos} Assuntos
              </span>
            </div>
            {renderizarGrupo(agrupamentoEspecifico)}
          </div>
        )}

        {Object.keys(agrupamentoBasico).length === 0 &&
          Object.keys(agrupamentoEspecifico).length === 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-neutral-600" />
              </div>
              <p className="text-lg font-bold text-neutral-300 mb-1">
                Nada mapeado por aqui
              </p>
              <p className="text-sm text-neutral-500">
                Nenhum assunto foi adicionado a este edital até ao momento.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
