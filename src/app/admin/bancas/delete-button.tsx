// src/app/admin/bancas/delete-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletarBanca } from "../../../actions/cadastros";

export function DeleteButton({ id }: { id: number }) {
  const handleSubmit = async (formData: FormData) => {
    const result = await deletarBanca(formData);

    if (result?.error) {
      toast.error("Ação Bloqueada", {
        description: result.error,
      });
    } else {
      toast.success("Sucesso!", {
        description: "A banca foi excluída da base de dados.",
      });
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
        title="Excluir Banca"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </form>
  );
}
