// src/app/admin/aulas/page.tsx

import { salvarAula, atualizarAula } from "../../../actions/aulas";
import { db } from "../../../db/index";
import { materias, assuntos, aulas } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { Edit, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AulaForm } from "./AulaForm"; // <-- Importamos o novo formulário!

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

  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);

  // ORDENAMOS TUDO ALFABETICAMENTE ANTES DE ENVIAR PARA O FORMULÁRIO
  listaMaterias.sort((a, b) => a.nome.localeCompare(b.nome));
  listaAssuntos.sort((a, b) => a.nome.localeCompare(b.nome));

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

  const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
  let aulaEditando: Aula | null = null;

  if (editId) {
    const resultado = await db.select().from(aulas).where(eq(aulas.id, editId));
    if (resultado.length > 0) {
      aulaEditando = resultado[0] as Aula;
    }
  }

  // A Ação Server agora é passada diretamente como prop para o Componente Client
  async function handleAction(formData: FormData) {
    "use server";
    if (aulaEditando) {
      await atualizarAula(formData);
      redirect("/admin/aulas"); // Limpa o estado da URL ao atualizar
    } else {
      await salvarAula(formData);
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      {/* Renderiza o novo formulário interativo */}
      <AulaForm
        materias={listaMaterias}
        assuntos={listaAssuntos}
        aulaEditando={aulaEditando}
        onSubmitAction={handleAction}
      />

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
