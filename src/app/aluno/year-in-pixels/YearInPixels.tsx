/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Info, Loader2, Clock } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  obterDadosYearInPixels,
  registrarEstudoTempo,
} from "@/actions/estudos";
import { toast } from "sonner";

function calcularLevelEstudo(minutosTotais: number): number {
  if (minutosTotais <= 0) return 0;
  if (minutosTotais < 60) return 1;
  if (minutosTotais < 180) return 2;
  if (minutosTotais < 300) return 3;
  return 4;
}

function formatarTempo(minutosTotais: number): string {
  if (minutosTotais === 0) return "0h 00m";
  const h = Math.floor(minutosTotais / 60);
  const m = minutosTotais % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function YearInPixels() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const year = 2026;

  const [atividadesDoAno, setAtividadesDoAno] = useState<
    Record<string, { level: number; tempoMinutos: number }>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    level: number;
    tempoMinutos: number;
    x: number;
    y: number;
  } | null>(null);

  const [activeMenuDay, setActiveMenuDay] = useState<{
    dateStr: string;
    formatData: string;
    currentTempoMinutos: number;
    x: number;
    y: number;
  } | null>(null);

  const [inputHoras, setInputHoras] = useState("");
  const [inputMinutos, setInputMinutos] = useState("");

  // PEGA O DIA DE HOJE PARA DESTACAR NA GRELHA
  const hojeStr = useMemo(() => {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${hoje.getFullYear()}-${mes}-${dia}`;
  }, []);

  useEffect(() => {
    const fetchDados = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const res = await obterDadosYearInPixels(userId, year);

        if (res.success && res.data) {
          const mapa: Record<string, { level: number; tempoMinutos: number }> =
            {};
          res.data.forEach((item: any) => {
            mapa[item.dataStr] = {
              level: item.level,
              tempoMinutos: item.tempoMinutos || 0,
            };
          });
          setAtividadesDoAno(mapa);
        }
      } catch (error) {
        console.error("Erro ao carregar pixels:", error);
      } finally {
        setIsLoading(false);
      }
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

      const atividadeDoDia = atividadesDoAno[dateStr] || {
        level: 0,
        tempoMinutos: 0,
      };

      daysArray.push({
        date: date,
        dateStr: dateStr,
        level: atividadeDoDia.level,
        tempoMinutos: atividadeDoDia.tempoMinutos,
      });
    }

    return daysArray;
  }, [year, atividadesDoAno]);

  const getLevelColor = (level: number, isToday: boolean) => {
    let bg = "";
    switch (level) {
      case 1:
        bg = "bg-emerald-950";
        break;
      case 2:
        bg = "bg-emerald-800";
        break;
      case 3:
        bg = "bg-emerald-500";
        break;
      case 4:
        bg = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]";
        break;
      default:
        bg = "bg-neutral-800/30";
        break;
    }

    // Se for o dia atual, aplica uma borda branca destacada
    const border = isToday
      ? "border-[1.5px] border-white/20 z-10 scale-110 shadow-[0_0_8px_rgba(255,255,255,0.1)]"
      : level === 1
        ? "border border-emerald-900/50"
        : level === 2
          ? "border border-emerald-700/50"
          : level === 3
            ? "border border-emerald-400/50"
            : level === 4
              ? "border border-emerald-300/50"
              : "border border-neutral-800";

    return `${bg} ${border}`;
  };

  const getLevelText = (level: number) => {
    if (level === 0) return "Nenhum registo";
    if (level === 1) return "Pouco estudo";
    if (level === 2) return "Estudo Razoável";
    if (level === 3) return "Muito estudo";
    return "Modo Turbo!";
  };

  const handleSubmitTempo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !activeMenuDay)
      return toast.error("Utilizador não autenticado.");

    const h = parseInt(inputHoras) || 0;
    const m = parseInt(inputMinutos) || 0;
    const totalMinutos = h * 60 + m;
    const levelCalculado = calcularLevelEstudo(totalMinutos);
    const dateStr = activeMenuDay.dateStr;

    const prevAtividades = { ...atividadesDoAno };
    setAtividadesDoAno((curr) => ({
      ...curr,
      [dateStr]: { level: levelCalculado, tempoMinutos: totalMinutos },
    }));
    setActiveMenuDay(null);
    setHoveredDay(null);

    try {
      const res = await registrarEstudoTempo(userId, dateStr, h, m);
      if (res?.error) throw new Error(res.error);
      toast.success("Tempo de estudo salvo!", { duration: 2000 });
    } catch {
      setAtividadesDoAno(prevAtividades);
      toast.error("Erro ao salvar o registo. Tente novamente.");
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm w-full relative overflow-hidden flex flex-col p-4 sm:p-6">
      {isLoading && (
        <div className="absolute top-4 right-6 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
          <span className="text-[10px] text-neutral-500 font-medium animate-pulse">
            Sincronizando...
          </span>
        </div>
      )}

      {activeMenuDay && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveMenuDay(null)}
        />
      )}

      {/* MENU FLUTUANTE */}
      {activeMenuDay && (
        <div
          className="fixed z-50 bg-neutral-950 border border-neutral-800 p-3 rounded-xl shadow-2xl flex flex-col gap-2 w-52 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${activeMenuDay.x}px`,
            top: `${activeMenuDay.y}px`,
            transform: "translate(-50%, -105%)",
          }}
        >
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-neutral-800/80">
            <span className="text-xs font-bold text-white">
              {activeMenuDay.formatData}
            </span>
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
          </div>

          <form onSubmit={handleSubmitTempo} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="flex flex-col flex-1">
                <label className="text-[10px] text-neutral-500 mb-1 font-medium uppercase">
                  Horas
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={inputHoras}
                  onChange={(e) => setInputHoras(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-[10px] text-neutral-500 mb-1 font-medium uppercase">
                  Minutos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputMinutos}
                  onChange={(e) => setInputMinutos(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#009966] hover:bg-emerald-600 text-white font-bold text-xs py-2 rounded-lg transition-colors mt-1"
            >
              Salvar Tempo
            </button>
          </form>
        </div>
      )}

      {/* TOOLTIP HOVER */}
      {hoveredDay && !activeMenuDay && (
        <div
          className="fixed z-50 pointer-events-none bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 items-center"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 10}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="text-[11px] font-bold text-white whitespace-nowrap">
            {hoveredDay.date}
          </span>
          <span className="text-[10px] font-medium text-emerald-400 whitespace-nowrap flex items-center gap-1">
            {getLevelText(hoveredDay.level)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 border-t border-neutral-800 pt-0.5 w-full text-center">
            {formatarTempo(hoveredDay.tempoMinutos)}
          </span>
        </div>
      )}

      {/* ÁREA DA GRELHA - TOTALMENTE SEM SCROLL */}
      <div className="flex gap-1.5 md:gap-2 w-full mb-6">
        {/* COLUNA DOS DIAS DA SEMANA */}
        <div className="grid grid-rows-7 gap-[2px] sm:gap-1 text-[8px] sm:text-[10px] font-medium text-neutral-500 pr-1 shrink-0">
          <span className="flex items-center justify-end">Dom</span>
          <span className="flex items-center justify-end">Seg</span>
          <span className="flex items-center justify-end">Ter</span>
          <span className="flex items-center justify-end">Qua</span>
          <span className="flex items-center justify-end">Qui</span>
          <span className="flex items-center justify-end">Sex</span>
          <span className="flex items-center justify-end">Sáb</span>
        </div>

        {/* GRELHA DOS PIXELS: min-w-0 forca a respeitar o container, esmagando-se de forma inteligente */}
        <div
          className="grid grid-rows-9 grid-flow-col gap-0.5 sm:gap-1 flex-1 min-w-0"
          onMouseLeave={() => setHoveredDay(null)}
        >
          {days.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="w-full aspect-square bg-transparent"
                />
              );
            }

            const formatData = day.date.toLocaleDateString("pt-BR");
            const isToday = day.dateStr === hojeStr;

            return (
              <div
                key={index}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const h = Math.floor(day.tempoMinutos / 60);
                  const m = day.tempoMinutos % 60;

                  setInputHoras(h > 0 ? h.toString() : "");
                  setInputMinutos(m > 0 ? m.toString() : "");

                  setActiveMenuDay({
                    dateStr: day.dateStr,
                    formatData: formatData,
                    currentTempoMinutos: day.tempoMinutos,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseEnter={(e) => {
                  if (!activeMenuDay) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredDay({
                      date: formatData,
                      level: day.level,
                      tempoMinutos: day.tempoMinutos,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }
                }}
                className={`w-4 h-4 rounded-[1px] md:rounded-[2px] cursor-pointer transition-all duration-200 hover:scale-125 hover:z-20 hover:ring-2 ring-neutral-500/50 ${getLevelColor(
                  day.level,
                  isToday,
                )}`}
              />
            );
          })}
        </div>
      </div>

      {/* RODAPÉ E LEGENDA */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-neutral-800/50 gap-4 sm:gap-0 mt-auto">
        <span className="text-[10px] sm:text-xs text-neutral-500 flex items-center gap-1 transition-colors text-center sm:text-left">
          <Info className="w-3.5 h-3.5 shrink-0 hidden sm:block" />
          Clique num dia para registar as horas manualmente.
        </span>

        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-500 font-medium shrink-0">
          <span>Menos</span>
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0 rounded-[2px] border border-neutral-800 bg-neutral-800/30" />
            <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0 rounded-[2px] border border-emerald-900/50 bg-emerald-950" />
            <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0 rounded-[2px] border border-emerald-700/50 bg-emerald-800" />
            <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0 rounded-[2px] border border-emerald-400/50 bg-emerald-500" />
            <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0 rounded-[2px] border border-emerald-300/50 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          </div>
          <span>Mais</span>
        </div>
      </div>
    </div>
  );
}
