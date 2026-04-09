import { db } from "@/db";
import {
  noticias,
  noticiaConcursos,
  noticiaEditais,
  concursos,
  editais,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function LeituraNoticiaPage({
  params,
}: {
  params: Promise<{ estado: string; slug: string }>;
}) {
  const { slug } = await params;
  const res = await db.select().from(noticias).where(eq(noticias.slug, slug));

  if (res.length === 0) {
    redirect("/aluno/noticias");
  }

  const noticia = res[0];
  const dataFormatada = format(
    new Date(noticia.dataPublicacao),
    "dd 'de' MMMM 'de' yyyy, 'às' HH:mm",
    { locale: ptBR },
  );
  const localizacao = [noticia.estado, noticia.municipio]
    .filter(Boolean)
    .join(" - ");
  const concursosRelacionados = await db
    .select({
      id: concursos.id,
      orgao: concursos.orgao,
      cargo: concursos.cargo,
      linkInscricao: concursos.linkInscricao,
    })
    .from(noticiaConcursos)
    .innerJoin(concursos, eq(noticiaConcursos.concursoId, concursos.id))
    .where(eq(noticiaConcursos.noticiaId, noticia.id));
  const editaisRelacionados = await db
    .select({
      id: editais.id,
      titulo: editais.titulo,
    })
    .from(noticiaEditais)
    .innerJoin(editais, eq(noticiaEditais.editalId, editais.id))
    .where(eq(noticiaEditais.noticiaId, noticia.id));

  return (
    <main className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 mt-6 mb-20 px-4">
      <Link
        href="/aluno/noticias"
        className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-emerald-500 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Notícias
      </Link>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-md shadow-neutral-950/80 tracking-wider rounded-md bg-neutral-900 text-neutral-500">
            {noticia.tipoConcurso}
          </span>
          {localizacao && (
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-md shadow-neutral-950/80 tracking-wider rounded-md bg-neutral-900 text-neutral-500">
              {localizacao}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-extrabold text-white leading-tight">
          {noticia.titulo}
        </h1>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 ">
            Autor: {noticia.publicadoPor}
          </div>
          <span className="hidden sm:block ">•</span>
          <div className="flex items-center gap-2 ">
            Publicado em {dataFormatada}
          </div>
        </div>
      </div>

      {/* CAPA DA NOTÍCIA */}
      {noticia.thumbnailUrl && (
        <div className="w-94 h-64 relative overflow-hidden">
          <Image
            src={noticia.thumbnailUrl}
            alt={noticia.titulo}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}

      {/* CONTEÚDO DA NOTÍCIA */}
      <article className="prose prose-invert max-w-none prose-emerald">
        <div className="text-neutral-300 leading-relaxed text-md whitespace-pre-wrap">
          {noticia.conteudo}
        </div>
        {/* Links dos Editais Verticais */}
        {editaisRelacionados.map((e) => (
          <Link
            key={e.id}
            href={`/aluno/editais/${e.id}`}
            className="flex flex-wrap items-center justify-between pt-4"
          >
            <div className="flex items-center gap-2 group">
              <ExternalLink className="w-5 h-5 group-hover:text-neutral-200 text-neutral-400 duration-300" />
              <p className="text-lg font-bold text-neutral-400 group-hover:text-neutral-200 hover:underline duration-300">
                {e.titulo}
              </p>
            </div>
          </Link>
        ))}
        {/* SECÇÃO: OPORTUNIDADES RELACIONADAS */}
        {(concursosRelacionados.length > 0 ||
          editaisRelacionados.length > 0) && (
          <div className="mt-4">
            <div className="flex flex-col gap-3">
              {/* Links dos Concursos */}
              {concursosRelacionados.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-950 rounded-xl border border-neutral-800"
                >
                  <div>
                    <p className="text-sm font-bold text-neutral-200">
                      {c.orgao}
                    </p>
                    <p className="text-xs font-medium text-emerald-500">
                      {c.cargo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 jus">
                    <p className="text-neutral-500 text-sm font-medium">
                      Situação do Concurso:
                    </p>
                    {c.linkInscricao ? (
                      <a
                        href={c.linkInscricao}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Inscrever-se <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="px-3 py-1 bg-neutral-800 text-neutral-500 text-xs font-bold rounded-lg">
                        Em Breve
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* RODAPÉ E VINCULAÇÕES */}
      <div className="pt-8 mt-6 border-t border-neutral-800 flex flex-col gap-6">
        {/* Mostra as Tags da Notícia */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-neutral-500">
            Assuntos relacionados:
          </span>
          <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-md shadow-neutral-950/80 tracking-wider rounded-md bg-neutral-900 text-neutral-500">
            {noticia.tipoConcurso}
          </span>
          {noticia.estado && (
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase shadow-md shadow-neutral-950/80 tracking-wider rounded-md bg-neutral-900 text-neutral-500">
              {noticia.estado}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
