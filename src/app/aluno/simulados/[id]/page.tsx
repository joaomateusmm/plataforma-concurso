// src/app/aluno/simulados/[id]/page.tsx
import { db } from "../../../../db/index";
import {
  simulados,
  simuladoQuestoes,
  questoes,
  materias,
  bancas,
} from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProvaClient from "./prova-client";

export default async function SalaDeProvaPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const simuladoId = params.id;

  // 1. Verifica se o simulado existe
  const simuladoResult = await db
    .select()
    .from(simulados)
    .where(eq(simulados.id, simuladoId));
  if (simuladoResult.length === 0) {
    redirect("/aluno/simulados"); // Se não existir, chuta o aluno de volta
  }
  const simulado = simuladoResult[0];

  // 2. Busca todas as questões vinculadas a este simulado
  const listaQuestoesDB = await db
    .select({
      sqId: simuladoQuestoes.id,
      respostaUsuario: simuladoQuestoes.respostaUsuario,
      isCorreta: simuladoQuestoes.isCorreta,
      enunciado: questoes.enunciado,
      textoApoio: questoes.textoApoio,
      tipo: questoes.tipo,
      itemCorreto: questoes.itemCorreto,
      itensErrados: questoes.itensErrados,
      materiaNome: materias.nome,
      bancaNome: bancas.nome,
    })
    .from(simuladoQuestoes)
    .innerJoin(questoes, eq(simuladoQuestoes.questaoId, questoes.id))
    .leftJoin(materias, eq(questoes.materiaId, materias.id))
    .leftJoin(bancas, eq(questoes.bancaId, bancas.id))
    .where(eq(simuladoQuestoes.simuladoId, simuladoId))
    .orderBy(simuladoQuestoes.id);

  // 3. Formata as questões (Embaralhando as alternativas no servidor para evitar bugs)
  const questoesFormatadas = listaQuestoesDB.map((q) => {
    let opcoes: string[] = [];

    if (q.tipo === "Objetiva") {
      // Pega a certa, junta com as erradas e embaralha a ordem aleatoriamente!
      const erradas = Array.isArray(q.itensErrados) ? q.itensErrados : [];
      opcoes = [q.itemCorreto, ...erradas].sort(() => Math.random() - 0.5);
    } else if (q.tipo === "Certo ou Errado") {
      opcoes = ["Certo", "Errado"];
    }

    return {
      ...q,
      opcoes, // Injetamos as opções já embaralhadas
    };
  });

  return (
    <div className="max-w-7xl mx-auto mt-6 mb-12">
      <ProvaClient simulado={simulado} questoes={questoesFormatadas} />
    </div>
  );
}
