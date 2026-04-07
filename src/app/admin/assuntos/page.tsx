// src/app/admin/assuntos/page.tsx
import { salvarAssunto, atualizarAssunto } from "../../../actions/cadastros";
import { db } from "../../../db/index";
import { materias, assuntos } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// IMPORTAMOS OS COMPONENTES
import { MultiAssuntoForm } from "./MultiAssuntoForm";
import { TabelaAssuntos } from "./TabelaAssuntos";
import { ImportAssuntosJson } from "./ImportAssuntosJson";
import { ExportAssuntosJson } from "./ExportAssuntosJson"; // <-- O nosso novo botão de exportação!

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

  // LÓGICA: Suporta Salvar em Massa pelo Formulário!
  async function handleAction(formData: FormData) {
    "use server";

    const materiaId = formData.get("materiaId") as string;
    const nomes = formData.getAll("nomes") as string[];

    if (assuntoEditando) {
      const fd = new FormData();
      fd.append("id", assuntoEditando.id.toString());
      fd.append("materiaId", materiaId);
      fd.append("nome", nomes[0]); // Na edição, há apenas 1 input
      await atualizarAssunto(fd);
      redirect("/admin/assuntos");
    } else {
      // Se for CRIAÇÃO manual, iteramos por cada nome preenchido e salvamos
      for (const nome of nomes) {
        if (nome.trim() !== "") {
          const fd = new FormData();
          fd.append("materiaId", materiaId);
          fd.append("nome", nome.trim());
          await salvarAssunto(fd);
        }
      }
      redirect("/admin/assuntos");
    }
  }

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12 animate-in fade-in duration-500">
      {/* CARD DO FORMULÁRIO */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
        {/* CABEÇALHO COM O TÍTULO E OS BOTÕES */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {assuntoEditando ? "Editar Assunto" : "Cadastrar Assuntos"}
          </h1>

          {/* Agrupamos os botões num flex container para ficarem lado a lado */}
          {!assuntoEditando && (
            <div className="flex items-end justify-center flex-col gap-3">
              <ExportAssuntosJson listaAssuntos={listaAssuntos} />
              <ImportAssuntosJson />
            </div>
          )}
        </div>

        <p className="text-gray-500 mb-8 max-w-2xl">
          {assuntoEditando
            ? "Altere os dados do assunto selecionado."
            : "Vincule um ou múltiplos assuntos a uma matéria manualmente, ou use a importação via JSON para adicionar dezenas de uma só vez."}
        </p>

        {/* COMPONENTE CLIENTE DE CRIAÇÃO RENDERIZADO AQUI */}
        <MultiAssuntoForm
          listaDeMaterias={listaDeMaterias}
          assuntoEditando={assuntoEditando}
          action={handleAction}
        />
      </div>

      {/* TABELA COM CHECKBOXES RENDERIZADA AQUI */}
      <TabelaAssuntos
        listaAssuntos={listaAssuntos}
        assuntoEditandoId={assuntoEditando?.id}
      />
    </div>
  );
}
