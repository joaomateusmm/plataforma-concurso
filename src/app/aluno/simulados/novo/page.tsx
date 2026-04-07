// src/app/aluno/simulados/novo/page.tsx
import { db } from "../../../../db/index";
import { bancas, materias, assuntos, questoes } from "../../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { NovoSimuladoForm } from "./novo-simulado-form";
import { CopyPlus } from "lucide-react";

export default async function NovoSimuladoPage() {
  const todasBancas = await db.select().from(bancas);
  const todasMaterias = await db.select().from(materias);

  // AQUI MUDOU: Agora puxamos o nome da matéria junto com o assunto!
  const todosAssuntos = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      materiaNome: materias.nome,
    })
    .from(assuntos)
    .leftJoin(materias, eq(assuntos.materiaId, materias.id));

  const contagemBancasQuery = await db
    .select({
      id: questoes.bancaId,
      total: sql<number>`count(${questoes.id})`.mapWith(Number),
    })
    .from(questoes)
    .groupBy(questoes.bancaId);

  const contagemMateriasQuery = await db
    .select({
      id: questoes.materiaId,
      total: sql<number>`count(${questoes.id})`.mapWith(Number),
    })
    .from(questoes)
    .groupBy(questoes.materiaId);

  const contagemAssuntosQuery = await db
    .select({
      id: questoes.assuntoId,
      total: sql<number>`count(${questoes.id})`.mapWith(Number),
    })
    .from(questoes)
    .groupBy(questoes.assuntoId);

  const listaBancas = todasBancas.map((b) => ({
    ...b,
    quantidadeQuestoes:
      contagemBancasQuery.find((q) => q.id === b.id)?.total || 0,
  }));

  const listaMaterias = todasMaterias.map((m) => ({
    ...m,
    quantidadeQuestoes:
      contagemMateriasQuery.find((q) => q.id === m.id)?.total || 0,
  }));

  const listaAssuntos = todosAssuntos.map((a) => ({
    ...a,
    quantidadeQuestoes:
      contagemAssuntosQuery.find((q) => q.id === a.id)?.total || 0,
  }));

  return (
    <div className="mx-auto space-y-8 animate-in fade-in duration-500 mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <CopyPlus className="w-8 h-8 text-emerald-500" />
            Criar Simulado
          </h1>
          <p className="text-neutral-400">
            Crie o seu próprio simulado. Escolha sua Banca, Matérias e Questões,
            se prepare de forma consciente para sua prova.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      <NovoSimuladoForm
        bancas={listaBancas}
        materias={listaMaterias}
        assuntos={listaAssuntos}
      />
    </div>
  );
}
