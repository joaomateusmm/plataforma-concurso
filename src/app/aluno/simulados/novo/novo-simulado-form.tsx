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
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46 !important; border-radius: 10px !important; }
        .custom-scrollbar { scrollbar-width: thin !important; scrollbar-color: #3f3f46 transparent !important; }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <form
          id="form-simulado"
          onSubmit={handleGerarSimulado}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-neutral-800 pb-3">
              <Settings2 className="text-emerald-500 w-5 h-5" />
              <h2 className="text-xl font-bold text-white">
                Configurações Gerais
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-300">
                  Nome do Simulado *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Treino Reta Final PMCE"
                  className="bg-neutral-950 border border-neutral-800 text-white px-3 h-12 rounded-xl focus:ring-1 duration-200 shadow-md focus:ring-neutral-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-300">
                  Total a Gerar (Soma dos filtros)
                </label>
                <div className="bg-neutral-950 border border-neutral-800 text-neutral-400 h-12 font-semibold text-xl px-3 shadow-md rounded-xl flex items-center justify-center">
                  {quantidadeTotalCalculada} Questões
                </div>
                <span className="text-xs text-neutral-500 text-center mt-1">
                  Quantidade que será incluída no simulado
                </span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-6 border-b border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-white">
                Selecione os Filtros
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
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
          <div className="flex flex-col p-6 gap-6 text-white bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 tracking-widest mb-3">
                <FileText className="w-3.5 h-3.5" /> Visualize seu simulado:
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight">
                {titulo || "Novo Simulado"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-neutral-500 font-semibold flex justify-between items-center mb-2">
                  BANCAS SELECIONADAS
                  <span className="bg-neutral-800 px-1.5 rounded-full text-[10px]">
                    {bancasSel.length}
                  </span>
                </span>
                {bancasSel.length === 0 ? (
                  <div className="text-sm text-neutral-500 italic">
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
                        className="flex items-center bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-800/60"
                      >
                        <span className="text-xs text-neutral-300 truncate">
                          {bancas.find((b) => b.id === id)?.nome ||
                            "Desconhecida"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-800/80 pt-4">
                <span className="text-xs text-neutral-500 font-semibold flex justify-between items-center mb-3">
                  MATÉRIAS SELECIONADAS
                  <span className="bg-neutral-800 px-1.5 rounded-full text-[10px]">
                    {Object.keys(materiasSel).length}
                  </span>
                </span>
                {Object.keys(materiasSel).length === 0 ? (
                  <div className="text-sm text-neutral-500 italic">
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
                          className="flex items-center justify-between bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-800/60"
                        >
                          <span
                            className="text-xs text-neutral-300 truncate pr-2"
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
                            className="w-14 h-8 bg-neutral-900 border border-emerald-500/50 text-emerald-400 text-xs font-bold text-center rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-800/80 pt-4">
                <span className="text-xs text-neutral-500 font-semibold flex justify-between items-center mb-3">
                  ASSUNTOS SELECIONADOS
                  <span className="bg-neutral-800 px-1.5 rounded-full text-[10px]">
                    {Object.keys(materiasSel).length +
                      Object.keys(assuntosSel).length}
                  </span>
                </span>

                {Object.keys(materiasSel).length === 0 &&
                Object.keys(assuntosSel).length === 0 ? (
                  <div className="text-sm text-neutral-500 italic">
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
                          className="flex items-center justify-between bg-neutral-950/50 p-2.5 rounded-lg border border-emerald-500/30"
                        >
                          <span className="text-xs text-emerald-400 truncate pr-2 italic">
                            Todos os assuntos de {matName}
                          </span>
                          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">
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
                          className="flex items-center justify-between bg-neutral-950/50 p-2.5 rounded-lg border border-neutral-800/60"
                        >
                          <span
                            className="text-xs text-neutral-300 truncate pr-2"
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
                            className="w-14 h-8 bg-neutral-900 border border-emerald-500/50 text-emerald-400 text-xs font-bold text-center rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 shrink-0"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-end justify-start border-t gap-1.5 text-2xl font-semibold border-neutral-800/80 pt-4">
                {isLoadingCount ? (
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                ) : (
                  questoesDisponiveis
                )}
                <span className=" text-sm mb-1 text-neutral-500 font-medium">
                  Questões encontradas.
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                form="form-simulado"
                disabled={isGenerating}
                className="flex items-center w-full justify-center gap-2 bg-emerald-600 hover:scale-[1.02] text-white py-4 rounded-xl font-bold text-lg duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
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
