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
        <span className="text-gray-500 dark:text-neutral-400 font-medium uppercase tracking-widest text-sm transition-colors duration-300">
          Hora Atual
        </span>
      );
    if (activeMode === "cronometro")
      return (
        <span className="text-gray-500 dark:text-neutral-400 font-medium uppercase tracking-widest text-sm transition-colors duration-300">
          Cronômetro
        </span>
      );

    if (activeMode === "temporizador") {
      return isTemporizadorEditing ? (
        <span className="text-gray-500 dark:text-neutral-400 font-medium uppercase tracking-widest text-sm transition-colors duration-300">
          Defina o Tempo
        </span>
      ) : (
        <span className="text-gray-500 dark:text-neutral-400 font-medium uppercase tracking-widest text-sm transition-colors duration-300">
          Contagem Decrescente
        </span>
      );
    }

    if (activeMode === "pomodoro") {
      return isPomodoroEditing ? (
        <span className="text-gray-500 dark:text-neutral-400 font-medium uppercase tracking-widest text-sm transition-colors duration-300">
          Defina o Pomodoro
        </span>
      ) : (
        <span
          className={`font-medium uppercase tracking-widest text-sm transition-colors duration-300 ${pomodoroPhase === "focus" ? "text-gray-400 dark:text-neutral-500" : "text-[#009966] dark:text-emerald-500"}`}
        >
          {pomodoroPhase === "focus"
            ? `Foco - Ciclo ${pomodoroCurrentCycle}/${pomodoroTotalCycles}`
            : `Pausa - Ciclo ${pomodoroCurrentCycle}/${pomodoroTotalCycles}`}
        </span>
      );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-8 md:pt-12 px-4 font-sans transition-colors duration-300">
      <div className="h-6 mb-6 flex items-center justify-center">
        {renderTitle()}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-wrap justify-center gap-2 p-1.5 h-14 bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-xl mb-16 border border-gray-200 dark:border-white/10 transition-colors duration-300">
          <button
            onClick={() => setActiveMode("relogio")}
            className={`flex items-center gap-2 px-4 cursor-pointer py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "relogio"
                ? "bg-white text-gray-900 shadow-sm dark:shadow-none dark:bg-white dark:text-black"
                : "text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" /> Hora Atual
          </button>
          <button
            onClick={() => setActiveMode("cronometro")}
            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "cronometro"
                ? "bg-white text-gray-900 shadow-sm dark:shadow-none dark:bg-white dark:text-black"
                : "text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Timer className="w-4 h-4" /> Cronômetro
          </button>
          <button
            onClick={() => setActiveMode("temporizador")}
            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "temporizador"
                ? "bg-white text-gray-900 shadow-sm dark:shadow-none dark:bg-white dark:text-black"
                : "text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Hourglass className="w-4 h-4" /> Temporizador
          </button>
          <button
            onClick={() => setActiveMode("pomodoro")}
            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-xl font-bold text-sm transition-all duration-300 ${
              activeMode === "pomodoro"
                ? "bg-white text-gray-900 shadow-sm dark:shadow-none dark:bg-white dark:text-black"
                : "text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Coffee className="w-4 h-4" /> Pomodoro
          </button>
        </div>
        <Link
          href="/aluno/timer/tela-cheia"
          target="_blank"
          className="flex items-center gap-2 bg-white hover:bg-gray-50 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 h-14 px-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white transition-all duration-300 shadow-sm dark:shadow-lg"
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
