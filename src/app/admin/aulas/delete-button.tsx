// src/app/admin/aulas/delete-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletarAula } from "../../../actions/aulas";

export function DeleteButton({ id }: { id: number }) {
  const handleSubmit = async (formData: FormData) => {
    const result = await deletarAula(formData);

    if (result?.error) {
      toast.error("Erro", {
        description: result.error,
      });
    } else {
      toast.success("Sucesso!", {
        description: "A aula foi removida com sucesso.",
      });
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
        title="Excluir Aula"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </form>
  );
}
