/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  ImageIcon,
  X,
  CalendarIcon,
  Clock,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { salvarNoticia, atualizarNoticia } from "@/actions/noticias";

// UPLOADTHING
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// SHADCN & DATAS
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export function NoticiaForm({
  noticiaEditando,
  concursosDb = [],
  editaisDb = [],
  relacoesConcursosIniciais = [], // Recebe os IDs dos concursos relacionados a esta noticia
  relacoesEditaisIniciais = [], // Recebe os IDs dos editais relacionados a esta noticia
}: {
  noticiaEditando?: any | null;
  concursosDb: any[];
  editaisDb: any[];
  relacoesConcursosIniciais?: number[];
  relacoesEditaisIniciais?: string[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Localização
  const [estado, setEstado] = useState(noticiaEditando?.estado || "");
  const [municipio, setMunicipio] = useState(noticiaEditando?.municipio || "");

  // Estados de Múltipla Seleção
  const [selectedConcursos, setSelectedConcursos] = useState<number[]>(
    relacoesConcursosIniciais,
  );
  const [selectedEditais, setSelectedEditais] = useState<string[]>(
    relacoesEditaisIniciais,
  );

  // Estados dos Arquivos
  const [thumbnailUrl, setThumbnailUrl] = useState(
    noticiaEditando?.thumbnailUrl || "",
  );

  // Estados de Data e Hora
  const [date, setDate] = useState<Date | undefined>(
    noticiaEditando?.dataPublicacao
      ? new Date(noticiaEditando.dataPublicacao)
      : new Date(),
  );
  const [time, setTime] = useState<string>(
    noticiaEditando?.dataPublicacao
      ? format(new Date(noticiaEditando.dataPublicacao), "HH:mm")
      : format(new Date(), "HH:mm"),
  );

  const concursosStr = JSON.stringify(relacoesConcursosIniciais);
  const editaisStr = JSON.stringify(relacoesEditaisIniciais);

  useEffect(() => {
    setThumbnailUrl(noticiaEditando?.thumbnailUrl || "");
    if (noticiaEditando?.dataPublicacao) {
      setDate(new Date(noticiaEditando.dataPublicacao));
      setTime(format(new Date(noticiaEditando.dataPublicacao), "HH:mm"));
    }
    setEstado(noticiaEditando?.estado || "");
    setMunicipio(noticiaEditando?.municipio || "");
    setSelectedConcursos(JSON.parse(concursosStr));
    setSelectedEditais(JSON.parse(editaisStr));
  }, [noticiaEditando, concursosStr, editaisStr]);

  // CONFIGURAÇÃO DO UPLOADTHING
  const { startUpload, isUploading: isUploadingImage } = useUploadThing(
    "imageUploader",
    {
      onClientUploadComplete: (res) => {
        if (res && res[0]) {
          setThumbnailUrl(res[0].url);
          toast.success("Capa da notícia enviada com sucesso!");
        }
      },
      onUploadError: (error: Error) => {
        toast.error(`Erro no upload: ${error.message}`);
      },
    },
  );

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setThumbnailUrl(objectUrl);
    await startUpload([file]);
  };

  // Funções Auxiliares para Toggle de Multi-Seleção
  const toggleConcurso = (id: number) => {
    setSelectedConcursos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleEdital = (id: string) => {
    setSelectedEditais((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!thumbnailUrl) {
      return toast.error("A capa da notícia é obrigatória.");
    }

    if (!date || !time) {
      return toast.error("A data e a hora de publicação são obrigatórias.");
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("thumbnailUrl", thumbnailUrl);

    // Adiciona os arrays convertidos em String JSON para o backend processar
    formData.append("concursosIds", JSON.stringify(selectedConcursos));
    formData.append("editaisIds", JSON.stringify(selectedEditais));

    formData.append("estado", estado);
    formData.append("municipio", municipio);

    const [hours, minutes] = time.split(":").map(Number);
    const dataFinal = new Date(date);
    dataFinal.setHours(hours, minutes, 0, 0);

    formData.append("dataPublicacao", dataFinal.toISOString());

    try {
      if (noticiaEditando) {
        await atualizarNoticia(formData);
        toast.success("Notícia atualizada!");
      } else {
        await salvarNoticia(formData);
        toast.success("Notícia publicada com sucesso!");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro ao salvar a notícia.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Lista de Estados (UF) para o Select
  const estadosBR = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <form
      key={noticiaEditando?.id || "novo"}
      onSubmit={onSubmit}
      className="space-y-8"
    >
      {noticiaEditando && (
        <input type="hidden" name="id" value={noticiaEditando.id} />
      )}

      {/* BLOCO 1: INFORMAÇÕES PRINCIPAIS */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Informações Básicas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Título da Notícia *
            </label>
            <input
              name="titulo"
              type="text"
              required
              defaultValue={noticiaEditando?.titulo || ""}
              className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              placeholder="Ex: Saiu o edital da Polícia Federal 2026!"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Publicado Por *
            </label>
            <input
              name="publicadoPor"
              type="text"
              required
              defaultValue={noticiaEditando?.publicadoPor || ""}
              className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              placeholder="Ex: Equipe +Aprovado"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Tipo de Concurso *
            </label>
            <select
              name="tipoConcurso"
              required
              defaultValue={noticiaEditando?.tipoConcurso || ""}
              className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Selecione a área...</option>
              <option value="Concursos Policiais">Concursos Policiais</option>
              <option value="Concursos Fiscais">Concursos Fiscais</option>
              <option value="Concursos Tribunais">Concursos Tribunais</option>
              <option value="Concursos Administrativos">
                Concursos Administrativos
              </option>
              <option value="Concursos Militares">Concursos Militares</option>
              <option value="Geral">Notícia Geral</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Data e Hora de Publicação *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-200 p-3 rounded-xl h-11.5 focus:ring-2 focus:ring-emerald-500 bg-white hover:bg-gray-50 shadow-none",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    `${format(date, "dd 'de' MMM, yyyy", { locale: ptBR })} às ${time}`
                  ) : (
                    <span>Selecione a data e hora</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white opacity-100 shadow-2xl border border-gray-200 z-100 relative rounded-xl"
                align="start"
              >
                <div className="bg-white rounded-t-xl overflow-hidden relative z-10">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                    className="bg-white"
                  />
                </div>
                <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between gap-2 relative z-10">
                  <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Horário:
                  </span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border border-gray-200 rounded-md p-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* BLOCO 2: LOCALIZAÇÃO */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Filtros de Região (Opcional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Estado (UF)
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Qualquer Estado (Nacional)</option>
              {estadosBR.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Município
            </label>
            <input
              type="text"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              placeholder="Ex: Fortaleza, São Paulo..."
            />
          </div>
        </div>
      </div>

      {/* BLOCO 3: VINCULAÇÃO MÚLTIPLA */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Vincular Concursos e Editais (Opcional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MÚLTIPLA SELEÇÃO DE CONCURSOS */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Concursos Relacionados
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between w-full border-gray-200 p-3 rounded-xl h-11.5 bg-white shadow-none font-normal"
                >
                  {selectedConcursos.length > 0
                    ? `${selectedConcursos.length} concurso(s) selecionado(s)`
                    : "Nenhum concurso vinculado"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-75 md:w-100 p-0 bg-white shadow-xl z-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="max-h-75 overflow-y-auto p-1 hide-native-scroll">
                  {concursosDb.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      Nenhum concurso encontrado no sistema.
                    </p>
                  ) : (
                    concursosDb.map((c) => {
                      const isSelected = selectedConcursos.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleConcurso(c.id)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300"}`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm font-medium text-gray-700 leading-tight">
                            {c.orgao} -{" "}
                            <span className="text-gray-500 font-normal">
                              {c.cargo}
                            </span>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {selectedConcursos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedConcursos.map((id) => {
                  const conc = concursosDb.find((c) => c.id === id);
                  if (!conc) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded-md"
                    >
                      {conc.orgao}{" "}
                      <button type="button" onClick={() => toggleConcurso(id)}>
                        <X className="w-3 h-3 hover:text-emerald-900" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* MÚLTIPLA SELEÇÃO DE EDITAIS */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1.5 text-gray-800 text-sm">
              Editais Relacionados
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between w-full border-gray-200 p-3 rounded-xl h-11.5 bg-white shadow-none font-normal"
                >
                  {selectedEditais.length > 0
                    ? `${selectedEditais.length} edital(is) selecionado(s)`
                    : "Nenhum edital vinculado"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-75 md:w-100 p-0 bg-white shadow-xl z-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="max-h-75 overflow-y-auto p-1 hide-native-scroll">
                  {editaisDb.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      Nenhum edital encontrado no sistema.
                    </p>
                  ) : (
                    editaisDb.map((e) => {
                      const isSelected = selectedEditais.includes(e.id);
                      return (
                        <div
                          key={e.id}
                          onClick={() => toggleEdital(e.id)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300"}`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm font-medium text-gray-700 leading-tight">
                            {e.titulo}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {selectedEditais.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedEditais.map((id) => {
                  const edital = editaisDb.find((e) => e.id === id);
                  if (!edital) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded-md"
                    >
                      {edital.titulo}{" "}
                      <button type="button" onClick={() => toggleEdital(id)}>
                        <X className="w-3 h-3 hover:text-emerald-900" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BLOCO 4: CONTEÚDO E IMAGEM */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1.5 text-gray-800 text-sm">
          Descrição / Notícia *
        </label>
        <textarea
          name="conteudo"
          required
          rows={6}
          defaultValue={noticiaEditando?.conteudo || ""}
          className="border border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
          placeholder="Escreva o conteúdo completo da notícia aqui..."
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-200 pt-8">
        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Capa da Notícia (Thumb) *
        </label>

        {thumbnailUrl ? (
          <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden border flex items-center justify-center border-gray-200 group">
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
                  <X className="w-4 h-4" /> Remover Imagem
                </button>
              </div>
            )}
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-10 bg-gray-50 hover:bg-gray-100 transition-colors ${isUploadingImage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                <span className="text-sm font-bold text-emerald-600">
                  Enviando Imagem...
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-sm font-bold text-gray-700">
                  Clique para adicionar a capa
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Recomendado: 1280x720 (16:9)
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

      {/* BOTÕES DE AÇÃO */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        {noticiaEditando && (
          <Link
            href="/admin/noticias"
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 duration-200 cursor-pointer active:scale-95 shadow-sm"
          >
            Cancelar
          </Link>
        )}
        <button
          type="submit"
          disabled={isUploadingImage || isSubmitting}
          className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 duration-200 cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {noticiaEditando ? "Atualizar Notícia" : "Publicar Notícia"}
        </button>
      </div>

      <style>{`
        .hide-native-scroll::-webkit-scrollbar { display: none; }
        .hide-native-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </form>
  );
}
