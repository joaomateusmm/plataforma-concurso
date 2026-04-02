// src/components/TopNavbar.tsx
"use client";

import UserNav from "./UserNav";
import Grainient from "@/components/Grainient";

export default function TopNavbar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* --- BANNER (NOTICE) --- */}
      <div className="relative flex h-9 items-center justify-center overflow-hidden bg-neutral-950 px-4">
        {/* BACKGROUND: Grainient */}
        <div className="absolute inset-0 z-0 opacity-70">
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
          <span className="flex items-center gap-1 text-white font-medium">
            <span className="font-sans">
              <a className="text-neutral-900 font-bold">
                Promoção de inauguração!
              </a>{" "}
              Adquira todas as funções da plataforma por{" "}
              <a className="text-neutral-900 font-bold">50%</a> do valor! Válido
              até 06/06.
            </span>
          </span>
        </div>
      </div>

      {/* --- HEADER --- */}
      {/* O Header fica imediatamente abaixo do Notice, herda a mesma largura e ambos têm position fixed pelo contêiner pai */}
      <header className="flex h-14 w-full items-center justify-end border-b border-neutral-800 bg-neutral-950/60 px-6 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </header>
    </div>
  );
}
