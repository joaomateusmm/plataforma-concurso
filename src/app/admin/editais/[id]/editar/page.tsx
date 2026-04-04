import { db } from "@/db/index";
import { assuntos, materias, editais, editalAssuntos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditarEditalForm from "./EditarEditalForm";

export default async function EditarEditalPage(props: {
  params: Promise<{ id: string }>;
}) {
  // Await nos parametros para evitar erros de Next.js 15
  const params = await props.params;
  const editalId = params.id;

  const editalData = await db
    .select()
    .from(editais)
    .where(eq(editais.id, editalId));

  if (!editalData || editalData.length === 0) {
    return notFound();
  }

  const vinculacoes = await db
    .select()
    .from(editalAssuntos)
    .where(eq(editalAssuntos.editalId, editalId));

  const initialAssuntosBasicos = vinculacoes
    .filter((v) => v.tipoConhecimento === "Básico")
    .map((v) => v.assuntoId);
  const initialAssuntosEspecificos = vinculacoes
    .filter((v) => v.tipoConhecimento === "Específico")
    .map((v) => v.assuntoId);

  const assuntosDoBanco = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      materiaNome: materias.nome,
    })
    .from(assuntos)
    .leftJoin(materias, eq(assuntos.materiaId, materias.id));

  return (
    <EditarEditalForm
      edital={editalData[0]}
      initialAssuntosBasicos={initialAssuntosBasicos}
      initialAssuntosEspecificos={initialAssuntosEspecificos}
      assuntosDb={assuntosDoBanco}
    />
  );
}
