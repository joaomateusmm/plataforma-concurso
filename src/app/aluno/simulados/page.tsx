/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  obterMeusSimulados,
  deletarSimulado,
} from "../../../actions/simulados";
import { toast } from "sonner";
import {
  Trash2,
  Play,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  FileQuestion,
  NotebookPen,
} from "lucide-react";

// Importações do Shadcn Alert Dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MeusSimuladosPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [simulados, setSimulados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [simuladoToDelete, setSimuladoToDelete] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSimulados() {
      try {
        if (session?.user?.id) {
          const res = await obterMeusSimulados(session.user.id);
          if (isMounted) {
            if (res.success && res.simulados) {
              setSimulados(res.simulados);
            } else {
              toast.error("Ops!", { description: res.error });
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        if (isMounted) {
          toast.error("Erro", { description: "Falha ao buscar simulados." });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!sessionPending) {
      if (session?.user) {
        fetchSimulados();
      } else {
        setIsLoading(false); // Usuário deslogado, para de carregar imediatamente
      }
    }

    return () => {
      isMounted = false; // Cleanup para evitar memory leaks
    };
  }, [session, sessionPending]);

  const confirmarDelecao = async () => {
    if (!simuladoToDelete) return;

    const id = simuladoToDelete;
    setSimuladoToDelete(null); // Fecha o modal imediatamente
    setDeletingId(id); // Ativa o spinner de loading no botão do card

    const res = await deletarSimulado(id);

    if (res.success) {
      toast.success("Excluído!", {
        description: "O simulado foi apagado com sucesso.",
      });
      // Remove o simulado da lista na tela sem precisar recarregar a página
      setSimulados((prev) => prev.filter((sim) => sim.id !== id));
    } else {
      toast.error("Erro", { description: res.error });
    }
    setDeletingId(null); // Desativa o spinner
  };

  // Funções para formatar os dados visuais
  const formatarData = (dataStr: string) => {
    if (!dataStr) return "";
    return new Date(dataStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularPorcentagem = (acertos: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((acertos / total) * 100);
  };

  if (sessionPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#009966] dark:text-emerald-500 transition-colors duration-300" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Target className="w-16 h-16 text-gray-400 dark:text-neutral-700 transition-colors duration-300" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Acesso Restrito
        </h2>
        <p className="text-gray-500 dark:text-neutral-400 transition-colors duration-300">
          Faça login para ver e gerir os seus simulados.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-[#009966] hover:bg-[#007a52] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors duration-300"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8 mt-6 mb-12 animate-in fade-in duration-500">
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2 transition-colors duration-300">
              <NotebookPen className="w-8 h-8 text-[#009966] dark:text-emerald-500 transition-colors duration-300" />
              Meus Simulados
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 transition-colors duration-300">
              Acompanhe o seu desempenho, continue de onde parou ou crie novos
              testes.
            </p>
          </div>

          <Link
            href="/aluno/simulados/novo"
            className="flex items-center justify-center gap-2 bg-[#009966] hover:bg-[#007a52] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(0,153,102,0.2)] dark:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300"
          >
            <Play className="w-4 h-4 fill-current" />
            Novo Simulado
          </Link>
        </div>

        <div className="border-t mt-7 mb-9 border-gray-200 dark:border-neutral-800 transition-colors duration-300"></div>

        {/* LISTAGEM DE SIMULADOS */}
        {simulados.length === 0 ? (
          <div className="rounded-3xl mt-32 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
              <FileQuestion className="w-10 h-10 text-gray-400 dark:text-neutral-600 transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 dark:text-white/40 mb-2 transition-colors duration-300">
              Nenhum simulado criado
            </h3>
            <p className="text-gray-500 dark:text-white/30 max-w-md mb-8 transition-colors duration-300">
              Você ainda não gerou nenhuma prova. Clique no botão abaixo para
              personalizar o seu primeiro simulado e começar a treinar!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {simulados.map((simulado) => {
              const isConcluido = simulado.status === "Concluido";
              const porcentagem = isConcluido
                ? calcularPorcentagem(
                    simulado.acertos,
                    simulado.quantidadeQuestoes,
                  )
                : 0;

              return (
                <div
                  key={simulado.id}
                  className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-hidden hover:border-gray-300 dark:hover:border-neutral-700 transition-colors duration-300 group relative shadow-sm"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Status Badge */}
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-colors duration-300 ${
                          isConcluido
                            ? "bg-[#009966]/10 text-[#009966] border-[#009966]/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-neutral-400/10 text-neutral-500 shadow-sm dark:text-neutral-400 border-neutral-500/10 dark:border-neutral-500/20"
                        }`}
                      >
                        {isConcluido ? "Concluído" : "Em Andamento"}
                      </span>

                      <button
                        // Em vez de deletar direto, abrimos o Modal setando o ID!
                        onClick={() => setSimuladoToDelete(simulado.id)}
                        disabled={deletingId === simulado.id}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 border-gray-200 dark:text-neutral-500 dark:hover:text-red-400 dark:hover:bg-red-400/10 p-2 border dark:border-neutral-800 cursor-pointer rounded-lg transition-colors duration-300 disabled:opacity-50"
                        title="Excluir Simulado"
                      >
                        {deletingId === simulado.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Título e Data */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-[#009966] dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {simulado.titulo}
                    </h3>
                    <div className="flex items-center gap-2 font-medium text-xs text-gray-500 dark:text-neutral-500 mb-6 transition-colors duration-300">
                      <Clock className="w-3.5 h-3.5" />
                      {formatarData(simulado.criadoEm)}
                    </div>

                    {/* Estatísticas */}
                    <div className="mt-auto grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-neutral-950/50 rounded-xl border border-gray-200 dark:border-neutral-800/50 transition-colors duration-300">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
                          Questões
                        </span>
                        <span className="text-lg font-extrabold text-gray-900 dark:text-neutral-200 transition-colors duration-300">
                          {simulado.quantidadeQuestoes}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
                          {isConcluido ? "Acertos" : "Progresso"}
                        </span>
                        {isConcluido ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-extrabold text-[#009966] dark:text-emerald-500 transition-colors duration-300">
                              {simulado.acertos}
                            </span>
                            <span className="text-sm font-medium text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                              ({porcentagem}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-400 dark:text-neutral-300 mt-0.5 flex items-center gap-1.5 transition-colors duration-300">
                            Pendente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Ação Inferior */}
                  <button
                    onClick={() =>
                      router.push(`/aluno/simulados/${simulado.id}`)
                    }
                    className={`w-full py-4 text-sm font-bold flex items-center cursor-pointer justify-center gap-2 duration-300 border-t transition-colors ${
                      isConcluido
                        ? "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                        : "bg-[#009966]/10 border-[#009966]/20 text-[#009966] hover:bg-[#009966]/20 hover:text-[#007a52] dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-500 dark:hover:bg-emerald-800 dark:hover:text-emerald-300"
                    }`}
                  >
                    {isConcluido ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Ver Gabarito
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" /> Continuar
                        Simulado
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!simuladoToDelete}
        onOpenChange={(open) => !open && setSimuladoToDelete(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-2xl transition-colors duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Excluir Simulado?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-neutral-400 mt-2 transition-colors duration-300">
              Tem a certeza que deseja excluir este simulado permanentemente?
              Todo o seu progresso, acertos e histórico serão apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 gap-3 border-gray-200 dark:border-neutral-700 border-t transition-colors duration-300">
            <AlertDialogCancel className="bg-transparent border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelecao}
              className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-500 transition-colors duration-300 shadow-lg shadow-red-600/20 dark:shadow-red-900/20 border-none"
            >
              Sim, excluir simulado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
