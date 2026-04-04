import { db } from "@/db/index";
import { editais, editalAssuntos, assuntos, materias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditalClientView from "./EditalClientView";

export default async function EditalAlunoPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const editalId = params.id;

  const editalData = await db
    .select()
    .from(editais)
    .where(eq(editais.id, editalId));

  if (!editalData.length) {
    return notFound();
  }

  // ATENÇÃO AQUI: Adicionado editalAssuntos.tipoConhecimento à busca!
  const assuntosVinculados = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      materiaNome: materias.nome,
      tipo: editalAssuntos.tipoConhecimento, // <-- Este é o segredo!
    })
    .from(editalAssuntos)
    .innerJoin(assuntos, eq(editalAssuntos.assuntoId, assuntos.id))
    .leftJoin(materias, eq(assuntos.materiaId, materias.id))
    .where(eq(editalAssuntos.editalId, editalId));

  return (
    <EditalClientView edital={editalData[0]} assuntosDb={assuntosVinculados} />
  );
}
