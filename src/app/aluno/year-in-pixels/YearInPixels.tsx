"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { obterDadosYearInPixels } from "@/actions/estudos";

export function YearInPixels() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const year = 2026;

  const [atividadesDoAno, setAtividadesDoAno] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  // 1. ESTADOS PARA O TOOLTIP INSTANTÂNEO
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    level: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const fetchDados = async () => {
      if (!userId) return;

      setIsLoading(true);
      const res = await obterDadosYearInPixels(userId, year);

      if (res.success && res.data) {
        const mapa: Record<string, number> = {};
        res.data.forEach((item) => {
          mapa[item.dataStr] = item.level;
        });
        setAtividadesDoAno(mapa);
      }
      setIsLoading(false);
    };

    fetchDados();
  }, [userId, year]);

  const days = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const startDayOfWeek = startDate.getDay();

    const daysInYear =
      (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365;
    const daysArray = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push(null);
    }

    for (let i = 0; i < daysInYear; i++) {
      const date = new Date(year, 0, i + 1);

      const mes = String(date.getMonth() + 1).padStart(2, "0");
      const dia = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${mes}-${dia}`;

      const levelDoDia = atividadesDoAno[dateStr] || 0;

      daysArray.push({
        date: date,
        dateStr: dateStr,
        level: levelDoDia,
      });
    }

    return daysArray;
  }, [year, atividadesDoAno]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-950 border-emerald-900/50";
      case 2:
        return "bg-emerald-800 border-emerald-700/50";
      case 3:
        return "bg-emerald-500 border-emerald-400/50";
      case 4:
        return "bg-emerald-400 border-emerald-300/50 shadow-[0_0_8px_rgba(52,211,153,0.4)]";
      default:
        return "bg-neutral-800/30 border-neutral-800";
    }
  };

  // 2. FUNÇÃO PARA TRADUZIR O NÍVEL EM TEXTO PARA O TOOLTIP
  const getLevelText = (level: number) => {
    if (level === 0) return "Nenhum simulado";
    if (level === 1) return "Pouco estudo";
    if (level === 2) return "Estudo Razoável";
    if (level === 3) return "Muito estudo";
    return "Modo Turbo!";
  };

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm w-full overflow-x-auto custom-scrollbar relative">
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* 3. O COMPONENTE TOOLTIP FLUTUANTE */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none bg-neutral-950 border border-neutral-800 px-2 py-2 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 10}px`,
            transform: "translate(-50%, -100%)", // Centraliza em cima do rato
          }}
        >
          <span className="text-[10px]  font-bold text-white whitespace-nowrap">
            {hoveredDay.date}
          </span>
          <span className="text-[10px] font-medium text-emerald-400 whitespace-nowrap">
            {getLevelText(hoveredDay.level)}
          </span>
        </div>
      )}

      <div className="min-w-212.5 relative">
        <div className="flex text-xs font-semibold text-neutral-500 mb-2 ml-8 justify-between pr-4">
          {months.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col justify-between text-[10px] font-medium text-neutral-500 py-0 pr-1 h-33.75">
            <span className="leading-none h-3.75 flex items-center">Dom</span>
            <span className="leading-none h-3.75 flex items-center">Seg</span>
            <span className="leading-none h-3.75 flex items-center">Ter</span>
            <span className="leading-none h-3.75 flex items-center">Qua</span>
            <span className="leading-none h-3.75 flex items-center">Qui</span>
            <span className="leading-none h-3.75 flex items-center">Sex</span>
            <span className="leading-none h-3.75 flex items-center">Sáb</span>
          </div>

          <div
            className="grid-rows-7 grid-flow-col gap-1.5 h-auto inline-grid"
            // Retiramos o hover global quando o rato sai da grelha
            onMouseLeave={() => setHoveredDay(null)}
          >
            {days.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="w-3.5 h-3.5 bg-transparent"
                  />
                );
              }

              const formatData = day.date.toLocaleDateString("pt-BR");

              return (
                <div
                  key={index}
                  // 4. ATUALIZAMOS A POSIÇÃO E OS DADOS NO MOUSE ENTER
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredDay({
                      date: formatData,
                      level: day.level,
                      x: rect.left + rect.width / 2, // Centro horizontal do bloco
                      y: rect.top, // Topo do bloco
                    });
                  }}
                  className={`w-3.5 h-3.5 rounded-[3px] border transition-all duration-200 hover:scale-125 hover:ring-2 ring-neutral-500/50 ${getLevelColor(
                    day.level,
                  )}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-neutral-500 flex items-center gap-1 transition-colors">
            <Info className="w-3.5 h-3.5" />
            Atividade baseada em simulados resolvidos.
          </span>

          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <span>Menos</span>
            <div className="flex gap-1.5">
              <div className="w-[14px] h-[14px] rounded-[3px] border border-neutral-800 bg-neutral-800/30" />
              <div className="w-[14px] h-[14px] rounded-[3px] border border-emerald-900/50 bg-emerald-950" />
              <div className="w-[14px] h-[14px] rounded-[3px] border border-emerald-700/50 bg-emerald-800" />
              <div className="w-[14px] h-[14px] rounded-[3px] border border-emerald-400/50 bg-emerald-500" />
              <div className="w-[14px] h-[14px] rounded-[3px] border border-emerald-300/50 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
            </div>
            <span>Mais</span>
          </div>
        </div>
      </div>
    </div>
  );
}
