"use server";

import { db } from "../db/index";
import { concursos, lembretesConcursos, user } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    linkCronograma: formData.get("linkCronograma") as string,
    periodoInscricao: formData.get("periodoInscricao") as string,
    periodoIsencao: formData.get("periodoIsencao") as string,
    dataProva: formData.get("dataProva") as string,
    thumbnailUrl: formData.get("thumbnailUrl") as string,
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
      status: novoStatus,
      linkInscricao: formData.get("linkInscricao") as string,
      linkEdital: formData.get("linkEdital") as string,
      linkCronograma: formData.get("linkCronograma") as string,
      periodoInscricao: formData.get("periodoInscricao") as string,
      periodoIsencao: formData.get("periodoIsencao") as string,
      dataProva: formData.get("dataProva") as string,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
    })
    .where(eq(concursos.id, id));

  if (concursoAntigo && concursoAntigo.status !== novoStatus) {
    try {
      const usuariosParaLembrar = await db
        .select({ email: user.email, nome: user.name })
        .from(lembretesConcursos)
        .innerJoin(user, eq(lembretesConcursos.userId, user.id))
        .where(eq(lembretesConcursos.concursoId, id));

      // Forçamos o TypeScript a entender que isto é uma lista de strings
      const emails = usuariosParaLembrar
        .map((u) => u.email)
        .filter(Boolean) as string[];

      if (emails.length > 0) {
        await resend.emails.send({
          from: "Aprovado <avisos@seudominio.com>", // ATENÇÃO: Domínio verificado no Resend
          to: "Aprovado <avisos@seudominio.com>", // <-- ADICIONADO PARA RESOLVER O ERRO DO TS
          bcc: emails, // Os alunos entram aqui na cópia oculta
          subject: `Atualização: Concurso ${orgao}`,
          html: `
            <h2>Boas notícias sobre o concurso da <b>${orgao}</b>!</h2>
            <p>O status do concurso que você está acompanhando mudou para: <strong style="color: #059669;">${novoStatus}</strong>.</p>
            <p>Acesse a plataforma para conferir as novas datas, editais ou cronogramas.</p>
            <br/>
            <p>Equipe +Aprovado</p>
          `,
        });
      }
    } catch (err) {
      console.error("Erro ao enviar emails de lembrete:", err);
    }
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
