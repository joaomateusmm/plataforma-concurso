import { db } from "@/db";
import { concursos, editais, noticias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// IMPORTA O TEU FORMULÁRIO (Ajusta o caminho conforme a tua nova estrutura)
import { NoticiaForm } from "../../nova/NoticiaForm";

export default async function EditarNoticiaPage({
  params,
}: {
  // 1. No Next.js 15+, os params são uma Promise!
  params: Promise<{ id: string }>;
}) {
  // 2. Extraímos o ID usando o await
  const { id } = await params;
  const idParaEditar = parseInt(id);

  // 3. Camada de segurança extra: se o ID não for um número (ex: /editar/abc), redireciona
  if (isNaN(idParaEditar)) {
    redirect("/admin/noticias");
  }

  // 4. Busca a notícia específica no banco de dados
  const res = await db
    .select()
    .from(noticias)
    .where(eq(noticias.id, idParaEditar));

  // Se não encontrar a notícia, chuta o utilizador de volta para a lista
  if (res.length === 0) {
    redirect("/admin/noticias");
  }

  const noticiaEditando = res[0];

  // 5. Busca os concursos e editais para os Dropdowns do Form
  const concursosDb = await db.select().from(concursos);
  const editaisDb = await db.select().from(editais);

  return (
    <main className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 mb-12">
      <Link
        href="/admin/noticias"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para lista
      </Link>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-600" />
            Editar Notícia
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Altere os dados abaixo para atualizar a notícia no feed dos alunos.
          </p>
        </div>

        {/* Renderiza o teu formulário injetando os dados da notícia */}
        <NoticiaForm
          noticiaEditando={noticiaEditando}
          concursosDb={concursosDb}
          editaisDb={editaisDb}
        />
      </div>
    </main>
  );
}
