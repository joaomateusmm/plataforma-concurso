"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Save } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MultiBancaForm({ bancaEditando, action }: any) {
  // Se for edição, mostra o nome atual. Se for criação, mostra 1 input vazio inicial.
  const [inputs, setInputs] = useState<string[]>(
    bancaEditando ? [bancaEditando.nome] : [""],
  );

  const addInput = () => setInputs([...inputs, ""]);

  const removeInput = (index: number) => {
    const novos = [...inputs];
    novos.splice(index, 1);
    setInputs(novos);
  };

  const updateInput = (index: number, valor: string) => {
    const novos = [...inputs];
    novos[index] = valor;
    setInputs(novos);
  };

  return (
    <form action={action} className="space-y-6">
      {bancaEditando && (
        <input type="hidden" name="id" value={bancaEditando.id} />
      )}

      <div className="space-y-3">
        <label className="font-bold text-sm text-gray-500 uppercase tracking-wider">
          Nome da(s) Banca(s) *
        </label>
        {inputs.map((valor, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              name="nomes" // TODOS os inputs partilham o mesmo nome para a Action capturar como Array!
              type="text"
              required
              value={valor}
              onChange={(e) => updateInput(idx, e.target.value)}
              placeholder={`Ex: Banca ${idx + 1} (Ex: FGV, Cebraspe...)`}
              className="flex-1 border border-gray-200 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-50 text-gray-900 transition-all"
            />
            {!bancaEditando && inputs.length > 1 && (
              <button
                type="button"
                onClick={() => removeInput(idx)}
                className="p-3.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100 shrink-0"
                title="Remover esta banca"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Botão de Adicionar mais inputs (Escondido se for modo de edição) */}
      {!bancaEditando && (
        <button
          type="button"
          onClick={addInput}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors w-fit px-2 py-1 rounded hover:bg-blue-50"
        >
          <Plus className="w-4 h-4" /> Adicionar outra banca
        </button>
      )}

      <div className="flex gap-3 pt-6 border-t border-gray-100">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-md shadow-blue-600/20"
        >
          <Save className="w-5 h-5" />
          {bancaEditando ? "Atualizar Banca" : "Salvar Bancas"}
        </button>

        {bancaEditando && (
          <Link
            href="/admin/bancas"
            className="px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition border border-gray-200"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
