/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  SkipForward,
  CheckCheck,
  Target,
  BarChart3,
  Award,
  TriangleAlert,
  AlertCircle,
  ScanEye,
  X,
} from "lucide-react";
import { finalizarSimulado } from "../../../../actions/simulados";
import { HeaderMiniTimer } from "@/components/HeaderMiniTimer";
import { Button } from "@/components/ui/button";

interface ProvaClientProps {
  simulado: any;
  questoes: any[];
}

export default function ProvaClient({ simulado, questoes }: ProvaClientProps) {
  const router = useRouter();
  const isConcluido = simulado.status === "Concluido";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados Visuais
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(true); // <-- NOVO ESTADO AQUI

  useEffect(() => {
    if (isFocusMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFocusMode]);

  const [respostas, setRespostas] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    if (isConcluido) {
      questoes.forEach((q) => {
        if (q.respostaUsuario) initial[q.sqId] = q.respostaUsuario;
      });
    }
    return initial;
  });

  const [eliminated, setEliminated] = useState<Record<number, string[]>>({});
  const [marked, setMarked] = useState<Record<number, string[]>>({});
  const questaoAtual = questoes[currentIndex];
  const totalCount = questoes.length;
  const answeredCount = Object.keys(respostas).length;
  const remainingCount = totalCount - answeredCount;
  const allAnswered = answeredCount === totalCount;
  const progressPercentage = (answeredCount / totalCount) * 100;

  const handleSelectOption = (opcao: string) => {
    if (isConcluido) return;
    setRespostas((prev) => ({ ...prev, [questaoAtual.sqId]: opcao }));
  };

  const handleToggleEliminated = (sqId: number, opcao: string) => {
    setEliminated((prev) => {
      const current = prev[sqId] || [];
      const isCurrentlyEliminated = current.includes(opcao);

      if (!isCurrentlyEliminated) {
        setMarked((prevMarked) => {
          const currentMarked = prevMarked[sqId] || [];
          return {
            ...prevMarked,
            [sqId]: currentMarked.filter((o) => o !== opcao),
          };
        });
      }

      return {
        ...prev,
        [sqId]: isCurrentlyEliminated
          ? current.filter((o) => o !== opcao)
          : [...current, opcao],
      };
    });
  };

  const handleToggleMarked = (sqId: number, opcao: string) => {
    setMarked((prev) => {
      const current = prev[sqId] || [];
      const isCurrentlyMarked = current.includes(opcao);

      if (!isCurrentlyMarked) {
        setEliminated((prevEliminated) => {
          const currentEliminated = prevEliminated[sqId] || [];
          return {
            ...prevEliminated,
            [sqId]: currentEliminated.filter((o) => o !== opcao),
          };
        });
      }

      return {
        ...prev,
        [sqId]: isCurrentlyMarked
          ? current.filter((o) => o !== opcao)
          : [...current, opcao],
      };
    });
  };

  const skipQuestion = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const autoCompleteForTesting = () => {
    const fakeAnswers: Record<number, string> = {};
    questoes.forEach((q) => {
      if (q.opcoes && q.opcoes.length > 0) {
        fakeAnswers[q.sqId] =
          q.opcoes[Math.floor(Math.random() * q.opcoes.length)];
      } else if (q.tipo === "Discursiva") {
        fakeAnswers[q.sqId] = "Resposta gerada automaticamente para testes.";
      }
    });
    setRespostas(fakeAnswers);
    toast.success("Auto Teste ativado", {
      description: "Todas as questões foram preenchidas aleatoriamente!",
    });
  };

  const handleFinalizar = async () => {
    if (answeredCount < totalCount) {
      const confirmar = confirm(
        `Você respondeu apenas ${answeredCount} de ${totalCount} questões. Deseja finalizar mesmo assim?`,
      );
      if (!confirmar) return;
    }

    setIsSubmitting(true);
    const result = await finalizarSimulado(simulado.id, respostas);

    if (result.error) {
      toast.error("Erro", { description: result.error });
      setIsSubmitting(false);
    } else {
      toast.success("Simulado Finalizado!", {
        description: `Você acertou ${result.acertos} questões!`,
      });

      setIsFocusMode(false);
      router.refresh();
    }
  };

  return (
    <div
      data-lenis-prevent={isFocusMode ? "true" : undefined}
      className={`text-neutral-300 font-sans pb-24 transition-all duration-300 ${
        isFocusMode
          ? "fixed inset-0 z-100 bg-[#070707] overflow-y-auto h-dvh w-full"
          : "min-h-screen"
      }`}
    >
      <ProvaHeader
        titulo={simulado.titulo}
        isConcluido={isConcluido}
        answeredCount={answeredCount}
        totalCount={totalCount}
        progressPercentage={progressPercentage}
        onBack={() => {
          if (isFocusMode) setIsFocusMode(false);
          else router.push("/aluno/simulados");
        }}
        onAutoTest={autoCompleteForTesting}
        isFocusMode={isFocusMode}
        toggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        isMapVisible={isMapVisible}
        toggleMap={() => setIsMapVisible(!isMapVisible)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 flex flex-col lg:flex-row gap-8 relative">
        <div className="flex-1 w-full max-w-full transition-all duration-300">
          {isConcluido && (
            <ResultDashboard
              acertos={simulado.acertos || 0}
              totalCount={totalCount}
            />
          )}

          <QuestionCard
            questaoAtual={questaoAtual}
            currentIndex={currentIndex}
            respostas={respostas}
            isConcluido={isConcluido}
            eliminated={eliminated}
            marked={marked}
            onSelectOption={handleSelectOption}
            onToggleEliminated={handleToggleEliminated}
            onToggleMarked={handleToggleMarked}
            setRespostas={setRespostas}
            setEliminated={setEliminated}
            setMarked={setMarked}
          />

          <NavigationButtons
            currentIndex={currentIndex}
            totalCount={totalCount}
            isConcluido={isConcluido}
            onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            onNext={() =>
              setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))
            }
            onSkip={skipQuestion}
          />
        </div>

        {/* LÓGICA DE ESCONDER O MAPA AQUI */}
        {isMapVisible && (
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-28 max-h-full overflow-y-auto flex flex-col gap-4 pb-4 animate-in slide-in-from-right-4 duration-300">
            <QuestionMap
              questoes={questoes}
              respostas={respostas}
              currentIndex={currentIndex}
              isConcluido={isConcluido}
              onSelectQuestion={setCurrentIndex}
              onClose={() => setIsMapVisible(false)} // Passamos a prop de fechar
            />

            {!isConcluido && (
              <FinalizeButton
                isSubmitting={isSubmitting}
                allAnswered={allAnswered}
                remainingCount={remainingCount}
                onFinalizar={handleFinalizar}
              />
            )}
          </aside>
        )}
      </main>
    </div>
  );
}

