"use client";

import React from "react";

export default function Banner() {
  return (
    <div className="fixed top-0 right-0 left-0 flex h-12 items-center justify-center overflow-hidden border-b border-neutral-100 bg-neutral-50 px-4">
      <div className="relative z-10 flex items-center gap-3 text-[11px] font-medium text-neutral-400 md:text-[13px]">
        <span className="flex items-center gap-1 text-black">
          <span>
            Pronto para dar mais um passo rumo à sua aprovação? O seu próximo
            simulado está à sua espera.
          </span>
        </span>
      </div>
    </div>
  );
}
