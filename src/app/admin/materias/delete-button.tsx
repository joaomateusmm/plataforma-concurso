// src/app/admin/materias/delete-button.tsx
"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletarMateria } from "../../../actions/cadastros";

// Este componente recebe o ID da matéria que ele deve apagar
export function DeleteButton({ id }: { id: number }) {
  // Função que intercepta o envio do formulário
  const handleSubmit = async (formData: FormData) => {
    // Chama a server action e aguarda a resposta dela
    const result = await deletarMateria(formData);

    // Se a action devolveu um erro, mostramos o toast vermelho (error)
    if (result?.error) {
      toast.error("Ação Bloqueada", {
        description: result.error,
      });
    } else {
      // Se não tem erro, deu certo! Mostramos o toast verde (success)
      toast.success("Sucesso!", {
        description: "A matéria foi excluída da base de dados.",
      });
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-2 text-red-500 cursor-pointer hover:bg-red-50 rounded-md transition-colors"
        title="Excluir Matéria"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </form>
  );
}
