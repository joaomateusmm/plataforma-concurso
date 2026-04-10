// src/components/TopNavbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import UpdatesNotification from "./UpdatesNotification";
import UserNav from "./UserNav";
import Grainient from "@/components/Grainient";
import { HeaderMiniTimer } from "./HeaderMiniTimer";
import { ThemeToggle } from "./ThemeToggle";

export default function TopNavbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-90 flex flex-col">
      {/* --- BANNER (NOTICE) --- */}
      <div className="relative flex h-9 items-center justify-center overflow-hidden bg-neutral-900 dark:bg-neutral-950 px-4 transition-colors duration-300">
        {/* BACKGROUND: Grainient */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <Grainient
              color1="#9effa5"
              color2="#07ab12"
              color3="#0f4700"
              timeSpeed={1}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm md:text-[13px]">
          <span className="flex items-center gap-1 text-white/80 font-medium">
            <span className="font-sans">
              <a className="font-bold text-white">Promoção de inauguração!</a>{" "}
              Adquira todas as funções da plataforma por{" "}
              <a className=" font-bold text-white">50%</a> do valor! Válido até
              06/06.
            </span>
          </span>
        </div>
      </div>

      {/* ADICIONADO "relative" AQUI NO HEADER */}
      <header className="relative flex h-14 px-4 w-full justify-between items-center border-b border-gray-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 backdrop-blur-md transition-all duration-300">
        {/* LADO ESQUERDO: Logo */}
        <div className="flex gap-12 ml-4">
          <Link
            className="flex items-center justify-center hover:brightness-120 duration-200 w-full"
            href="/"
          >
            <Image
              className="mr-2"
              src="/logo.svg"
              width={35}
              height={35}
              alt="Logo +Aprovado"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight transition-colors duration-300">
              +Aprovado
            </span>
          </Link>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <HeaderMiniTimer />
        </div>

        <div className="flex justify-end gap-4 items-center">
          <ThemeToggle />
          <UpdatesNotification />
          <UserNav />
          <SearchBar />
          <div className="h-6 border-r border-gray-200 dark:border-neutral-800 transition-colors duration-300"></div>
          <button className="inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-neutral-100 hover:ring-2 active:scale-95 ring-gray-300 dark:ring-neutral-300 duration-300 text-xs text-white dark:text-neutral-800 px-4 cursor-pointer py-2 rounded-xl font-bold transition-all">
            Apoiar Projeto
          </button>
        </div>
      </header>
    </div>
  );
}
