"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { ClockSeparator } from "./FlipDigit";
import { useTimer } from "@/contexts/TimerContext";

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
    <div className="relative flex flex-col items-center justify-center bg-[#111111] rounded-2xl w-50 h-32 md:w-58 md:h-56 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
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

function TimeDisplay({ value }: { value: string }) {
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  if (value !== prevValue && !isFlipping) {
    setIsFlipping(true);
    setPrevValue(value);
  }

  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => setIsFlipping(false), 500);
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
        className={`absolute top-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-t-2xl flex items-end justify-center transform-origin-bottom ${isFlipping ? "animate-flipTop" : ""}`}
        style={{ backfaceVisibility: "hidden", zIndex: 20 }}
      >
        <span className="text-neutral-400 font-bold text-7xl md:text-9xl select-none translate-y-[50%]">
          {isFlipping ? prevValue : value}
        </span>
      </div>
      <div
        className={`absolute bottom-0 w-full h-1/2 overflow-hidden bg-[#111111] rounded-b-2xl flex items-start justify-center transform-origin-top ${isFlipping ? "animate-flipBottom" : ""}`}
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
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 md:h-1.5 bg-[#070707] z-30  pointer-events-none"></div>
    </div>
  );
}

export function Pomodoro() {
  const {
    pomodoroTime,
    isPomodoroRunning,
    isPomodoroEditing,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
  } = useTimer();

  const [inputH, setInputH] = useState("00");
  const [inputM, setInputM] = useState("25");
  const [inputS, setInputS] = useState("00");

  const [breakM, setBreakM] = useState("05");
  const [cycles, setCycles] = useState("4");

  const handleStart = () => {
    if (isPomodoroEditing) {
      const focusSecs =
        parseInt(inputH) * 3600 + parseInt(inputM) * 60 + parseInt(inputS);
      const breakSecs = parseInt(breakM) * 60;
      const totalCycles = parseInt(cycles);
      startPomodoro(focusSecs, breakSecs, totalCycles);
    } else {
      startPomodoro();
    }
  };

  const displayH = Math.floor(pomodoroTime / 3600)
    .toString()
    .padStart(2, "0");
  const displayM = Math.floor((pomodoroTime % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const displayS = (pomodoroTime % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center animate-in md:mt-5 fade-in duration-500">
      {/* OS RELÓGIOS COMEÇAM LOGO AQUI (SEM TEXTO ACIMA DELES) */}
      <div className="flex items-center justify-center gap-2 md:gap-4 select-none">
        {isPomodoroEditing ? (
          <>
            <TimeInput value={inputH} onChange={setInputH} placeholder="HH" />
            <ClockSeparator />
            <TimeInput value={inputM} onChange={setInputM} placeholder="MM" />
            <ClockSeparator hiddenOnMobile={true} />
            <div className="hidden sm:block">
              <TimeInput value={inputS} onChange={setInputS} placeholder="SS" />
            </div>
          </>
        ) : (
          <>
            <TimeDisplay value={displayH} />
            <ClockSeparator />
            <TimeDisplay value={displayM} />
            <ClockSeparator hiddenOnMobile={true} />
            <div className="hidden sm:block">
              <TimeDisplay value={displayS} />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col items-center">
        {isPomodoroEditing && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center gap-2 ">
              <span className="flex items-center text-center gap-2 text-xs font-bold text-neutral-500 uppercase">
                Tempo de <br></br>Intervalo
              </span>
              <input
                type="text"
                value={breakM}
                onChange={(e) => setBreakM(e.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  if (breakM === "") setBreakM("05");
                }}
                className="bg-transparent text-white/70 focus:text-white font-bold text-3xl w-16 text-center outline-none border-b border-neutral-700 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-col items-center gap-2 ">
              <span className="flex items-center text-center gap-2 text-xs font-bold text-neutral-500 uppercase">
                {" "}
                Laços<br></br>(Ciclos)
              </span>
              <input
                type="text"
                value={cycles}
                onChange={(e) => setCycles(e.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  if (cycles === "") setCycles("4");
                }}
                className="bg-transparent text-white/70 focus:text-white font-bold text-3xl w-16 text-center outline-none border-b border-neutral-700 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        )}

        <div className="mt-12 flex items-center gap-6">
          <button
            onClick={isPomodoroRunning ? pausePomodoro : handleStart}
            className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 duration-300 ${isPomodoroRunning ? "bg-black text-white " : "bg-white text-black"}`}
          >
            {isPomodoroRunning ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6" fill="currentColor" />
            )}
          </button>

          {!isPomodoroEditing && (
            <button
              onClick={resetPomodoro}
              className="w-14 h-14 rounded-full bg-white/5 cursor-pointer text-white flex items-center justify-center hover:bg-white/10 active:scale-95 duration-300 border border-white/10"
              title="Zerar Pomodoro"
            >
              <RotateCcw className="w-5 h-5 text-neutral-400 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
