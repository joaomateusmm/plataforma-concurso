/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  SkipForward,
  Zap,
  CheckCheck,
  Target,
  BarChart3,
  Award,
  AlertCircle, // <-- Ícone importado aqui!
} from "lucide-react";
import { finalizarSimulado } from "../../../../actions/simulados";

interface ProvaClientProps {
  simulado: any;
  questoes: any[];
}

export default function ProvaClient({ simulado, questoes }: ProvaClientProps) {
  const router = useRouter();
  const isConcluido = simulado.status === "Concluido";

  // ==========================================
  // ESTADOS E LÓGICA DE NEGÓCIO
  // ==========================================
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [respostas, setRespostas] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    if (isConcluido) {
      questoes.forEach((q) => {
        if (q.respostaUsuario) initial[q.sqId] = q.respostaUsuario;
      });
    }
    return initial;
  });

  // Novos Estados para guardar as marcações e eliminações
  const [eliminated, setEliminated] = useState<Record<number, string[]>>({});
  const [marked, setMarked] = useState<Record<number, string[]>>({});

  const questaoAtual = questoes[currentIndex];

  // Estatísticas
  const totalCount = questoes.length;
  const answeredCount = Object.keys(respostas).length;
  const remainingCount = totalCount - answeredCount;
  const allAnswered = answeredCount === totalCount;
  const progressPercentage = (answeredCount / totalCount) * 100;

  // Funções de Ação
  const handleSelectOption = (opcao: string) => {
    if (isConcluido) return;
    setRespostas((prev) => ({ ...prev, [questaoAtual.sqId]: opcao }));
  };

  const handleToggleEliminated = (sqId: number, opcao: string) => {
    setEliminated((prev) => {
      const current = prev[sqId] || [];
      return {
        ...prev,
        [sqId]: current.includes(opcao)
          ? current.filter((o) => o !== opcao)
          : [...current, opcao],
      };
    });
  };

  const handleToggleMarked = (sqId: number, opcao: string) => {
    setMarked((prev) => {
      const current = prev[sqId] || [];
      return {
        ...prev,
        [sqId]: current.includes(opcao)
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
      router.refresh();
    }
  };

  // ==========================================
  // RENDERIZAÇÃO LIMPA E COMPONENTIZADA
  // ==========================================
  return (
    <div className="min-h-screen text-neutral-300 font-sans pb-24">
      <ProvaHeader
        titulo={simulado.titulo}
        isConcluido={isConcluido}
        answeredCount={answeredCount}
        totalCount={totalCount}
        progressPercentage={progressPercentage}
        onBack={() => router.push("/aluno/simulados")}
        onAutoTest={autoCompleteForTesting}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* COLUNA ESQUERDA: Questões */}
        <div className="flex-1 w-full max-w-full">
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

        {/* COLUNA DIREITA: Mapa e Botão Finalizar */}
        <aside className="w-full lg:w-72 shrink-0">
          <QuestionMap
            questoes={questoes}
            respostas={respostas}
            currentIndex={currentIndex}
            isConcluido={isConcluido}
            onSelectQuestion={setCurrentIndex}
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
}: any) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 rounded-t-2xl bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">
              {titulo}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isConcluido && (
              <button
                onClick={onAutoTest}
                title="Auto Completar para Testes"
                className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-xs font-bold text-amber-500 hover:bg-amber-500/20 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Auto Teste</span>
              </button>
            )}
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${isConcluido ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-neutral-800 text-neutral-300 border-neutral-700"}`}
            >
              {isConcluido ? "Gabarito" : "Modo Campanha"}
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
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
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
}: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Metadados */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-neutral-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-sm font-bold text-white">
          {currentIndex + 1}
        </div>
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
        <span className="text-[10px] font-bold uppercase border border-neutral-700 text-neutral-500 px-2.5 py-1.5 rounded-lg ml-auto">
          {questaoAtual.tipo}
        </span>
      </div>

      {/* Texto de Apoio */}
      {questaoAtual.textoApoio && (
        <div className="mb-8 p-5 bg-neutral-950 border-l-4 border-emerald-500/50 rounded-r-xl">
          <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap italic">
            {questaoAtual.textoApoio}
          </p>
        </div>
      )}

      {/* Enunciado Principal */}
      <p className="text-lg sm:text-xl font-medium text-white leading-relaxed mb-8">
        {questaoAtual.enunciado}
      </p>

      {/* Alternativas Objetivas/Certo-Errado */}
      <div className="flex flex-col gap-4">
        {questaoAtual.opcoes?.map((opcao: string, index: number) => {
          const isSelected = respostas[questaoAtual.sqId] === opcao;
          const isGabaritoCorreto =
            isConcluido && opcao === questaoAtual.itemCorreto;
          const isGabaritoErrado =
            isConcluido && isSelected && opcao !== questaoAtual.itemCorreto;

          const isEliminated = eliminated[questaoAtual.sqId]?.includes(opcao);
          const isMarked = marked[questaoAtual.sqId]?.includes(opcao);

          // Estilo base: Borda esquerda transparente para não "pular" quando selecionada
          let cardClass =
            "border border-neutral-800 bg-neutral-950 text-neutral-300 border-l-[6px] border-l-transparent hover:border-l-neutral-700 hover:bg-neutral-900";

          if (isConcluido) {
            if (isGabaritoCorreto) {
              cardClass =
                "border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 border-l-[6px] border-l-emerald-500";
            } else if (isGabaritoErrado) {
              cardClass =
                "border border-red-500/20 bg-red-500/5 text-red-300 border-l-[6px] border-l-red-500";
            } else {
              cardClass =
                "border border-neutral-800 bg-neutral-950/30 opacity-40 text-neutral-600 border-l-[6px] border-l-transparent";
            }
          } else {
            if (isSelected) {
              cardClass =
                "border border-emerald-900/50 bg-neutral-950 text-white border-l-[6px] border-l-emerald-500 shadow-[0_4px_10px_rgba(16,185,129,0.05)]";
            } else if (isEliminated) {
              cardClass =
                "border border-neutral-800 bg-neutral-950/50 opacity-40 hover:opacity-60 text-neutral-500 border-l-[6px] border-l-red-900/50";
            } else if (isMarked) {
              cardClass =
                "border border-blue-900/50 bg-neutral-950 text-neutral-200 border-l-[6px] border-l-blue-500";
            }
          }

          return (
            <div
              key={index}
              onClick={() => {
                if (!isConcluido) onSelectOption(opcao);
              }}
              className={`group relative flex items-center justify-between gap-4 py-4 px-5 sm:px-6 rounded-xl transition-all w-full cursor-pointer ${cardClass} ${isConcluido ? "cursor-default" : ""}`}
            >
              {/* Texto com classe condicional para "riscar" (line-through) */}
              <span
                className={`text-[14.5px] leading-relaxed flex-1 py-1 ${isEliminated && !isSelected ? "line-through opacity-70 text-neural-400" : ""}`}
              >
                {opcao}
              </span>

              {/* Botões de Ação Lateral (Marcar/Eliminar) - Alinhamento Vertical Perfeito */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {!isConcluido && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:border-l sm:border-neutral-800 sm:pl-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMarked(questaoAtual.sqId, opcao);
                      }}
                      className={`rounded-lg p-2 transition-all ${
                        isMarked
                          ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                          : "text-neutral-500 hover:bg-neutral-800 hover:text-blue-400"
                      }`}
                      title="Marcar como possível resposta"
                    >
                      <AlertCircle size={16} strokeWidth={isMarked ? 2.5 : 2} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEliminated(questaoAtual.sqId, opcao);
                      }}
                      className={`rounded-lg p-2 transition-all ${
                        isEliminated
                          ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                          : "text-neutral-500 hover:bg-neutral-800 hover:text-red-400"
                      }`}
                      title="Eliminar esta alternativa"
                    >
                      <XCircle size={16} strokeWidth={isEliminated ? 2.5 : 2} />
                    </button>
                  </div>
                )}

                {/* Ícones de Certo/Errado no Gabarito */}
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

      {/* Questões Discursivas */}
      {questaoAtual.tipo === "Discursiva" && (
        <div className="mt-6">
          {!isConcluido ? (
            <textarea
              value={respostas[questaoAtual.sqId] || ""}
              onChange={(e) =>
                setRespostas((prev: any) => ({
                  ...prev,
                  [questaoAtual.sqId]: e.target.value,
                }))
              }
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
}: any) {
  return (
    <div className="lg:sticky lg:top-28 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-neutral-800">
        <BarChart3 className="w-5 h-5 text-neutral-400" />
        <h3 className="font-bold text-white">Mapa da Prova</h3>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2.5">
        {questoes.map((q: any, idx: number) => {
          const estaRespondida = !!respostas[q.sqId];
          let btnClass =
            "bg-neutral-950 text-neutral-500 border-neutral-800 hover:border-neutral-600";

          if (isConcluido) {
            const acertou = q.isCorreta;
            btnClass = acertou
              ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
              : "bg-red-500/20 text-red-500 border-red-500/30";
          } else if (estaRespondida) {
            btnClass =
              "bg-emerald-600/20 text-emerald-400 border-emerald-500/30";
          }

          if (currentIndex === idx) {
            btnClass +=
              " ring-2 ring-white ring-offset-2 ring-offset-neutral-900";
          }

          return (
            <button
              key={q.sqId}
              onClick={() => onSelectQuestion(idx)}
              className={`aspect-square rounded-xl text-xs font-black border flex items-center justify-center transition-all ${btnClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legenda do Mapa */}
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
              <div className="w-3 h-3 rounded bg-emerald-600/20 border border-emerald-500/30" />{" "}
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
    <div className="mt-4">
      <button
        onClick={onFinalizar}
        disabled={isSubmitting || !allAnswered}
        className={`w-full rounded-2xl p-3 mb-1 text-sm md:text-base font-extrabold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
          allAnswered
            ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/30 hover:shadow-emerald-900/50 active:scale-[0.99]"
            : "bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed shadow-none"
        }`}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCheck className="h-4 w-4" />
        )}
        {isSubmitting
          ? "Corrigindo prova..."
          : allAnswered
            ? "Finalizar Prova"
            : "Finalizar Prova"}
      </button>
      <p className="text-center text-xs text-neutral-500 mt-2">
        ({remainingCount} questões restante{remainingCount !== 1 ? "s" : ""})
      </p>
    </div>
  );
}
