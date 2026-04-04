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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-8 h-8 text-emerald-500" />
            Painel do Aluno
          </h1>
          <p className="text-neutral-400">
            Tenha uma visão geral do seu desempenho e progresso nos estudos.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      <div className="bg-neutral-900 border mt-10 border-neutral-800 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="absolute top-[-20%] right-[-5%] text-emerald-500/5 rotate-12 pointer-events-none hidden md:block">
          <Sparkles className="w-96 h-96" />
        </div>

        <div className="relative z-10 flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white tracking-tight">
            Olá, {user?.name?.split(" ")[0] || "Estudante"}!
          </h1>
          <p className="text-neutral-400 max-w-xl text-lg mb-8">
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
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm flex items-start gap-4 hover:border-neutral-700 transition-colors group">
          <div className="p-3 bg-neutral-950 border border-neutral-800 text-emerald-500 rounded-xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Simulados Concluídos
            </p>
            <h3 className="text-2xl font-extrabold text-white">12</h3>
            <p className="text-xs font-medium text-emerald-400 mt-1">
              +2 nesta semana
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm flex items-start gap-4 hover:border-neutral-700 transition-colors group">
          <div className="p-3 bg-neutral-950 border border-neutral-800 text-blue-500 rounded-xl group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Questões Resolvidas
            </p>
            <h3 className="text-2xl font-extrabold text-white">348</h3>
            <p className="text-xs font-medium text-blue-400 mt-1">
              Top 15% dos alunos
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm flex items-start gap-4 hover:border-neutral-700 transition-colors group">
          <div className="p-3 bg-neutral-950 border border-neutral-800 text-purple-500 rounded-xl group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-colors">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Taxa de Acerto
            </p>
            <h3 className="text-2xl font-extrabold text-white">78%</h3>
            <p className="text-xs font-medium text-purple-400 mt-1">
              Rumo aos 85%!
            </p>
          </div>
        </div>
      </div>

      {/* SESSÃO DE ATIVIDADE RECENTE */}
      <div className="bg-neutral-900 rounded-3xl border border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-neutral-400" />
            <h2 className="text-lg font-bold text-white">Últimos Simulados</h2>
          </div>
          <Link
            href="/aluno/simulados"
            className="text-sm font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-16 text-center flex flex-col items-center justify-center bg-neutral-900/50">
          <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-600 shadow-inner">
            <Trophy className="w-7 h-7" />
          </div>
          <p className="text-lg font-bold text-neutral-300 mb-1">
            Nenhum simulado feito ainda
          </p>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-6">
            O seu histórico de simulados aparecerá aqui. Que tal testar os seus
            conhecimentos agora mesmo?
          </p>
          <Link
            href="/aluno/simulados/novo"
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Fazer um teste rápido
          </Link>
        </div>
      </div>
    </div>
  );
}
