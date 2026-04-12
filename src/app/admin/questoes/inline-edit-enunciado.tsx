"use client";

import { useState } from "react";
import { Check, Loader2, SquarePen, X } from "lucide-react";
import { toast } from "sonner";
import { atualizarEnunciadoRapido } from "../../../actions/questoes";

export function InlineEditEnunciado({
  id,
  initialText,
}: {
  id: number;
  initialText: string;
}) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isChanged = text !== initialText;

  const handleSave = async () => {
    if (!text.trim()) return toast.error("O enunciado não pode ficar vazio.");

    setIsSaving(true);
    const res = await atualizarEnunciadoRapido(id, text);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Enunciado atualizado!");
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  // MODO VISUALIZAÇÃO
  if (!isEditing) {
    return (
      <div className="group flex items-center gap-2 pr-8 py-1">
        <button
          onClick={() => setIsEditing(true)}
          className="cursor-pointer p-1.5 text-gray-400 hover:text-[#009966] hover:bg-[#009966]/10 rounded-md transition-all duration-300"
          title="Edição rápida"
        >
          <SquarePen className="w-4 h-4" />
        </button>
        <span className="text-gray-600 dark:text-neutral-300 text-sm transition-colors duration-300">
          {text.length > 80 ? `${text.substring(0, 80)}...` : text}
        </span>
      </div>
    );
  }

  // MODO EDIÇÃO
  return (
    <div className="flex flex-col gap-2 min-w-62.5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex gap-2 justify-start items-center">
        <button
          onClick={() => {
            setText(initialText);
            setIsEditing(false);
          }}
          disabled={isSaving}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
        {isChanged && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-[#009966] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#007a52] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Salvar
          </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full text-sm p-2.5 border border-[#009966]/50 rounded-lg dark:bg-neutral-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#009966] shadow-sm resize-none"
        rows={3}
        autoFocus
        onKeyDown={(e) => {
          // Se apertar Ctrl + Enter, salva automaticamente
          if (e.ctrlKey && e.key === "Enter") handleSave();
        }}
      />
    </div>
  );
}
