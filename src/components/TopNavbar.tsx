// src/components/TopNavbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import UpdatesNotification from "./UpdatesNotification";
import UserNav from "./UserNav";
import Grainient from "@/components/Grainient";

export default function TopNavbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-90 flex flex-col">
      {/* --- BANNER (NOTICE) --- */}
      <div className="relative flex h-9 items-center justify-center overflow-hidden bg-neutral-950 px-4">
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

      <header className="flex h-14 px-4 w-full justify-between items-center border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-md transition-all duration-300">
        <div>
          <Link
            className="flex items-center justify-center hover:opacity-80 transition-opacity w-full"
            href="/"
          >
            <Image
              className=""
              src="/logo.svg"
              width={50}
              height={50}
              alt={""}
            />
            <span className="text-xl font-bold text-white tracking-tight leading-tight">
              +Aprovado
            </span>
          </Link>
        </div>
        <div className="flex w-full justify-end gap-4 items-center">
          <UpdatesNotification />

          <UserNav />

          <SearchBar />

          <div className=" h-6 border-r border-neutral-800"></div>

          <button className="inline-flex items-center justify-center gap-2 bg-neutral-100 hover:ring-2 active:scale-95 ring-neutral-300 duration-300 text-xs text-neutral-800 px-4 cursor-pointer py-2 rounded-xl font-bold  transition-all">
            Apoiar Projeto
          </button>
        </div>
      </header>
    </div>
  );
}
