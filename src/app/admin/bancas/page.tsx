import { salvarBanca, atualizarBanca } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { bancas } from "../../../db/schema";
import { DeleteButton } from "./delete-button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MultiBancaForm } from "./MultiBancaForm"; // Importando o nosso novo Form dinâmico!

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

  // NOVA LÓGICA: Suporta Salvar em Massa!
  async function handleAction(formData: FormData) {
    "use server";

    // O getAll("nomes") pega em todos os valores das caixas de texto que criámos!
    const nomes = formData.getAll("nomes") as string[];

    if (bancaEditando) {
      // MODO EDIÇÃO: Montamos o FormData e enviamos para a action antiga
      const fd = new FormData();
      fd.append("id", bancaEditando.id.toString());
      fd.append("nome", nomes[0]); // Na edição, há apenas 1 input
      await atualizarBanca(fd);
      redirect("/admin/bancas");
    } else {
      // MODO CRIAÇÃO: Iteramos por cada nome preenchido e salvamos
      for (const nome of nomes) {
        if (nome.trim() !== "") {
          const fd = new FormData();
          fd.append("nome", nome.trim());
          await salvarBanca(fd); // Chama a sua action repetidamente
        }
      }
      redirect("/admin/bancas");
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12 animate-in fade-in duration-500">
      {/* Formulário de Criação/Edição Modernizado */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {bancaEditando ? "Editar Banca" : "Cadastrar Bancas"}
        </h1>
        <p className="text-gray-500 mb-8">
          {bancaEditando
            ? "Altere o nome da banca organizadora selecionada."
            : "Adicione uma ou múltiplas bancas organizadoras de uma só vez."}
        </p>

        {/* CHAMADA DO NOVO COMPONENTE */}
        <MultiBancaForm bancaEditando={bancaEditando} action={handleAction} />
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
                Nome da Banca
              </th>
              <th className="p-5 font-bold text-gray-500 text-xs uppercase tracking-wider text-center w-32">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {listaBancas.map((banca) => (
              <tr
                key={banca.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  bancaEditando?.id === banca.id ? "bg-blue-50/50" : ""
                }`}
              >
                <td className="p-5 text-sm text-gray-400">#{banca.id}</td>
                <td className="p-5 text-sm font-medium text-gray-800">
                  {banca.nome}
                </td>
                <td className="p-5 flex justify-center gap-2">
                  {/* Botão de Editar */}
                  <Link
                    href={`/admin/bancas?edit=${banca.id}`}
                    className="p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
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
                <td colSpan={3} className="p-10 text-center text-gray-500">
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
