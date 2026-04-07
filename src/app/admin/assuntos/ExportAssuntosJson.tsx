// src/app/admin/assuntos/ExportAssuntosJson.tsx
"use client";

import { Download } from "lucide-react";

export function ExportAssuntosJson({
  listaAssuntos,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listaAssuntos: any[];
}) {
  const handleDownload = () => {
    const dadosParaIA = listaAssuntos.map((assunto) => ({
      id: assunto.id,
      materia: assunto.materiaNome,
      assunto: assunto.nome,
    }));

    const jsonString = JSON.stringify(dadosParaIA, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "base_conhecimento_ia.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
      title="Baixar lista de IDs para treinar a IA"
    >
      <Download className="w-4 h-4" />
      Baixar JSON
    </button>
  );
}
