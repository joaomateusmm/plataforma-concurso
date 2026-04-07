// src/app/admin/concursos/page.tsx
import { db } from "../../../db/index";
import { concursos } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { ConcursoForm } from "./ConcursoForm"; // IMPORTAMOS O COMPONENTE AQUI

export default async function GerenciarConcursosPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;

  const listaConcursos = await db
    .select()
    .from(concursos)
    .orderBy(desc(concursos.id));

  const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
  let concursoEditando = null;

  if (editId) {
    const resultado = await db
      .select()
      .from(concursos)
      .where(eq(concursos.id, editId));
    if (resultado.length > 0) {
      concursoEditando = resultado[0];
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {concursoEditando ? "Editar Concurso" : "Novo Concurso"}
        </h1>
        <p className="text-gray-600 mb-8">
          {concursoEditando
            ? "Altere as informações do concurso selecionado."
            : "Cadastre um novo concurso para exibir na vitrine dos alunos."}
        </p>

        {/* USAMOS O COMPONENTE AQUI */}
        <ConcursoForm concursoEditando={concursoEditando} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-700 w-16">ID</th>
                <th className="p-4 font-semibold text-gray-700">
                  Órgão / Cargo
                </th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700">Banca</th>
                <th className="p-4 font-semibold text-gray-700 text-center w-32">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {listaConcursos.map((concurso) => (
                <tr
                  key={concurso.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${concursoEditando?.id === concurso.id ? "bg-yellow-50" : ""}`}
                >
                  <td className="p-4 text-gray-500">#{concurso.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">
                      {concurso.orgao}
                    </div>
                    <div className="text-green-600 text-sm font-medium">
                      {concurso.cargo}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${concurso.status === "Inscrições Abertas" ? "bg-green-100 text-green-700" : concurso.status === "Em Breve" || concurso.status === "Edital Em Breve" ? "bg-yellow-100 text-yellow-700" : concurso.status === "Inscrições Encerradas" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}
                    >
                      {concurso.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm font-medium">
                    {concurso.banca}
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <Link
                      href={`/admin/concursos?edit=${concurso.id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Editar Concurso"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <DeleteButton id={concurso.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
