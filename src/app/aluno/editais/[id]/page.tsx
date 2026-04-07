// src/app/aluno/editais/[id]/page.tsx
import { db } from "@/db/index";
import {
  editais,
  editalAssuntos,
  assuntos,
  materias,
  aulas,
} from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditalClientView from "./EditalClientView";

export default async function EditalAlunoPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  // CORREÇÃO AQUI: Como o seu DB usa string (Varchar) para o edital, não usamos o Number()
  const editalId = params.id;

  const editalData = await db
    .select()
    .from(editais)
    .where(eq(editais.id, editalId));

  if (!editalData.length) {
    return notFound();
  }

  const assuntosVinculados = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      materiaNome: materias.nome,
      tipo: editalAssuntos.tipoConhecimento,
      qtdAulas: count(aulas.id),
    })
    .from(editalAssuntos)
    .innerJoin(assuntos, eq(editalAssuntos.assuntoId, assuntos.id))
    .leftJoin(materias, eq(assuntos.materiaId, materias.id))
    .leftJoin(aulas, eq(aulas.assuntoId, assuntos.id))
    .where(eq(editalAssuntos.editalId, editalId))
    .groupBy(
      assuntos.id,
      assuntos.nome,
      materias.nome,
      editalAssuntos.tipoConhecimento,
    );

  return (
    <EditalClientView edital={editalData[0]} assuntosDb={assuntosVinculados} />
  );
}
