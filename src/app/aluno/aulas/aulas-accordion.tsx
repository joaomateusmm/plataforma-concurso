// src/app/aluno/materiais/aulas-accordion.tsx
"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, BookOpen, Layers } from "lucide-react";

// Definimos o formato dos dados que vamos receber do banco
type Aula = { id: number; titulo: string; videoUrl: string };
type Assunto = { id: number; nome: string; aulas: Aula[] };
type Materia = { id: number; nome: string; assuntos: Assunto[] };

export function AulasAccordion({ materias }: { materias: Materia[] }) {
  // Controlamos quais matérias e assuntos estão abertos
  const [materiasAbertas, setMateriasAbertas] = useState<number[]>([]);
  const [assuntosAbertos, setAssuntosAbertos] = useState<number[]>([]);

  const toggleMateria = (id: number) => {
    setMateriasAbertas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAssunto = (id: number) => {
    setAssuntosAbertos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  if (materias.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800">
          Nenhum material disponível
        </h3>
        <p className="text-gray-500">
          Ainda não há videoaulas cadastradas no sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materias.map((materia) => {
        const isMateriaAberta = materiasAbertas.includes(materia.id);

        return (
          <div
            key={materia.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
          >
            {/* NÍVEL 1: MATÉRIA */}
            <button
              onClick={() => toggleMateria(materia.id)}
              className={`w-full flex items-center justify-between p-5 transition-colors ${
                isMateriaAberta
                  ? "bg-green-50/50 border-b border-green-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-xl ${isMateriaAberta ? "bg-green-600 text-white shadow-md shadow-green-600/20" : "bg-gray-100 text-gray-500"}`}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2
                    className={`text-xl font-bold ${isMateriaAberta ? "text-green-800" : "text-gray-800"}`}
                  >
                    {materia.nome}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">
                    {materia.assuntos.length}{" "}
                    {materia.assuntos.length === 1 ? "assunto" : "assuntos"}{" "}
                    disponíveis
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-6 h-6 transition-transform duration-300 ${
                  isMateriaAberta
                    ? "rotate-180 text-green-600"
                    : "text-gray-400"
                }`}
              />
            </button>

            {/* CONTEÚDO DA MATÉRIA (ASSUNTOS) */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isMateriaAberta
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3 bg-gray-50/50">
                  {materia.assuntos.map((assunto) => {
                    const isAssuntoAberto = assuntosAbertos.includes(
                      assunto.id,
                    );

                    return (
                      <div
                        key={assunto.id}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                      >
                        {/* NÍVEL 2: ASSUNTO */}
                        <button
                          onClick={() => toggleAssunto(assunto.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-800">
                              {assunto.nome}
                            </h3>
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full ml-2">
                              {assunto.aulas.length}{" "}
                              {assunto.aulas.length === 1 ? "aula" : "aulas"}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-200 ${
                              isAssuntoAberto
                                ? "rotate-180 text-gray-600"
                                : "text-gray-400"
                            }`}
                          />
                        </button>

                        {/* NÍVEL 3: AULAS (VÍDEOS) */}
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isAssuntoAberto
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="border-t border-gray-100 bg-gray-50 p-2 space-y-1">
                              {assunto.aulas.map((aula) => (
                                <a
                                  key={aula.id}
                                  href={aula.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <PlayCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-gray-700 font-medium group-hover:text-green-700 transition-colors">
                                      {aula.titulo}
                                    </span>
                                  </div>
                                  <span className="text-xs font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                    Assistir Agora &rarr;
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
