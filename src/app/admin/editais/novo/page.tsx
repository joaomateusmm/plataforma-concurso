import { db } from "@/db/index";
import { assuntos, materias, editais, editalAssuntos } from "@/db/schema";
import { eq } from "drizzle-orm";

// 🚀 AQUI ESTÁ O SEGREDO: Importação com chaves (Named Import)
import { NovoEditalForm } from "./NovoEditalForm";

export default async function Page() {
  const assuntosDoBanco = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      materiaNome: materias.nome,
    })
    .from(assuntos)
    .leftJoin(materias, eq(assuntos.materiaId, materias.id));

  // 1. Busca todos os editais normalmente
  const editaisRaw = await db.select().from(editais);

  // 2. Busca todas as relações (quais assuntos pertencem a quais editais)
  const relacoesRaw = await db.select().from(editalAssuntos);

  // 3. Junta tudo no mesmo formato que o form espera (imitando o db.query)
  const listaDeEditaisExistentes = editaisRaw.map((edital) => ({
    ...edital,
    editalAssuntos: relacoesRaw.filter((rel) => rel.editalId === edital.id),
  }));

  return (
    <NovoEditalForm
      assuntosDb={assuntosDoBanco}
      editaisDb={listaDeEditaisExistentes}
    />
  );
}
