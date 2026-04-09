"use client";

import { useState, useEffect } from "react";
import { ClockSeparator } from "./FlipDigit";
import { Globe, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// COMPONENTE COM ANIMAÇÃO FLIP 3D E SUPORTE A AM/PM
function TimeDisplay({ value, period }: { value: string; period?: string }) {
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
    <div className="relative flex flex-col items-center justify-center bg-[#111111] rounded-2xl w-50 h-32 md:w-58 md:h-56 transition-all perspective-1000">
      {/* AM / PM INDICATOR */}
      {period && (
        <span className="absolute bottom-3 left-4 text-neutral-600 font-bold text-xs md:text-sm z-40 select-none">
          {period}
        </span>
      )}

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
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 md:h-1.5 bg-[#070707] z-30 pointer-events-none"></div>
    </div>
  );
}

export function Relogio() {
  const [format, setFormat] = useState<"24h" | "12h">("24h");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  const [time, setTime] = useState({ h: "00", m: "00", s: "00", period: "" });

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();

      // Usamos en-GB para 24h (para evitar que meia noite seja "24") e en-US para 12h
      const locale = format === "12h" ? "en-US" : "en-GB";

      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: format === "12h",
      };

      const formatter = new Intl.DateTimeFormat(locale, options);
      const parts = formatter.formatToParts(date);

      let h = "00",
        m = "00",
        s = "00",
        p = "";

      parts.forEach(({ type, value }) => {
        if (type === "hour") h = value;
        if (type === "minute") m = value;
        if (type === "second") s = value;
        if (type === "dayPeriod") p = value;
      });

      setTime({ h, m, s, period: p });
    }, 1000);

    return () => clearInterval(interval);
  }, [format, timezone]);

  // Nomes amigáveis para exibir no botão do Dropdown
  const timezoneNames: Record<string, string> = {
    "America/Sao_Paulo": "Brasília (UTC-3)",
    "Europe/London": "Londres (GMT 0)",
    "Asia/Tokyo": "Tóquio (GMT+9)",
  };

  return (
    <div className="flex flex-col items-center animate-in md:mt-5 fade-in duration-500">
      {/* OS RELÓGIOS */}
      <div className="flex items-center justify-center gap-2 md:gap-4 select-none">
        <TimeDisplay value={time.h} period={time.period} />
        <ClockSeparator />
        <TimeDisplay value={time.m} />
        <ClockSeparator hiddenOnMobile={true} />
        <div className="hidden sm:block">
          <TimeDisplay value={time.s} />
        </div>
      </div>

      {/* CONFIGURAÇÕES / DROPDOWNS (Mantendo a estética escura e limpa) */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* DROPDOWN FUSO HORÁRIO */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-2xl text-sm font-bold text-neutral-400 hover:text-white transition-colors outline-none cursor-pointer">
            <Globe className="w-4 h-4" />
            {timezoneNames[timezone]}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111111] border border-[#222] text-neutral-400 rounded-xl p-1">
            <DropdownMenuItem
              onClick={() => setTimezone("America/Sao_Paulo")}
              className="cursor-pointer font-medium hover:bg-white/10 hover:text-white rounded-lg px-3 py-2"
            >
              Brasília (UTC-3)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTimezone("Europe/London")}
              className="cursor-pointer font-medium hover:bg-white/10 hover:text-white rounded-lg px-3 py-2"
            >
              Londres (GMT 0)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTimezone("Asia/Tokyo")}
              className="cursor-pointer font-medium hover:bg-white/10 hover:text-white rounded-lg px-3 py-2"
            >
              Tóquio (GMT+9)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* DROPDOWN FORMATO DE HORA */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-2xl text-sm font-bold text-neutral-400 hover:text-white transition-colors outline-none cursor-pointer">
            <Clock className="w-4 h-4" />
            Formato: {format === "24h" ? "24 Horas" : "12 Horas"}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111111] border border-[#222] text-neutral-400 rounded-xl p-1">
            <DropdownMenuItem
              onClick={() => setFormat("24h")}
              className="cursor-pointer font-medium hover:bg-white/10 hover:text-white rounded-lg px-3 py-2"
            >
              24 Horas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFormat("12h")}
              className="cursor-pointer font-medium hover:bg-white/10 hover:text-white rounded-lg px-3 py-2"
            >
              12 Horas (AM / PM)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
