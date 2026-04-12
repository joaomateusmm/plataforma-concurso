"use server";

import { db } from "../db/index";
import { questoes, simulados, simuladoQuestoes } from "../db/schema";
import { eq, inArray, and, sql, desc, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface GerarSimuladoParams {
  userId: string;
  titulo: string;
  quantidadeTotal: number;
  bancasIds?: number[];
  materiasConfig?: { id: number; qtd: number }[];
  assuntosConfig?: { id: number; qtd: number }[];
  estiloProva?: string; // "Objetiva" ou "Certo ou Errado"
  tempoLimite?: number | null; // Tempo em minutos
}

interface ContarProps {
  bancasIds?: number[];
  materiasIds?: number[];
  assuntosIds?: number[];
  estiloProva?: string;
}

function gerarIdAlfanumerico(tamanho = 15) {
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

export async function gerarSimuladoAleatorio(params: GerarSimuladoParams) {
  try {
    const filtrosDb = [];

    // 1. Filtros Globais (AND)
    if (params.bancasIds && params.bancasIds.length > 0) {
      filtrosDb.push(inArray(questoes.bancaId, params.bancasIds));
    }

    if (params.estiloProva) {
      filtrosDb.push(eq(questoes.tipo, params.estiloProva));
    }

    // 2. Filtros Específicos (OR) - Matérias e Assuntos
    const orConditions = [];

    if (params.materiasConfig && params.materiasConfig.length > 0) {
      const materiasIds = params.materiasConfig.map((m) => m.id);
      orConditions.push(inArray(questoes.materiaId, materiasIds));
    }

    if (params.assuntosConfig && params.assuntosConfig.length > 0) {
      const assuntosIds = params.assuntosConfig.map((a) => a.id);
      orConditions.push(inArray(questoes.assuntoId, assuntosIds));
    }

    if (orConditions.length > 0) {
      filtrosDb.push(or(...orConditions));
    }

    // 3. BUSCA UNIFICADA (Resolve o bug do excesso de questões)
    // Busca todas as questões que obedecem aos filtros e aplica o limite global
    const questoesSorteadas = await db
      .select({ id: questoes.id })
      .from(questoes)
      .where(filtrosDb.length > 0 ? and(...filtrosDb) : undefined)
      .orderBy(sql`RANDOM()`)
      .limit(params.quantidadeTotal);

    const idsUnicos = Array.from(new Set(questoesSorteadas.map((q) => q.id)));

    if (idsUnicos.length === 0) {
      return {
        error:
          "Nenhuma questão encontrada com esses filtros no banco de dados.",
      };
    }

    const customId = gerarIdAlfanumerico();

    await db.insert(simulados).values({
      id: customId,
      userId: params.userId,
      titulo: params.titulo,
      // Agora idsUnicos nunca vai ultrapassar a quantidadeTotal!
      quantidadeQuestoes: idsUnicos.length,
      status: "Pendente",
      estiloProva: params.estiloProva || "Objetiva",
      tempoLimite: params.tempoLimite || null,
    });

    const vinculacoes = idsUnicos.map((questaoId) => ({
      simuladoId: customId,
      questaoId: questaoId,
    }));

    await db.insert(simuladoQuestoes).values(vinculacoes);

    revalidatePath("/aluno/simulados");

    return { success: true, simuladoId: customId };
  } catch (error) {
    console.error("Erro ao gerar simulado:", error);
    return { error: "Falha ao gerar o simulado. Tente novamente." };
  }
}

export async function finalizarSimulado(
  simuladoId: string,
  respostas: Record<number, string>,
) {
  try {
    const sqs = await db
      .select({
        sqId: simuladoQuestoes.id,
        questaoId: questoes.id,
        itemCorreto: questoes.itemCorreto,
      })
      .from(simuladoQuestoes)
      .innerJoin(questoes, eq(simuladoQuestoes.questaoId, questoes.id))
      .where(eq(simuladoQuestoes.simuladoId, simuladoId));

    let acertos = 0;

    for (const sq of sqs) {
      const respostaDoAluno = respostas[sq.sqId] || null;
      let isCorreta = false;

      if (respostaDoAluno) {
        isCorreta = respostaDoAluno === sq.itemCorreto;
        if (isCorreta) acertos++;
      }

      await db
        .update(simuladoQuestoes)
        .set({
          respostaUsuario: respostaDoAluno,
          isCorreta: respostaDoAluno ? isCorreta : null,
        })
        .where(eq(simuladoQuestoes.id, sq.sqId));
    }

    await db
      .update(simulados)
      .set({
        status: "Concluido",
        acertos: acertos,
      })
      .where(eq(simulados.id, simuladoId));

    revalidatePath(`/aluno/simulados/${simuladoId}`);
    return { success: true, acertos };
  } catch (error) {
    console.error("Erro ao finalizar simulado:", error);
    return { error: "Falha ao corrigir a prova." };
  }
}

export async function obterMeusSimulados(userId: string) {
  try {
    const lista = await db
      .select()
      .from(simulados)
      .where(eq(simulados.userId, userId))
      .orderBy(desc(simulados.criadoEm));

    return { success: true, simulados: lista };
  } catch (error) {
    console.error("Erro ao buscar simulados:", error);
    return { error: "Falha ao carregar os seus simulados." };
  }
}

export async function deletarSimulado(simuladoId: string) {
  try {
    await db.delete(simulados).where(eq(simulados.id, simuladoId));

    revalidatePath("/aluno/simulados");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar simulado:", error);
    return { error: "Falha ao excluir o simulado." };
  }
}

export async function contarQuestoesDisponiveis(filtros: ContarProps) {
  try {
    const filtrosDb = [];

    if (filtros.bancasIds && filtros.bancasIds.length > 0) {
      filtrosDb.push(inArray(questoes.bancaId, filtros.bancasIds));
    }

    // AGORA COMPARA CORRETAMENTE COM O BANCO ("Objetiva" ou "Certo ou Errado")
    if (filtros.estiloProva) {
      filtrosDb.push(eq(questoes.tipo, filtros.estiloProva));
    }

    const orConditions = [];
    if (filtros.materiasIds && filtros.materiasIds.length > 0) {
      orConditions.push(inArray(questoes.materiaId, filtros.materiasIds));
    }
    if (filtros.assuntosIds && filtros.assuntosIds.length > 0) {
      orConditions.push(inArray(questoes.assuntoId, filtros.assuntosIds));
    }

    if (orConditions.length > 0) {
      filtrosDb.push(or(...orConditions));
    }

    const resultado = await db
      .select({ count: sql<number>`count(*)` })
      .from(questoes)
      .where(filtrosDb.length > 0 ? and(...filtrosDb) : undefined);

    const total = Number(resultado[0]?.count || 0);
    return { total };
  } catch (error) {
    console.error("Erro na contagem:", error);
    return { total: 0 };
  }
}
