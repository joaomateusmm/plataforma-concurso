"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
// IMPORTANTE: Ajuste o caminho da importação para onde você colocou a função acima!
import { exportarMateriasEAssuntos } from "../../../actions/cadastros";

export function ExportMateriasButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Busca os dados atualizados do servidor
      const data = await exportarMateriasEAssuntos();

      // 2. Transforma o objeto num texto JSON formatado
      const jsonString = JSON.stringify(data, null, 2);

      // 3. Cria um arquivo virtual
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      // 4. Força o download
      const a = document.createElement("a");
      a.href = url;
      a.download = "dicionario-materias-assuntos.json";
      document.body.appendChild(a);
      a.click();

      // 5. Limpa a memória
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("JSON exportado com sucesso!", {
        description: "As matérias e assuntos foram baixados.",
      });
    } catch (error) {
      toast.error("Erro", { description: "Falha ao exportar o JSON." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center text-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
      ) : (
        <Download className="w-4 h-4 text-emerald-500" />
      )}
      {isExporting ? "Gerando..." : "Baixar JSON"}
    </button>
  );
}
