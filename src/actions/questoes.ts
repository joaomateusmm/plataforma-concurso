// src/actions/questoes.ts
"use server";

import { db } from "../db/index";
import { questoes } from "../db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { materias, assuntos, bancas } from "../db/schema";

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

export async function importarQuestoesJson(jsonData: string) {
  try {
    // Transforma o texto do arquivo de volta em um objeto JavaScript
    const questoesArray = JSON.parse(jsonData);

    if (!Array.isArray(questoesArray) || questoesArray.length === 0) {
      return {
        error: "O arquivo JSON deve conter uma lista (array) de questões.",
      };
    }

    // O Drizzle é super poderoso. Se passarmos um array, ele faz um "Bulk Insert"!
    // Ele insere milhares de linhas em uma única operação super rápida.
    await db.insert(questoes).values(questoesArray);

    revalidatePath("/admin/questoes");
    return { success: true, count: questoesArray.length };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erro na importação:", error);
    return {
      error:
        "Erro ao processar o arquivo. Verifique se a estrutura está correta.",
    };
  }
}

export async function exportarDicionarioIds() {
  // Busca tudo diretamente do banco de dados
  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);
  const listaBancas = await db.select().from(bancas);

  // Retorna um objeto limpo e organizado
  return {
    bancas: listaBancas,
    materias: listaMaterias,
    assuntos: listaAssuntos,
  };
}

export async function editarQuestao(id: number, formData: FormData) {
  const tipo = formData.get("tipo") as string;
  const enunciado = formData.get("enunciado") as string;
  const itemCorreto = formData.get("itemCorreto") as string;

  const textoApoio = formData.get("textoApoio") as string;
  const imagemApoio = formData.get("imagemApoio") as string;

  const materiaId = parseInt(formData.get("materiaId") as string);
  const assuntoId = parseInt(formData.get("assuntoId") as string);
  const bancaId = parseInt(formData.get("bancaId") as string);

  const arrayItensErrados = formData
    .getAll("itensErrados")
    .map((item) => (item as string).trim())
    .filter((item) => item.length > 0);

  try {
    await db
      .update(questoes)
      .set({
        tipo: tipo,
        enunciado: enunciado,
        itemCorreto: itemCorreto,
        itensErrados: arrayItensErrados,
        materiaId: materiaId,
        assuntoId: assuntoId,
        bancaId: bancaId,
        textoApoio: textoApoio || null,
        imagemApoio: imagemApoio || null,
      })
      .where(eq(questoes.id, id));

    revalidatePath("/admin/questoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao editar questão:", error);
    return { error: "Ocorreu um erro ao atualizar a questão." };
  }
}

export async function atualizarEnunciadoRapido(
  id: number,
  novoEnunciado: string,
) {
  try {
    await db
      .update(questoes)
      .set({ enunciado: novoEnunciado })
      .where(eq(questoes.id, id));

    revalidatePath("/admin/questoes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar enunciado:", error);
    return { error: "Falha ao atualizar o enunciado." };
  }
}
