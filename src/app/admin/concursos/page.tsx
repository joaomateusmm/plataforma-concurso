// src/app/admin/concursos/page.tsx
import { salvarConcurso, atualizarConcurso } from "../../../actions/concursos";
import { db } from "../../../db/index";
import { concursos } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type Concurso = typeof concursos.$inferSelect;

export default async function GerenciarConcursosPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;

  const listaConcursos = await db
    .select()
    .from(concursos)
    .orderBy(desc(concursos.id));

  const editId = searchParams.edit ? parseInt(searchParams.edit) : null;
  let concursoEditando: Concurso | null = null;

  if (editId) {
    const resultado = await db
      .select()
      .from(concursos)
      .where(eq(concursos.id, editId));
    if (resultado.length > 0) {
      concursoEditando = resultado[0];
    }
  }

  async function handleAction(formData: FormData) {
    "use server";
    if (concursoEditando) {
      await atualizarConcurso(formData);
      redirect("/admin/concursos");
    } else {
      await salvarConcurso(formData);
    }
  }

  return (
    <div className="max-w-6xl mb-12 mx-auto space-y-8">
      {/* Formulário */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {concursoEditando ? "Editar Concurso" : "Novo Concurso"}
        </h1>
        <p className="text-gray-600 mb-8">
          {concursoEditando
            ? "Altere as informações do edital selecionado."
            : "Cadastre um novo edital para exibir na vitrine dos alunos."}
        </p>

        <form action={handleAction} className="space-y-6">
          {concursoEditando && (
            <input type="hidden" name="id" value={concursoEditando.id} />
          )}

          {/* LINHA 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Órgão *
              </label>
              <input
                name="orgao"
                type="text"
                required
                defaultValue={concursoEditando?.orgao || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Polícia Civil do Ceará"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Cargo *
              </label>
              <input
                name="cargo"
                type="text"
                required
                defaultValue={concursoEditando?.cargo || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Inspetor e Escrivão"
              />
            </div>
          </div>

          {/* LINHA 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Banca *
              </label>
              <input
                name="banca"
                type="text"
                required
                defaultValue={concursoEditando?.banca || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: IDECAN"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">Vagas</label>
              <input
                name="vagas"
                type="text"
                defaultValue={concursoEditando?.vagas || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 1.000 + CR"
              />
            </div>
          </div>

          {/* LINHA 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Salário
              </label>
              <input
                name="salario"
                type="text"
                defaultValue={concursoEditando?.salario || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: R$ 5.800,00"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Escolaridade
              </label>
              <select
                name="escolaridade"
                defaultValue={concursoEditando?.escolaridade || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Selecione o nível...</option>
                <option value="Nível Fundamental">Nível Fundamental</option>
                <option value="Nível Médio">Nível Médio</option>
                <option value="Nível Superior">Nível Superior</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Status *
              </label>
              <select
                name="status"
                required
                defaultValue={concursoEditando?.status || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Selecione o status...</option>
                <option value="Edital Em Breve">Edital Em Breve</option>
                <option value="Em Breve">Em Breve</option>
                <option value="Inscrições Abertas">Inscrições Abertas</option>
                <option value="Inscrições Encerradas">
                  Inscrições Encerradas
                </option>
                <option value="Encerrado">Encerrado</option>
              </select>
            </div>
          </div>

          {/* LINHA 4 - PERÍODOS DE INSCRIÇÃO/ISENÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Período de Inscrição{" "}
                <span className="text-gray-400 font-normal text-sm">
                  (Opcional)
                </span>
              </label>
              <input
                name="periodoInscricao"
                type="text"
                defaultValue={concursoEditando?.periodoInscricao || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 09/03/2026 10:00 até 02/04/2026 23:59"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Período de Isenção{" "}
                <span className="text-gray-400 font-normal text-sm">
                  (Opcional)
                </span>
              </label>
              <input
                name="periodoIsencao"
                type="text"
                defaultValue={concursoEditando?.periodoIsencao || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 09/03/2026 10:00 até 11/03/2026 23:59"
              />
            </div>
          </div>

          {/* LINHA 5 - LINKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Link do Edital{" "}
                <span className="text-gray-400 font-normal text-sm">
                  (Opcional)
                </span>
              </label>
              <input
                name="linkEdital"
                type="url"
                defaultValue={concursoEditando?.linkEdital || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-1 text-gray-800">
                Link da Inscrição{" "}
                <span className="text-gray-400 font-normal text-sm">
                  (Opcional)
                </span>
              </label>
              <input
                name="linkInscricao"
                type="url"
                defaultValue={concursoEditando?.linkInscricao || ""}
                className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* LINHA 6 - DESCRIÇÃO */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-gray-800">
              Breve Descrição
            </label>
            <textarea
              name="descricao"
              rows={3}
              defaultValue={concursoEditando?.descricao || ""}
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Resumo sobre o concurso..."
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition"
            >
              {concursoEditando ? "Atualizar Concurso" : "Cadastrar Concurso"}
            </button>
            {concursoEditando && (
              <Link
                href="/admin/concursos"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition"
              >
                Cancelar
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Tabela de Listagem */}
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
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    concursoEditando?.id === concurso.id ? "bg-yellow-50" : ""
                  }`}
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
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        concurso.status === "Inscrições Abertas"
                          ? "bg-green-100 text-green-700"
                          : concurso.status === "Em Breve" ||
                              concurso.status === "Edital Em Breve"
                            ? "bg-yellow-100 text-yellow-700"
                            : concurso.status === "Inscrições Encerradas"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                      }`}
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
              {listaConcursos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Nenhum concurso cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
