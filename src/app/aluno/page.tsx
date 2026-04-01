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
} from "lucide-react";
import Link from "next/link";

export default function AlunoDashboardPage() {
  const { data, isPending } = useSession();
  const user = data?.user;
  if (isPending) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8 animate-in fade-in duration-500 ">
      {/* CABEÇALHO DE BOAS-VINDAS */}
      <div className="bg-linear-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-lg shadow-green-900/20 relative overflow-hidden">
        {/* Efeito de brilho de fundo */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/10">
          <Sparkles className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Olá, {user?.name?.split(" ")[0] || "Estudante"}! 👋
          </h1>
          <p className="text-green-100 max-w-xl text-lg">
            Pronto para dar mais um passo rumo à sua aprovação? O seu próximo
            simulado está à sua espera.
          </p>

          <div className="mt-8">
            <Link
              href="/aluno/simulados/novo"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-lg hover:bg-green-50 hover:scale-105 transition-all shadow-md"
            >
              <PlayCircle className="w-5 h-5" />
              Começar Novo Simulado
            </Link>
          </div>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS (Mocados por enquanto) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Simulados Concluídos
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">12</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              +2 nesta semana
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Questões Resolvidas
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">348</h3>
            <p className="text-xs text-green-600 font-medium mt-1">
              Top 15% dos alunos
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Taxa de Acerto Geral
            </p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">78%</h3>
            <p className="text-xs text-purple-600 font-medium mt-1">
              Rumo aos 85%!
            </p>
          </div>
        </div>
      </div>

      {/* SESSÃO DE ATIVIDADE RECENTE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Últimos Simulados</h2>
          <Link
            href="/aluno/simulados"
            className="text-sm font-semibold text-green-600 hover:text-green-800 flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <p className="font-medium text-gray-800 mb-1">
            Nenhum simulado feito ainda
          </p>
          <p className="text-sm max-w-sm">
            O seu histórico de simulados aparecerá aqui. Que tal testar os seus
            conhecimentos agora mesmo?
          </p>
        </div>
      </div>
    </div>
  );
}
