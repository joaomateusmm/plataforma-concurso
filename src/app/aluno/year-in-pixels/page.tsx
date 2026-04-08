import { YearInPixels } from "./YearInPixels"; // Ajusta o caminho do import
import { Grid2x2Check } from "lucide-react";

export default function YearInPixelsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in mt-6 fade-in duration-500">
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

      <YearInPixels />

    </div>
  );
}
