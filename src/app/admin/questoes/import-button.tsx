"use client";

import { Upload, Loader2, FileJson } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner"; // Assumindo que você usa sonner para notificações
import { importarQuestoesJson } from "../../../actions/questoes";

export function ImportJsonButton() {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica se é um arquivo JSON
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Formato inválido", {
        description: "Por favor, envie apenas arquivos .json",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Lê o conteúdo do arquivo no navegador do cliente
      const fileText = await file.text();

      // Envia o texto gigante para o servidor processar
      const result = await importarQuestoesJson(fileText);

      if (result.error) {
        toast.error("Erro na importação", { description: result.error });
      } else {
        toast.success("Sucesso Absoluto!", {
          description: `${result.count} questões foram adicionadas ao banco de dados.`,
        });
      }
    } catch (error) {
      toast.error("Erro", { description: "Falha ao ler o arquivo." });
    } finally {
      setIsImporting(false);
      // Limpa o input para permitir enviar o mesmo arquivo de novo se necessário
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".json,application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" // Escondemos o input feio padrão do HTML
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm font-bold rounded-lg hover:bg-neutral-800 transition shadow-sm disabled:opacity-50"
      >
        {isImporting ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        ) : (
          <FileJson className="w-4 h-4 text-emerald-500" />
        )}
        {isImporting ? "Importando..." : "Importar JSON"}
      </button>
    </div>
  );
}
