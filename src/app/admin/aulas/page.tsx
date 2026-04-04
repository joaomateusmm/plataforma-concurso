// src/app/admin/aulas/page.tsx

import { salvarAula, atualizarAula } from "../../../actions/aulas";
import { db } from "../../../db/index";
import { materias, assuntos, aulas } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { Edit, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Molde para o TypeScript da edição
type Aula = {
  id: number;
  titulo: string;
  videoUrl: string;
  materiaId: number | null;
  assuntoId: number | null;
};

export default async function GerenciarAulasPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;

  // Buscamos as listas para os campos de seleção (select)
  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);

  // Consulta JOIN para mostrar os nomes reais na tabela
  const listaAulas = await db
    .select({
      id: aulas.id,
      titulo: aulas.titulo,
      videoUrl: aulas.videoUrl,
      materiaNome: materias.nome,
      assuntoNome: assuntos.nome,
    })
    .from(aulas)
    .innerJoin(materias, eq(aulas.materiaId, materias.id))
    .innerJoin(assuntos, eq(aulas.assuntoId, assuntos.id));

  // Lógica de Edição via URL
  const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
  let aulaEditando: Aula | null = null;

  if (editId) {
    const resultado = await db.select().from(aulas).where(eq(aulas.id, editId));
    if (resultado.length > 0) {
      aulaEditando = resultado[0] as Aula;
    }
  }

  // Função central para salvar ou atualizar
  async function handleAction(formData: FormData) {
    "use server";
    if (aulaEditando) {
      await atualizarAula(formData);
      redirect("/admin/aulas");
    } else {
      await salvarAula(formData);
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      {/* Formulário de Criação/Edição */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {aulaEditando ? "Editar Videoaula" : "Gerenciar Videoaulas"}
        </h1>
        <p className="text-gray-600 mb-8">
          {aulaEditando
            ? "Altere os dados da aula selecionada."
            : "Vincule aulas do YouTube a um assunto específico."}
        </p>

        <form action={handleAction} className="space-y-6">
          {aulaEditando && (
            <input type="hidden" name="id" value={aulaEditando.id} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seleção de Matéria */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Matéria *
              </label>
              <select
                name="materiaId"
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                required
                defaultValue={
                  aulaEditando ? aulaEditando.materiaId?.toString() : ""
                }
              >
                <option value="">Selecione a matéria...</option>
                {listaMaterias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Assunto */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Assunto *
              </label>
              <select
                name="assuntoId"
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                required
                defaultValue={
                  aulaEditando ? aulaEditando.assuntoId?.toString() : ""
                }
              >
                <option value="">Selecione o assunto...</option>
                {listaAssuntos.map((assunto) => (
                  <option key={assunto.id} value={assunto.id}>
                    {assunto.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título da Aula */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Título da Aula *
              </label>
              <input
                name="titulo"
                type="text"
                required
                defaultValue={aulaEditando ? aulaEditando.titulo : ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Concordância Verbal - Parte 1"
              />
            </div>

            {/* URL do Vídeo */}
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Link do YouTube *
              </label>
              <input
                name="videoUrl"
                type="url"
                required
                defaultValue={aulaEditando ? aulaEditando.videoUrl : ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition"
            >
              {aulaEditando ? "Atualizar Aula" : "Salvar Aula"}
            </button>

            {aulaEditando && (
              <Link
                href="/admin/aulas"
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
              <th className="p-4 font-semibold text-gray-700 w-16">ID</th>
              <th className="p-4 font-semibold text-gray-700">
                Título da Aula
              </th>
              <th className="p-4 font-semibold text-gray-700">
                Matéria / Assunto
              </th>
              <th className="p-4 font-semibold text-gray-700 text-center">
                Vídeo
              </th>
              <th className="p-4 font-semibold text-gray-700 w-32 text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {listaAulas.map((aula) => (
              <tr
                key={aula.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  aulaEditando?.id === aula.id ? "bg-yellow-50" : ""
                }`}
              >
                <td className="p-4 text-gray-500">#{aula.id}</td>
                <td className="p-4 font-medium text-gray-800">{aula.titulo}</td>
                <td className="p-4">
                  <div className="text-green-600 font-medium text-sm">
                    {aula.materiaNome}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {aula.assuntoNome}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <a
                    href={aula.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Assistir no YouTube"
                  >
                    <Video className="w-5 h-5" />
                  </a>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <Link
                    href={`/admin/aulas?edit=${aula.id}`}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Editar Aula"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <DeleteButton id={aula.id} />
                </td>
              </tr>
            ))}

            {listaAulas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nenhuma aula cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
