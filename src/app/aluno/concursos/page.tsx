// src/app/aluno/concursos/page.tsx
import { db } from "../../../db/index";
import { concursos } from "../../../db/schema";
import {
  Building2,
  GraduationCap,
  CircleDollarSign,
  Users,
  ExternalLink,
  FileText,
  Newspaper,
  Clock,
  BellRing,
} from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ConcursoCard({ concurso }: { concurso: any }) {
  const isEmBreve =
    concurso.status === "Em Breve" || concurso.status === "Edital Em Breve";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Inscrições Abertas":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Em Breve":
      case "Edital Em Breve":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Inscrições Encerradas":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Encerrado":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  return (
    <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col hover:border-neutral-700 hover:bg-neutral-900/80 transition-all duration-300 group h-full">
      {/* STATUS E BANCA */}
      <div className="p-5 border-b border-neutral-800/50 flex items-center justify-between bg-neutral-950/30">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
            concurso.status,
          )}`}
        >
          {concurso.status}
        </span>
        <div className="flex gap-1 items-center justify-center text-sm font-medium text-neutral-500">
          Banca:
          <span className="text-xs font-bold text-neutral-500 bg-neutral-800 px-2.5 py-1 rounded-md">
            {concurso.banca}
          </span>
        </div>
      </div>

      {/* TÍTULO PRINCIPAL */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-200 group-hover:text-emerald-400 transition-colors leading-tight">
            {concurso.orgao}
          </h2>
          <p className="text-emerald-500 font-medium text-sm mt-1">
            {concurso.cargo}
          </p>
        </div>

        {concurso.descricao && (
          <p className="text-sm text-neutral-400 line-clamp-2">
            {concurso.descricao}
          </p>
        )}

        {/* INFORMAÇÕES EXTRAS */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-2">
          <div className="flex items-center gap-2 text-neutral-300">
            <CircleDollarSign className="w-4 h-4 text-neutral-500 shrink-0" />
            <span
              className="text-xs font-medium truncate"
              title={concurso.salario || ""}
            >
              {concurso.salario || "A definir"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Users className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-xs font-medium truncate">
              {concurso.vagas || "Cadastro Reserva"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 col-span-2">
            <GraduationCap className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-xs font-medium truncate">
              {concurso.escolaridade || "Não informado"}
            </span>
          </div>
        </div>

        {/* DATAS (INSCRIÇÃO E ISENÇÃO) */}
        {(concurso.periodoInscricao || concurso.periodoIsencao) && (
          <div className="border-t border-neutral-800/60 pt-4 mt-2 space-y-2">
            {concurso.periodoInscricao && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-neutral-400 leading-tight">
                  <span className="font-bold text-neutral-300 block">
                    Período de Inscrição:
                  </span>
                  {concurso.periodoInscricao}
                </p>
              </div>
            )}
            {concurso.periodoIsencao && (
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-neutral-400 leading-tight">
                  <span className="font-bold text-neutral-300 block">
                    Período de Isenção:
                  </span>
                  {concurso.periodoIsencao}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AÇÕES (BOTÕES E LINKS) */}
      <div className="p-5 pt-0 mt-auto flex flex-col gap-3">
        {isEmBreve ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-neutral-800/50 text-neutral-500 cursor-not-allowed border border-neutral-800"
          >
            Em Breve...
          </button>
        ) : (
          <a
            href={concurso.linkInscricao || "#"}
            target={concurso.linkInscricao ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              concurso.status === "Inscrições Abertas"
                ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
            }`}
          >
            {concurso.status === "Inscrições Abertas"
              ? "Fazer Inscrição"
              : "Ver Detalhes da Inscrição"}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {isEmBreve ? (
          <Link
            href="/aluno/noticias"
            className="flex items-center justify-center gap-1.5 text-xs font-medium text-yellow-500/80 hover:text-yellow-400 transition-colors py-1 group/noticia"
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span className="group-hover/noticia:underline underline-offset-2">
              Acompanhe as Notícias
            </span>
          </Link>
        ) : (
          concurso.linkEdital && (
            <a
              href={concurso.linkEdital}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-emerald-400 transition-colors py-1 group/edital"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="group-hover/edital:underline underline-offset-2">
                Acessar Edital Oficial
              </span>
            </a>
          )
        )}
      </div>
    </div>
  );
}

export default async function ConcursosAbertosPage() {
  const listaConcursos = await db.select().from(concursos);

  // Separamos a lista de concursos em duas arrays distintas baseadas no status
  const concursosAbertos = listaConcursos.filter(
    (c) => c.status === "Inscrições Abertas",
  );

  const concursosEmBreve = listaConcursos.filter(
    (c) => c.status === "Em Breve" || c.status === "Edital Em Breve",
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 mt-6 mb-12">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <BellRing className="w-8 h-8 text-emerald-500" />
            Concursos Abertos
          </h1>
          <p className="text-neutral-400">
            Fique por dentro das melhores oportunidades. Acompanhe os editais
            abertos, próximos concursos e planeje os seus estudos.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      {listaConcursos.length === 0 ? (
        <div className="text-center p-16 bg-neutral-900 rounded-3xl border border-neutral-800">
          <Building2 className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-300">
            Nenhum concurso aberto ou próximo no momento
          </h3>
          <p className="text-neutral-500 mt-2">
            Estamos atualizando a nossa base de concursos. Volte em breve!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* SEÇÃO 1: INSCRIÇÕES ABERTAS */}
          {concursosAbertos.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center border-b border-neutral-800 pb-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Inscrições Abertas:
                </h2>
                <span className="ml-2 rounded-md bg-neutral-800 px-2 py-0.5 text-xs font-bold text-neutral-400">
                  {concursosAbertos.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {concursosAbertos.map((concurso) => (
                  <ConcursoCard key={concurso.id} concurso={concurso} />
                ))}
              </div>
            </section>
          )}

          {/* SEÇÃO 2: EM BREVE */}
          {concursosEmBreve.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center border-b border-neutral-800 pb-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Próximos Concursos:
                </h2>
                <span className="ml-2 rounded-md bg-neutral-800 px-2 py-0.5 text-xs font-bold text-neutral-400">
                  {concursosEmBreve.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {concursosEmBreve.map((concurso) => (
                  <ConcursoCard key={concurso.id} concurso={concurso} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
