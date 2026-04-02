// src/actions/concursos.ts
"use server";

import { db } from "../db/index";
import { concursos } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function salvarConcurso(formData: FormData) {
  await db.insert(concursos).values({
    orgao: formData.get("orgao") as string,
    cargo: formData.get("cargo") as string,
    banca: formData.get("banca") as string,
    descricao: formData.get("descricao") as string,
    vagas: formData.get("vagas") as string,
    salario: formData.get("salario") as string,
    escolaridade: formData.get("escolaridade") as string,
    status: formData.get("status") as string,
    linkInscricao: formData.get("linkInscricao") as string,
    linkEdital: formData.get("linkEdital") as string,
    periodoInscricao: formData.get("periodoInscricao") as string, // Novo
    periodoIsencao: formData.get("periodoIsencao") as string, // Novo
  });

  revalidatePath("/admin/concursos");
  revalidatePath("/aluno/concursos");
}

export async function atualizarConcurso(formData: FormData) {
  const id = parseInt(formData.get("id") as string);

  await db
    .update(concursos)
    .set({
      orgao: formData.get("orgao") as string,
      cargo: formData.get("cargo") as string,
      banca: formData.get("banca") as string,
      descricao: formData.get("descricao") as string,
      vagas: formData.get("vagas") as string,
      salario: formData.get("salario") as string,
      escolaridade: formData.get("escolaridade") as string,
      status: formData.get("status") as string,
      linkInscricao: formData.get("linkInscricao") as string,
      linkEdital: formData.get("linkEdital") as string,
      periodoInscricao: formData.get("periodoInscricao") as string, // Novo
      periodoIsencao: formData.get("periodoIsencao") as string, // Novo
    })
    .where(eq(concursos.id, id));

  revalidatePath("/admin/concursos");
  revalidatePath("/aluno/concursos");
}

export async function deletarConcurso(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  try {
    await db.delete(concursos).where(eq(concursos.id, id));
    revalidatePath("/admin/concursos");
    revalidatePath("/aluno/concursos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir concurso." };
  }
}
