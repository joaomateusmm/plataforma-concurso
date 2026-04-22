/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Loader2, Flame, Clock, CalendarDays, TrendingUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { obterDadosYearInPixels } from "@/actions/estudos";

export function InvestidasEstudo() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const year = 2026; // Ou dinâmico, como preferir

  const [dadosAno, setDadosAno] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const res = await obterDadosYearInPixels(userId, year);
        if (res.success && res.data) {
          setDadosAno(res.data);
        }
      } catch (error) {
        console.error("Erro ao carregar investidas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDados();
  }, [userId, year]);

  // --- LÓGICA DE CÁLCULO DOS INSIGHTS ---
  const estatisticas = useMemo(() => {
    let totalMinutos = 0;
    let diasAtivos = 0;
    const diasEstudadosSet = new Set<string>();

    dadosAno.forEach((dia) => {
      if (dia.tempoMinutos > 0 || dia.level > 0) {
        totalMinutos += dia.tempoMinutos;
        diasAtivos++;
        diasEstudadosSet.add(dia.dataStr);
      }
    });

    // 1. Horas Totais
    const horasTotais = Math.floor(totalMinutos / 60);
    const minutosRestantes = totalMinutos % 60;

    // 2. Média Diária (baseada nos dias que ele efetivamente estudou)
    const mediaMinutos =
      diasAtivos > 0 ? Math.floor(totalMinutos / diasAtivos) : 0;
    const mediaH = Math.floor(mediaMinutos / 60);
    const mediaM = mediaMinutos % 60;

    // 3. Cálculo de Ofensiva Atual (Streak de dias consecutivos até HOJE ou último dia)
    let streakAtual = 0;
    const hoje = new Date();
    // Como o ano é fixo em 2026 no seu exemplo, a lógica da "ofensiva até hoje"
    // pode ser adaptada. Vou iterar de hoje para trás (ou do último dia de 2026 para trás).

    // Para um caso real usando a data atual do usuário:
    for (let i = 0; i < 365; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);

      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      const dataStr = `${d.getFullYear()}-${mes}-${dia}`; // Ex: 2026-05-17

      // Se não estudou hoje, a ofensiva ainda não quebra (ele ainda tem o dia de hoje para estudar)
      // Mas se não estudou ontem, a ofensiva zera.
      if (i === 0 && !diasEstudadosSet.has(dataStr)) {
        continue; // Ignora o dia de hoje se estiver vazio, checa ontem
      }

      if (diasEstudadosSet.has(dataStr)) {
        streakAtual++;
      } else {
        break; // Quebrou a sequência
      }
    }

    return {
      horasTotais,
      minutosRestantes,
      diasAtivos,
      mediaH,
      mediaM,
      streakAtual,
    };
  }, [dadosAno]);

  if (isLoading) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center justify-center h-full min-h-[300px] shadow-sm w-full">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm w-full flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Tuas Investidas</h2>
        <p className="text-xs text-neutral-500">
          Resumo do teu progresso em {year}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* CARD: TEMPO TOTAL */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">
              Tempo Total
            </p>
            <p className="text-lg font-black text-white leading-none">
              {estatisticas.horasTotais}h {estatisticas.minutosRestantes}m
            </p>
          </div>
        </div>

        {/* CARD: OFENSIVA */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">
              Ofensiva Atual
            </p>
            <p className="text-lg font-black text-white leading-none flex items-baseline gap-1.5">
              {estatisticas.streakAtual}{" "}
              <span className="text-xs font-medium text-neutral-400">
                dias seguidos
              </span>
            </p>
          </div>
        </div>

        {/* CARD DUPLO: MÉDIA E DIAS ATIVOS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 flex flex-col items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">
                Média Diária
              </p>
              <p className="text-base font-black text-white leading-none">
                {estatisticas.mediaH}h {estatisticas.mediaM}m
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 flex flex-col items-start gap-2">
            <CalendarDays className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-0.5">
                Dias Ativos
              </p>
              <p className="text-base font-black text-white leading-none">
                {estatisticas.diasAtivos}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  dias
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
