// src/app/admin/bancas/ImportBancasJson.tsx
"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { salvarBanca } from "@/actions/cadastros"; // Usaremos a action que já existe!

export function ImportBancasJson() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validação básica do formato (espera um array de strings ou objetos)
      if (!Array.isArray(jsonData)) {
        throw new Error(
          "O arquivo JSON deve conter uma lista (array) de bancas.",
        );
      }

      let countSalvos = 0;

      // Itera sobre o JSON para salvar cada banca
      for (const item of jsonData) {
        const nomeDaBanca =
          typeof item === "string" ? item : item.nome || item.banca;

        if (
          nomeDaBanca &&
          typeof nomeDaBanca === "string" &&
          nomeDaBanca.trim() !== ""
        ) {
          const fd = new FormData();
          fd.append("nome", nomeDaBanca.trim());
          await salvarBanca(fd);
          countSalvos++;
        }
      }

      if (countSalvos > 0) {
        toast.success(`${countSalvos} bancas importadas com sucesso!`);
      } else {
        toast.warning("Nenhuma banca válida encontrada no JSON.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Erro ao ler JSON", {
        description:
          error.message ||
          "Verifique se o arquivo está formatado corretamente.",
      });
    } finally {
      setIsUploading(false);
      // Limpa o input para poder enviar o mesmo arquivo de novo, se quiser
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept="application/json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center text-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 text-sm font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
        title="Importar bancas via arquivo JSON"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
        ) : (
          <UploadCloud className="w-4 h-4 text-emerald-500" />
        )}
        Importar JSON
      </button>
    </>
  );
}
