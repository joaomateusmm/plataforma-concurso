/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Settings2,
  Play,
  Check,
  Search,
  FileText,
  Target,
  Layers,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { gerarSimuladoAleatorio } from "../../../../actions/simulados";

interface DadosProps {
  bancas: any[];
  materias: any[];
  assuntos: any[];
}

function FilterCard({
  title,
  items,
  selectedIds,
  onToggle,
  placeholder,
}: {
  title: string;
  items: any[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  placeholder: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        item.nome.toLowerCase().includes(lowerSearch),
      );
    }
    return result.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [items, searchTerm]);

  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-neutral-300 mb-3 flex justify-between items-center">
        {title}
        <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-emerald-400">
          {selectedIds.length} marcadas
        </span>
      </label>

      <div className="flex flex-col h-120 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-inner">
        <div className="flex items-center px-4 h-12 shrink-0 border-b border-neutral-800/60 bg-neutral-950">
          <Search className="w-4 h-4 text-neutral-500 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 placeholder:text-neutral-600"
          />
        </div>

        <div
          data-lenis-prevent="true"
          className="custom-scrollbar relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto"
          style={{ overscrollBehavior: "contain" }}
        >
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Nenhum resultado encontrado.
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const qtd = item.quantidadeQuestoes || 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-neutral-700 bg-neutral-900"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-neutral-950 stroke-3" />
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-3 overflow-hidden">
                      <span className="truncate leading-snug text-sm">
                        {item.nome}
                      </span>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md border ${
                          qtd > 0
                            ? "bg-neutral-800/50 text-neutral-300 border-neutral-800"
                            : "bg-neutral-800/50 text-neutral-500 border-neutral-800"
                        }`}
                      >
                        {qtd} {qtd === 1 ? "Questão" : "Questões"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NovoSimuladoForm({ bancas, materias, assuntos }: DadosProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isGenerating, setIsGenerating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [quantidade, setQuantidade] = useState<number>(10);

  const [bancasSelecionadas, setBancasSelecionadas] = useState<number[]>([]);
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<number[]>(
    [],
  );
  const [assuntosSelecionados, setAssuntosSelecionados] = useState<number[]>(
    [],
  );

  const toggleSelection = (id: number, state: number[], setState: any) => {
    if (state.includes(id)) {
      setState(state.filter((itemId) => itemId !== id));
    } else {
      setState([...state, id]);
    }
  };

  // =========================================================
  // LÓGICA DINÂMICA DO RESUMO DO SIMULADO (A MÁGICA ACONTECE AQUI)
  // =========================================================

  // Extraímos os nomes do que o utilizador selecionou para mostrar na caixa
  const nomesBancas = bancas
    .filter((b) => bancasSelecionadas.includes(b.id))
    .map((b) => b.nome);
  const nomesMaterias = materias
    .filter((m) => materiasSelecionadas.includes(m.id))
    .map((m) => m.nome);
  const nomesAssuntos = assuntos
    .filter((a) => assuntosSelecionados.includes(a.id))
    .map((a) => a.nome);

  // Estimativa de Questões: Calcula o limite superior cruzando os filtros!
  const estimativaQuestoes = useMemo(() => {
    // Total absoluto do banco
    const totalBanco = bancas.reduce(
      (acc, curr) => acc + (Number(curr.quantidadeQuestoes) || 0),
      0,
    );

    const totalB =
      bancasSelecionadas.length > 0
        ? bancas
            .filter((b) => bancasSelecionadas.includes(b.id))
            .reduce(
              (acc, curr) => acc + (Number(curr.quantidadeQuestoes) || 0),
              0,
            )
        : totalBanco;

    const totalM =
      materiasSelecionadas.length > 0
        ? materias
            .filter((m) => materiasSelecionadas.includes(m.id))
            .reduce(
              (acc, curr) => acc + (Number(curr.quantidadeQuestoes) || 0),
              0,
            )
        : totalBanco;

    const totalA =
      assuntosSelecionados.length > 0
        ? assuntos
            .filter((a) => assuntosSelecionados.includes(a.id))
            .reduce(
              (acc, curr) => acc + (Number(curr.quantidadeQuestoes) || 0),
              0,
            )
        : totalBanco;

    // A intersecção nunca pode ser maior que o menor grupo selecionado!
    return Math.min(totalB, totalM, totalA);
  }, [
    bancas,
    materias,
    assuntos,
    bancasSelecionadas,
    materiasSelecionadas,
    assuntosSelecionados,
  ]);

  const handleGerarSimulado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Erro de Autenticação", {
        description: "Você precisa estar logado para gerar simulados.",
      });
      return;
    }
    if (!titulo.trim()) {
      toast.error("Aviso", {
        description: "Por favor, dê um título ao seu simulado.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const resultado = await gerarSimuladoAleatorio({
        userId: session.user.id,
        titulo: titulo,
        quantidade: quantidade,
        bancasIds:
          bancasSelecionadas.length > 0 ? bancasSelecionadas : undefined,
        materiasIds:
          materiasSelecionadas.length > 0 ? materiasSelecionadas : undefined,
        assuntosIds:
          assuntosSelecionados.length > 0 ? assuntosSelecionados : undefined,
      });

      if (resultado.error) {
        toast.error("Ops!", { description: resultado.error });
      } else if (resultado.simuladoId) {
        toast.success("Simulado Gerado!", {
          description: "Prepare-se, a prova vai começar!",
        });
        router.push(`/aluno/simulados/${resultado.simuladoId}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro Fatal", {
        description: "Falha ao conectar com o servidor.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <style>{`
        .hide-native-scroll::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .hide-native-scroll { scrollbar-width: none !important; -ms-overflow-style: none !important; }

        .custom-scrollbar::-webkit-scrollbar { display: block !important; width: 6px !important; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46 !important; border-radius: 10px !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #52525b !important; }
        .custom-scrollbar { scrollbar-width: thin !important; scrollbar-color: #3f3f46 transparent !important; }
      `}</style>

      {/* GRID LAYOUT: O Formulário na esquerda, Resumo na direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* COLUNA ESQUERDA: FORMULÁRIO (Ocupa 2 espaços) */}
        <form
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
                  className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-neutral-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-300">
                  Quantidade de Questões *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value))}
                  className="bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-neutral-600"
                />
                <span className="text-xs text-neutral-500">
                  Mín: 1 | Máx: 120
                </span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
            <div className="mb-6 border-b border-neutral-800 pb-3">
              <h2 className="text-xl font-bold text-white">
                Filtros de Questões
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Se não marcar nenhuma opção, o simulado sorteará questões de
                forma totalmente aleatória de todo o banco.
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <FilterCard
                title="Bancas"
                placeholder="Pesquisar banca..."
                items={bancas}
                selectedIds={bancasSelecionadas}
                onToggle={(id) =>
                  toggleSelection(id, bancasSelecionadas, setBancasSelecionadas)
                }
              />
              <FilterCard
                title="Matérias"
                placeholder="Pesquisar matéria..."
                items={materias}
                selectedIds={materiasSelecionadas}
                onToggle={(id) =>
                  toggleSelection(
                    id,
                    materiasSelecionadas,
                    setMateriasSelecionadas,
                  )
                }
              />
              <FilterCard
                title="Assuntos"
                placeholder="Pesquisar assunto..."
                items={assuntos}
                selectedIds={assuntosSelecionados}
                onToggle={(id) =>
                  toggleSelection(
                    id,
                    assuntosSelecionados,
                    setAssuntosSelecionados,
                  )
                }
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sorteando Questões...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Criar e Começar Simulado
                </>
              )}
            </button>
          </div>
        </form>

        {/* COLUNA DIREITA: RESUMO DINÂMICO (Ocupa 1 espaço e fica FIXO no scroll) */}
        <div className="lg:col-span-1 sticky top-8">
          <div className="flex flex-col p-6 gap-6 text-white bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Brilho visual no card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 tracking-widest mb-3">
                <FileText className="w-3.5 h-3.5" />
                Visualize seu simulado:
              </div>
              <h3 className="text-2xl font-bold text-white wrap-break-word leading-tight">
                {titulo || "Novo Simulado"}
              </h3>
            </div>

            <div className="space-y-5">
              <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/60">
                <span className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">
                  <Target className="w-3.5 h-3.5" /> Quantidade Desejada
                </span>
                <div className="text-sm font-medium text-neutral-200">
                  {quantidade} {quantidade === 1 ? "Questão" : "Questões"}
                </div>
              </div>

              <div>
                <span className="text-xs text-neutral-500 font-semibold flex justify-between items-center mb-1">
                  BANCAS{" "}
                  <span className="bg-neutral-800 px-1.5 rounded-full text-[10px]">
                    {bancasSelecionadas.length}
                  </span>
                </span>
                <div className="text-sm font-medium text-neutral-300 line-clamp-3">
                  {nomesBancas.length > 0
                    ? nomesBancas.join(", ")
                    : "Todas as Bancas da Plataforma"}
                </div>
              </div>

              <div>
                <span className="text-xs text-neutral-500 font-semibold flex justify-between items-center mb-1">
                  MATÉRIAS{" "}
                  <span className="bg-neutral-800 px-1.5 rounded-full text-[10px]">
                    {materiasSelecionadas.length}
                  </span>
                </span>
                <div className="text-sm font-medium text-neutral-300 line-clamp-3">
                  {nomesMaterias.length > 0
                    ? nomesMaterias.join(", ")
                    : "Todas as Matérias"}
                </div>
              </div>

              <div>
                <span className="text-xs text-neutral-500 font-semibold flex justify-between items-center mb-1">
                  ASSUNTOS{" "}
                  <span className="bg-neutral-800 px-1.5 rounded-full text-[10px]">
                    {assuntosSelecionados.length}
                  </span>
                </span>
                <div className="text-sm font-medium text-neutral-300 line-clamp-3">
                  {nomesAssuntos.length > 0
                    ? nomesAssuntos.join(", ")
                    : "Todos os Assuntos"}
                </div>
              </div>
            </div>

            <div className="mt-2 pt-5 border-t border-neutral-800/80">
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-bold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" /> Questões Disponíveis
              </span>
              <div className="text-3xl font-semibold text-emerald-400 tracking-tight">
                {estimativaQuestoes.toLocaleString("pt-BR")}{" "}
                <span className="text-sm font-medium text-neutral-500">
                  Qts no Banco
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
