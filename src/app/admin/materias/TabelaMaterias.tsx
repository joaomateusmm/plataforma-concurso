/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Loader2, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { deletarMateriasEmMassa } from "../../../actions/cadastros";

export function TabelaMaterias({ listaMaterias, materiaEditandoId }: any) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAllSelected =
    listaMaterias.length > 0 && selectedIds.length === listaMaterias.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listaMaterias.map((m: any) => m.id));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    if (
      !confirm(
        `Tem a certeza que deseja excluir ${selectedIds.length} matéria(s)? Os assuntos ligados a elas também poderão ser afetados!`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const res = await deletarMateriasEmMassa(selectedIds);
    setIsDeleting(false);

    if (res.error) {
      toast.error("Erro", { description: res.error });
    } else {
      toast.success("Sucesso", {
        description: "Matérias excluídas com sucesso!",
      });
      setSelectedIds([]); // Limpa a seleção
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* TOOLBAR DE AÇÕES (Aparece apenas quando há itens selecionados) */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50/50 border-b border-blue-100 p-4 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <CheckSquare className="w-5 h-5" />
            {selectedIds.length} matéria(s) selecionada(s)
          </div>
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Excluir Selecionados
          </button>
        </div>
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-5 w-12 text-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleAll}
                className="w-4 h-4 cursor-pointer accent-blue-600 rounded border-gray-300"
              />
            </th>
            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">
              ID
            </th>
            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">
              Nome da Matéria
            </th>
            {/* NOVA COLUNA AQUI */}
            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider text-center">
              Qtd. Assuntos
            </th>
            <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider text-center w-32">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {listaMaterias.map((materia: any) => {
            const isSelected = selectedIds.includes(materia.id);
            const isEditing = materiaEditandoId === materia.id;

            return (
              <tr
                key={materia.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-blue-50/30" : isEditing ? "bg-yellow-50" : ""
                }`}
              >
                <td className="p-5 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(materia.id)}
                    className="w-4 h-4 cursor-pointer accent-blue-600 rounded border-gray-300"
                  />
                </td>
                <td className="p-5 text-sm text-gray-400">#{materia.id}</td>
                <td className="p-5 text-sm font-medium text-gray-800">
                  {materia.nome}
                </td>
                {/* NOVO DADO AQUI */}
                <td className="p-5 text-sm font-bold text-gray-600 text-center">
                  <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    {materia.qtdAssuntos || 0}
                  </span>
                </td>
                <td className="p-5 flex justify-center gap-2">
                  <Link
                    href={`/admin/materias?edit=${materia.id}`}
                    className="p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
                    title="Editar Matéria"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            );
          })}

          {listaMaterias.length === 0 && (
            <tr>
              {/* Ajustado o colSpan para 5 pois agora temos mais uma coluna */}
              <td colSpan={5} className="p-10 text-center text-gray-500">
                Nenhuma matéria cadastrada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
