"use client";

// Este componente desenha um único dígito estilo "Flip Clock"
export function FlipDigit({ digit }: { digit: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center bg-[#151515] rounded-2xl text-gray-100 font-bold text-7xl md:text-9xl w-24 h-32 md:w-40 md:h-56 shadow-2xl border border-white/5">
      <div className="absolute top-0 w-full h-[49.5%] bg-[#1e1e1e] rounded-t-2xl overflow-hidden flex items-end justify-center pb-0">
        <span className="translate-y-[50%] select-none">{digit}</span>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 md:h-1.5 bg-black z-10 shadow-inner"></div>
      <div className="absolute bottom-0 w-full h-[49.5%] bg-[#181818] rounded-b-2xl overflow-hidden flex items-start justify-center">
        <span className="-translate-y-[50%] select-none">{digit}</span>
      </div>
    </div>
  );
}

export function ClockSeparator({
  hiddenOnMobile = false,
}: {
  hiddenOnMobile?: boolean;
}) {
  return (
    <div
      className={`${hiddenOnMobile ? "hidden sm:flex" : "flex"} flex-col gap-10 mx-1 md:mx-3`}
    >
      <div className="w-5 h-5 bg-[#2D2D2D] rounded-full"></div>
      <div className="w-5 h-5 bg-[#2D2D2D] rounded-full"></div>
    </div>
  );
}
