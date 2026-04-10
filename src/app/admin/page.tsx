// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { count } from "drizzle-orm";
import Link from "next/link";
import {
  BookOpen,
  Database,
  FileText,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Target,
  Trophy,
} from "lucide-react";

import {
  questoes,
  concursos,
  editais,
  bancas,
  materias,
  assuntos,
} from "@/db/schema";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/aluno");
  }
  const [
    [qtdQuestoes],
    [qtdConcursos],
    [qtdEditais],
    [qtdBancas],
    [qtdMaterias],
    [qtdAssuntos],
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(questoes)
      .catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(concursos)
      .catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(editais)
      .catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(bancas)
      .catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(materias)
      .catch(() => [{ value: 0 }]),
    db
      .select({ value: count() })
      .from(assuntos)
      .catch(() => [{ value: 0 }]),
  ]);

  const primeiroNome = session.user.name?.split(" ")[0] || "Administrador";

  return (
    <div className="max-w-full mx-12 space-y-10 mb-12 animate-in fade-in duration-500">
      {/* HEADER CARD */}
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3 transition-colors duration-300">
            <LayoutDashboard className="w-4 h-4" /> Visão Geral
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Olá, {primeiroNome}! 👋
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 max-w-2xl transition-colors duration-300">
            Bem-vindo ao seu centro de comando. Aqui você tem uma visão completa
            da base de conhecimento que alimenta a plataforma dos seus alunos.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900 dark:text-neutral-200 transition-colors duration-300">
              {session.user.name}
            </p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
              Nível: Admin
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-500 dark:border-emerald-500/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-lg shadow-sm transition-colors duration-300">
            {primeiroNome.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 flex items-center gap-5 hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all duration-300 group">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
              Questões no Banco
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
              {qtdQuestoes.value}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 flex items-center gap-5 hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all duration-300 group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <Trophy className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
              Concursos Ativos
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
              {qtdConcursos.value}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 flex items-center gap-5 hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all duration-300 group">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-500/20 group-hover:scale-105 transition-transform duration-300">
            <FileText className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
              Editais Mapeados
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
              {qtdEditais.value}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 flex items-center gap-5 hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all duration-300 group">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <Layers className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
              Bancas Registradas
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
              {qtdBancas.value}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 flex items-center gap-5 hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all duration-300 group">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-500/20 group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
              Matérias
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
              {qtdMaterias.value}
            </p>
          </div>
        </div>

        {/* Card 6: Assuntos */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 flex items-center gap-5 hover:shadow-md dark:hover:shadow-neutral-900/50 transition-all duration-300 group">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <Target className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider transition-colors duration-300">
              Tópicos/Assuntos
            </p>
            <p className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
              {qtdAssuntos.value}
            </p>
          </div>
        </div>
      </div>

      {/* ACESSO RÁPIDO */}
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
          <PlusCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />{" "}
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/questoes/nova"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="font-bold text-gray-700 dark:text-neutral-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">
              Nova Questão
            </span>
          </Link>

          <Link
            href="/admin/concursos"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-neutral-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-300">
              <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="font-bold text-gray-700 dark:text-neutral-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300">
              Novo Concurso
            </span>
          </Link>

          <Link
            href="/admin/editais/novo"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-neutral-800 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-500/5 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500 transition-colors duration-300">
              <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="font-bold text-gray-700 dark:text-neutral-300 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors duration-300">
              Mapear Edital
            </span>
          </Link>

          <Link
            href="/admin/bancas"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
              <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="font-bold text-gray-700 dark:text-neutral-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors duration-300">
              Gerir Bancas
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
