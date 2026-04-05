import { salvarMateria, atualizarMateria } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { materias } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// IMPORTAMOS OS NOVOS COMPONENTES!
import { MultiMateriaForm } from "./MultiMateriaForm";
import { TabelaMaterias } from "./TabelaMaterias";

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

  // NOVA LÓGICA: Suporta Salvar Várias Matérias ao mesmo tempo
  async function handleAction(formData: FormData) {
    "use server";

    // Captura todos os inputs dinâmicos com name="nomes"
    const nomes = formData.getAll("nomes") as string[];

    if (materiaEditando) {
      // MODO EDIÇÃO
      const fd = new FormData();
      fd.append("id", materiaEditando.id.toString());
      fd.append("nome", nomes[0]);
      await atualizarMateria(fd);
      redirect("/admin/materias");
    } else {
      // MODO CRIAÇÃO EM MASSA
      for (const nome of nomes) {
        if (nome.trim() !== "") {
          const fd = new FormData();
          fd.append("nome", nome.trim());
          await salvarMateria(fd);
        }
      }
      redirect("/admin/materias");
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12 animate-in fade-in duration-500">
      {/* FORMULÁRIO */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {materiaEditando ? "Editar Matéria" : "Cadastrar Matérias"}
        </h1>
        <p className="text-gray-500 mb-8">
          {materiaEditando
            ? "Altere o nome da matéria selecionada."
            : "Adicione uma ou múltiplas matérias base de uma só vez."}
        </p>

        {/* CHAMADA DO NOVO COMPONENTE */}
        <MultiMateriaForm
          materiaEditando={materiaEditando}
          action={handleAction}
        />
      </div>

      {/* TABELA COM CHECKBOXES DE EXCLUSÃO EM MASSA */}
      <TabelaMaterias
        listaMaterias={listaMaterias}
        materiaEditandoId={materiaEditando?.id}
      />
    </div>
  );
}
