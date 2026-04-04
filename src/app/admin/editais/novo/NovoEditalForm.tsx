/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  FileText,
  Check,
  Search,
  Send,
  ChevronDown,
  Layers,
  BookMarked,
  BookOpen,
  ImageIcon,
  X,
} from "lucide-react";
import { criarEditalAdmin } from "@/actions/editais";

// AJUSTE ESTE IMPORT DE ACORDO COM A SUA CONFIGURAÇÃO DO UPLOADTHING!
// Geralmente fica em "@/utils/uploadthing" ou "@/lib/uploadthing"
import { UploadDropzone } from "@/utils/uploadthing";

export default function NovoEditalForm({
  assuntosDb = [],
}: {
  assuntosDb?: any[];
}) {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [banca, setBanca] = useState("");
  const [descricao, setDescricao] = useState("");
  // NOVO ESTADO: Guarda a URL da imagem carregada
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMaterias, setExpandedMaterias] = useState<string[]>([]);

  // Novo Sistema: Tabs de Navegação e Estados Separados
  const [abaAtiva, setAbaAtiva] = useState<"basico" | "especifico">("basico");
  const [assuntosBasicos, setAssuntosBasicos] = useState<number[]>([]);
  const [assuntosEspecificos, setAssuntosEspecificos] = useState<number[]>([]);

  // Qual lista estamos editando no momento?
  const assuntosSelecionadosAtuais =
    abaAtiva === "basico" ? assuntosBasicos : assuntosEspecificos;
  const setSelecionadosAtuais =
    abaAtiva === "basico" ? setAssuntosBasicos : setAssuntosEspecificos;

  const filteredAssuntos = useMemo(() => {
    if (!searchTerm.trim()) return assuntosDb;
    const lowerSearch = searchTerm.toLowerCase();
    return assuntosDb.filter(
      (item) =>
        item.nome.toLowerCase().includes(lowerSearch) ||
        (item.materiaNome &&
          item.materiaNome.toLowerCase().includes(lowerSearch)),
    );
  }, [assuntosDb, searchTerm]);

  const assuntosAgrupados = useMemo(() => {
    const grupos: Record<string, any[]> = {};
    filteredAssuntos.forEach((assunto) => {
      const materia = assunto.materiaNome || "Outros / Sem Matéria";
      if (!grupos[materia]) grupos[materia] = [];
      grupos[materia].push(assunto);
    });
    return grupos;
  }, [filteredAssuntos]);

  const toggleAssunto = (id: number) => {
    setSelecionadosAtuais((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleMateriaAccordion = (materiaNome: string) => {
    setExpandedMaterias((prev) =>
      prev.includes(materiaNome)
        ? prev.filter((m) => m !== materiaNome)
        : [...prev, materiaNome],
    );
  };

  const toggleAllInMateria = (e: React.MouseEvent, materiaNome: string) => {
    e.stopPropagation();
    const assuntosDaMateria = assuntosAgrupados[materiaNome].map((a) => a.id);
    const todosSelecionados = assuntosDaMateria.every((id) =>
      assuntosSelecionadosAtuais.includes(id),
    );

    if (todosSelecionados) {
      setSelecionadosAtuais((prev) =>
        prev.filter((id) => !assuntosDaMateria.includes(id)),
      );
    } else {
      setSelecionadosAtuais((prev) => {
        const novosIds = assuntosDaMateria.filter((id) => !prev.includes(id));
        return [...prev, ...novosIds];
      });
    }
  };

  const handleSalvar = async (status: "Rascunho" | "Publicado") => {
    if (!titulo.trim())
      return toast.error("Aviso", {
        description: "O título do edital é obrigatório.",
      });

    if (assuntosBasicos.length === 0 && assuntosEspecificos.length === 0) {
      return toast.error("Aviso", {
        description: "Selecione pelo menos um assunto (Básico ou Específico).",
      });
    }

    setIsSubmitting(true);

    const res = await criarEditalAdmin({
      titulo,
      banca,
      descricao,
      thumbnailUrl, // Passamos a URL da Imagem para a Action!
      assuntosMapeados: {
        basico: assuntosBasicos,
        especifico: assuntosEspecificos,
      },
      status,
    });

    if (res.error) {
      toast.error("Erro ao salvar", { description: res.error });
      setIsSubmitting(false);
    } else {
      toast.success("Edital Criado!", {
        description: `O edital foi salvo como ${status}.`,
      });
      router.push("/admin/editais");
    }
  };

  const totalGeral = assuntosBasicos.length + assuntosEspecificos.length;

  return (
    <>
      <style>{`
        .hide-native-scroll::-webkit-scrollbar { display: none !important; }
        .hide-native-scroll { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8 animate-in mb-12 fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldAlert className="w-4 h-4" /> Área do Administrador
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-emerald-600" />
              Cadastrar Novo Edital
            </h1>
            <p className="text-gray-500">
              Crie o mapeamento do edital dividindo as matérias em Conhecimentos
              Básicos e Específicos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUNA ESQUERDA: INFORMAÇÕES E BOTÕES */}
          <div className="space-y-6 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" /> Dados do
                Edital
              </h2>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Título do Edital *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Soldado PMCE 2026"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Banca Organizadora
                  </label>
                  <input
                    type="text"
                    value={banca}
                    onChange={(e) => setBanca(e.target.value)}
                    placeholder="Ex: IDECAN, Cebraspe, FCC..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Descrição / Notas
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Informações adicionais sobre este edital..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3.5 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 resize-none h-24"
                  />
                </div>

                {/* NOVO CAMPO: UPLOAD DE THUMBNAIL */}
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-6">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Capa do Edital
                  </label>

                  {thumbnailUrl ? (
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden border flex items-center justify-center border-gray-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl}
                        alt="Capa"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setThumbnailUrl("")}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold transition-transform transform scale-95 group-hover:scale-100"
                        >
                          <X className="w-4 h-4" /> Remover Imagem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <UploadDropzone
                        endpoint="imageUploader" // Certifique-se que é este o nome do endpoint no seu arquivo core.ts
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            setThumbnailUrl(res[0].url);
                            toast.success("Capa enviada com sucesso!");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Erro no upload: ${error.message}`);
                        }}
                        className="ut-label:text-emerald-600 ut-button:bg-emerald-600 ut-button:ut-readying:bg-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3">
              <button
                onClick={() => handleSalvar("Publicado")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-extrabold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Publicar Edital
              </button>

              <button
                onClick={() => handleSalvar("Rascunho")}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-4 rounded-2xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Salvar como Rascunho
              </button>
            </div>
          </div>

          {/* COLUNA DIREITA: MAPEAMENTO COM TABS (Básico / Específico) */}
          <div className="space-y-6 h-full flex flex-col">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col flex-1 h-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" /> Mapeamento
                </h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-200 font-bold">
                  Total: {totalGeral} Assuntos
                </span>
              </div>

              {/* TABS DE NAVEGAÇÃO */}
              <div className="flex p-1 gap-2 bg-gray-100 rounded-xl mb-4 shrink-0">
                <button
                  onClick={() => setAbaAtiva("basico")}
                  className={`flex-1 flex cursor-pointer items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    abaAtiva === "basico"
                      ? "bg-white text-emerald-700 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Conhecimentos Básicos
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[9px]">
                    {assuntosBasicos.length}
                  </span>
                </button>
                <button
                  onClick={() => setAbaAtiva("especifico")}
                  className={`flex-1 flex cursor-pointer items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    abaAtiva === "especifico"
                      ? "bg-white text-emerald-700 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <BookMarked className="w-4 h-4" /> Conhecimentos Específicos
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[9px]">
                    {assuntosEspecificos.length}
                  </span>
                </button>
              </div>

              <div className="flex flex-col flex-1 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden min-h-0">
                <div className="flex items-center px-4 h-12 shrink-0 border-b border-gray-200 bg-white">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Pesquisar para adicionar em ${abaAtiva === "basico" ? "Básico" : "Específico"}...`}
                    className="flex-1 bg-transparent border-none text-gray-900 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400"
                  />
                </div>

                <div
                  data-lenis-prevent="true"
                  data-force-scroll="true"
                  className="hide-native-scroll relative flex-1 overflow-x-hidden overflow-y-auto p-2"
                  style={{ overscrollBehavior: "contain" }}
                >
                  {Object.keys(assuntosAgrupados).length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      Nenhum resultado encontrado.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {Object.entries(assuntosAgrupados).map(
                        ([materiaNome, assuntos]) => {
                          const isExpanded =
                            expandedMaterias.includes(materiaNome);
                          const assuntosDaMateriaIds = assuntos.map(
                            (a) => a.id,
                          );

                          // Usa os assuntos do estado da aba atual!
                          const selecionadosNestaMateria =
                            assuntosDaMateriaIds.filter((id) =>
                              assuntosSelecionadosAtuais.includes(id),
                            ).length;
                          const todosSelecionados =
                            selecionadosNestaMateria ===
                            assuntosDaMateriaIds.length;

                          return (
                            <div
                              key={materiaNome}
                              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                            >
                              <div
                                onClick={() =>
                                  toggleMateriaAccordion(materiaNome)
                                }
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={(e) =>
                                      toggleAllInMateria(e, materiaNome)
                                    }
                                    className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                      todosSelecionados
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : selecionadosNestaMateria > 0
                                          ? "bg-emerald-100 border-emerald-500 text-emerald-500"
                                          : "border-gray-300 bg-white"
                                    }`}
                                  >
                                    {(todosSelecionados ||
                                      selecionadosNestaMateria > 0) && (
                                      <Check className="w-3.5 h-3.5 stroke-3" />
                                    )}
                                  </button>
                                  <span className="text-sm font-bold text-gray-700 truncate">
                                    {materiaNome}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-bold text-gray-400">
                                    {selecionadosNestaMateria}/
                                    {assuntosDaMateriaIds.length}
                                  </span>
                                  <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  />
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="flex flex-col border-t border-gray-100 bg-gray-50/50">
                                  {assuntos.map((assunto) => {
                                    const isSelected =
                                      assuntosSelecionadosAtuais.includes(
                                        assunto.id,
                                      );
                                    return (
                                      <button
                                        key={assunto.id}
                                        type="button"
                                        onClick={() =>
                                          toggleAssunto(assunto.id)
                                        }
                                        className="flex items-start gap-3 w-full text-left px-4 py-2.5 transition-colors hover:bg-gray-100 group"
                                      >
                                        <div
                                          className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center transition-colors ml-6 ${
                                            isSelected
                                              ? "bg-emerald-500 border-emerald-500 text-white"
                                              : "border-gray-300 bg-white group-hover:border-emerald-300"
                                          }`}
                                        >
                                          {isSelected && (
                                            <Check className="w-3 h-3 stroke-3" />
                                          )}
                                        </div>
                                        <span
                                          className={`whitespace-normal leading-snug text-[13px] ${isSelected ? "text-gray-900 font-medium" : "text-gray-500"}`}
                                        >
                                          {assunto.nome}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ShieldAlert(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
