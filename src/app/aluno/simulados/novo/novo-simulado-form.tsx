/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Settings2, Play, Check, Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { gerarSimuladoAleatorio } from "../../../../actions/simulados";

interface DadosProps {
  bancas: any[];
  materias: any[];
  assuntos: any[];
}

// Subcomponente reutilizável para a lista de pesquisa e seleção
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

  // Filtra os itens com base na barra de pesquisa
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter((item) =>
      item.nome.toLowerCase().includes(lowerSearch),
    );
  }, [items, searchTerm]);

  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-neutral-300 mb-3 flex justify-between items-center">
        {title}
        <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-emerald-400">
          {selectedIds.length} marcadas
        </span>
      </label>

      {/* Container Principal do Card com altura fixa para permitir o scroll */}
      <div className="flex flex-col h-125 meu-scroll bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-inner">
        {/* Barra de Pesquisa */}
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

        {/* Lista Rolável com Scroll invisível (funcionando perfeitamente!) */}
        <div className="flex-1 overflow-y-auto overscroll-contain ">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              Nenhum resultado encontrado.
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={`flex items-start gap-3 w-full text-left px-4 py-3 transition-colors ${
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-neutral-700 bg-neutral-900"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-neutral-950 stroke-[3]" />
                      )}
                    </div>
                    <span className="whitespace-normal leading-snug text-sm">
                      {item.nome}
                    </span>
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

  // Função centralizada para alternar estado
  const toggleSelection = (id: number, state: number[], setState: any) => {
    if (state.includes(id)) {
      setState(state.filter((itemId) => itemId !== id));
    } else {
      setState([...state, id]);
    }
  };

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
    } catch (error) {
      toast.error("Erro Fatal", {
        description: "Falha ao conectar com o servidor.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleGerarSimulado} className="space-y-6">
      {/* BLOCO 1: CONFIGURAÇÕES BÁSICAS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-800 pb-3">
          <Settings2 className="text-emerald-500 w-5 h-5" />
          <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
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
            <span className="text-xs text-neutral-500">Mín: 1 | Máx: 120</span>
          </div>
        </div>
      </div>

      {/* BLOCO 2: FILTROS AVANÇADOS (Opcionais) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-6 border-b border-neutral-800 pb-3">
          <h2 className="text-xl font-bold text-white">Filtros de Questões</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Se não marcar nenhuma opção, o simulado sorteará questões de forma
            totalmente aleatória de todo o banco.
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
              toggleSelection(id, materiasSelecionadas, setMateriasSelecionadas)
            }
          />

          <FilterCard
            title="Assuntos"
            placeholder="Pesquisar assunto..."
            items={assuntos}
            selectedIds={assuntosSelecionados}
            onToggle={(id) =>
              toggleSelection(id, assuntosSelecionados, setAssuntosSelecionados)
            }
          />
        </div>
      </div>

      {/* BLOCO 3: BOTÃO DE AÇÃO */}
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
  );
}
