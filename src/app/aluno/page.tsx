// src/app/aluno/page.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import {
  Trophy,
  Target,
  BookOpen,
  PlayCircle,
  ArrowRight,
  Sparkles,
  BrainCircuit,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

export default function AlunoDashboardPage() {
  const { data, isPending } = useSession();
  const user = data?.user;

  if (isPending) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 mb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2 transition-colors duration-300">
            <LayoutDashboard className="w-8 h-8 text-emerald-500" />
            Painel do Aluno
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 transition-colors duration-300">
            Tenha uma visão geral do seu desempenho e progresso nos estudos.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-gray-200 dark:border-neutral-800 transition-colors duration-300"></div>

      <div className="bg-white dark:bg-neutral-900 border mt-10 border-gray-200 dark:border-neutral-800 rounded-3xl p-8 md:p-10 text-gray-900 dark:text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="absolute top-[-20%] right-[-5%] text-emerald-500/5 rotate-12 pointer-events-none hidden md:block">
          <Sparkles className="w-96 h-96" />
        </div>

        <div className="relative z-10 flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
            Olá, {user?.name?.split(" ")[0] || "Estudante"}!
          </h1>
          <p className="text-gray-600 dark:text-neutral-400 max-w-xl text-lg mb-8 transition-colors duration-300">
            Pronto para dar mais um passo rumo à sua aprovação? O seu próximo
            simulado está à sua espera.
          </p>

          <Link
            href="/aluno/simulados/novo"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
          >
            <PlayCircle className="w-5 h-5 fill-current" />
            Começar Novo Simulado
          </Link>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS (Mocados por enquanto) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-start gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors duration-300 group">
          <div className="p-3 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 text-emerald-500 rounded-xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors duration-300">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-500 mb-1 transition-colors duration-300">
              Simulados Concluídos
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
              12
            </h3>
            <p className="text-xs font-medium text-emerald-500 dark:text-emerald-400 mt-1 transition-colors duration-300">
              +2 nesta semana
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-start gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors duration-300 group">
          <div className="p-3 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 text-blue-500 rounded-xl group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors duration-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-500 mb-1 transition-colors duration-300">
              Questões Resolvidas
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
              348
            </h3>
            <p className="text-xs font-medium text-blue-500 dark:text-blue-400 mt-1 transition-colors duration-300">
              Top 15% dos alunos
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex items-start gap-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors duration-300 group">
          <div className="p-3 bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 text-purple-500 rounded-xl group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-colors duration-300">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-500 mb-1 transition-colors duration-300">
              Taxa de Acerto
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
              78%
            </h3>
            <p className="text-xs font-medium text-purple-500 dark:text-purple-400 mt-1 transition-colors duration-300">
              Rumo aos 85%!
            </p>
          </div>
        </div>
      </div>

      {/* SESSÃO DE ATIVIDADE RECENTE */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-gray-500 dark:text-neutral-400 transition-colors duration-300" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Últimos Simulados
            </h2>
          </div>
          <Link
            href="/aluno/simulados"
            className="text-sm font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-300"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-16 text-center flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-900/50 transition-colors duration-300">
          <div className="w-16 h-16 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-neutral-600 shadow-inner transition-colors duration-300">
            <Trophy className="w-7 h-7" />
          </div>
          <p className="text-lg font-bold text-gray-800 dark:text-neutral-300 mb-1 transition-colors duration-300">
            Nenhum simulado feito ainda
          </p>
          <p className="text-sm text-gray-500 dark:text-neutral-500 max-w-sm mx-auto mb-6 transition-colors duration-300">
            O seu histórico de simulados aparecerá aqui. Que tal testar os seus
            conhecimentos agora mesmo?
          </p>
          <Link
            href="/aluno/simulados/novo"
            className="px-6 py-2.5 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-lg text-sm font-bold transition-colors duration-300"
          >
            Fazer um teste rápido
          </Link>
        </div>
      </div>
    </div>
  );
}
