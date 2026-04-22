import { YearInPixels } from "./YearInPixels";
import { InvestidasEstudo } from "./InvestidasEstudo"; // <-- Importe o novo componente
import { Grid2x2Check } from "lucide-react";

export default function YearInPixelsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in mt-6 fade-in duration-500 pb-16 px-4 xl:px-0">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Grid2x2Check className="w-8 h-8 text-emerald-500" />
          <h1 className="text-3xl font-black text-white">Year in Pixels</h1>
        </div>
        <p className="text-neutral-400 font-medium">
          Acompanhe a sua constância e intensidade de estudos ao longo de todo o
          ano.
        </p>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      {/* Usamos flex-col para mobile, e flex-row para telas muito grandes (xl) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* LADO ESQUERDO: GRELHA */}
        <div className="flex-1 w-full overflow-hidden">
          <YearInPixels />
        </div>

        {/* LADO DIREITO: DASHBOARD DE INVESTIDAS */}
        <div className="w-full xl:w-[320px] shrink-0 sticky top-6">
          <InvestidasEstudo />
        </div>
      </div>
    </div>
  );
}
