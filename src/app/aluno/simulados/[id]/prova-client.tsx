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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { finalizarSimulado } from "../../../../actions/simulados";

interface ProvaClientProps {
  simulado: any;
  questoes: any[];
}

export default function ProvaClient({ simulado, questoes }: ProvaClientProps) {
  const router = useRouter();
  const isConcluido = simulado.status === "Concluido";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado que guarda as respostas do aluno: { id_da_relacao: "resposta escolhida" }
  const [respostas, setRespostas] = useState<Record<number, string>>(() => {
    // Se já estiver concluído, carrega as respostas que vieram do banco
    const initial: Record<number, string> = {};
    if (isConcluido) {
      questoes.forEach((q) => {
        if (q.respostaUsuario) initial[q.sqId] = q.respostaUsuario;
      });
    }
    return initial;
  });

  const questaoAtual = questoes[currentIndex];
  const isUltimaQuestao = currentIndex === questoes.length - 1;

  // Função para marcar a opção
  const handleSelectOption = (opcao: string) => {
    if (isConcluido) return; // Bloqueia se a prova já acabou
    setRespostas((prev) => ({ ...prev, [questaoAtual.sqId]: opcao }));
  };

  // Função para enviar tudo pro banco
  const handleFinalizar = async () => {
    // Verifica se respondeu tudo (Opcional, mas recomendado)
    const respondidas = Object.keys(respostas).length;
    if (respondidas < questoes.length) {
      const confirmar = confirm(
        `Você respondeu apenas ${respondidas} de ${questoes.length} questões. Deseja finalizar mesmo assim?`,
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
      router.refresh(); // Recarrega a página para o servidor mandar o status "Concluido"
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* CABEÇALHO DO SIMULADO */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white">{simulado.titulo}</h1>
          <div className="flex gap-3 mt-2 text-sm">
            <span
              className={`px-2.5 py-1 rounded-md font-bold ${isConcluido ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}
            >
              {isConcluido ? "Simulado Concluído" : "Em Andamento"}
            </span>
            {isConcluido && (
              <span className="px-2.5 py-1 rounded-md font-bold bg-neutral-800 text-neutral-300">
                Acertos: {simulado.acertos} / {simulado.quantidadeQuestoes}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-neutral-400 mb-1">Progresso</p>
          <p className="text-xl font-extrabold text-emerald-500">
            {currentIndex + 1}{" "}
            <span className="text-neutral-500 text-base">
              / {questoes.length}
            </span>
          </p>
        </div>
      </div>

      {/* ÁREA DA QUESTÃO */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-sm relative">
        {/* Metadados da Questão (Banca / Matéria) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questaoAtual.bancaNome && (
            <span className="text-[10px] font-bold uppercase bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
              {questaoAtual.bancaNome}
            </span>
          )}
          {questaoAtual.materiaNome && (
            <span className="text-[10px] font-bold uppercase bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
              {questaoAtual.materiaNome}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase border border-neutral-700 text-neutral-500 px-2 py-1 rounded">
            {questaoAtual.tipo}
          </span>
        </div>

        {/* Texto de Apoio (Se existir) */}
        {questaoAtual.textoApoio && (
          <div className="mb-6 p-5 bg-neutral-950/50 border border-neutral-800/50 rounded-xl">
            <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap italic">
              {questaoAtual.textoApoio}
            </p>
          </div>
        )}

        {/* Enunciado Principal */}
        <p className="text-lg font-medium text-neutral-200 leading-relaxed mb-8">
          {questaoAtual.enunciado}
        </p>

        {/* ALTERNATIVAS */}
        <div className="flex flex-col gap-3">
          {questaoAtual.opcoes?.map((opcao: string, index: number) => {
            const isSelected = respostas[questaoAtual.sqId] === opcao;
            const isGabaritoCorreto =
              isConcluido && opcao === questaoAtual.itemCorreto;
            const isGabaritoErrado =
              isConcluido && isSelected && opcao !== questaoAtual.itemCorreto;

            // Lógica de cores baseada no status (Concluido vs Em Andamento)
            let cardClass =
              "border-neutral-800 bg-neutral-950/30 hover:bg-neutral-800 text-neutral-300";
            let radioClass = "border-neutral-600";

            if (isConcluido) {
              if (isGabaritoCorreto) {
                cardClass =
                  "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
                radioClass = "border-emerald-500 bg-emerald-500";
              } else if (isGabaritoErrado) {
                cardClass = "border-red-500/50 bg-red-500/10 text-red-300";
                radioClass = "border-red-500 bg-red-500";
              } else {
                cardClass =
                  "border-neutral-800 bg-neutral-950/30 opacity-50 text-neutral-500";
              }
            } else if (isSelected) {
              cardClass =
                "border-emerald-500 bg-emerald-500/5 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
              radioClass =
                "border-emerald-500 bg-emerald-500 ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-neutral-900";
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(opcao)}
                disabled={isConcluido}
                className={`flex items-start gap-4 p-5 rounded-xl border transition-all text-left w-full cursor-pointer ${cardClass} ${isConcluido ? "cursor-default" : ""}`}
              >
                {/* O Bolinha do Radio Button */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${radioClass}`}
                >
                  {isSelected && !isConcluido && (
                    <div className="w-full h-full rounded-full bg-emerald-500 border-2 border-neutral-900" />
                  )}
                </div>

                <span className="text-[15px] leading-relaxed">{opcao}</span>

                {/* Ícones de Certo/Errado no Gabarito */}
                {isConcluido && isGabaritoCorreto && (
                  <CheckCircle2 className="w-5 h-5 ml-auto text-emerald-500 shrink-0" />
                )}
                {isConcluido && isGabaritoErrado && (
                  <XCircle className="w-5 h-5 ml-auto text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK CASO SEJA DISCURSIVA (Isso exige correção manual no futuro, então só mostramos o gabarito no final) */}
        {questaoAtual.tipo === "Discursiva" && (
          <div className="mt-4">
            {!isConcluido ? (
              <textarea
                value={respostas[questaoAtual.sqId] || ""}
                onChange={(e) =>
                  setRespostas((prev) => ({
                    ...prev,
                    [questaoAtual.sqId]: e.target.value,
                  }))
                }
                placeholder="Digite sua resposta discursiva aqui..."
                className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300 focus:outline-none focus:border-emerald-500 resize-none h-48"
              />
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl opacity-70">
                  <p className="text-xs text-neutral-500 mb-2 font-bold uppercase">
                    Sua Resposta:
                  </p>
                  <p className="text-sm text-neutral-300">
                    {respostas[questaoAtual.sqId] || "Sem resposta."}
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-emerald-500 mb-2 font-bold uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Padrão Esperado
                    (Gabarito):
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

      {/* NAVEGAÇÃO E CONTROLES BOTOES */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-sm">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className=" gap-1.5 hidden md:flex">
          {questoes.map((q, idx) => {
            const estaRespondida = !!respostas[q.sqId];
            let btnClass =
              "bg-neutral-800 text-neutral-500 hover:bg-neutral-700 border-transparent";

            if (isConcluido) {
              const acertou = q.isCorreta;
              btnClass = acertou
                ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                : "bg-red-500/20 text-red-500 border-red-500/30";
            } else if (estaRespondida) {
              btnClass =
                "bg-emerald-600/20 text-emerald-500 border-emerald-500/50";
            }
            if (currentIndex === idx) {
              btnClass +=
                " ring-2 ring-white ring-offset-2 ring-offset-neutral-900";
            }

            return (
              <button
                key={q.sqId}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-md text-xs font-bold border flex items-center justify-center transition-all ${btnClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {!isUltimaQuestao ? (
          <button
            onClick={() =>
              setCurrentIndex((prev) => Math.min(questoes.length - 1, prev + 1))
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            Próxima <ChevronRight className="w-4 h-4" />
          </button>
        ) : !isConcluido ? (
          <button
            onClick={handleFinalizar}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {isSubmitting ? "Finalizando..." : "Finalizar Simulado"}
          </button>
        ) : (
          <button
            onClick={() => router.push("/aluno")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            Voltar ao Painel
          </button>
        )}
      </div>
    </div>
  );
}
