"use server";

import { db } from "../db/index";
import { questoes, simulados, simuladoQuestoes } from "../db/schema";
import { eq, inArray, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface GerarSimuladoParams {
  userId: string;
  titulo: string;
  quantidade: number;
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
    // 1. Montamos os filtros de busca dinâmica
    const filtros = [];

    if (params.bancasIds && params.bancasIds.length > 0) {
      filtros.push(inArray(questoes.bancaId, params.bancasIds));
    }
    if (params.materiasIds && params.materiasIds.length > 0) {
      filtros.push(inArray(questoes.materiaId, params.materiasIds));
    }
    if (params.assuntosIds && params.assuntosIds.length > 0) {
      filtros.push(inArray(questoes.assuntoId, params.assuntosIds));
    }

    // 2. Buscamos as questões aleatórias no banco de dados
    const questoesSorteadas = await db
      .select({ id: questoes.id })
      .from(questoes)
      .where(filtros.length > 0 ? and(...filtros) : undefined)
      .orderBy(sql`RANDOM()`) // O Segredo da aleatoriedade!
      .limit(params.quantidade);

    if (questoesSorteadas.length === 0) {
      return { error: "Nenhuma questão encontrada com esses filtros." };
    }

    // Geramos o ID customizado aqui!
    const customId = gerarIdAlfanumerico();

    // 3. Criamos o "Cabeçalho" do Simulado com o novo ID
    const novoSimulado = await db
      .insert(simulados)
      .values({
        id: customId, // Injetando o ID customizado
        userId: params.userId,
        titulo: params.titulo,
        quantidadeQuestoes: questoesSorteadas.length,
        status: "Pendente",
      })
      .returning({ id: simulados.id });

    const simuladoId = novoSimulado[0].id;

    // 4. Vinculamos as questões sorteadas a este novo simulado
    const vinculacoes = questoesSorteadas.map((q) => ({
      simuladoId: simuladoId,
      questaoId: q.id,
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
  simuladoId: string, // <--- MUDOU DE number PARA string AQUI
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
    // Como configuramos 'onDelete: cascade' na tabela simulado_questoes,
    // ao deletar o simulado pai, todas as questões vinculadas a ele sumirão automaticamente!
    await db.delete(simulados).where(eq(simulados.id, simuladoId));

    revalidatePath("/aluno/simulados");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar simulado:", error);
    return { error: "Falha ao excluir o simulado." };
  }
}
