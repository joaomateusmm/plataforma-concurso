// src/app/aluno/materiais/page.tsx

import { db } from "../../../db/index";
import { materias, assuntos, aulas } from "../../../db/schema";
import { AulasAccordion } from "./aulas-accordion";
import { Sparkles } from "lucide-react";

export default async function MateriaisPage() {
  // 1. Buscamos todos os dados necessários
  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);
  const listaAulas = await db.select().from(aulas);

  // 2. Montamos a "Árvore" (Hierarquia)
  // Filtramos para mostrar apenas matérias que tenham assuntos, e assuntos que tenham aulas.
  const arvoreMaterias = listaMaterias
    .map((materia) => {
      // Pega os assuntos desta matéria
      const assuntosDaMateria = listaAssuntos.filter(
        (assunto) => assunto.materiaId === materia.id,
      );

      // Mapeia os assuntos para colocar as aulas dentro deles
      const assuntosComAulas = assuntosDaMateria
        .map((assunto) => {
          const aulasDoAssunto = listaAulas.filter(
            (aula) => aula.assuntoId === assunto.id,
          );
          return { ...assunto, aulas: aulasDoAssunto };
        })
        .filter((assunto) => assunto.aulas.length > 0); // Só mantém assuntos que tenham aulas cadastradas

      return { ...materia, assuntos: assuntosComAulas };
    })
    .filter((materia) => materia.assuntos.length > 0); // Só mantém matérias que tenham conteúdos

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in mt-10 fade-in duration-500">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="bg-linear-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white shadow-lg shadow-green-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/10">
          <Sparkles className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Aulas Gratuitas</h1>
          <p className="text-green-100 max-w-xl text-lg">
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
