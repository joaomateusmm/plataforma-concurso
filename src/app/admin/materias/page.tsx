import { salvarMateria, atualizarMateria } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { materias, assuntos } from "../../../db/schema";
import { eq, count, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

// IMPORTAMOS OS COMPONENTES!
import { MultiMateriaForm } from "./MultiMateriaForm";
import { TabelaMaterias } from "./TabelaMaterias";
import { ExportMateriasButton } from "./ExportMateriasButton"; // NOVO BOTÃO AQUI

type Materia = {
  id: number;
  nome: string;
};

export default async function GerenciarMateriasPage(props: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const searchParams = await props.searchParams;

  // =================================================================
  // LÓGICA DE BUSCA
  // =================================================================
  const listaMaterias = await db
    .select({
      id: materias.id,
      nome: materias.nome,
      qtdAssuntos: count(assuntos.id),
    })
    .from(materias)
    .leftJoin(assuntos, eq(materias.id, assuntos.materiaId))
    .groupBy(materias.id)
    .orderBy(desc(materias.id));

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

  // LÓGICA DE SALVAMENTO
  async function handleAction(formData: FormData) {
    "use server";
    const nomes = formData.getAll("nomes") as string[];

    if (materiaEditando) {
      const fd = new FormData();
      fd.append("id", materiaEditando.id.toString());
      fd.append("nome", nomes[0]);
      await atualizarMateria(fd);
      redirect("/admin/materias");
    } else {
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
      {/* FORMULÁRIO (COM DARK MODE E BOTÃO DE EXPORTAÇÃO) */}
      <div className="bg-white dark:bg-neutral-900 p-10 rounded-3xl shadow-sm border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        {/* CABEÇALHO COM TÍTULO E BOTÃO LADO A LADO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
            {materiaEditando ? "Editar Matéria" : "Cadastrar Matérias"}
          </h1>

          <ExportMateriasButton />
        </div>

        <p className="text-gray-500 dark:text-neutral-400 mb-8 transition-colors duration-300">
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

      {/* TABELA COM CHECKBOXES DE EXCLUSÃO EM MASSA E NOVA COLUNA */}
      <TabelaMaterias
        listaMaterias={listaMaterias}
        materiaEditandoId={materiaEditando?.id}
      />
    </div>
  );
}
