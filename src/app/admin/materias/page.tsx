// src/app/admin/materias/page.tsx

import { salvarMateria, atualizarMateria } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { materias } from "../../../db/schema";
import { DeleteButton } from "./delete-button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// 1. CORREÇÃO: Criamos o "molde" para que o TypeScript saiba o que é uma Matéria
type Materia = {
  id: number;
  nome: string;
};

export default async function GerenciarMateriasPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const listaMaterias = await db.select().from(materias);

  const editId = searchParams.edit ? parseInt(searchParams.edit) : null;

  // 2. CORREÇÃO: Avisamos que esta variável pode ser nula OU uma Materia
  let materiaEditando: Materia | null = null;

  if (editId) {
    const resultado = await db
      .select()
      .from(materias)
      .where(eq(materias.id, editId));
    if (resultado.length > 0) {
      materiaEditando = resultado[0];
    }
  }

  async function handleAction(formData: FormData) {
    "use server";
    if (materiaEditando) {
      await atualizarMateria(formData);
      redirect("/admin/materias");
    } else {
      await salvarMateria(formData);
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {materiaEditando ? "Editar Matéria" : "Gerenciar Matérias"}
        </h1>
        <p className="text-gray-600 mb-8">
          {materiaEditando
            ? "Altere o nome da matéria selecionada."
            : "Adicione novas matérias base para o sistema."}
        </p>

        <form action={handleAction} className="flex gap-4 items-end">
          {materiaEditando && (
            <input type="hidden" name="id" value={materiaEditando.id} />
          )}

          <div className="flex-1 flex flex-col">
            <label className="font-semibold mb-1 text-gray-800">
              Nome da Matéria *
            </label>
            <input
              name="nome"
              type="text"
              required
              defaultValue={materiaEditando ? materiaEditando.nome : ""}
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Informática"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              {materiaEditando ? "Atualizar" : "Salvar"}
            </button>

            {materiaEditando && (
              <Link
                href="/admin/materias"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition"
              >
                Cancelar
              </Link>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-700">ID</th>
              <th className="p-4 font-semibold text-gray-700">
                Nome da Matéria
              </th>
              <th className="p-4 font-semibold text-gray-700 w-32 text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {listaMaterias.map((materia) => (
              <tr
                key={materia.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  materiaEditando?.id === materia.id ? "bg-yellow-50" : ""
                }`}
              >
                <td className="p-4 text-gray-500">#{materia.id}</td>
                <td className="p-4 font-medium text-gray-800">
                  {materia.nome}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <Link
                    href={`/admin/materias?edit=${materia.id}`}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar Matéria"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <DeleteButton id={materia.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
