"use server";

import { db } from "../db/index";
import { editais, editalAssuntos } from "../db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

interface CriarEditalParams {
  titulo: string;
  descricao: string;
  banca: string;
  assuntosMapeados: { basico: number[]; especifico: number[] };
  status: "Rascunho" | "Publicado";
}

function gerarIdAlfanumerico(tamanho = 12) {
  const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let idGerado = "";
  for (let i = 0; i < tamanho; i++) {
    idGerado += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length),
    );
  }
  return idGerado;
}

export async function criarEditalAdmin(params: CriarEditalParams) {
  try {
    if (!params.titulo) return { error: "O título do edital é obrigatório." };

    const totalAssuntos =
      params.assuntosMapeados.basico.length +
      params.assuntosMapeados.especifico.length;
    if (totalAssuntos === 0) {
      return {
        error: "É necessário selecionar pelo menos um assunto para o edital.",
      };
    }

    const editalId = gerarIdAlfanumerico();

    await db.insert(editais).values({
      id: editalId,
      titulo: params.titulo,
      descricao: params.descricao,
      banca: params.banca,
      status: params.status,
    });

    // Mapeia os arrays separadamente com o seu respectivo "tipo"
    const vinculacoesBasicas = params.assuntosMapeados.basico.map(
      (assuntoId) => ({
        editalId: editalId,
        assuntoId: assuntoId,
        tipoConhecimento: "Básico",
      }),
    );

    const vinculacoesEspecificas = params.assuntosMapeados.especifico.map(
      (assuntoId) => ({
        editalId: editalId,
        assuntoId: assuntoId,
        tipoConhecimento: "Específico",
      }),
    );

    const todasVinculacoes = [...vinculacoesBasicas, ...vinculacoesEspecificas];

    await db.insert(editalAssuntos).values(todasVinculacoes);

    revalidatePath("/admin/editais");
    return { success: true, editalId };
  } catch (error) {
    console.error("Erro ao criar edital:", error);
    return { error: "Falha interna ao criar o edital." };
  }
}

export async function obterEditaisAdmin() {
  try {
    const lista = await db
      .select()
      .from(editais)
      .orderBy(desc(editais.criadoEm));

    return { success: true, editais: lista };
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
    return { error: "Falha ao carregar a lista de editais." };
  }
}

export async function deletarEditalAdmin(id: string) {
  try {
    // Como usamos onDelete: 'cascade' no schema, os assuntos vinculados serão apagados sozinhos!
    await db.delete(editais).where(eq(editais.id, id));

    revalidatePath("/admin/editais");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar edital:", error);
    return { error: "Falha ao excluir o edital." };
  }
}

// Adicione no final do seu src/actions/editais.ts
export async function obterEditaisPublicados() {
  try {
    const lista = await db
      .select()
      .from(editais)
      .where(eq(editais.status, "Publicado"))
      .orderBy(desc(editais.criadoEm));

    return { success: true, editais: lista };
  } catch (error) {
    console.error("Erro ao buscar editais publicados:", error);
    return { error: "Falha ao carregar a lista de editais." };
  }
}

export async function atualizarEditalAdmin(
  id: string,
  params: CriarEditalParams,
) {
  try {
    if (!params.titulo) return { error: "O título do edital é obrigatório." };

    // AQUI ESTAVA O ERRO! Precisamos usar a nova lógica "assuntosMapeados"
    const totalAssuntos =
      params.assuntosMapeados.basico.length +
      params.assuntosMapeados.especifico.length;

    if (totalAssuntos === 0) {
      return {
        error: "É necessário selecionar pelo menos um assunto para o edital.",
      };
    }

    // 1. Atualiza os dados básicos do Edital
    await db
      .update(editais)
      .set({
        titulo: params.titulo,
        descricao: params.descricao,
        banca: params.banca,
        status: params.status,
      })
      .where(eq(editais.id, id));

    // 2. Remove as vinculações antigas de assuntos
    await db.delete(editalAssuntos).where(eq(editalAssuntos.editalId, id));

    // 3. Insere as novas vinculações atualizadas com os TIPOS corretos (Básico ou Específico)
    const vinculacoesBasicas = params.assuntosMapeados.basico.map(
      (assuntoId) => ({
        editalId: id,
        assuntoId: assuntoId,
        tipoConhecimento: "Básico", // Define como básico
      }),
    );

    const vinculacoesEspecificas = params.assuntosMapeados.especifico.map(
      (assuntoId) => ({
        editalId: id,
        assuntoId: assuntoId,
        tipoConhecimento: "Específico", // Define como específico
      }),
    );

    const todasVinculacoes = [...vinculacoesBasicas, ...vinculacoesEspecificas];

    await db.insert(editalAssuntos).values(todasVinculacoes);

    revalidatePath("/admin/editais");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar edital:", error);
    return { error: "Falha interna ao atualizar o edital." };
  }
}
