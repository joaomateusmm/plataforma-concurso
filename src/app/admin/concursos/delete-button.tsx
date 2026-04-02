// src/app/admin/concursos/delete-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletarConcurso } from "../../../actions/concursos";

export function DeleteButton({ id }: { id: number }) {
  const handleSubmit = async (formData: FormData) => {
    const result = await deletarConcurso(formData);

    if (result?.error) {
      toast.error("Erro", {
        description: result.error,
      });
    } else {
      toast.success("Sucesso!", {
        description: "Concurso excluído com sucesso.",
      });
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
        title="Excluir Concurso"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </form>
  );
}
