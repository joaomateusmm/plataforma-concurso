/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Settings2, Play, FileText } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  gerarSimuladoAleatorio,
  contarQuestoesDisponiveis,
} from "../../../../actions/simulados";

import {
  FilterCardBancas,
  FilterCardMaterias,
  FilterCardAssuntosAvancado,
} from "./FilterCards";

interface DadosProps {
  bancas: any[];
  materias: any[];
  assuntos: any[];
}

export function NovoSimuladoForm({ bancas, materias, assuntos }: DadosProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isGenerating, setIsGenerating] = useState(false);
  const [titulo, setTitulo] = useState("");

  const [bancasSel, setBancasSel] = useState<number[]>([]);
  const [materiasSel, setMateriasSel] = useState<Record<number, number>>({});
  const [assuntosSel, setAssuntosSel] = useState<Record<number, number>>({});

  const [questoesDisponiveis, setQuestoesDisponiveis] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Efeito do Contador
  useEffect(() => {
    const fetchCount = async () => {
      setIsLoadingCount(true);
      try {
        const materiasIds = Object.keys(materiasSel).map(Number);
        const assuntosIds = Object.keys(assuntosSel).map(Number);

        const res = await contarQuestoesDisponiveis({
          bancasIds: bancasSel.length > 0 ? bancasSel : undefined,
          materiasIds: materiasIds.length > 0 ? materiasIds : undefined,
          assuntosIds: assuntosIds.length > 0 ? assuntosIds : undefined,
        });

        setQuestoesDisponiveis(res.total || 0);
      } catch (error) {
        console.error("Erro ao buscar questões:", error);
        setQuestoesDisponiveis(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    const timeoutId = setTimeout(() => fetchCount(), 500);
    return () => clearTimeout(timeoutId);
  }, [bancasSel, materiasSel, assuntosSel]);

  // Resgate do Edital
  useEffect(() => {
    const savedData = sessionStorage.getItem("simulado_pre_selecionado");
    if (savedData) {
      try {
        const dados = JSON.parse(savedData);
        if (dados.titulo) setTitulo(dados.titulo);
        if (dados.materias) {
          const matsObj: Record<number, number> = {};
          dados.materias.forEach((id: number) => (matsObj[id] = 10));
          setMateriasSel(matsObj);
        }
        if (dados.assuntos) {
          const assObj: Record<number, number> = {};
          dados.assuntos.forEach((id: number) => (assObj[id] = 10));
          setAssuntosSel(assObj);
        }
        sessionStorage.removeItem("simulado_pre_selecionado");
      } catch {
        /* ignorado */
      }
    }
  }, []);

  const toggleBanca = (id: number) => {
    setBancasSel((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // HELPER: Garante a extração do ID da matéria seja qual for a estrutura que o backend enviou
  const obterMateriaId = (a: any) => {
    let id = Number(a.materiaId || a.materia_id || 0);
    if (!id && (a.materiaNome || a.materia?.nome)) {
      const nomeBusca = a.materiaNome || a.materia?.nome;
      const mat = materias.find((m: any) => m.nome === nomeBusca);
      if (mat) id = Number(mat.id);
    }
    return id;
  };

  const handleToggleMateria = (materiaId: number) => {
    setMateriasSel((prev) => {
      const next = { ...prev };
      if (next[materiaId]) delete next[materiaId];
      else next[materiaId] = 10;
      return next;
    });

    setAssuntosSel((prev) => {
      const next = { ...prev };
      const assuntosDestaMateria = assuntos.filter(
        (a) => obterMateriaId(a) === materiaId,
      );
      assuntosDestaMateria.forEach((a) => delete next[a.id]);
      return next;
    });
  };

  const handleToggleAssunto = (assuntoId: number, materiaId: number) => {
    const isMateriaFullySelected = !!materiasSel[materiaId];

    if (isMateriaFullySelected) {
      // Desmarca a pasta principal
      setMateriasSel((prev) => {
        const next = { ...prev };
        delete next[materiaId];
        return next;
      });
      // Marca todos os outros filhos como customizados (exceto o que clicaste)
      setAssuntosSel((prev) => {
        const next = { ...prev };
        const assuntosDestaMateria = assuntos.filter(
          (a) => obterMateriaId(a) === materiaId,
        );
        assuntosDestaMateria.forEach((a) => {
          if (a.id !== assuntoId) next[a.id] = 10;
        });
        return next;
      });
    } else {
      setAssuntosSel((prev) => {
        const next = { ...prev };
        if (next[assuntoId]) delete next[assuntoId];
        else next[assuntoId] = 10;

        // [INTELIGÊNCIA] Se marcarmos todos manualmente, transforma em pasta selecionada!
        const assuntosDestaMateria = assuntos.filter(
          (a) => obterMateriaId(a) === materiaId,
        );
        const allSelectedNow =
          assuntosDestaMateria.length > 0 &&
          assuntosDestaMateria.every((a) => next[a.id]);

        if (allSelectedNow) {
          assuntosDestaMateria.forEach((a) => delete next[a.id]);
          setMateriasSel((mPrev) => ({ ...mPrev, [materiaId]: 10 }));
        }

        return next;
      });
    }
  };

  const updateQtd = (id: number, qtd: number, setState: any) => {
    setState((prev: any) => ({ ...prev, [id]: qtd }));
  };

  const totalMaterias = Object.values(materiasSel).reduce((a, b) => a + b, 0);
  const totalAssuntos = Object.values(assuntosSel).reduce((a, b) => a + b, 0);
  const quantidadeTotalCalculada =
    totalMaterias + totalAssuntos > 0 ? totalMaterias + totalAssuntos : 60;

  const handleGerarSimulado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return toast.error("Você precisa estar logado.");
    if (!titulo.trim()) return toast.error("Dê um título ao seu simulado.");

    setIsGenerating(true);

    const payloadMaterias = Object.entries(materiasSel).map(([id, qtd]) => ({
      id: Number(id),
      qtd,
    }));
    const payloadAssuntos = Object.entries(assuntosSel).map(([id, qtd]) => ({
      id: Number(id),
      qtd,
    }));

    try {
      const resultado = await gerarSimuladoAleatorio({
        userId: session.user.id,
        titulo: titulo,
        quantidadeTotal: quantidadeTotalCalculada,
        bancasIds: bancasSel.length > 0 ? bancasSel : undefined,
        materiasConfig:
          payloadMaterias.length > 0 ? payloadMaterias : undefined,
        assuntosConfig:
          payloadAssuntos.length > 0 ? payloadAssuntos : undefined,
      });

      if (resultado.error) {
        toast.error("Ops!", { description: resultado.error });
      } else if (resultado.simuladoId) {
        toast.success("Simulado Gerado com Sucesso!");
        router.push(`/aluno/simulados/${resultado.simuladoId}`);
      }
    } catch {
      toast.error("Erro Fatal no Servidor.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: block !important; width: 6px !important; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1 !important; border-radius: 10px !important; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46 !important; }
        .custom-scrollbar { scrollbar-width: thin !important; scrollbar-color: #cbd5e1 transparent !important; }
        .dark .custom-scrollbar { scrollbar-color: #3f3f46 transparent !important; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <form
          id="form-simulado"
          onSubmit={handleGerarSimulado}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-neutral-800 pb-3 transition-colors duration-300">
              <Settings2 className="text-[#009966] dark:text-emerald-500 w-5 h-5 transition-colors duration-300" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Configurações Gerais
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 transition-colors duration-300">
                  Nome do Simulado *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Treino Reta Final PMCE"
                  className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 px-3 h-12 rounded-xl focus:ring-1 duration-200 shadow-md focus:ring-[#009966] dark:focus:ring-neutral-500 outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 transition-colors duration-300">
                  Total a Gerar (Soma dos filtros)
                </label>
                <div className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 h-12 font-semibold text-xl px-3 shadow-md rounded-xl flex items-center justify-center transition-colors duration-300">
                  {quantidadeTotalCalculada} Questões
                </div>
                <span className="text-xs text-gray-500 dark:text-neutral-500 text-center mt-1 transition-colors duration-300">
                  Quantidade que será incluída no simulado
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
            <div className="mb-6 border-b border-gray-200 dark:border-neutral-800 pb-3 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Selecione os Filtros
              </h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 transition-colors duration-300">
                Marque matérias completas ou escolha assuntos específicos
                clicando nas pastas.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <FilterCardBancas
                title="Bancas"
                placeholder="Pesquisar banca..."
                items={bancas}
                selectedIds={bancasSel}
                onToggle={toggleBanca}
              />

              <FilterCardMaterias
                title="Matérias"
                placeholder="Pesquisar matéria..."
                items={materias}
                selections={materiasSel}
                onToggle={handleToggleMateria}
              />

              <FilterCardAssuntosAvancado
                items={assuntos}
                materias={materias}
                selections={assuntosSel}
                materiasSel={materiasSel}
                onToggleAssunto={handleToggleAssunto}
                onToggleMateria={handleToggleMateria}
              />
            </div>
          </div>
        </form>

        <div className="lg:col-span-1 sticky top-8">
          <div className="flex flex-col p-6 gap-6 text-gray-900 dark:text-white bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#009966]/5 dark:bg-emerald-500/10 blur-3xl rounded-full pointer-events-none transition-colors duration-300" />
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#009966] dark:text-emerald-500 tracking-widest mb-3 transition-colors duration-300">
                <FileText className="w-3.5 h-3.5" /> Visualize seu simulado:
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
                {titulo || "Novo Simulado"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-neutral-500 font-semibold flex justify-between items-center mb-2 transition-colors duration-300">
                  BANCAS SELECIONADAS
                  <span className="bg-gray-100 dark:bg-neutral-800 px-1.5 rounded-full text-[10px] transition-colors duration-300">
                    {bancasSel.length}
                  </span>
                </span>
                {bancasSel.length === 0 ? (
                  <div className="text-sm text-gray-400 dark:text-neutral-500 italic transition-colors duration-300">
                    Nenhuma específica.
                  </div>
                ) : (
                  <div
                    className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1 overscroll-contain"
                    data-lenis-prevent="true"
                  >
                    {bancasSel.map((id) => (
                      <div
                        key={id}
                        className="flex items-center bg-gray-50 dark:bg-neutral-950/50 p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800/60 transition-colors duration-300"
                      >
                        <span className="text-xs text-gray-600 dark:text-neutral-300 truncate transition-colors duration-300">
                          {bancas.find((b) => b.id === id)?.nome ||
                            "Desconhecida"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-neutral-800/80 pt-4 transition-colors duration-300">
                <span className="text-xs text-gray-500 dark:text-neutral-500 font-semibold flex justify-between items-center mb-3 transition-colors duration-300">
                  MATÉRIAS SELECIONADAS
                  <span className="bg-gray-100 dark:bg-neutral-800 px-1.5 rounded-full text-[10px] transition-colors duration-300">
                    {Object.keys(materiasSel).length}
                  </span>
                </span>
                {Object.keys(materiasSel).length === 0 ? (
                  <div className="text-sm text-gray-400 dark:text-neutral-500 italic transition-colors duration-300">
                    Nenhuma específica.
                  </div>
                ) : (
                  <div
                    className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1 overscroll-contain"
                    data-lenis-prevent="true"
                  >
                    {Object.entries(materiasSel).map(([idStr, qtd]) => {
                      const id = Number(idStr);
                      const matName =
                        materias.find((m) => m.id === id)?.nome ||
                        "Desconhecida";
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between bg-gray-50 dark:bg-neutral-950/50 p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800/60 transition-colors duration-300"
                        >
                          <span
                            className="text-xs text-gray-600 dark:text-neutral-300 truncate pr-2 transition-colors duration-300"
                            title={matName}
                          >
                            {matName}
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={qtd}
                            onChange={(e) =>
                              updateQtd(
                                id,
                                parseInt(e.target.value) || 1,
                                setMateriasSel,
                              )
                            }
                            className="w-14 h-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-emerald-500/50 text-[#009966] dark:text-emerald-400 text-xs font-bold text-center rounded focus:outline-none focus:ring-1 focus:ring-[#009966] dark:focus:ring-emerald-500 shrink-0 transition-colors duration-300"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-neutral-800/80 pt-4 transition-colors duration-300">
                <span className="text-xs text-gray-500 dark:text-neutral-500 font-semibold flex justify-between items-center mb-3 transition-colors duration-300">
                  ASSUNTOS SELECIONADOS
                  <span className="bg-gray-100 dark:bg-neutral-800 px-1.5 rounded-full text-[10px] transition-colors duration-300">
                    {Object.keys(materiasSel).length +
                      Object.keys(assuntosSel).length}
                  </span>
                </span>

                {Object.keys(materiasSel).length === 0 &&
                Object.keys(assuntosSel).length === 0 ? (
                  <div className="text-sm text-gray-400 dark:text-neutral-500 italic transition-colors duration-300">
                    Nenhum específico.
                  </div>
                ) : (
                  <div
                    className="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1 overscroll-contain"
                    data-lenis-prevent="true"
                  >
                    {Object.keys(materiasSel).map((idStr) => {
                      const id = Number(idStr);
                      const matName =
                        materias.find((m) => m.id === id)?.nome ||
                        "Desconhecida";
                      return (
                        <div
                          key={`all-${id}`}
                          className="flex items-center justify-between bg-gray-50 dark:bg-neutral-950/50 p-2.5 rounded-lg border border-[#009966]/30 dark:border-emerald-500/30 transition-colors duration-300"
                        >
                          <span className="text-xs text-[#009966] dark:text-emerald-400 truncate pr-2 italic transition-colors duration-300">
                            Todos os assuntos de {matName}
                          </span>
                          <span className="text-[10px] text-[#009966] dark:text-emerald-500 font-bold bg-[#009966]/10 dark:bg-emerald-500/10 px-2 py-1 rounded transition-colors duration-300">
                            INCLUÍDO
                          </span>
                        </div>
                      );
                    })}
                    {Object.entries(assuntosSel).map(([idStr, qtd]) => {
                      const id = Number(idStr);
                      const assName =
                        assuntos.find((a) => a.id === id)?.nome ||
                        "Desconhecido";
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between bg-gray-50 dark:bg-neutral-950/50 p-2.5 rounded-lg border border-gray-200 dark:border-neutral-800/60 transition-colors duration-300"
                        >
                          <span
                            className="text-xs text-gray-600 dark:text-neutral-300 truncate pr-2 transition-colors duration-300"
                            title={assName}
                          >
                            {assName}
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={qtd}
                            onChange={(e) =>
                              updateQtd(
                                id,
                                parseInt(e.target.value) || 1,
                                setAssuntosSel,
                              )
                            }
                            className="w-14 h-8 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-emerald-500/50 text-[#009966] dark:text-emerald-400 text-xs font-bold text-center rounded focus:outline-none focus:ring-1 focus:ring-[#009966] dark:focus:ring-emerald-500 shrink-0 transition-colors duration-300"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-end justify-start border-t gap-1.5 text-2xl font-semibold border-gray-200 dark:border-neutral-800/80 pt-4 transition-colors duration-300">
                {isLoadingCount ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#009966] dark:text-emerald-500 transition-colors duration-300" />
                ) : (
                  questoesDisponiveis
                )}
                <span className="text-sm mb-1 text-gray-500 dark:text-neutral-500 font-medium transition-colors duration-300">
                  Questões encontradas.
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                form="form-simulado"
                disabled={isGenerating}
                className="flex items-center w-full justify-center gap-2 bg-[#009966] hover:bg-[#007a52] dark:bg-emerald-600 hover:scale-[1.02] dark:hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg duration-300 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Gerando...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" /> Criar Simulado
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
