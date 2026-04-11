// src/app/aluno/materiais/aulas-accordion.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronDown, PlayCircle, BookOpen, Layers } from "lucide-react";

type Aula = { id: number; titulo: string; videoUrl: string };
type Assunto = { id: number; nome: string; aulas: Aula[] };
type Materia = { id: number; nome: string; assuntos: Assunto[] };

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function AulasAccordion({
  materias,
  assuntoAbertoId,
}: {
  materias: Materia[];
  assuntoAbertoId?: number;
}) {
  const [materiasAbertas, setMateriasAbertas] = useState<number[]>(() => {
    if (!assuntoAbertoId) return [];
    const materiaPai = materias.find((m) =>
      m.assuntos.some((a) => a.id === assuntoAbertoId),
    );
    return materiaPai ? [materiaPai.id] : [];
  });

  const [assuntosAbertos, setAssuntosAbertos] = useState<number[]>(() => {
    return assuntoAbertoId ? [assuntoAbertoId] : [];
  });

  useEffect(() => {
    if (assuntoAbertoId) {
      setTimeout(() => {
        const elemento = document.getElementById(`assunto-${assuntoAbertoId}`);
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });

          elemento.classList.add(
            "ring-2",
            "ring-[#009966]",
            "dark:ring-emerald-500",
            "ring-offset-2",
            "ring-offset-white",
            "dark:ring-offset-neutral-950",
            "transition-all",
            "duration-300",
          );
          setTimeout(() => {
            elemento.classList.remove(
              "ring-2",
              "ring-[#009966]",
              "dark:ring-emerald-500",
              "ring-offset-2",
              "ring-offset-white",
              "dark:ring-offset-neutral-950",
              "transition-all",
              "duration-300",
            );
          }, 2000);
        }
      }, 100);
    }
  }, [assuntoAbertoId]);

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
      <div className="text-center p-12 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors duration-300">
        <BookOpen className="w-12 h-12 text-gray-300 dark:text-neutral-700 mx-auto mb-4 transition-colors duration-300" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-200 transition-colors duration-300">
          Nenhum material disponível
        </h3>
        <p className="text-gray-500 dark:text-neutral-500 transition-colors duration-300">
          Ainda não há videoaulas cadastradas no sistema.
        </p>
      </div>
    );
  }

  const materiasOrdenadas = [...materias].sort((a, b) =>
    a.nome.localeCompare(b.nome, undefined, { numeric: true }),
  );

  return (
    <div className="space-y-4">
      {materiasOrdenadas.map((materia) => {
        const isMateriaAberta = materiasAbertas.includes(materia.id);

        const assuntosOrdenados = [...materia.assuntos].sort((a, b) =>
          a.nome.localeCompare(b.nome, undefined, { numeric: true }),
        );

        return (
          <div
            key={materia.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleMateria(materia.id)}
              className={`w-full flex items-center justify-between p-5 transition-colors duration-300 ${
                isMateriaAberta
                  ? "bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-200 dark:border-neutral-800"
                  : "hover:bg-gray-50 dark:hover:bg-neutral-800/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-xl transition-colors duration-300 ${
                    isMateriaAberta
                      ? "bg-[#009966] dark:bg-emerald-600 text-white shadow-md shadow-[#009966]/20 dark:shadow-emerald-900/20"
                      : "bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-400"
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2
                    className={`text-xl font-bold transition-colors duration-300 ${
                      isMateriaAberta
                        ? "text-[#009966] dark:text-emerald-400"
                        : "text-gray-900 dark:text-neutral-200"
                    }`}
                  >
                    {materia.nome}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-neutral-500 font-medium mt-0.5 transition-colors duration-300">
                    {materia.assuntos.length}{" "}
                    {materia.assuntos.length === 1 ? "assunto" : "assuntos"}{" "}
                    disponíveis
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-6 h-6 transition-transform duration-300 ${
                  isMateriaAberta
                    ? "rotate-180 text-[#009966] dark:text-emerald-500"
                    : "text-gray-400 dark:text-neutral-500"
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isMateriaAberta
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3 bg-gray-50/50 dark:bg-neutral-950/50 transition-colors duration-300">
                  {assuntosOrdenados.map((assunto) => {
                    const isAssuntoAberto = assuntosAbertos.includes(
                      assunto.id,
                    );

                    const aulasOrdenadas = [...assunto.aulas].sort((a, b) =>
                      a.titulo.localeCompare(b.titulo, undefined, {
                        numeric: true,
                      }),
                    );

                    return (
                      <div
                        key={assunto.id}
                        id={`assunto-${assunto.id}`}
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden transition-all duration-500"
                      >
                        <button
                          onClick={() => toggleAssunto(assunto.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-gray-400 dark:text-neutral-500 transition-colors duration-300" />
                            <h3 className="font-semibold text-gray-800 dark:text-neutral-300 text-left transition-colors duration-300">
                              {assunto.nome}
                            </h3>
                            <span className="text-xs font-bold bg-gray-100 dark:bg-neutral-800 text-[#009966] dark:text-emerald-400 px-2.5 py-1 rounded-full ml-2 border border-gray-200 dark:border-neutral-700/50 shrink-0 transition-colors duration-300">
                              {assunto.aulas.length}{" "}
                              {assunto.aulas.length === 1 ? "aula" : "aulas"}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-200 shrink-0 ${
                              isAssuntoAberto
                                ? "rotate-180 text-gray-400 dark:text-neutral-400"
                                : "text-gray-500 dark:text-neutral-600"
                            }`}
                          />
                        </button>

                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isAssuntoAberto
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 transition-colors duration-300">
                              {aulasOrdenadas.map((aula) => {
                                const videoId = getYouTubeId(aula.videoUrl);
                                const thumbnailUrl = videoId
                                  ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                                  : null;

                                return (
                                  <a
                                    key={aula.id}
                                    href={aula.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-neutral-800 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-300"
                                  >
                                    {thumbnailUrl ? (
                                      <div className="relative w-28 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-800 group-hover:border-[#009966]/50 dark:group-hover:border-emerald-500/50 transition-colors duration-300 bg-gray-100 dark:bg-neutral-950">
                                        <Image
                                          src={thumbnailUrl}
                                          alt={aula.titulo}
                                          fill
                                          sizes="112px"
                                          unoptimized
                                          className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                          <PlayCircle className="w-6 h-6 text-white/80 group-hover:text-white transition-transform group-hover:scale-110 drop-shadow-md" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-28 h-16 shrink-0 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center border border-gray-200 dark:border-neutral-700 transition-colors duration-300">
                                        <PlayCircle className="w-6 h-6 text-gray-400 dark:text-neutral-500 group-hover:text-[#009966] dark:group-hover:text-emerald-400 transition-colors duration-300" />
                                      </div>
                                    )}

                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm text-gray-600 dark:text-neutral-400 font-medium group-hover:text-gray-900 dark:group-hover:text-neutral-200 transition-colors duration-300 line-clamp-2 leading-tight">
                                        {aula.titulo}
                                      </span>
                                      <span className="text-[10px] font-bold text-[#009966]/0 dark:text-emerald-500/0 group-hover:text-[#009966] dark:group-hover:text-emerald-500 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                                        Assistir Agora &rarr;
                                      </span>
                                    </div>
                                  </a>
                                );
                              })}
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
