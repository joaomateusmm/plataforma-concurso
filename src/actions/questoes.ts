// src/actions/questoes.ts
"use server";

import { db } from "../db/index";
import { questoes } from "../db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function salvarQuestao(formData: FormData) {
  const tipo = formData.get("tipo") as string;
  const enunciado = formData.get("enunciado") as string;
  const itemCorreto = formData.get("itemCorreto") as string;

  // 1. Recebemos os dados opcionais (podem vir vazios)
  const textoApoio = formData.get("textoApoio") as string;
  const imagemApoio = formData.get("imagemApoio") as string;

  const materiaId = parseInt(formData.get("materiaId") as string);
  const assuntoId = parseInt(formData.get("assuntoId") as string);
  const bancaId = parseInt(formData.get("bancaId") as string);

  const arrayItensErrados = formData
    .getAll("itensErrados")
    .map((item) => (item as string).trim())
    .filter((item) => item.length > 0);

  await db.insert(questoes).values({
    tipo: tipo,
    enunciado: enunciado,
    itemCorreto: itemCorreto,
    itensErrados: arrayItensErrados,
    materiaId: materiaId,
    assuntoId: assuntoId,
    bancaId: bancaId,
    // 2. Salvamos no banco! Se estiverem vazios, salvamos como null.
    textoApoio: textoApoio || null,
    imagemApoio: imagemApoio || null,
  });

  revalidatePath("/admin/questoes");
}

export async function deletarQuestao(formData: FormData) {
  const id = parseInt(formData.get("id") as string);

  try {
    await db.delete(questoes).where(eq(questoes.id, id));
    revalidatePath("/admin/questoes");
    return { success: true };
  } catch (error) {
    console.error("ERRO DE EXCLUSÃO DE QUESTÃO:", error);
    return {
      error: "Ocorreu um erro ao tentar excluir esta questão.",
    };
  }
}
