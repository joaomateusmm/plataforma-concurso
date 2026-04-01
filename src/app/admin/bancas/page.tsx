// src/app/admin/bancas/page.tsx

import { salvarBanca, atualizarBanca } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { bancas } from "../../../db/schema";
import { DeleteButton } from "./delete-button";
// Importamos o ícone de Editar, o Link, eq e redirect
import { Edit } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Criamos o molde para o TypeScript
type Banca = {
  id: number;
  nome: string;
};

export default async function GerenciarBancasPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const listaBancas = await db.select().from(bancas);

  // Lógica para verificar se estamos no modo de edição
  const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
  let bancaEditando: Banca | null = null;

  if (editId) {
    const resultado = await db
      .select()
      .from(bancas)
      .where(eq(bancas.id, editId));
    if (resultado.length > 0) {
      bancaEditando = resultado[0];
    }
  }

  // Função central para decidir a rota de salvar ou atualizar
  async function handleAction(formData: FormData) {
    "use server";
    if (bancaEditando) {
      await atualizarBanca(formData);
      redirect("/admin/bancas"); // Limpa o ?edit= da URL
    } else {
      await salvarBanca(formData);
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      {/* Formulário de Criação/Edição */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {bancaEditando ? "Editar Banca" : "Gerenciar Bancas"}
        </h1>
        <p className="text-gray-600 mb-8">
          {bancaEditando
            ? "Altere o nome da banca selecionada."
            : "Adicione as bancas organizadoras de concursos."}
        </p>

        <form action={handleAction} className="flex gap-4 items-end">
          {/* Campo oculto com o ID para a edição */}
          {bancaEditando && (
            <input type="hidden" name="id" value={bancaEditando.id} />
          )}

          <div className="flex-1 flex flex-col">
            <label className="font-semibold mb-1 text-gray-800">
              Nome da Banca *
            </label>
            <input
              name="nome"
              type="text"
              required
              defaultValue={bancaEditando ? bancaEditando.nome : ""}
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Fundação Carlos Chagas (FCC)"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              {bancaEditando ? "Atualizar" : "Salvar"}
            </button>

            {/* Botão Cancelar (aparece apenas editando) */}
            {bancaEditando && (
              <Link
                href="/admin/bancas"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition"
              >
                Cancelar
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Tabela de Listagem */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-700">ID</th>
              <th className="p-4 font-semibold text-gray-700">Nome da Banca</th>
              <th className="p-4 font-semibold text-gray-700 w-32 text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {listaBancas.map((banca) => (
              <tr
                key={banca.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  bancaEditando?.id === banca.id ? "bg-yellow-50" : ""
                }`}
              >
                <td className="p-4 text-gray-500">#{banca.id}</td>
                <td className="p-4 font-medium text-gray-800">{banca.nome}</td>
                <td className="p-4 flex justify-center gap-2">
                  {/* Botão de Editar */}
                  <Link
                    href={`/admin/bancas?edit=${banca.id}`}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar Banca"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>

                  <DeleteButton id={banca.id} />
                </td>
              </tr>
            ))}

            {listaBancas.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  Nenhuma banca cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
