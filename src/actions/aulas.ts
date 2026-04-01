// src/actions/aulas.ts
"use server";

import { db } from "../db/index";
import { aulas } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. FUNÇÃO DE CRIAR NOVA AULA
export async function salvarAula(formData: FormData) {
  const titulo = formData.get("titulo") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const materiaId = parseInt(formData.get("materiaId") as string);
  const assuntoId = parseInt(formData.get("assuntoId") as string);

  await db.insert(aulas).values({
    titulo: titulo,
    videoUrl: videoUrl,
    materiaId: materiaId,
    assuntoId: assuntoId,
  });

  // Atualiza a página do painel admin onde a tabela de aulas ficará
  revalidatePath("/admin/aulas");
}

// 2. FUNÇÃO DE ATUALIZAR AULA EXISTENTE
export async function atualizarAula(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const titulo = formData.get("titulo") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const materiaId = parseInt(formData.get("materiaId") as string);
  const assuntoId = parseInt(formData.get("assuntoId") as string);

  await db
    .update(aulas)
    .set({
      titulo: titulo,
      videoUrl: videoUrl,
      materiaId: materiaId,
      assuntoId: assuntoId,
    })
    .where(eq(aulas.id, id));

  revalidatePath("/admin/aulas");
}

// 3. FUNÇÃO DE DELETAR AULA
export async function deletarAula(formData: FormData) {
  const id = parseInt(formData.get("id") as string);

  try {
    await db.delete(aulas).where(eq(aulas.id, id));
    revalidatePath("/admin/aulas");
    return { success: true };
  } catch (error) {
    console.error("ERRO DE EXCLUSÃO DE AULA:", error);
    return {
      error: "Ocorreu um erro ao tentar excluir esta aula.",
    };
  }
}
