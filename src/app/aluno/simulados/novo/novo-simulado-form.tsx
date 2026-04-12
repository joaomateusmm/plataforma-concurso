/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Settings2,
  Play,
  FileText,
  Clock,
  HelpCircle,
  CircleQuestionMark,
  Minus, // <-- ADICIONA ESTE
  Plus,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  gerarSimuladoAleatorio,
  contarQuestoesDisponiveis,
} from "../../../../actions/simulados";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { FilterCardBancas, FilterCardMaterias } from "./FilterCards";

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
  const [quantidadeTotal, setQuantidadeTotal] = useState<number>(60);
  const [bancasSel, setBancasSel] = useState<number[]>([]);
  const [materiasSel, setMateriasSel] = useState<Record<number, boolean>>({});
  const [assuntosSel, setAssuntosSel] = useState<Record<number, boolean>>({});
  const [estiloProva, setEstiloProva] = useState<string>("Objetiva");
  const [isEstiloDropdownOpen, setIsEstiloDropdownOpen] = useState(false);
  const [isTempoDropdownOpen, setIsTempoDropdownOpen] = useState(false);
  const [tempoLimite, setTempoLimite] = useState<number | null>(null);
  const [questoesDisponiveis, setQuestoesDisponiveis] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isQtdDropdownOpen, setIsQtdDropdownOpen] = useState(false);

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
          estiloProva: estiloProva, // "Objetiva" ou "Certo ou Errado"
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
  }, [bancasSel, materiasSel, assuntosSel, estiloProva]);

  useEffect(() => {
    const savedData = sessionStorage.getItem("simulado_pre_selecionado");
    if (savedData) {
      try {
        const dados = JSON.parse(savedData);
        if (dados.titulo) setTitulo(dados.titulo);
        if (dados.materias) {
          const matsObj: Record<number, boolean> = {};
          dados.materias.forEach((id: number) => (matsObj[id] = true));
          setMateriasSel(matsObj);
        }
        if (dados.assuntos) {
          const assObj: Record<number, boolean> = {};
          dados.assuntos.forEach((id: number) => (assObj[id] = true));
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
      else next[materiaId] = true;
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
      setMateriasSel((prev) => {
        const next = { ...prev };
        delete next[materiaId];
        return next;
      });
      setAssuntosSel((prev) => {
        const next = { ...prev };
        const assuntosDestaMateria = assuntos.filter(
          (a) => obterMateriaId(a) === materiaId,
        );
        assuntosDestaMateria.forEach((a) => {
          if (a.id !== assuntoId) next[a.id] = true;
        });
        return next;
      });
    } else {
      setAssuntosSel((prev) => {
        const next = { ...prev };
        if (next[assuntoId]) delete next[assuntoId];
        else next[assuntoId] = true;

        const assuntosDestaMateria = assuntos.filter(
          (a) => obterMateriaId(a) === materiaId,
        );
        const allSelectedNow =
          assuntosDestaMateria.length > 0 &&
          assuntosDestaMateria.every((a) => next[a.id]);

        if (allSelectedNow) {
          assuntosDestaMateria.forEach((a) => delete next[a.id]);
          setMateriasSel((mPrev) => ({ ...mPrev, [materiaId]: true }));
        }

        return next;
      });
    }
  };

  const formatarTempo = (minutos: number | null) => {
    if (!minutos) return "Sem limite de tempo";
    const horas = Math.floor(minutos / 60);
    const minRestantes = minutos % 60;
    if (minRestantes === 0) return `${horas} hora${horas > 1 ? "s" : ""}`;
    return `${horas}h ${minRestantes}m`;
  };

  const handleGerarSimulado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return toast.error("Você precisa estar logado.");
    if (!titulo.trim()) return toast.error("Dê um título ao seu simulado.");
    if (quantidadeTotal <= 0)
      return toast.error("A quantidade de questões deve ser maior que zero.");

    if (quantidadeTotal > questoesDisponiveis) {
      return toast.error("Aviso", {
        description: `Só existem ${questoesDisponiveis} questões disponíveis com estes filtros. Reduza o Total a Gerar.`,
      });
    }

    setIsGenerating(true);

    const payloadMaterias = Object.keys(materiasSel).map((id) => ({
      id: Number(id),
      qtd: quantidadeTotal,
    }));
    const payloadAssuntos = Object.keys(assuntosSel).map((id) => ({
      id: Number(id),
      qtd: quantidadeTotal,
    }));

    try {
      const resultado = await gerarSimuladoAleatorio({
        userId: session.user.id,
        titulo: titulo,
        quantidadeTotal: quantidadeTotal,
        bancasIds: bancasSel.length > 0 ? bancasSel : undefined,
        materiasConfig:
          payloadMaterias.length > 0 ? payloadMaterias : undefined,
        assuntosConfig:
          payloadAssuntos.length > 0 ? payloadAssuntos : undefined,
        estiloProva: estiloProva,
        tempoLimite: tempoLimite,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 font-semibold text-xl text-gray-600 dark:text-neutral-400 placeholder:text-gray-400/60 dark:placeholder:text-neutral-600 px-3 h-12 rounded-xl focus:ring-1 duration-200 shadow-md focus:ring-[#009966] dark:focus:ring-neutral-500 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-3">
                {/* DROPDOWN - QUANTIDADE DE QUESTÕES (ESTILO FINTECH) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 transition-colors duration-300">
                      Nº de Questões que terá no Simulado *
                    </label>
                    <HoverCard openDelay={100} closeDelay={200}>
                      <HoverCardTrigger>
                        <CircleQuestionMark className="h-4 w-4 text-gray-700 dark:text-neutral-300" />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        Essa é a quantidade total de questões que seu simulado
                        terá. A quantidade de questões por assunto será
                        escolhida aleatoriamente pelo sistema.
                      </HoverCardContent>
                    </HoverCard>
                  </div>

                  <DropdownMenu
                    open={isQtdDropdownOpen}
                    onOpenChange={setIsQtdDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      {/* Botão fechado - Idêntico aos outros inputs! */}
                      <Button
                        className={`bg-gray-50 dark:bg-neutral-950 border cursor-pointer border-gray-200 dark:border-neutral-800 font-semibold text-xl text-gray-600 dark:text-neutral-400 placeholder:text-gray-400 dark:placeholder:text-neutral-600 px-3 h-12 rounded-xl focus:ring-1 duration-200 shadow-md focus:ring-[#009966] dark:focus:ring-neutral-500 outline-none transition-colors ${
                          isQtdDropdownOpen
                            ? "ring-1 ring-neutral-700 focus:ring-0"
                            : ""
                        }`}
                        variant="outline"
                      >
                        {quantidadeTotal}
                      </Button>
                    </DropdownMenuTrigger>

                    {/* Painel aberto - O teu Widget Premium */}
                    <DropdownMenuContent
                      sideOffset={8}
                      className="w-(--radix-dropdown-menu-trigger-width) bg-white dark:bg-neutral-900 border border-gray-800 shadow-md dark:border-emerald-500 rounded-2xl p-5  transition-all duration-300 ring-4  "
                    >
                      <div className="flex flex-col items-center w-full">
                        <div className="flex items-center justify-between w-full">
                          {/* Botão Menos */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setQuantidadeTotal((prev) =>
                                Math.max(1, prev - 5),
                              );
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
                          >
                            <Minus className="w-5 h-5" />
                          </button>

                          {/* Input Centralizado Gigante */}
                          <div className="flex flex-col items-center flex-1 overflow-hidden">
                            <input
                              type="number"
                              required
                              min="1"
                              max="200"
                              value={quantidadeTotal || ""}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (isNaN(val)) setQuantidadeTotal(0 as any);
                                else if (val <= 200) setQuantidadeTotal(val);
                                else setQuantidadeTotal(200);
                              }}
                              onBlur={() => {
                                if (!quantidadeTotal || quantidadeTotal < 1)
                                  setQuantidadeTotal(1);
                              }}
                              className="w-full bg-transparent font-extrabold text-5xl text-center text-gray-600 dark:text-neutral-300 outline-none p-0 border-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors duration-300"
                            />
                            <span className="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mt-1 transition-colors duration-300">
                              Questões
                            </span>
                          </div>

                          {/* Botão Mais */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setQuantidadeTotal((prev) =>
                                Math.min(200, prev + 5),
                              );
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Chips de Seleção Rápida */}
                        <div className="flex items-center justify-center gap-2 mt-6 w-full">
                          {[20, 40, 60, 80, 100].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setQuantidadeTotal(num);
                              }}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                                quantidadeTotal === num
                                  ? "bg-gray-200 dark:bg-neutral-900 text-gray-900 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700 shadow-xs scale-105"
                                  : "bg-gray-50 dark:bg-neutral-950 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:scale-105"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* DROPDOWN - ESTILO DA PROVA (Apenas Múltipla ou Certo/Errado) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 transition-colors duration-300">
                    Estilo da Prova *
                  </label>
                  <HoverCard openDelay={100} closeDelay={200}>
                    <HoverCardTrigger>
                      <CircleQuestionMark className="h-4 w-4 text-gray-700 dark:text-neutral-300" />
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Aqui você escolherá se sua prova será de questões de
                      múltipla Escolha: A, B, C, D ou E.<br></br> Ou questões de
                      Certo / Errado.
                    </HoverCardContent>
                  </HoverCard>
                </div>
                {/* Adicionamos o estado open e onOpenChange para 
                  saber quando o menu está aberto 
                */}
                <DropdownMenu
                  open={isEstiloDropdownOpen}
                  onOpenChange={setIsEstiloDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-gray-50 cursor-pointer flex items-center justify-between gap-5 dark:bg-neutral-950 border font-semibold text-xl text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 placeholder:text-gray-400 dark:placeholder:text-neutral-600 px-3 h-12 rounded-xl focus:ring-1 duration-200 shadow-md focus:ring-[#009966] dark:focus:ring-neutral-500 outline-none transition-colors w-full"
                      variant="outline"
                    >
                      <span>
                        {estiloProva === "Objetiva"
                          ? "Múltipla Escolha"
                          : "Certo / Errado"}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${isEstiloDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors duration-300 w-(--radix-dropdown-menu-trigger-width)">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300 py-1">
                        Tipo de questões
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setEstiloProva("Objetiva");
                          setIsEstiloDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        Múltipla Escolha
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEstiloProva("Certo ou Errado");
                          setIsEstiloDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        Certo / Errado
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* DROPDOWN - TEMPO DE PROVA */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center ">
                  <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 transition-colors duration-300">
                    Tempo de Prova *
                  </label>
                  <HoverCard openDelay={100} closeDelay={200}>
                    <HoverCardTrigger>
                      <CircleQuestionMark className="h-4 w-4 text-gray-700 dark:text-neutral-300" />
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <span className="py-4">
                        Aqui você seleciona a duração total que sua prova terá.
                      </span>
                      <br></br>
                      <span className="py-4">
                        Caso você não termine no tempo, não se preocupe!
                        <br></br> Você terá a opção de continuar ou parar.
                      </span>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                {/* Adicionamos o estado open e onOpenChange */}
                <DropdownMenu
                  open={isTempoDropdownOpen}
                  onOpenChange={setIsTempoDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    {/* Botão atualizado com flex, justify-between e w-full */}
                    <Button
                      className="bg-gray-50 cursor-pointer flex items-center justify-between gap-5 dark:bg-neutral-950 border font-semibold text-xl text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 placeholder:text-gray-400 dark:placeholder:text-neutral-600 px-3 h-12 rounded-xl focus:ring-1 duration-200 shadow-md focus:ring-[#009966] dark:focus:ring-neutral-500 outline-none transition-colors w-full"
                      variant="outline"
                    >
                      <span>{formatarTempo(tempoLimite)}</span>
                      {/* A Seta com a animação de rotação */}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${isTempoDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    data-lenis-prevent="true"
                    className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 transition-colors duration-300 h-64 overflow-y-auto custom-scrollbar overscroll-contain w-(--radix-dropdown-menu-trigger-width)"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-gray-500 dark:text-neutral-500 transition-colors duration-300 py-1">
                        Duração máxima
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(null);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        Sem limite de tempo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(60);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        1 Hora
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(90);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        1 Hora e 30 Minutos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(120);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        2 Horas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(150);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        2 Horas e 30 Minutos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(180);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        3 Horas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(210);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        3 Horas e 30 Minutos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(240);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        4 Horas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(270);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        4 Horas e 30 Minutos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTempoLimite(300);
                          setIsTempoDropdownOpen(false);
                        }}
                        className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-800 border-t rounded-none border-gray-100 dark:border-neutral-700/70 focus:text-gray-900 dark:focus:text-white py-3 duration-200 transition-colors"
                      >
                        5 Horas
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <FilterCardMaterias
                materias={materias}
                assuntos={assuntos}
                materiasSel={materiasSel}
                assuntosSel={assuntosSel}
                onToggleMateria={handleToggleMateria}
                onToggleAssunto={handleToggleAssunto}
              />

              <FilterCardBancas
                title="Bancas"
                placeholder="Pesquisar banca..."
                items={bancas}
                selectedIds={bancasSel}
                onToggle={toggleBanca}
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
              <div className="flex flex-col gap-2 bg-gray-50 dark:bg-neutral-950/50 p-3 rounded-xl border border-gray-200 dark:border-neutral-800/60">
                <div className="flex items-center gap-2 text-sm">
                  <HelpCircle className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                  <span className="font-semibold text-gray-700 dark:text-neutral-300">
                    Estilo:
                  </span>
                  <span className="text-gray-600 dark:text-neutral-400 truncate">
                    {estiloProva === "Objetiva"
                      ? "Múltipla Escolha"
                      : "Certo / Errado"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
                  <span className="font-semibold text-gray-700 dark:text-neutral-300">
                    Tempo:
                  </span>
                  <span className="text-gray-600 dark:text-neutral-400 truncate">
                    {formatarTempo(tempoLimite)}
                  </span>
                </div>
              </div>

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
                    {Object.keys(materiasSel).map((idStr) => {
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
                          <span className="text-[10px] text-[#009966] dark:text-emerald-500 font-bold bg-[#009966]/10 dark:bg-emerald-500/10 px-2 py-1 rounded transition-colors duration-300">
                            INCLUÍDO
                          </span>
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
                    {Object.keys(assuntosSel).map((idStr) => {
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
                          <span className="text-[10px] text-[#009966] dark:text-emerald-500 font-bold bg-[#009966]/10 dark:bg-emerald-500/10 px-2 py-1 rounded transition-colors duration-300">
                            INCLUÍDO
                          </span>
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
