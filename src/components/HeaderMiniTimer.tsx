/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Pause, Eye, EyeOff } from "lucide-react";
import { useTimer } from "@/contexts/TimerContext";

export function HeaderMiniTimer() {
  const {
    activeTimerMode,
    stopwatchTime,
    isStopwatchRunning,
    toggleStopwatch,
    temporizadorTime,
    isTemporizadorRunning,
    pauseTemporizador,
    startTemporizador,
    pomodoroTime,
    isPomodoroRunning,
    pausePomodoro,
    startPomodoro,
    pomodoroPhase,
  } = useTimer();

  const [isVisible, setIsVisible] = useState(true);
  const [showPhaseAlert, setShowPhaseAlert] = useState(false);
  const [prevPhase, setPrevPhase] = useState(pomodoroPhase);

  if (pomodoroPhase !== prevPhase) {
    if (activeTimerMode === "pomodoro") {
      setShowPhaseAlert(true);
    }
    setPrevPhase(pomodoroPhase);
  }

  useEffect(() => {
    if (showPhaseAlert) {
      const timer = setTimeout(() => setShowPhaseAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPhaseAlert]);

  let currentTime = 0;
  let isRunning = false;
  let timerColor =
    "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300";
  let playBtnColor =
    "bg-[#009966]/10 text-[#009966] hover:bg-[#009966]/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30";
  let alertBadgeColor = "text-gray-500 dark:text-neutral-400";

  if (activeTimerMode === "temporizador") {
    currentTime = temporizadorTime;
    isRunning = isTemporizadorRunning;
    timerColor =
      "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300";
    playBtnColor =
      "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-neutral-500";
  } else if (activeTimerMode === "pomodoro") {
    currentTime = pomodoroTime;
    isRunning = isPomodoroRunning;

    if (pomodoroPhase === "break") {
      timerColor =
        "text-[#009966] hover:text-[#009966]/80 dark:text-emerald-500 dark:hover:text-emerald-400";
      playBtnColor =
        "bg-[#009966]/10 text-[#009966] hover:bg-[#009966]/20 dark:bg-emerald-500/20 dark:text-emerald-500 dark:hover:bg-emerald-500/30";
      alertBadgeColor = "text-[#009966] dark:text-emerald-400";
    } else {
      timerColor =
        "text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300";
      playBtnColor =
        "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-neutral-500";
      alertBadgeColor = "text-gray-400 dark:text-neutral-300";
    }
  } else {
    currentTime = stopwatchTime;
    isRunning = isStopwatchRunning;
  }

  const handleToggle = () => {
    if (activeTimerMode === "temporizador")
      isRunning ? pauseTemporizador() : startTemporizador();
    else if (activeTimerMode === "pomodoro")
      isRunning ? pausePomodoro() : startPomodoro();
    else toggleStopwatch();
  };

  const isActive = activeTimerMode !== "none" && (currentTime > 0 || isRunning);

  const h = Math.floor(currentTime / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((currentTime % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (currentTime % 60).toString().padStart(2, "0");

  return (
    <div
      className={`flex items-center group transition-all duration-500 ease-out ${
        isActive
          ? "opacity-100 scale-100 visible translate-y-0"
          : "opacity-0 scale-95 invisible -translate-y-2 pointer-events-none"
      }`}
    >
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`w-6 h-6 rounded-full flex items-center cursor-pointer justify-center opacity-0 group-hover:opacity-100 duration-300 transition-colors ${
          isVisible
            ? "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-white/20 dark:text-white dark:hover:bg-white/30"
        }`}
      >
        {isVisible ? (
          <Eye className="w-3 h-3" />
        ) : (
          <EyeOff className="w-3 h-3" />
        )}
      </button>

      <div className="relative flex items-center mx-3">
        <Link
          href="/aluno/timer"
          className={`flex items-center text-[13px] font-bold ${timerColor} transition-all duration-300 ${
            isVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="font-mono">
            {h !== "00" && `${h}:`}
            {m}:{s}
          </span>
        </Link>

        <div
          className={`absolute left-full ml-1.5 whitespace-nowrap text-[11px] font-bold tracking-wider uppercase pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            showPhaseAlert && isVisible
              ? "opacity-100 translate-x-0 scale-100 visible"
              : "opacity-0 translate-x-2 scale-95 invisible"
          } ${alertBadgeColor}`}
        >
          {pomodoroPhase === "break" ? "- Intervalo" : "- Foco"}
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`w-6 h-6 rounded-full flex items-center cursor-pointer justify-center opacity-0 group-hover:opacity-100 duration-300 transition-colors ${
          isRunning
            ? "bg-gray-100 text-gray-600 duration-500  hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            : playBtnColor
        }`}
      >
        {isRunning ? (
          <Pause className="w-3 h-3" fill="currentColor" />
        ) : (
          <Play className="w-3 h-3" fill="currentColor" />
        )}
      </button>
    </div>
  );
}
