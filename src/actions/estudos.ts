// src/actions/estudos.ts
"use server";

import { db } from "../db/index";
import { yearInPixels } from "../db/schema";
import { eq, and } from "drizzle-orm";

export async function obterDadosYearInPixels(userId: string, year: number) {
  try {
    const dados = await db
      .select()
      .from(yearInPixels)
      .where(eq(yearInPixels.userId, userId)); // Opcionalmente, pode filtrar apenas pelas datas do ano

    return { success: true, data: dados };
  } catch (error) {
    console.error("Erro ao buscar dados do Year in Pixels:", error);
    return { error: "Falha ao carregar os dados." };
  }
}

// Função auxiliar para calcular o nível da cor (ajuste os valores conforme quiser)
function calcularLevelEstudo(minutosTotais: number): number {
  if (minutosTotais <= 0) return 0;
  if (minutosTotais < 60) return 1; // Menos de 1 hora
  if (minutosTotais < 180) return 2; // De 1h até 3h
  if (minutosTotais < 300) return 3; // De 3h até 5h
  return 4; // Mais de 5 horas
}

export async function registrarEstudoTempo(
  userId: string,
  dateStr: string,
  horas: number,
  minutos: number,
) {
  try {
    // Calcula o total em minutos e descobre qual será a cor
    const totalMinutos = horas * 60 + minutos;
    const levelCalculado = calcularLevelEstudo(totalMinutos);

    // 1. Verifica se já existe um registo desse utilizador para esta data específica
    const registroExistente = await db
      .select()
      .from(yearInPixels)
      .where(
        and(eq(yearInPixels.userId, userId), eq(yearInPixels.dataStr, dateStr)),
      );

    if (registroExistente.length > 0) {
      // 2. Se existir, atualiza o tempo e o level
      await db
        .update(yearInPixels)
        .set({
          tempoMinutos: totalMinutos,
          level: levelCalculado,
        })
        .where(eq(yearInPixels.id, registroExistente[0].id));
    } else {
      // 3. Se não existir, cria o registo completo
      await db.insert(yearInPixels).values({
        userId,
        dataStr: dateStr,
        tempoMinutos: totalMinutos,
        level: levelCalculado,
      });
    }

    // Retornamos os dados novos para o front-end atualizar a tela otimisticamente
    return {
      success: true,
      newLevel: levelCalculado,
      tempoMinutos: totalMinutos,
    };
  } catch (error) {
    console.error("Erro ao registrar estudo manual:", error);
    return { error: "Falha ao gravar no banco de dados." };
  }
}
