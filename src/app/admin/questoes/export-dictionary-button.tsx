"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportarDicionarioIds } from "../../../actions/questoes";

export function ExportDictionaryButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Busca os dados atualizados do servidor
      const data = await exportarDicionarioIds();

      // 2. Transforma o objeto JavaScript num texto JSON formatado (com espaços)
      const jsonString = JSON.stringify(data, null, 2);

      // 3. Cria um arquivo virtual na memória do navegador
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      // 4. Cria um link invisível e simula um clique para forçar o download
      const a = document.createElement("a");
      a.href = url;
      a.download = "dicionario-ids-concursos.json";
      document.body.appendChild(a);
      a.click();

      // 5. Limpa a memória
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Dicionário exportado!", {
        description: "Envie este arquivo para o seu Gem especialista.",
      });
    } catch (error) {
      toast.error("Erro", { description: "Falha ao exportar os IDs." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center text-center justify-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm font-bold rounded-lg hover:bg-neutral-800 transition shadow-sm disabled:opacity-50"
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
