"use server";

import { db } from "../db/index";
import { lembretesConcursos } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Ajuste o caminho da sua auth
import { revalidatePath } from "next/cache";

export async function alternarLembreteConcurso(concursoId: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return {
      error: "Opa! Você precisa estar logado para ativar seus lembretes.",
    };
  }

  const userId = session.user.id;

  // Verifica se o lembrete já existe
  const lembreteExistente = await db
    .select()
    .from(lembretesConcursos)
    .where(
      and(
        eq(lembretesConcursos.userId, userId),
        eq(lembretesConcursos.concursoId, concursoId),
      ),
    );

  if (lembreteExistente.length > 0) {
    // Se existe, desativa (remove)
    await db
      .delete(lembretesConcursos)
      .where(eq(lembretesConcursos.id, lembreteExistente[0].id));

    revalidatePath("/aluno/concursos");
    return { active: false, success: "Lembrete desativado." };
  } else {
    // Se não existe, ativa (insere)
    await db.insert(lembretesConcursos).values({
      userId,
      concursoId,
    });

    revalidatePath("/aluno/concursos");
    return { active: true, success: "Você receberá " };
  }
}
