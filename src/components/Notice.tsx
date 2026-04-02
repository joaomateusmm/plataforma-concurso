"use client";

import React from "react";
import Grainient from "@/components/Grainient";

export default function Banner() {
  return (
    <div className="fixed top-0 right-0 left-0 flex z-99 h-9 items-center justify-center overflow-hidden bg-neutral-950 px-4">
      {/* --- BACKGROUND: Grainient --- */}
      <div className="absolute inset-0 z-0 opacity-70">
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <Grainient
            color1="#9effa5" // Prata Claro
            color2="#07ab12" // Cinza Médio
            color3="#0f4700" // Preto Profundo
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
  );
}
