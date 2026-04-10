"use server";

import { db } from "../db/index";
import { concursos } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notificarAlunosStatusConcurso } from "./lembretes";

// Função auxiliar para converter a string do DatePicker numa Data válida para o Drizzle
function parseDate(dateString: string | null): Date | null {
  if (!dateString || dateString.trim() === "") return null;
  const date = new Date(dateString);
  // Verifica se a data é válida
  if (isNaN(date.getTime())) return null;
  return date;
}

export async function salvarConcurso(formData: FormData) {
  await db.insert(concursos).values({
    orgao: formData.get("orgao") as string,
    cargo: formData.get("cargo") as string,
    banca: formData.get("banca") as string,
    descricao: formData.get("descricao") as string,
    vagas: formData.get("vagas") as string,
    salario: formData.get("salario") as string,
    escolaridade: formData.get("escolaridade") as string,

    // NOVO CAMPO SENDO SALVO
    cursoTecnico: formData.get("cursoTecnico") as string,

    status: formData.get("status") as string,
    linkInscricao: formData.get("linkInscricao") as string,
    linkEdital: formData.get("linkEdital") as string,
    linkCronograma: formData.get("linkCronograma") as string,

    // Textos livres originais
    periodoInscricao: formData.get("periodoInscricao") as string,
    periodoIsencao: formData.get("periodoIsencao") as string,
    dataProva: formData.get("dataProva") as string,
    thumbnailUrl: formData.get("thumbnailUrl") as string,

    // NOVAS DATAS PARA O SISTEMA AUTOMÁTICO
    fimInscricao: parseDate(formData.get("fimInscricao") as string),
    dataProvaReal: parseDate(formData.get("dataProvaReal") as string),
  });

  revalidatePath("/admin/concursos");
  revalidatePath("/aluno/concursos");
}

export async function atualizarConcurso(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const novoStatus = formData.get("status") as string;
  const orgao = formData.get("orgao") as string;

  const concursoAntigo = await db
    .select()
    .from(concursos)
    .where(eq(concursos.id, id))
    .then((res) => res[0]);

  console.log(
    `[CONCURSOS] Status Antigo: ${concursoAntigo?.status} | Novo Status: ${novoStatus}`,
  );

  await db
    .update(concursos)
    .set({
      orgao: orgao,
      cargo: formData.get("cargo") as string,
      banca: formData.get("banca") as string,
      descricao: formData.get("descricao") as string,
      vagas: formData.get("vagas") as string,
      salario: formData.get("salario") as string,
      escolaridade: formData.get("escolaridade") as string,

      // NOVO CAMPO SENDO ATUALIZADO
      cursoTecnico: formData.get("cursoTecnico") as string,

      status: novoStatus,
      linkInscricao: formData.get("linkInscricao") as string,
      linkEdital: formData.get("linkEdital") as string,
      linkCronograma: formData.get("linkCronograma") as string,

      // Textos livres
      periodoInscricao: formData.get("periodoInscricao") as string,
      periodoIsencao: formData.get("periodoIsencao") as string,
      dataProva: formData.get("dataProva") as string,
      thumbnailUrl: formData.get("thumbnailUrl") as string,

      // NOVAS DATAS PARA O SISTEMA AUTOMÁTICO
      fimInscricao: parseDate(formData.get("fimInscricao") as string),
      dataProvaReal: parseDate(formData.get("dataProvaReal") as string),
    })
    .where(eq(concursos.id, id));

  if (concursoAntigo && concursoAntigo.status !== novoStatus) {
    console.log(`[CONCURSOS] O status mudou! A chamar o lembretes.ts...`);
    const resultadoEmail = await notificarAlunosStatusConcurso(id, novoStatus);
    console.log(`[CONCURSOS] Resultado do envio:`, resultadoEmail);
  } else {
    console.log(
      `[CONCURSOS] O status NÃO mudou. O e-mail não foi disparado para evitar spam.`,
    );
  }

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Erro ao excluir concurso." };
  }
}
