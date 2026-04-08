"use server";

import { db } from "../db/index";
import { simulados } from "../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function obterDadosYearInPixels(userId: string, year: number) {
  try {
    // 1. Definimos o início e o fim do ano escolhido
    const dataInicio = new Date(year, 0, 1);
    const dataFim = new Date(year, 11, 31, 23, 59, 59);

    // 2. Buscamos todos os simulados do aluno dentro deste ano
    const historico = await db
      .select({ criadoEm: simulados.criadoEm })
      .from(simulados)
      .where(
        and(
          eq(simulados.userId, userId),
          gte(simulados.criadoEm, dataInicio),
          lte(simulados.criadoEm, dataFim),
        ),
      );

    // 3. Agrupamos os simulados por dia (Formato: "YYYY-MM-DD")
    const mapaAtividades: Record<string, number> = {};

    historico.forEach((item) => {
      if (!item.criadoEm) return;
      // Converte a data para o formato de string simples, ex: "2026-04-08"
      const dataStr = item.criadoEm.toISOString().split("T")[0];

      // Soma +1 a cada simulado encontrado naquele dia
      mapaAtividades[dataStr] = (mapaAtividades[dataStr] || 0) + 1;
    });

    // 4. Transformamos a contagem em "Níveis" de intensidade (1 a 4)
    const resultado = Object.entries(mapaAtividades).map(
      ([dataStr, quantidade]) => {
        let level = 0;
        if (quantidade >= 5)
          level = 4; // Modo Turbo (5+ simulados)
        else if (quantidade >= 3)
          level = 3; // Muito estudo (3 ou 4 simulados)
        else if (quantidade >= 2)
          level = 2; // Estudo razoável (2 simulados)
        else if (quantidade === 1) level = 1; // Pouco estudo (1 simulado)

        return { dataStr, level };
      },
    );

    return { success: true, data: resultado };
  } catch (error) {
    console.error("Erro ao buscar Year In Pixels:", error);
    return { error: "Falha ao carregar o histórico de estudos." };
  }
}
