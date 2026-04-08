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
}

interface ContarProps {
  bancasIds?: number[];
  materiasIds?: number[];
  assuntosIds?: number[];
}

// Função para gerar o ID alfanumérico no estilo "senha"
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
    let questoesSorteadas: { id: number }[] = [];
    const promises = [];

    // Junta promessas de matérias inteiras
    if (params.materiasConfig && params.materiasConfig.length > 0) {
      const matPromises = params.materiasConfig.map(async (config) => {
        const filtros = [eq(questoes.materiaId, config.id)];
        if (params.bancasIds && params.bancasIds.length > 0) {
          filtros.push(inArray(questoes.bancaId, params.bancasIds));
        }
        return db
          .select({ id: questoes.id })
          .from(questoes)
          .where(and(...filtros))
          .orderBy(sql`RANDOM()`)
          .limit(config.qtd);
      });
      promises.push(...matPromises);
    }

    // Junta promessas de assuntos específicos
    if (params.assuntosConfig && params.assuntosConfig.length > 0) {
      const assPromises = params.assuntosConfig.map(async (config) => {
        const filtros = [eq(questoes.assuntoId, config.id)];
        if (params.bancasIds && params.bancasIds.length > 0) {
          filtros.push(inArray(questoes.bancaId, params.bancasIds));
        }
        return db
          .select({ id: questoes.id })
          .from(questoes)
          .where(and(...filtros))
          .orderBy(sql`RANDOM()`)
          .limit(config.qtd);
      });
      promises.push(...assPromises);
    }

    // Executa tudo ao mesmo tempo ou cai no puramente aleatório
    if (promises.length > 0) {
      const resultados = await Promise.all(promises);
      questoesSorteadas = resultados.flat();
    } else {
      // MODO PURAMENTE ALEATÓRIO
      const filtros = [];
      if (params.bancasIds && params.bancasIds.length > 0) {
        filtros.push(inArray(questoes.bancaId, params.bancasIds));
      }
      questoesSorteadas = await db
        .select({ id: questoes.id })
        .from(questoes)
        .where(filtros.length > 0 ? and(...filtros) : undefined)
        .orderBy(sql`RANDOM()`)
        .limit(params.quantidadeTotal);
    }

    const idsUnicos = Array.from(new Set(questoesSorteadas.map((q) => q.id)));

    if (idsUnicos.length === 0) {
      return {
        error:
          "Nenhuma questão encontrada com esses filtros no banco de dados.",
      };
    }

    // Geramos o ID customizado
    const customId = gerarIdAlfanumerico();

    // 3. Criamos o "Cabeçalho" do Simulado com o novo ID e a quantidade REAL de questões encontradas
    const novoSimulado = await db
      .insert(simulados)
      .values({
        id: customId,
        userId: params.userId,
        titulo: params.titulo,
        quantidadeQuestoes: idsUnicos.length,
        status: "Pendente",
      })
      .returning({ id: simulados.id });

    const simuladoId = novoSimulado[0].id;

    // 4. Vinculamos as questões sorteadas a este novo simulado
    const vinculacoes = idsUnicos.map((questaoId) => ({
      simuladoId: simuladoId,
      questaoId: questaoId,
    }));

    await db.insert(simuladoQuestoes).values(vinculacoes);

    revalidatePath("/aluno/simulados");

    // Retornamos o ID para o Front-end redirecionar o aluno direto para a prova
    return { success: true, simuladoId: simuladoId };
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
    // 1. Busca todas as questões deste simulado para corrigir
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

    // 2. Corrige questão por questão e atualiza no banco
    for (const sq of sqs) {
      const respostaDoAluno = respostas[sq.sqId] || null;
      let isCorreta = false;

      if (respostaDoAluno) {
        // Compara a resposta do aluno com o gabarito oficial
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

    // 3. Atualiza o status do Simulado Geral para "Concluido" e salva a nota
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
      .orderBy(desc(simulados.criadoEm)); // Ordena do mais recente para o mais antigo

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

    const orConditions = [];
    if (filtros.materiasIds && filtros.materiasIds.length > 0) {
      orConditions.push(inArray(questoes.materiaId, filtros.materiasIds));
    }
    if (filtros.assuntosIds && filtros.assuntosIds.length > 0) {
      orConditions.push(inArray(questoes.assuntoId, filtros.assuntosIds));
    }

    // Junta os ORs (Matérias OU Assuntos selecionados)
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
