import Link from "next/link";
import {
  PlusCircle,
  Search,
  Edit2,
  CalendarDays,
  Megaphone,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db } from "@/db";
import { noticias } from "@/db/schema";
import { desc } from "drizzle-orm";

// IMPORTA O NOSSO NOVO BOTÃO CLIENT-SIDE
import { BotaoDeletarNoticia } from "./BotaoDeletarNoticia";

export default async function AdminNoticiasPage() {
  // Busca todas as notícias ordenadas pela mais recente
  const listaNoticias = await db
    .select()
    .from(noticias)
    .orderBy(desc(noticias.criadoEm));

  return (
    <main className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-emerald-600" />
            Gestão de Notícias
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Crie, edite e agende notícias para o feed dos alunos.
          </p>
        </div>
        <Link
          href="/admin/noticias/nova"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <PlusCircle className="w-5 h-5" /> Nova Notícia
        </Link>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {listaNoticias.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">
              Nenhuma notícia encontrada.
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Comece criando a primeira notícia para a sua plataforma!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Publicação
                  </th>
                  <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listaNoticias.map((n) => {
                  const dataPub = new Date(n.dataPublicacao);
                  const isAgendada = dataPub > new Date();

                  // LÓGICA DO LINK DA NOTÍCIA (Nacional ou por Estado)
                  const ufLink = n.estado ? n.estado.toLowerCase() : "br";

                  return (
                    <tr
                      key={n.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 line-clamp-1 max-w-md">
                          {n.titulo}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="font-medium text-emerald-600">
                            {n.tipoConcurso}
                          </span>
                          <span className="text-gray-300">•</span>
                          {n.publicadoPor}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isAgendada ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3" /> Agendada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Publicada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center  gap-2 text-sm text-gray-600  font-medium">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          {format(dataPub, "dd MMM, yyyy - HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/noticias/editar/${n.id}`}
                            className="p-2 text-gray-400 border border-neutral-200 hover:text-emerald-600 hover:bg-emerald-50 active:scale-95 duration-200 rounded-lg transition-colors"
                            title="Editar Notícia"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <BotaoDeletarNoticia id={n.id} />

                          <Link
                            href={`/aluno/noticias/${ufLink}/${n.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 border active:scale-95  border-neutral-200 hover:text-blue-600 hover:bg-blue-50 rounded-lg duration-200"
                            title="Ver Notícia"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
