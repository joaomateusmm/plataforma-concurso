// src/actions/cadastros.ts
"use server";

import { db } from "../db/index";
import { eq } from "drizzle-orm";
import { materias, bancas, assuntos } from "../db/schema";
import { revalidatePath } from "next/cache";

export async function salvarMateria(formData: FormData) {
  const nome = formData.get("nome") as string;

  await db.insert(materias).values({ nome: nome });

  revalidatePath("/admin/materias");
}

export async function salvarBanca(formData: FormData) {
  const nome = formData.get("nome") as string;
  await db.insert(bancas).values({ nome: nome });
  revalidatePath("/admin/bancas");
}

export async function salvarAssunto(formData: FormData) {
  const nome = formData.get("nome") as string;
  const materiaId = parseInt(formData.get("materiaId") as string);

  await db.insert(assuntos).values({
    nome: nome,
    materiaId: materiaId,
  });

  revalidatePath("/admin/assuntos");
}

export async function deletarMateria(formData: FormData) {
  const id = parseInt(formData.get("id") as string);

  try {
    await db.delete(materias).where(eq(materias.id, id));
    revalidatePath("/admin/materias");

    return { success: true };
  } catch (error) {
    console.error("ERRO DE EXCLUSÃO:", error);

    return {
      error:
        "Não é possível excluir. Existem Assuntos ou Questões vinculados a esta matéria.",
    };
  }
}

export async function deletarBanca(formData: FormData) {
  const id = parseInt(formData.get("id") as string);

  try {
    await db.delete(bancas).where(eq(bancas.id, id));
    revalidatePath("/admin/bancas");
    return { success: true };
  } catch (error) {
    console.error("ERRO DE EXCLUSÃO DE BANCA:", error);
    return {
      error:
        "Não é possível excluir. Existem Questões vinculadas a esta banca.",
    };
  }
}

export async function deletarAssunto(formData: FormData) {
  const id = parseInt(formData.get("id") as string);

  try {
    await db.delete(assuntos).where(eq(assuntos.id, id));
    revalidatePath("/admin/assuntos");
    return { success: true };
  } catch (error) {
    console.error("ERRO DE EXCLUSÃO DE ASSUNTO:", error);
    return {
      error:
        "Não é possível excluir. Existem Questões vinculadas a este assunto.",
    };
  }
}

export async function atualizarMateria(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const nome = formData.get("nome") as string;

  await db.update(materias).set({ nome: nome }).where(eq(materias.id, id));

  revalidatePath("/admin/materias");
}

export async function atualizarBanca(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const nome = formData.get("nome") as string;

  await db.update(bancas).set({ nome: nome }).where(eq(bancas.id, id));

  revalidatePath("/admin/bancas");
}

export async function atualizarAssunto(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const nome = formData.get("nome") as string;
  const materiaId = parseInt(formData.get("materiaId") as string);

  await db
    .update(assuntos)
    .set({
      nome: nome,
      materiaId: materiaId,
    })
    .where(eq(assuntos.id, id));

  revalidatePath("/admin/assuntos");
}
