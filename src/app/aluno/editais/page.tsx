/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // <-- Importação correta do Next Image
import { toast } from "sonner";
import {
  Building2,
  ArrowRight,
  Loader2,
  Sparkles,
  Target,
  NotepadText,
} from "lucide-react";
import { obterEditaisPublicados } from "@/actions/editais";

export default function EditaisAlunoPage() {
  const [editais, setEditais] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchEditais() {
      try {
        const res = await obterEditaisPublicados();
        if (isMounted) {
          if (res.success && res.editais) {
            setEditais(res.editais);
          } else {
            toast.error("Ops!", { description: res.error });
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (isMounted) {
          toast.error("Erro", { description: "Falha ao buscar editais." });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchEditais();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 mt-6 mb-12 animate-in fade-in duration-500">
      {/* CABEÇALHO HERO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <NotepadText className="w-8 h-8 text-emerald-500" />
            Editais
          </h1>
          <p className="text-neutral-400">
            Escolha o seu concurso alvo e acesse o raio-x completo do edital.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      {/* LISTAGEM DE EDITAIS EM GRID */}
      {editais.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-neutral-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Nenhum edital disponível no momento
          </h3>
          <p className="text-neutral-400 max-w-md">
            A nossa equipa está a trabalhar no mapeamento de novos concursos.
            Volte em breve para conferir as novidades!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editais.map((edital) => (
            <div
              key={edital.id}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all duration-300 group relative"
            >
              {/* IMAGEM DE FUNDO DO CARD (Thumbnail) */}
              {edital.thumbnailUrl && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <Image
                    src={edital.thumbnailUrl}
                    alt={edital.titulo}
                    fill
                    unoptimized
                    className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Máscara: Fade da Esquerda para a Direita (Garante a leitura do título) */}
                  <div className="absolute inset-0 bg-linear-to-r from-neutral-900 via-neutral-900/80 to-transparent" />
                  {/* Máscara: Fade de Baixo para Cima (Protege a zona do botão inferior) */}
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                </div>
              )}

              {/* CONTEÚDO DO CARD (com z-10 para ficar por cima do fundo) */}
              <div className="relative z-10 p-6 flex-1 flex flex-col">
                {/* Meta Header */}
                <div className="flex justify-between items-start mb-5">
                  {edital.banca && (
                    <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border bg-neutral-950/20  shadow-sm backdrop-blur-sm border-neutral-800 text-neutral-400 flex items-center gap-1.5 shadow-neutral-950">
                      {edital.banca}
                    </span>
                  )}
                </div>

                {/* Título e Descrição */}
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-emerald-400 transition-colors drop-shadow-md">
                  {edital.titulo}
                </h3>

                {edital.descricao ? (
                  <p className="text-sm text-neutral-400 line-clamp-3 mb-6 leading-relaxed drop-shadow-sm">
                    {edital.descricao}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-600 italic mb-6">
                    Sem descrição adicional fornecida para este edital.
                  </p>
                )}

                <div className="mt-auto pt-6 border-t border-neutral-800/60 relative">
                  <Link
                    href={`/aluno/editais/${edital.id}`}
                    className="w-full flex items-center justify-between group/btn"
                  >
                    <span className="text-sm font-bold text-neutral-300 group-hover/btn:text-emerald-400 transition-colors">
                      Explorar Edital
                    </span>
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center group-hover/btn:bg-emerald-500 group-hover/btn:text-neutral-950 text-neutral-400 transition-all duration-300 group-hover/btn:translate-x-1">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
