// src/app/aluno/materiais/page.tsx

import { db } from "../../../db/index";
import { materias, assuntos, aulas } from "../../../db/schema";
import { AulasAccordion } from "./aulas-accordion";
import { Video } from "lucide-react";

export default async function MateriaisPage(props: {
  searchParams: Promise<{ assuntoId?: string }>;
}) {
  // 1. CAPTURAMOS O PARÂMETRO DA URL
  const searchParams = await props.searchParams;
  const assuntoIdSelecionado = searchParams.assuntoId
    ? parseInt(searchParams.assuntoId)
    : undefined;

  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);
  const listaAulas = await db.select().from(aulas);

  const arvoreMaterias = listaMaterias
    .map((materia) => {
      const assuntosDaMateria = listaAssuntos.filter(
        (assunto) => assunto.materiaId === materia.id,
      );

      const assuntosComAulas = assuntosDaMateria
        .map((assunto) => {
          const aulasDoAssunto = listaAulas.filter(
            (aula) => aula.assuntoId === assunto.id,
          );
          return { ...assunto, aulas: aulasDoAssunto };
        })
        .filter((assunto) => assunto.aulas.length > 0);

      return { ...materia, assuntos: assuntosComAulas };
    })
    .filter((materia) => materia.assuntos.length > 0);

  return (
    <div className="max-w-7xl mx-auto animate-in mt-6 fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Video className="w-8 h-8 text-emerald-500" />
            Aulas
          </h1>
          <p className="text-neutral-400">
            Escolha uma matéria abaixo para ter acesso a todas as videoaulas
            cuidadosamente organizadas.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      {/* 2. PASSAMOS O ID SELECIONADO PARA O ACORDEÃO */}
      <AulasAccordion
        materias={arvoreMaterias}
        assuntoAbertoId={assuntoIdSelecionado}
      />
    </div>
  );
}
