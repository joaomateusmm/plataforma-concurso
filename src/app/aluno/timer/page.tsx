"use client";

import { useState } from "react";
import { Timer, Clock, Hourglass, Coffee, MonitorUp } from "lucide-react";
import { Cronometro } from "./components/Cronometro";
import { Temporizador } from "./components/Temporizador";
import { Pomodoro } from "./components/Pomodoro";
import { useTimer } from "@/contexts/TimerContext";
import { Relogio } from "./components/Relogio";
import Link from "next/link"; 

type Mode = "relogio" | "cronometro" | "temporizador" | "pomodoro";

export default function FlipClockPage() {
  const [activeMode, setActiveMode] = useState<Mode>("cronometro");

  const {
    isTemporizadorEditing,
    isPomodoroEditing,
    pomodoroPhase,
    pomodoroCurrentCycle,
    pomodoroTotalCycles,
  } = useTimer();

  const renderTitle = () => {
    if (activeMode === "relogio")
      return (
        <span className="text-neutral-400 font-medium uppercase tracking-widest text-sm">
          Hora Atual
        </span>
      );
    if (activeMode === "cronometro")
      return (
        <span className="text-neutral-400 font-medium uppercase tracking-widest text-sm">
          Cronômetro
        </span>
      );

    if (activeMode === "temporizador") {
      return isTemporizadorEditing ? (
        <span className="text-neutral-400 font-medium uppercase tracking-widest text-sm">
          Defina o Tempo
        </span>
      ) : (
        <span className="text-neutral-400 font-medium uppercase tracking-widest text-sm">
          Contagem Decrescente
        </span>
      );
    }

    if (activeMode === "pomodoro") {
      return isPomodoroEditing ? (
        <span className="text-neutral-400 font-medium uppercase tracking-widest text-sm">
          Defina o Pomodoro
        </span>
      ) : (
        <span
          className={` font-medium uppercase tracking-widest text-sm ${pomodoroPhase === "focus" ? "text-neutral-500" : "text-emerald-500"}`}
        >
          {pomodoroPhase === "focus"
            ? `Foco - Ciclo ${pomodoroCurrentCycle}/${pomodoroTotalCycles}`
            : `Pausa - Ciclo ${pomodoroCurrentCycle}/${pomodoroTotalCycles}`}
        </span>
      );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 md:pt-12 px-4 font-sans">
      <div className="h-6 mb-6 flex items-center justify-center">
        {renderTitle()}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-wrap justify-center gap-2 p-1.5 h-14 bg-white/5 backdrop-blur-md rounded-xl mb-16 border border-white/10">
          <button
            onClick={() => setActiveMode("relogio")}
            className={`flex items-center gap-2 px-4 cursor-pointer py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "relogio"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" /> Hora Atual
          </button>
          <button
            onClick={() => setActiveMode("cronometro")}
            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "cronometro"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Timer className="w-4 h-4" /> Cronômetro
          </button>
          <button
            onClick={() => setActiveMode("temporizador")}
            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "temporizador"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Hourglass className="w-4 h-4" /> Temporizador
          </button>
          <button
            onClick={() => setActiveMode("pomodoro")}
            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "pomodoro"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Coffee className="w-4 h-4" /> Pomodoro
          </button>
        </div>
        <Link
          href="/aluno/timer/tela-cheia"
          target="_blank" // Abre numa nova aba para o aluno poder arrastar para outro monitor!
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 h-14 px-3 rounded-xl text-sm font-bold text-neutral-400 hover:text-white transition-all shadow-lg"
        >
          <MonitorUp className="w-4 h-4" />
          <span className="hidden sm:inline">Modo Tela Cheia</span>
        </Link>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DOS COMPONENTES */}
      {activeMode === "cronometro" && <Cronometro />}
      {activeMode === "relogio" && <Relogio />}
      {activeMode === "temporizador" && <Temporizador />}
      {activeMode === "pomodoro" && <Pomodoro />}
    </main>
  );
}
