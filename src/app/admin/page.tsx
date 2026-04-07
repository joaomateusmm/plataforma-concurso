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
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-3">
            <LayoutDashboard className="w-4 h-4" /> Visão Geral
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Olá, {primeiroNome}! 👋
          </h1>
          <p className="text-gray-500 max-w-2xl">
            Bem-vindo ao seu centro de comando. Aqui você tem uma visão completa
            da base de conhecimento que alimenta a plataforma dos seus alunos.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900">
              {session.user.name}
            </p>
            <p className="text-xs font-medium text-emerald-600">Nível: Admin</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-700 font-black text-lg shadow-sm">
            {primeiroNome.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Questões no Banco
            </p>
            <p className="text-3xl font-black text-gray-900">
              {qtdQuestoes.value}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Concursos Ativos
            </p>
            <p className="text-3xl font-black text-gray-900">
              {qtdConcursos.value}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
            <FileText className="w-8 h-8 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Editais Mapeados
            </p>
            <p className="text-3xl font-black text-gray-900">
              {qtdEditais.value}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
            <Layers className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Bancas Registradas
            </p>
            <p className="text-3xl font-black text-gray-900">
              {qtdBancas.value}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform">
            <BookOpen className="w-8 h-8 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Matérias
            </p>
            <p className="text-3xl font-black text-gray-900">
              {qtdMaterias.value}
            </p>
          </div>
        </div>

        {/* Card 6: Assuntos */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center border border-cyan-100 group-hover:scale-105 transition-transform">
            <Target className="w-8 h-8 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Tópicos/Assuntos
            </p>
            <p className="text-3xl font-black text-gray-900">
              {qtdAssuntos.value}
            </p>
          </div>
        </div>
      </div>

      {/* ACESSO RÁPIDO */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-emerald-600" /> Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/questoes/nova"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Database className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-bold text-gray-700 group-hover:text-blue-700">
              Nova Questão
            </span>
          </Link>

          <Link
            href="/admin/concursos"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
              <Trophy className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-bold text-gray-700 group-hover:text-emerald-700">
              Novo Concurso
            </span>
          </Link>

          <Link
            href="/admin/editais/novo"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-400 hover:bg-violet-50/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
              <FileText className="w-5 h-5 text-violet-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-bold text-gray-700 group-hover:text-violet-700">
              Mapear Edital
            </span>
          </Link>

          <Link
            href="/admin/bancas"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
              <Layers className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-bold text-gray-700 group-hover:text-amber-700">
              Gerir Bancas
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
