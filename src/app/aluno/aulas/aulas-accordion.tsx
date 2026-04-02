// src/app/aluno/materiais/aulas-accordion.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, PlayCircle, BookOpen, Layers } from "lucide-react";

// Definimos o formato dos dados que vamos receber do banco
type Aula = { id: number; titulo: string; videoUrl: string };
type Assunto = { id: number; nome: string; aulas: Aula[] };
type Materia = { id: number; nome: string; assuntos: Assunto[] };

// Função mágica para extrair o ID do vídeo de qualquer formato de link do YouTube
function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

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
      <div className="text-center p-12 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm">
        <BookOpen className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-neutral-200">
          Nenhum material disponível
        </h3>
        <p className="text-neutral-500">
          Ainda não há videoaulas cadastradas no sistema.
        </p>
      </div>
    );
  }

  // 1. Ordenamos as Matérias em ordem alfabética/numérica
  const materiasOrdenadas = [...materias].sort((a, b) =>
    a.nome.localeCompare(b.nome, undefined, { numeric: true }),
  );

  return (
    <div className="space-y-4">
      {materiasOrdenadas.map((materia) => {
        const isMateriaAberta = materiasAbertas.includes(materia.id);

        // 2. Ordenamos os Assuntos em ordem alfabética/numérica
        const assuntosOrdenados = [...materia.assuntos].sort((a, b) =>
          a.nome.localeCompare(b.nome, undefined, { numeric: true }),
        );

        return (
          <div
            key={materia.id}
            className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-sm overflow-hidden transition-all duration-300"
          >
            {/* NÍVEL 1: MATÉRIA */}
            <button
              onClick={() => toggleMateria(materia.id)}
              className={`w-full flex items-center justify-between p-5 transition-colors ${
                isMateriaAberta
                  ? "bg-neutral-800/50 border-b border-neutral-800"
                  : "hover:bg-neutral-800/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-xl transition-colors ${
                    isMateriaAberta
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2
                    className={`text-xl font-bold transition-colors ${
                      isMateriaAberta ? "text-emerald-400" : "text-neutral-200"
                    }`}
                  >
                    {materia.nome}
                  </h2>
                  <p className="text-sm text-neutral-500 font-medium mt-0.5">
                    {materia.assuntos.length}{" "}
                    {materia.assuntos.length === 1 ? "assunto" : "assuntos"}{" "}
                    disponíveis
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-6 h-6 transition-transform duration-300 ${
                  isMateriaAberta
                    ? "rotate-180 text-emerald-500"
                    : "text-neutral-500"
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
                <div className="p-4 space-y-3 bg-neutral-950/50">
                  {assuntosOrdenados.map((assunto) => {
                    const isAssuntoAberto = assuntosAbertos.includes(
                      assunto.id,
                    );

                    // 3. Ordenamos as Aulas em ordem alfabética/numérica
                    const aulasOrdenadas = [...assunto.aulas].sort((a, b) =>
                      a.titulo.localeCompare(b.titulo, undefined, {
                        numeric: true,
                      }),
                    );

                    return (
                      <div
                        key={assunto.id}
                        className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden"
                      >
                        {/* NÍVEL 2: ASSUNTO */}
                        <button
                          onClick={() => toggleAssunto(assunto.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Layers className="w-5 h-5 text-neutral-500" />
                            <h3 className="font-semibold text-neutral-300 text-left">
                              {assunto.nome}
                            </h3>
                            <span className="text-xs font-bold bg-neutral-800 text-emerald-400 px-2.5 py-1 rounded-full ml-2 border border-neutral-700/50 shrink-0">
                              {assunto.aulas.length}{" "}
                              {assunto.aulas.length === 1 ? "aula" : "aulas"}
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-200 shrink-0 ${
                              isAssuntoAberto
                                ? "rotate-180 text-neutral-400"
                                : "text-neutral-600"
                            }`}
                          />
                        </button>

                        {/* NÍVEL 3: AULAS (VÍDEOS COM THUMBNAIL) */}
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isAssuntoAberto
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="border-t border-neutral-800 bg-neutral-950 p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                    className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-neutral-800 hover:bg-neutral-900 transition-all duration-300"
                                  >
                                    {/* THUMBNAIL DA AULA */}
                                    {thumbnailUrl ? (
                                      <div className="relative w-28 h-16 shrink-0 rounded-lg overflow-hidden border border-neutral-800 group-hover:border-emerald-500/50 transition-colors bg-neutral-950">
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
                                      <div className="w-28 h-16 shrink-0 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                        <PlayCircle className="w-6 h-6 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
                                      </div>
                                    )}

                                    {/* TÍTULO E BOTÃO */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm text-neutral-400 font-medium group-hover:text-neutral-200 transition-colors line-clamp-2 leading-tight">
                                        {aula.titulo}
                                      </span>
                                      <span className="text-[10px] font-bold text-emerald-500/0 group-hover:text-emerald-500 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
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
