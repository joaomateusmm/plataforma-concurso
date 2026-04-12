// src/app/admin/questoes/delete-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletarQuestao } from "../../../actions/questoes";

export function DeleteButton({ id }: { id: number }) {
  const handleSubmit = async (formData: FormData) => {
    const result = await deletarQuestao(formData);

    if (result?.error) {
      toast.error("Erro", {
        description: result.error,
      });
    } else {
      toast.success("Sucesso!", {
        description: "A questão foi removida do banco de simulados.",
      });
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors duration-300 cursor-pointer"
        title="Excluir Questão"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </form>
  );
}
