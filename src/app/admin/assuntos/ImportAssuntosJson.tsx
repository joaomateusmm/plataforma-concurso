"use client";

import { Loader2, FileJson } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { importarAssuntosJson } from "../../../actions/cadastros";

export function ImportAssuntosJson() {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Formato inválido", {
        description: "Por favor, envie apenas arquivos .json",
      });
      return;
    }

    setIsImporting(true);

    try {
      const fileText = await file.text();
      const result = await importarAssuntosJson(fileText);

      if (result.error) {
        toast.error("Erro na importação", { description: result.error });
      } else {
        toast.success("Importação Concluída!", {
          description: `${result.count} assuntos foram adicionados ao banco de dados com sucesso.`,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro", { description: "Falha ao ler o arquivo." });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        accept=".json,application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isImporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        ) : (
          <FileJson className="w-4 h-4 text-indigo-500" />
        )}
        {isImporting ? "Processando..." : "Importar JSON"}
      </button>
    </div>
  );
}
