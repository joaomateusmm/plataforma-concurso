import { salvarAssunto, atualizarAssunto } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { materias, assuntos } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
// IMPORTAMOS O NOVO FORMULÁRIO AQUI
import { MultiAssuntoForm } from "./MultiAssuntoForm";

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

  // NOVA LÓGICA: Suporta Salvar em Massa!
  async function handleAction(formData: FormData) {
    "use server";

    const materiaId = formData.get("materiaId") as string;
    // O getAll("nomes") pega todos os valores dos inputs dinâmicos que gerámos
    const nomes = formData.getAll("nomes") as string[];

    if (assuntoEditando) {
      // Se for EDIÇÃO, montamos o FormData e enviamos para a action antiga
      const fd = new FormData();
      fd.append("id", assuntoEditando.id.toString());
      fd.append("materiaId", materiaId);
      fd.append("nome", nomes[0]); // Na edição, há apenas 1 input
      await atualizarAssunto(fd);
      redirect("/admin/assuntos");
    } else {
      // Se for CRIAÇÃO, iteramos por cada nome preenchido e salvamos
      for (const nome of nomes) {
        if (nome.trim() !== "") {
          const fd = new FormData();
          fd.append("materiaId", materiaId);
          fd.append("nome", nome.trim());
          await salvarAssunto(fd); // Chama a sua action repetidamente
        }
      }
      redirect("/admin/assuntos"); // Recarrega a página para limpar o formulário
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12 animate-in fade-in duration-500">
      {/* CARD DO FORMULÁRIO */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {assuntoEditando ? "Editar Assunto" : "Cadastrar Assuntos"}
        </h1>
        <p className="text-gray-500 mb-8">
          {assuntoEditando
            ? "Altere os dados do assunto selecionado."
            : "Vincule um ou múltiplos assuntos a uma matéria de uma só vez."}
        </p>

        {/* COMPONENTE CLIENTE RENDERIZADO AQUI */}
        <MultiAssuntoForm
          listaDeMaterias={listaDeMaterias}
          assuntoEditando={assuntoEditando}
          action={handleAction}
        />
      </div>

      {/* Tabela de Listagem */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                ID
              </th>
              <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                Matéria Vinculada
              </th>
              <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider">
                Nome do Assunto
              </th>
              <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider text-center w-32">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {listaAssuntos.map((assunto) => (
              <tr
                key={assunto.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  assuntoEditando?.id === assunto.id ? "bg-blue-50/50" : ""
                }`}
              >
                <td className="p-5 text-sm text-gray-400">#{assunto.id}</td>
                <td className="p-5 text-sm text-blue-600 font-bold">
                  {assunto.materiaNome}
                </td>
                <td className="p-5 text-sm font-medium text-gray-800">
                  {assunto.nome}
                </td>
                <td className="p-5 flex justify-center gap-2">
                  <Link
                    href={`/admin/assuntos?edit=${assunto.id}`}
                    className="p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
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
                <td colSpan={4} className="p-10 text-center text-gray-500">
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
