"use client";

import { useState, useEffect } from "react"; // Removido o useRef que não estava a ser usado
import { Play, Pause, RotateCcw } from "lucide-react";
import { ClockSeparator } from "./FlipDigit";
import { useTimer } from "@/contexts/TimerContext";

// Componente para o MODO EDIÇÃO (Input)
function TimeInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex flex-col items-center mt-5 justify-center bg-[#111111] rounded-2xl w-50 h-32 md:w-58 md:h-56 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
      <input
        type="text"
        maxLength={2}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        onBlur={() => {
          if (value.length === 1) onChange(`0${value}`);
          if (value === "") onChange("00");
        }}
        className="w-full h-full bg-transparent text-center text-neutral-400 font-bold text-7xl md:text-9xl outline-none placeholder:text-gray-800"
      />
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 md:h-1.5 bg-[#070707] z-10 shadow-inner pointer-events-none"></div>
    </div>
  );
}

// NOVO COMPONENTE COM ANIMAÇÃO FLIP 3D
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
      }, 500); // Duração exata da animação CSS (0.5s)
      return () => clearTimeout(timer);
    }
  }, [isFlipping]);

  return (
    <div className="relative flex flex-col items-center justify-center bg-[#111111] rounded-2xl w-50 h-32 md:w-58 md:h-56  transition-all perspective-1000">
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

      {/* LINHA DO MEIO (Eixo escuro) */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 md:h-1.5 bg-[#070707] z-30  pointer-events-none"></div>
    </div>
  );
}

export function Temporizador() {
  const {
    temporizadorTime,
    isTemporizadorRunning,
    isTemporizadorEditing,
    startTemporizador,
    pauseTemporizador,
    resetTemporizador,
  } = useTimer();

  const [inputH, setInputH] = useState("00");
  const [inputM, setInputM] = useState("00");
  const [inputS, setInputS] = useState("00");

  const handleStart = () => {
    if (isTemporizadorEditing) {
      const total =
        parseInt(inputH) * 3600 + parseInt(inputM) * 60 + parseInt(inputS);
      startTemporizador(total);
    } else {
      startTemporizador();
    }
  };

  const displayH = Math.floor(temporizadorTime / 3600)
    .toString()
    .padStart(2, "0");
  const displayM = Math.floor((temporizadorTime % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const displayS = (temporizadorTime % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500">
      {isTemporizadorEditing ? (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <TimeInput value={inputH} onChange={setInputH} placeholder="HH" />
            <div className="md:mt-5">
              <ClockSeparator />
            </div>
            <TimeInput value={inputM} onChange={setInputM} placeholder="MM" />
            <div className="md:mt-5">
              <ClockSeparator hiddenOnMobile={true} />
            </div>
            <div className="hidden sm:block">
              <TimeInput value={inputS} onChange={setInputS} placeholder="SS" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 md:mt-5">
          <div className="flex items-center justify-center gap-2 md:gap-4 select-none">
            <TimeDisplay value={displayH} />
            <ClockSeparator />
            <TimeDisplay value={displayM} />
            <ClockSeparator hiddenOnMobile={true} />
            <div className="hidden sm:block">
              <TimeDisplay value={displayS} />
            </div>
          </div>
        </div>
      )}

      {/* CONTROLES */}
      <div className="mt-16 flex items-center gap-6">
        <button
          onClick={isTemporizadorRunning ? pauseTemporizador : handleStart}
          className={`w-14 h-14 rounded-full cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
            isTemporizadorRunning
              ? "bg-black text-white shadow-white/10"
              : "bg-white text-black shadow-blue-500/20"
          }`}
        >
          {isTemporizadorRunning ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6" fill="currentColor" />
          )}
        </button>

        {!isTemporizadorEditing && (
          <button
            onClick={resetTemporizador}
            className="w-14 h-14 rounded-full cursor-pointer bg-white/5 text-white flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all border border-white/10"
            title="Zerar Temporizador"
          >
            <RotateCcw className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