// ==========================================
// SUBCOMPONENTES (LÓGICA VISUAL ISOLADA)
// ==========================================

function ProvaHeader({
  titulo,
  isConcluido,
  answeredCount,
  totalCount,
  progressPercentage,
  onBack,
  onAutoTest,
  isFocusMode,
  toggleFocusMode,
  isMapVisible,
  toggleMap,
}: any) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 rounded-t-2xl bg-neutral-950/80 backdrop-blur-xl">
      {isFocusMode && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <HeaderMiniTimer />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
              title={isFocusMode ? "Sair do Modo Foco" : "Voltar"}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">
              {titulo}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* BOTÃO PARA MOSTRAR/ESCONDER MAPA */}
            <button
              onClick={toggleMap}
              title={isMapVisible ? "Ocultar Mapa" : "Mostrar Mapa"}
              className={`inline-flex items-center gap-1.5 rounded-md cursor-pointer border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                !isMapVisible
                  ? "bg-white border-neutral-300 text-neutral-950"
                  : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-500/20"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mapa</span>
            </button>

            {/* BOTÃO MODO FOCO DINÂMICO */}
            <button
              onClick={toggleFocusMode}
              title={isFocusMode ? "Sair do Modo Foco" : "Ativar Modo Foco"}
              className={`inline-flex items-center gap-1.5 rounded-md cursor-pointer border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                isFocusMode
                  ? "bg-white border-neutral-300 text-neutral-950"
                  : "bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-500/20"
              }`}
            >
              <ScanEye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isFocusMode ? "Sair do Foco" : "Modo Foco"}
              </span>
            </button>

            {!isConcluido && (
              <button
                onClick={onAutoTest}
                title="Auto Completar para Testes"
                className="inline-flex items-center gap-1.5 rounded-md cursor-pointer bg-neutral-900 border border-neutral-700 px-2.5 py-1.5 text-xs font-bold text-neutral-300 hover:bg-neutral-500/20 transition-colors"
              >
                <TriangleAlert className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Marcar Tudo</span>
              </button>
            )}
            <span className="text-neutral-500">|</span>
            <span
              className={` py-1.5 rounded-lg text-xs font-bold  ${isConcluido ? " text-emerald-400 " : " text-neutral-300 "}`}
            >
              {isConcluido ? "Gabarito" : "Prova"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-neutral-500 min-w-12.5 text-right">
            {answeredCount} / {totalCount}
          </span>
        </div>
      </div>
    </header>
  );
}

function ResultDashboard({ acertos, totalCount }: any) {
  const taxa = Math.round((acertos / totalCount) * 100);
  const erros = totalCount - acertos;
  return (
    <div className="mb-8 p-8 border border-neutral-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="relative z-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-sm border border-emerald-500/20 mb-4">
          <Award className="w-4 h-4" /> Simulado Finalizado
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2">
          Seu Desempenho
        </h2>
        <p className="text-neutral-400">
          Revise as suas respostas abaixo e veja onde precisa melhorar.
        </p>
      </div>
      <div className="relative z-10 flex gap-4 w-full md:w-auto">
        <div className="flex-1 md:w-32 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{acertos}</p>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Acertos
          </p>
        </div>
        <div className="flex-1 md:w-32 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center">
          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{erros}</p>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Erros
          </p>
        </div>
        <div className="flex-1 md:w-32 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center">
          <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{taxa}%</p>
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Taxa
          </p>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  questaoAtual,
  currentIndex,
  respostas,
  isConcluido,
  eliminated,
  marked,
  onSelectOption,
  onToggleEliminated,
  onToggleMarked,
  setRespostas,
  setEliminated, // Recebemos a prop
  setMarked, // Recebemos a prop
}: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-neutral-800">
        <div className="text-[10px] font-bold uppercase bg-neutral-950 border border-neutral-800 text-neutral-400 px-2.5 py-1.5 rounded-full">
          {currentIndex + 1}
        </div>
        <span className="text-neutral-800">|</span>
        {questaoAtual.bancaNome && (
          <span className="text-[10px] font-bold uppercase bg-neutral-950 border border-neutral-800 text-neutral-400 px-2.5 py-1.5 rounded-lg">
            {questaoAtual.bancaNome}
          </span>
        )}
        {questaoAtual.materiaNome && (
          <span className="text-[10px] font-bold uppercase bg-neutral-950 border border-neutral-800 text-neutral-400 px-2.5 py-1.5 rounded-lg">
            {questaoAtual.materiaNome}
          </span>
        )}
        <span className="text-[10px] font-bold uppercase bg-neutral-950 border border-neutral-800 text-neutral-400 px-2.5 py-1.5 rounded-lg">
          {questaoAtual.tipo}
        </span>
      </div>

      {questaoAtual.textoApoio && (
        <div className="mb-8 p-5 bg-neutral-950 border-l-4 border-emerald-500/50 rounded-r-xl">
          <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap italic">
            {questaoAtual.textoApoio}
          </p>
        </div>
      )}

      <p className="text-lg sm:text-lg font-medium text-white leading-relaxed mb-8">
        {questaoAtual.enunciado}
      </p>

      <div className="flex flex-col gap-4">
        {questaoAtual.opcoes?.map((opcao: string, index: number) => {
          const isSelected = respostas[questaoAtual.sqId] === opcao;
          const isGabaritoCorreto =
            isConcluido && opcao === questaoAtual.itemCorreto;
          const isGabaritoErrado =
            isConcluido && isSelected && opcao !== questaoAtual.itemCorreto;

          const currentEliminated = eliminated[questaoAtual.sqId] || [];
          const currentMarked = marked[questaoAtual.sqId] || [];

          const isEliminated = currentEliminated.includes(opcao);
          const isMarked = currentMarked.includes(opcao);

          let cardClass =
            "border border-neutral-800 bg-neutral-950 text-neutral-300 border-l-[6px] border-l-transparent hover:border-l-neutral-700 hover:bg-neutral-900";

          if (isConcluido) {
            if (isGabaritoCorreto)
              cardClass =
                "border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 border-l-[6px] border-l-emerald-500";
            else if (isGabaritoErrado)
              cardClass =
                "border border-red-500/20 bg-red-500/5 text-red-300 border-l-[6px] border-l-red-500";
            else
              cardClass =
                "border border-neutral-800 bg-neutral-950/30 opacity-40 text-neutral-600 border-l-[6px] border-l-transparent";
          } else {
            if (isSelected)
              cardClass =
                "border border-white/80 bg-neutral-950 text-white border-l-[6px] border-l-white/80";
            else if (isEliminated)
              cardClass =
                "border border-neutral-800 bg-neutral-950/50 opacity-40 hover:opacity-60 text-neutral-500 border-l-[6px] border-l-red-900/50";
            else if (isMarked)
              cardClass =
                "border border-blue-900/50 bg-neutral-950 text-neutral-200 border-l-[6px] border-l-blue-500";
          }

          return (
            <div
              key={index}
              onClick={() => {
                if (!isConcluido) {
                  if (isSelected) {
                    // DESSELECIONAR: Se já estava selecionada, apaga a resposta.
                    setRespostas((prev: any) => {
                      const novasRespostas = { ...prev };
                      delete novasRespostas[questaoAtual.sqId];
                      return novasRespostas;
                    });
                  } else {
                    // SELECIONAR: Marca a opção como resposta principal
                    onSelectOption(opcao);

                    // Seletividade: Se o aluno marcou como resposta final,
                    // temos de ter a certeza que limpamos os ícones de dúvida/eliminado.
                    if (isEliminated) {
                      setEliminated((prev: any) => ({
                        ...prev,
                        [questaoAtual.sqId]: currentEliminated.filter(
                          (o: string) => o !== opcao,
                        ),
                      }));
                    }
                    if (isMarked) {
                      setMarked((prev: any) => ({
                        ...prev,
                        [questaoAtual.sqId]: currentMarked.filter(
                          (o: string) => o !== opcao,
                        ),
                      }));
                    }
                  }
                }
              }}
              className={`group relative flex items-center justify-between gap-4 py-3 px-5 sm:px-6 rounded-xl transition-all w-full cursor-pointer ${cardClass} ${isConcluido ? "cursor-default" : ""}`}
            >
              <span
                className={`text-[14.5px] leading-relaxed flex-1 py-1 ${isEliminated && !isSelected ? "line-through opacity-70 text-neutral-400" : ""}`}
              >
                {opcao}
              </span>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {!isConcluido && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:border-l sm:border-neutral-800 sm:pl-2">
                    {/* BOTÃO DÚVIDA (AZUL) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // IMPEDE QUE A DIV PAI (onSelectOption) SEJA CHAMADA
                        e.preventDefault();

                        // Se a opção principal já estiver selecionada, apagamo-la
                        // porque agora o aluno quer marcá-la apenas como dúvida.
                        if (isSelected) {
                          setRespostas((prev: any) => {
                            const novas = { ...prev };
                            delete novas[questaoAtual.sqId];
                            return novas;
                          });
                        }

                        onToggleMarked(questaoAtual.sqId, opcao);
                      }}
                      className={`rounded-lg p-2 transition-all ${isMarked ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30" : "text-neutral-500 hover:bg-neutral-800 hover:text-blue-400"}`}
                      title="Marcar como possível resposta"
                    >
                      <AlertCircle size={16} strokeWidth={isMarked ? 2.5 : 2} />
                    </button>

                    {/* BOTÃO ELIMINAR (VERMELHO) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // IMPEDE QUE A DIV PAI (onSelectOption) SEJA CHAMADA
                        e.preventDefault();

                        // Se a opção principal já estiver selecionada, apagamo-la
                        // porque agora o aluno decidiu eliminar esta opção.
                        if (isSelected) {
                          setRespostas((prev: any) => {
                            const novas = { ...prev };
                            delete novas[questaoAtual.sqId];
                            return novas;
                          });
                        }

                        onToggleEliminated(questaoAtual.sqId, opcao);
                      }}
                      className={`rounded-lg p-2 transition-all ${isEliminated ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "text-neutral-500 hover:bg-neutral-800 hover:text-red-400"}`}
                      title="Eliminar esta alternativa"
                    >
                      <XCircle size={16} strokeWidth={isEliminated ? 2.5 : 2} />
                    </button>
                  </div>
                )}
                {isConcluido && isGabaritoCorreto && (
                  <div className="p-1 rounded-full bg-emerald-500/20 ml-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
                {isConcluido && isGabaritoErrado && (
                  <div className="p-1 rounded-full bg-red-500/20 ml-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {questaoAtual.tipo === "Discursiva" && (
        <div className="mt-6">
          {!isConcluido ? (
            <textarea
              value={respostas[questaoAtual.sqId] || ""}
              onChange={(e) => onSelectOption(e.target.value)}
              placeholder="Digite a sua resposta discursiva..."
              className="w-full p-5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-48 placeholder:text-neutral-600"
            />
          ) : (
            <div className="space-y-4">
              <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl opacity-70">
                <p className="text-xs text-neutral-500 mb-2 font-bold uppercase tracking-wider">
                  Sua Resposta
                </p>
                <p className="text-sm text-neutral-300">
                  {respostas[questaoAtual.sqId] || "Deixada em branco."}
                </p>
              </div>
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-xs text-emerald-500 mb-2 font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Padrão Esperado
                  (Gabarito)
                </p>
                <p className="text-sm text-emerald-100">
                  {questaoAtual.itemCorreto}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NavigationButtons({
  currentIndex,
  totalCount,
  isConcluido,
  onPrev,
  onNext,
  onSkip,
}: any) {
  const isUltimaQuestao = currentIndex === totalCount - 1;
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-3.5 text-sm font-bold text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" /> Anterior
      </button>
      {!isConcluido && (
        <button
          onClick={onSkip}
          disabled={isUltimaQuestao}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-3.5 text-sm font-bold text-neutral-400 transition-all hover:text-white hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
        >
          <SkipForward className="h-4 w-4" /> Pular
        </button>
      )}
      <button
        onClick={onNext}
        disabled={isUltimaQuestao}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-3.5 text-sm font-bold text-white transition-all hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        Próxima <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function QuestionMap({
  questoes,
  respostas,
  currentIndex,
  isConcluido,
  onSelectQuestion,
  onClose, // <-- PROP RECEBIDA AQUI PARA FECHAR O MAPA
}: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-1">
          <BarChart3 className="w-4 h-4 text-neutral-400" />
          <h3 className="font-bold text-white">Mapa da Prova</h3>
        </div>
        {/* BOTÃO X AGORA COM A FUNÇÃO ONCLOSE */}
        <Button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-neutral-950 cursor-pointer border-neutral-800 border hover:bg-neutral-800"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </Button>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-6 gap-1">
        {questoes.map((q: any, idx: number) => {
          const estaRespondida = !!respostas[q.sqId];
          let btnClass =
            "bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-600";
          if (isConcluido)
            btnClass = q.isCorreta
              ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
              : "bg-red-500/20 text-red-500 border-red-500/30";
          else if (estaRespondida) btnClass = "bg-white/50 text-black";
          if (currentIndex === idx) btnClass += " ring-1 ring-neutral-400";
          return (
            <button
              key={q.sqId}
              onClick={() => onSelectQuestion(idx)}
              className={`aspect-square rounded-sm text-xs font-black border flex items-center justify-center transition-all ${btnClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-8 flex flex-col gap-3 text-xs font-bold text-neutral-500">
        {isConcluido ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />{" "}
              Acertos
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />{" "}
              Erros
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-white/70 border border-white" />{" "}
              Respondidas
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-neutral-950 border border-neutral-800" />{" "}
              Pendentes
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FinalizeButton({
  isSubmitting,
  allAnswered,
  remainingCount,
  onFinalizar,
}: any) {
  return (
    <div>
      <button
        onClick={onFinalizar}
        disabled={isSubmitting || !allAnswered}
        className={`w-full rounded-2xl p-3 mb-1 text-sm md:text-base font-extrabold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${allAnswered ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/30 hover:shadow-emerald-900/50 active:scale-[0.99]" : "bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed shadow-none"}`}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCheck className="h-4 w-4" />
        )}
        {isSubmitting ? "Corrigindo prova..." : "Finalizar Prova"}
      </button>
      <p className="text-center text-xs text-neutral-500 mt-2">
        ({remainingCount} questões restante{remainingCount !== 1 ? "s" : ""})
      </p>
    </div>
  );
}
