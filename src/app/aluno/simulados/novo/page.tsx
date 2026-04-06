// src/app/aluno/simulados/novo/page.tsx
import { db } from "../../../../db/index";
import { bancas, materias, assuntos, questoes } from "../../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { NovoSimuladoForm } from "./novo-simulado-form"; // Ajuste o nome do ficheiro se necessário
import { BrainCircuit } from "lucide-react";

export default async function NovoSimuladoPage() {
  // 1. Busca Bancas + Contagem de Questões vinculadas
  const listaBancas = await db
    .select({
      id: bancas.id,
      nome: bancas.nome,
      quantidadeQuestoes: sql<number>`count(${questoes.id})`.mapWith(Number),
    })
    .from(bancas)
    .leftJoin(questoes, eq(bancas.id, questoes.bancaId))
    .groupBy(bancas.id);

  // 2. Busca Matérias + Contagem de Questões vinculadas
  const listaMaterias = await db
    .select({
      id: materias.id,
      nome: materias.nome,
      quantidadeQuestoes: sql<number>`count(${questoes.id})`.mapWith(Number),
    })
    .from(materias)
    .leftJoin(questoes, eq(materias.id, questoes.materiaId))
    .groupBy(materias.id);

  // 3. Busca Assuntos + Contagem de Questões vinculadas
  const listaAssuntos = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      quantidadeQuestoes: sql<number>`count(${questoes.id})`.mapWith(Number),
    })
    .from(assuntos)
    .leftJoin(questoes, eq(assuntos.id, questoes.assuntoId))
    .groupBy(assuntos.id);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <BrainCircuit className="w-8 h-8 text-emerald-500" />
            Criar Simulado
          </h1>
          <p className="text-neutral-400">
            Crie o seu próprio simulado. Escolha sua Banca, Matérias e Questões,
            se prepare de forma consciente para sua prova.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      {/* A DIV estática saiu daqui. Agora o formulário gere o layout de duas colunas! */}
      <NovoSimuladoForm
        bancas={listaBancas}
        materias={listaMaterias}
        assuntos={listaAssuntos}
      />
    </div>
  );
}
