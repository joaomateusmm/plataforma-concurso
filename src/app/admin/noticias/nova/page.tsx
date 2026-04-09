import { db } from "@/db";
import { concursos, editais, noticias } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NoticiaForm } from "./NoticiaForm";

export default async function NovaNoticiaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const idParaEditar = resolvedParams.id ? parseInt(resolvedParams.id) : null;
  let noticiaEditando = null;
  if (idParaEditar) {
    const res = await db
      .select()
      .from(noticias)
      .where(eq(noticias.id, idParaEditar));

    if (res.length > 0) {
      noticiaEditando = res[0];
    } else {
      redirect("/admin/noticias");
    }
  }

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
            {noticiaEditando ? "Editar Notícia" : "Criar Nova Notícia"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Preencha os dados abaixo para publicar novidades no feed dos alunos.
          </p>
        </div>
        <NoticiaForm
          noticiaEditando={noticiaEditando}
          concursosDb={concursosDb}
          editaisDb={editaisDb}
        />
      </div>
    </main>
  );
}
