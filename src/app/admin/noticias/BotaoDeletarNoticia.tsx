"use client";

import { Trash2 } from "lucide-react";
import { deletarNoticia } from "@/actions/noticias";
import { toast } from "sonner";

export function BotaoDeletarNoticia({ id }: { id: number }) {
  const handleExcluir = async () => {
    // Aqui podemos usar o confirm livremente, pois é um Client Component!
    if (window.confirm("Tem a certeza que deseja excluir esta notícia?")) {
      const res = await deletarNoticia(id);
      if (res.success) {
        toast.success("Notícia excluída com sucesso!");
      } else {
        toast.error("Erro ao excluir a notícia.");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleExcluir}
      className="p-2 text-gray-400 duration-200 active:scale-95 border border-neutral-200 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded-lg "
      title="Excluir Notícia"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
