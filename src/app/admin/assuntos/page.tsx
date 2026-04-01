// src/app/admin/assuntos/page.tsx

import { salvarAssunto, atualizarAssunto } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { materias, assuntos } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
// Importamos o ícone de Editar, o Link e o redirect
import { Edit } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Criamos o molde para o TypeScript
type Assunto = {
  id: number;
  nome: string;
  materiaId: number | null;
};

export default async function GerenciarAssuntosPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const listaDeMaterias = await db.select().from(materias);

  const listaAssuntos = await db
    .select({
      id: assuntos.id,
      nome: assuntos.nome,
      materiaNome: materias.nome,
    })
    .from(assuntos)
    .innerJoin(materias, eq(assuntos.materiaId, materias.id));

  // Lógica para verificar se estamos no modo de edição
  const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
  let assuntoEditando: Assunto | null = null;

  if (editId) {
    const resultado = await db
      .select()
      .from(assuntos)
      .where(eq(assuntos.id, editId));
    if (resultado.length > 0) {
      assuntoEditando = resultado[0] as Assunto;
    }
  }

  // Função central para decidir a rota de salvar ou atualizar
  async function handleAction(formData: FormData) {
    "use server";
    if (assuntoEditando) {
      await atualizarAssunto(formData);
      redirect("/admin/assuntos"); // Limpa o ?edit= da URL
    } else {
      await salvarAssunto(formData);
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      {/* Formulário de Criação/Edição */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {assuntoEditando ? "Editar Assunto" : "Gerenciar Assuntos"}
        </h1>
        <p className="text-gray-600 mb-8">
          {assuntoEditando
            ? "Altere os dados do assunto selecionado."
            : "Vincule um assunto a uma matéria existente."}
        </p>

        <form action={handleAction} className="flex gap-4 items-end">
          {/* Campo oculto com o ID para a edição */}
          {assuntoEditando && (
            <input type="hidden" name="id" value={assuntoEditando.id} />
          )}

          {/* Seleção de Matéria */}
          <div className="flex-1 flex flex-col">
            <label className="font-semibold mb-1 text-gray-800">
              Matéria Principal *
            </label>
            <select
              name="materiaId"
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
              // O truque da edição: define o valor selecionado por padrão!
              defaultValue={
                assuntoEditando ? assuntoEditando.materiaId?.toString() : ""
              }
            >
              <option value="">Selecione a matéria...</option>
              {listaDeMaterias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Nome do Assunto */}
          <div className="flex-2 flex flex-col">
            <label className="font-semibold mb-1 text-gray-800">
              Nome do Assunto *
            </label>
            <input
              name="nome"
              type="text"
              required
              defaultValue={assuntoEditando ? assuntoEditando.nome : ""}
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Concordância Verbal"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              {assuntoEditando ? "Atualizar" : "Salvar"}
            </button>

            {/* Botão Cancelar */}
            {assuntoEditando && (
              <Link
                href="/admin/assuntos"
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
              <th className="p-4 font-semibold text-gray-700">
                Matéria Vinculada
              </th>
              <th className="p-4 font-semibold text-gray-700">
                Nome do Assunto
              </th>
              <th className="p-4 font-semibold text-gray-700 w-32 text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {listaAssuntos.map((assunto) => (
              <tr
                key={assunto.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  assuntoEditando?.id === assunto.id ? "bg-yellow-50" : ""
                }`}
              >
                <td className="p-4 text-gray-500">#{assunto.id}</td>
                <td className="p-4 text-blue-600 font-medium">
                  {assunto.materiaNome}
                </td>
                <td className="p-4 font-medium text-gray-800">
                  {assunto.nome}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  {/* Botão de Editar */}
                  <Link
                    href={`/admin/assuntos?edit=${assunto.id}`}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar Assunto"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <DeleteButton id={assunto.id} />
                </td>
              </tr>
            ))}

            {listaAssuntos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Nenhum assunto cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
