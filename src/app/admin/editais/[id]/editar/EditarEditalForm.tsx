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
  Send,
  ChevronDown,
  Layers,
  ArrowLeft,
  BookOpen,
  BookMarked,
  ImageIcon,
  X,
  Search,
  UploadCloud,
} from "lucide-react";
import { atualizarEditalAdmin } from "@/actions/editais";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface EditarEditalFormProps {
  edital: any;
  initialAssuntosBasicos: number[];
  initialAssuntosEspecificos: number[];
  assuntosDb: any[];
}

export default function EditarEditalForm({
  edital = {}, // Proteção
  initialAssuntosBasicos = [],
  initialAssuntosEspecificos = [],
  assuntosDb = [],
}: EditarEditalFormProps) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(edital?.titulo || "");
  const [banca, setBanca] = useState(edital?.banca || "");
  const [descricao, setDescricao] = useState(edital?.descricao || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(edital?.thumbnailUrl || "");
  const [pdfUrl, setPdfUrl] = useState(edital?.pdfUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [manuallyExpandedMaterias, setManuallyExpandedMaterias] = useState<
    string[]
  >([]);
  const [abaAtiva, setAbaAtiva] = useState<"basico" | "especifico">("basico");
  const [assuntosBasicos, setAssuntosBasicos] = useState<number[]>(
    initialAssuntosBasicos,
  );
  const [assuntosEspecificos, setAssuntosEspecificos] = useState<number[]>(
    initialAssuntosEspecificos,
  );
  const assuntosSelecionadosAtuais =
    abaAtiva === "basico" ? assuntosBasicos : assuntosEspecificos;
  const setSelecionadosAtuais =
    abaAtiva === "basico" ? setAssuntosBasicos : setAssuntosEspecificos;
  const { startUpload: uploadImage, isUploading: isUploadingImage } =
    useUploadThing("imageUploader", {
      onClientUploadComplete: (res) => {
        if (res && res[0]) {
          setThumbnailUrl(res[0].url);
          toast.success("Nova capa enviada com sucesso!");
        }
      },
      onUploadError: (error: Error) => {
        toast.error(`Erro no upload da capa: ${error.message}`);
      },
    });

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setThumbnailUrl(objectUrl);
    await uploadImage([file]);
  };
  const { startUpload: uploadPdf, isUploading: isUploadingPdf } =
    useUploadThing("pdfUploader", {
      onClientUploadComplete: (res) => {
        if (res && res[0]) {
          setPdfUrl(res[0].url);
          toast.success("Novo Edital em PDF enviado com sucesso!");
        }
      },
      onUploadError: (error: Error) => {
        toast.error(`Erro no upload do PDF: ${error.message}`);
      },
    });

  const handlePdfSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor, selecione apenas arquivos PDF.");
      return;
    }

    await uploadPdf([file]);
  };
  const isSearching = searchTerm.trim().length > 0;
  const assuntosAgrupados = useMemo(() => {
    let filtrados = [...assuntosDb];
    if (isSearching) {
      const lowerSearch = searchTerm.toLowerCase();
      filtrados = filtrados.filter(
        (item) =>
          item.nome?.toLowerCase().includes(lowerSearch) ||
          (item.materiaNome &&
            item.materiaNome.toLowerCase().includes(lowerSearch)),
      );
    }
    const grupos: Record<string, any[]> = {};
    filtrados.forEach((assunto) => {
      const materia = assunto.materiaNome || "Outros / Sem Matéria";
      if (!grupos[materia]) grupos[materia] = [];
      grupos[materia].push(assunto);
    });
    const gruposOrdenados: Record<string, any[]> = {};
    Object.keys(grupos)
      .sort((a, b) => a.localeCompare(b))
      .forEach((materia) => {
        gruposOrdenados[materia] = grupos[materia].sort((a, b) =>
          a.nome.localeCompare(b.nome),
        );
      });

    return gruposOrdenados;
  }, [assuntosDb, searchTerm, isSearching]);

  const toggleAssunto = (id: number) => {
    setSelecionadosAtuais((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleMateriaAccordion = (materiaNome: string) => {
    setManuallyExpandedMaterias((prev) =>
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

  const handleAtualizar = async (status: "Rascunho" | "Publicado") => {
    if (!edital?.id)
      return toast.error("Aviso", {
        description: "ID do edital não encontrado.",
      });
    if (!titulo.trim())
      return toast.error("Aviso", {
        description: "O título do edital é obrigatório.",
      });

    if (assuntosBasicos.length === 0 && assuntosEspecificos.length === 0) {
      return toast.error("Aviso", {
        description: "Selecione pelo menos um assunto (Básico ou Específico).",
      });
    }

    if (isUploadingImage || isUploadingPdf) {
      return toast.warning("Aguarde", {
        description: "Existem arquivos sendo enviados para o servidor.",
      });
    }

    setIsSubmitting(true);

    try {
      const res = await atualizarEditalAdmin(edital.id, {
        titulo,
        banca,
        descricao,
        thumbnailUrl,
        pdfUrl,
        assuntosMapeados: {
          basico: assuntosBasicos,
          especifico: assuntosEspecificos,
        },
        status,
      });

      if (res.error) {
        toast.error("Erro ao atualizar", { description: res.error });
        setIsSubmitting(false);
      } else {
        toast.success("Edital Atualizado!", {
          description: `O edital foi salvo como ${status}.`,
        });
        router.push("/admin/editais");
      }
    } catch {
      toast.error("Erro Fatal", {
        description: "Falha ao conectar com o servidor.",
      });
      setIsSubmitting(false);
    }
  };

  const totalGeral = assuntosBasicos.length + assuntosEspecificos.length;

  return (
    <>
      <style>{`
        .hide-native-scroll::-webkit-scrollbar { display: none !important; }
        .hide-native-scroll { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider mb-4">
              <EditIcon className="w-4 h-4" /> Editando
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-emerald-600" />
              Editar Edital
            </h1>
            <p className="text-gray-500">
              Modifique as informações, arquivos ou os assuntos exigidos neste
              edital.
            </p>
          </div>

          <button
            onClick={() => router.push("/admin/editais")}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                      {isUploadingImage && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                          <Loader2 className="w-8 h-8 animate-spin text-white" />
                        </div>
                      )}

                      {!isUploadingImage && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                          <button
                            type="button"
                            onClick={() => setThumbnailUrl("")}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold transition-transform transform scale-95 group-hover:scale-100"
                          >
                            <X className="w-4 h-4" /> Remover Capa Atual
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label
                      className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors ${
                        isUploadingImage
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                          <span className="text-sm font-bold text-emerald-600">
                            Preparando...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            Clique para escolher uma imagem
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            PNG, JPG ou WEBP (Max 4MB)
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                        disabled={isUploadingImage}
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-100 pt-6">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Arquivo PDF do Edital
                  </label>

                  {pdfUrl ? (
                    <div className="relative w-full p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center justify-between group">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-bold text-emerald-900 truncate">
                            Edital Anexado
                          </span>
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            Visualizar Arquivo Atual
                          </a>
                        </div>
                      </div>

                      {isUploadingPdf && (
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600 shrink-0" />
                      )}

                      {!isUploadingPdf && (
                        <button
                          type="button"
                          onClick={() => setPdfUrl("")}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl font-bold transition-transform transform scale-95 group-hover:scale-100 shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label
                      className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors ${
                        isUploadingPdf
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      {isUploadingPdf ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                          <span className="text-sm font-bold text-emerald-600">
                            Enviando PDF...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <UploadCloud className="w-5 h-5 text-gray-400" />
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            Clique para anexar um novo PDF
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            Apenas arquivos .PDF
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handlePdfSelect}
                        disabled={isUploadingPdf}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3">
              <button
                onClick={() => handleAtualizar("Publicado")}
                disabled={isSubmitting || isUploadingImage || isUploadingPdf}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-extrabold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Atualizar e Publicar
              </button>

              <button
                onClick={() => handleAtualizar("Rascunho")}
                disabled={isSubmitting || isUploadingImage || isUploadingPdf}
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

              <div className="flex p-1 bg-gray-100 rounded-xl mb-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setAbaAtiva("basico")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
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
                  type="button"
                  onClick={() => setAbaAtiva("especifico")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
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
                    placeholder={`Pesquisar para atualizar em ${abaAtiva === "basico" ? "Básico" : "Específico"}...`}
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
                            isSearching ||
                            manuallyExpandedMaterias.includes(materiaNome);

                          const assuntosDaMateriaIds = assuntos.map(
                            (a) => a.id,
                          );
                          const selecionadosNestaMateria =
                            assuntosDaMateriaIds.filter((id) =>
                              assuntosSelecionadosAtuais.includes(id),
                            ).length;
                          const todosSelecionados =
                            selecionadosNestaMateria ===
                              assuntosDaMateriaIds.length &&
                            assuntosDaMateriaIds.length > 0;

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
                                    type="button"
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
                                    className={`w-4 h-4 text-gray-400 transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
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
                                          className={`wrap-break-word leading-snug text-[13px] ${isSelected ? "text-gray-900 font-medium" : "text-gray-500"}`}
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

function EditIcon(props: any) {
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
      <path d="M12 22h6" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
