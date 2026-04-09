"use client";

import { useState, useEffect } from "react";
import { useTimer } from "@/contexts/TimerContext";
import { Maximize, Minimize, ArrowLeft } from "lucide-react";

function ClockSeparator() {
  return (
    <div className="flex flex-col gap-4 md:gap-16 mx-2 md:mx-4">
      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-neutral-800 "></div>
      <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-neutral-800 "></div>
    </div>
  );
}

function TimeDisplayHuge({ value }: { value: string }) {
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
    <div className="relative flex flex-col items-center justify-center bg-[#000000] rounded-3xl w-40 h-32 md:w-64 md:h-56 lg:w-80 lg:h-72 transition-all perspective-1000">
      <div className="absolute top-0 w-full h-1/2 overflow-hidden bg-[#070707] rounded-t-3xl flex items-end justify-center">
        <span className="text-neutral-400 font-bold text-8xl md:text-[10rem] lg:text-[14rem] select-none translate-y-[50%]">
          {value}
        </span>
      </div>
      <div className="absolute bottom-0 w-full h-1/2 overflow-hidden bg-[#070707] rounded-b-3xl flex items-start justify-center">
        <span className="text-neutral-400 font-bold text-8xl md:text-[10rem] lg:text-[14rem] select-none -translate-y-[50%]">
          {isFlipping ? prevValue : value}
        </span>
      </div>
      <div
        className={`absolute top-0 w-full h-1/2 overflow-hidden bg-[#070707] rounded-t-3xl flex items-end justify-center transform-origin-bottom ${isFlipping ? "animate-flipTop" : ""}`}
        style={{ backfaceVisibility: "hidden", zIndex: 20 }}
      >
        <span className="text-neutral-400 font-bold text-8xl md:text-[10rem] lg:text-[14rem] select-none translate-y-[50%]">
          {isFlipping ? prevValue : value}
        </span>
      </div>
      <div
        className={`absolute bottom-0 w-full h-1/2 overflow-hidden bg-[#070707] rounded-b-3xl flex items-start justify-center transform-origin-top ${isFlipping ? "animate-flipBottom" : ""}`}
        style={{
          backfaceVisibility: "hidden",
          transform: isFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
          zIndex: 10,
        }}
      >
        <span className="text-neutral-400 font-bold text-8xl md:text-[10rem] lg:text-[14rem] select-none -translate-y-[50%]">
          {value}
        </span>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 md:h-2.5 bg-[#040404] z-30 shadow-inner pointer-events-none"></div>
    </div>
  );
}

export default function FullscreenTimerPage() {
  const {
    activeTimerMode,
    stopwatchTime,
    temporizadorTime,
    pomodoroTime,
    pomodoroPhase,
  } = useTimer();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [realTime, setRealTime] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setRealTime({
        h: now.getHours().toString().padStart(2, "0"),
        m: now.getMinutes().toString().padStart(2, "0"),
        s: now.getSeconds().toString().padStart(2, "0"),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      document.body.style.cursor = "default";
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
        document.body.style.cursor = "none";
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
      document.body.style.cursor = "default";
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  let currentTime = 0;
  let title = "Relógio Atual";
  let titleColor = "text-neutral-500";

  if (activeTimerMode === "cronometro") {
    currentTime = stopwatchTime;
    title = "Cronômetro";
    titleColor = "text-emerald-500";
  } else if (activeTimerMode === "temporizador") {
    currentTime = temporizadorTime;
    title = "Contagem Decrescente";
    titleColor = "text-blue-500";
  } else if (activeTimerMode === "pomodoro") {
    currentTime = pomodoroTime;
    title = pomodoroPhase === "focus" ? "" : "Intervalo";
    titleColor =
      pomodoroPhase === "focus" ? "text-neutral-500" : "text-emerald-500";
  }
  const h =
    activeTimerMode === "none"
      ? realTime.h
      : Math.floor(currentTime / 3600)
          .toString()
          .padStart(2, "0");

  const m =
    activeTimerMode === "none"
      ? realTime.m
      : Math.floor((currentTime % 3600) / 60)
          .toString()
          .padStart(2, "0");

  const s =
    activeTimerMode === "none"
      ? realTime.s
      : (currentTime % 60).toString().padStart(2, "0");

  return (
    <main
      data-lenis-prevent="true"
      className="fixed inset-0 z-9999 bg-[#040404] flex flex-col items-center justify-center font-sans overflow-hidden"
    >
      <div
        className={`absolute top-0 left-0 w-full p-6 flex justify-between items-center transition-opacity duration-300 z-50 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-white/5 px-4 py-2.5 rounded-xl font-bold border border-white/10 hover:bg-white/10 backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Fechar Aba
        </button>

        <span className="text-neutral-400 font-medium">
          Pare o mouse para sumir.
        </span>

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-white/5 px-4 py-2.5 rounded-xl font-bold border border-white/10 hover:bg-white/10 backdrop-blur-md cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
          {isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
        </button>
      </div>
      <div
        className={`mb-12 text-sm md:text-xl font-bold tracking-[0.3em] uppercase ${titleColor} transition-opacity duration-1000 ${showControls ? "opacity-100" : "opacity-30"}`}
      >
        {title}
      </div>

      <div className="flex items-center justify-center gap-2 md:gap-6 select-none">
        {(h !== "00" || activeTimerMode === "none") && (
          <>
            <TimeDisplayHuge value={h} />
            <ClockSeparator />
          </>
        )}
        <TimeDisplayHuge value={m} />
        <ClockSeparator />
        <TimeDisplayHuge value={s} />
      </div>
    </main>
  );
}
