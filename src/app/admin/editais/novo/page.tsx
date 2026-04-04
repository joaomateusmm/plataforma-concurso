import { db } from "@/db/index";
import { assuntos, materias } from "@/db/schema";
import { eq } from "drizzle-orm";
import NovoEditalForm from "./NovoEditalForm"; // Importando o formulário que acabamos de criar

export default async function Page() {
  const assuntosDoBanco = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      materiaNome: materias.nome,
    })
    .from(assuntos)
    .leftJoin(materias, eq(assuntos.materiaId, materias.id));

  return <NovoEditalForm assuntosDb={assuntosDoBanco} />;
}
