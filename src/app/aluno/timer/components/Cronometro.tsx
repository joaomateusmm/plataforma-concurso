"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { ClockSeparator } from "./FlipDigit"; // Usamos apenas o Separador antigo
import { useTimer } from "@/contexts/TimerContext";

// O COMPONENTE COM ANIMAÇÃO FLIP 3D PADRONIZADO (Importado do teu novo design)
function TimeDisplay({ value }: { value: string }) {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  if (value !== prevValue && !isFlipping) {
    setIsFlipping(true);
    setPrevValue(value);
  }

  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => {
        setIsFlipping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFlipping]);

  return (
    <div className="relative flex flex-col items-center justify-center bg-[#111111] rounded-2xl w-50 h-32 md:w-58 md:h-56 transition-all perspective-1000">
      <div className="absolute top-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-t-2xl flex items-end justify-center">
        <span className="text-neutral-400 font-bold text-7xl md:text-9xl select-none translate-y-[50%]">
          {value}
        </span>
      </div>

      <div className="absolute bottom-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-b-2xl flex items-start justify-center">
        <span className="text-neutral-400 font-bold text-7xl md:text-9xl select-none -translate-y-[50%]">
          {isFlipping ? prevValue : value}
        </span>
      </div>

      <div
        className={`absolute top-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-t-2xl flex items-end justify-center transform-origin-bottom ${
          isFlipping ? "animate-flipTop" : ""
        }`}
        style={{ backfaceVisibility: "hidden", zIndex: 20 }}
      >
        <span className="text-neutral-400 font-bold text-7xl md:text-9xl select-none translate-y-[50%]">
          {isFlipping ? prevValue : value}
        </span>
      </div>

      <div
        className={`absolute bottom-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-b-2xl flex items-start justify-center transform-origin-top ${
          isFlipping ? "animate-flipBottom" : ""
        }`}
        style={{
          backfaceVisibility: "hidden",
          transform: isFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
          zIndex: 10,
        }}
      >
        <span className="text-neutral-400 font-bold text-7xl md:text-9xl select-none -translate-y-[50%]">
          {value}
        </span>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 md:h-1.5 bg-[#070707] z-30 shadow-inner pointer-events-none"></div>
    </div>
  );
}

export function Cronometro() {
  const { stopwatchTime, isStopwatchRunning, toggleStopwatch, resetStopwatch } =
    useTimer();

  // Formatação em HH:MM:SS inteiros (ex: "00", "05", "12")
  const h = Math.floor(stopwatchTime / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((stopwatchTime % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (stopwatchTime % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500">
      {/* TÍTULO OPCIONAL (Igual ao do Temporizador) */}
      <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm opacity-0 select-none">
        Cronômetro
      </p>

      {/* O RELÓGIO (FLIP CLOCK) PADRONIZADO */}
      <div className="flex items-center justify-center gap-2 md:gap-4 select-none">
        <TimeDisplay value={h} />
        <ClockSeparator />

        <TimeDisplay value={m} />
        <ClockSeparator hiddenOnMobile={true} />

        <div className="hidden sm:block">
          <TimeDisplay value={s} />
        </div>
      </div>

      {/* CONTROLES */}
      <div className="mt-16 flex items-center gap-6">
        <button
          onClick={toggleStopwatch}
          className={`w-14 h-14 rounded-full flex cursor-pointer items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl ${
            isStopwatchRunning ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          {isStopwatchRunning ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6" fill="currentColor" />
          )}
        </button>

        <button
          onClick={resetStopwatch}
          className="w-14 h-14 rounded-full cursor-pointer bg-white/5 text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all border border-white/10"
          title="Zerar Cronômetro"
        >
          <RotateCcw className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}
