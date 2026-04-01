// src/app/admin/assuntos/delete-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletarAssunto } from "../../../actions/cadastros";

export function DeleteButton({ id }: { id: number }) {
  const handleSubmit = async (formData: FormData) => {
    const result = await deletarAssunto(formData);

    if (result?.error) {
      toast.error("Ação Bloqueada", {
        description: result.error,
      });
    } else {
      toast.success("Sucesso!", {
        description: "O assunto foi excluído da base de dados.",
      });
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
        title="Excluir Assunto"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </form>
  );
}
