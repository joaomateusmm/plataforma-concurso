// src/app/aluno/materiais/page.tsx

import { db } from "../../../db/index";
import { materias, assuntos, aulas } from "../../../db/schema";
import { AulasAccordion } from "./aulas-accordion";
import { Sparkles } from "lucide-react";

export default async function MateriaisPage() {
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in mt-10 fade-in duration-500">
      {/* CABEÇALHO DA PÁGINA - DARK MODE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Gradiente suave esmeralda no fundo para dar um toque premium */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent pointer-events-none" />

        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/5">
          <Sparkles className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-neutral-100">
            Aulas Gratuitas
          </h1>
          <p className="text-neutral-400 max-w-xl text-lg">
            Aprofunde o seu conhecimento. Escolha uma matéria abaixo para ter
            acesso a todas as videoaulas cuidadosamente organizadas.
          </p>
        </div>
      </div>

      {/* COMPONENTE INTERATIVO DAS AULAS */}
      <AulasAccordion materias={arvoreMaterias} />
    </div>
  );
}
