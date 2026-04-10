"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ImageIcon, X, CalendarIcon } from "lucide-react";
import { salvarConcurso, atualizarConcurso } from "../../../actions/concursos";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// IMPORTAÇÕES DO SHADCN E DATAS
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export function ConcursoForm({
  concursoEditando,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  concursoEditando: any | null;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState(
    concursoEditando?.thumbnailUrl || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ESTADO PARA VIGIAR A ESCOLARIDADE E ABRIR O CAMPO TÉCNICO
  const [escolaridade, setEscolaridade] = useState(
    concursoEditando?.escolaridade || "",
  );

  // 1. ESTADOS PARA OS NOVOS DATE PICKERS
  const [dateInscricao, setDateInscricao] = useState<DateRange | undefined>();
  const [dateIsencao, setDateIsencao] = useState<DateRange | undefined>();
  const [dateProva, setDateProva] = useState<Date | undefined>();

  // EFEITO DE INICIALIZAÇÃO AO EDITAR
  useEffect(() => {
    setThumbnailUrl(concursoEditando?.thumbnailUrl || "");
    setEscolaridade(concursoEditando?.escolaridade || "");

    // Puxar a Data da Prova Real
    if (concursoEditando?.dataProvaReal) {
      const parsedDataProva = new Date(concursoEditando.dataProvaReal);
      if (!isNaN(parsedDataProva.getTime())) {
        setDateProva(parsedDataProva);
      }
    } else {
      setDateProva(undefined);
    }

    setDateInscricao(undefined);
    setDateIsencao(undefined);
  }, [concursoEditando]);

  const { startUpload, isUploading: isUploadingImage } = useUploadThing(
    "imageUploader",
    {
      onClientUploadComplete: (res) => {
        if (res && res[0]) {
          setThumbnailUrl(res[0].url);
          toast.success("Capa enviada com sucesso!");
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

  async function handleAction(formData: FormData) {
    setIsSubmitting(true);
    formData.append("thumbnailUrl", thumbnailUrl);

    // 2. INJETAR AS DATAS DO CALENDÁRIO NO FORMDATA ANTES DE ENVIAR
    if (dateInscricao?.from) {
      let str = format(dateInscricao.from, "dd/MM/yyyy");
      if (dateInscricao.to) {
        str += ` a ${format(dateInscricao.to, "dd/MM/yyyy")}`;
        formData.append("fimInscricao", dateInscricao.to.toISOString());
      }
      formData.append("periodoInscricao", str);
    } else if (concursoEditando?.periodoInscricao) {
      formData.append("periodoInscricao", concursoEditando.periodoInscricao);
      if (concursoEditando.fimInscricao) {
        formData.append(
          "fimInscricao",
          new Date(concursoEditando.fimInscricao).toISOString(),
        );
      }
    }

    if (dateIsencao?.from) {
      let str = format(dateIsencao.from, "dd/MM/yyyy");
      if (dateIsencao.to) {
        str += ` a ${format(dateIsencao.to, "dd/MM/yyyy")}`;
      }
      formData.append("periodoIsencao", str);
    } else if (concursoEditando?.periodoIsencao) {
      formData.append("periodoIsencao", concursoEditando.periodoIsencao);
    }

    if (dateProva) {
      formData.append("dataProva", format(dateProva, "dd/MM/yyyy"));
      formData.append("dataProvaReal", dateProva.toISOString());
    }

    try {
      if (concursoEditando) {
        await atualizarConcurso(formData);
        toast.success("Concurso atualizado!");
      } else {
        await salvarConcurso(formData);
        toast.success("Concurso criado!");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Erro ao salvar o concurso.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      key={concursoEditando?.id || "novo"}
      action={handleAction}
      className="space-y-6"
    >
      {concursoEditando && (
        <input type="hidden" name="id" value={concursoEditando.id} />
      )}

      {/* LINHA 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Órgão *
          </label>
          <input
            name="orgao"
            type="text"
            required
            defaultValue={concursoEditando?.orgao || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="Ex: Polícia Civil do Ceará"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Cargo *
          </label>
          <input
            name="cargo"
            type="text"
            required
            defaultValue={concursoEditando?.cargo || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="Ex: Inspetor e Escrivão"
          />
        </div>
      </div>

      {/* LINHA 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Banca *
          </label>
          <input
            name="banca"
            type="text"
            required
            defaultValue={concursoEditando?.banca || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="Ex: IDECAN"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Vagas
          </label>
          <input
            name="vagas"
            type="text"
            defaultValue={concursoEditando?.vagas || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="Ex: 1.000 + CR"
          />
        </div>
      </div>

      {/* LINHA 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Salário
          </label>
          <input
            name="salario"
            type="text"
            defaultValue={concursoEditando?.salario || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="Ex: R$ 5.800,00"
          />
        </div>

        {/* COMBO ESCOLARIDADE + CURSO TÉCNICO */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
              Escolaridade
            </label>
            <select
              name="escolaridade"
              value={escolaridade}
              onChange={(e) => setEscolaridade(e.target.value)}
              className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white transition-colors"
            >
              <option value="">Selecione o nível...</option>
              <option value="Nível Fundamental">Nível Fundamental</option>
              <option value="Nível Médio">Nível Médio</option>
              <option value="Técnico">Técnico</option>
              <option value="Nível Superior">Nível Superior</option>
            </select>
          </div>

          {/* SÓ APARECE SE A ESCOLARIDADE FOR "TÉCNICO" */}
          {escolaridade === "Técnico" && (
            <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200 text-sm">
                Qual o curso técnico? *
              </label>
              <input
                name="cursoTecnico"
                type="text"
                required
                defaultValue={concursoEditando?.cursoTecnico || ""}
                className="border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-emerald-50/30 dark:bg-emerald-900/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
                placeholder="Ex: Técnico em Enfermagem"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Status *
          </label>
          <select
            name="status"
            required
            defaultValue={concursoEditando?.status || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white transition-colors"
          >
            <option value="">Selecione o status...</option>
            <option value="Concurso Autorizado">Concurso Autorizado</option>
            <option value="Edital Iminente">Edital Iminente</option>
            <option value="Banca Definida">Banca Definida</option>
            <option value="Edital Lançado">Edital Lançado</option>
            <option value="Inscrições Abertas">Inscrições Abertas</option>
            <option value="Inscrições Encerradas">Inscrições Encerradas</option>
            <option value="Concurso Encerrado">Concurso Encerrado</option>
          </select>
        </div>
      </div>

      {/* LINHA 4 - OS NOVOS DATE PICKERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PERÍODO DE INSCRIÇÃO (DATE RANGE) */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Período de Inscrição{" "}
            <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal border border-gray-200 dark:border-neutral-800 p-3 rounded-md h-auto focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-900 dark:text-white transition-colors",
                  !dateInscricao &&
                    "text-muted-foreground dark:text-neutral-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateInscricao?.from ? (
                  dateInscricao.to ? (
                    <>
                      {format(dateInscricao.from, "dd/MM/yy", { locale: ptBR })}{" "}
                      a {format(dateInscricao.to, "dd/MM/yy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateInscricao.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-neutral-900 shadow-xl border border-gray-200 dark:border-neutral-800 z-50 rounded-xl"
              align="start"
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateInscricao?.from}
                selected={dateInscricao}
                onSelect={setDateInscricao}
                numberOfMonths={2}
                locale={ptBR}
                className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-t-xl"
              />
              <div className="p-2 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 rounded-b-xl flex justify-center">
                <button
                  type="button"
                  onClick={() => setDateInscricao(undefined)}
                  className="text-xs font-bold text-gray-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors w-full py-1"
                >
                  Limpar Data
                </button>
              </div>
            </PopoverContent>
          </Popover>
          {concursoEditando?.periodoInscricao && !dateInscricao && (
            <span className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
              Atual: {concursoEditando.periodoInscricao}
            </span>
          )}
        </div>

        {/* PERÍODO DE ISENÇÃO (DATE RANGE) */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Período de Isenção{" "}
            <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal border border-gray-200 dark:border-neutral-800 p-3 rounded-md h-auto focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-900 dark:text-white transition-colors",
                  !dateIsencao && "text-muted-foreground dark:text-neutral-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateIsencao?.from ? (
                  dateIsencao.to ? (
                    <>
                      {format(dateIsencao.from, "dd/MM/yy", { locale: ptBR })} a{" "}
                      {format(dateIsencao.to, "dd/MM/yy", { locale: ptBR })}
                    </>
                  ) : (
                    format(dateIsencao.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-neutral-900 shadow-xl border border-gray-200 dark:border-neutral-800 z-50 rounded-xl"
              align="start"
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateIsencao?.from}
                selected={dateIsencao}
                onSelect={setDateIsencao}
                numberOfMonths={2}
                locale={ptBR}
                className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-t-xl"
              />
              <div className="p-2 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 rounded-b-xl flex justify-center">
                <button
                  type="button"
                  onClick={() => setDateIsencao(undefined)}
                  className="text-xs font-bold text-gray-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors w-full py-1"
                >
                  Limpar Data
                </button>
              </div>
            </PopoverContent>
          </Popover>
          {concursoEditando?.periodoIsencao && !dateIsencao && (
            <span className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
              Atual: {concursoEditando.periodoIsencao}
            </span>
          )}
        </div>

        {/* DATA DA PROVA (SINGLE DATE) */}
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Data da Prova{" "}
            <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal border border-gray-200 dark:border-neutral-800 p-3 rounded-md h-auto focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-900 dark:text-white transition-colors",
                  !dateProva && "text-muted-foreground dark:text-neutral-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateProva ? (
                  format(dateProva, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white dark:bg-neutral-900 shadow-xl border border-gray-200 dark:border-neutral-800 z-50 rounded-xl"
              align="start"
            >
              <Calendar
                mode="single"
                selected={dateProva}
                onSelect={setDateProva}
                initialFocus
                locale={ptBR}
                className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-t-xl"
              />
              <div className="p-2 border-t border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 rounded-b-xl flex justify-center">
                <button
                  type="button"
                  onClick={() => setDateProva(undefined)}
                  className="text-xs font-bold text-gray-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors w-full py-1"
                >
                  Limpar Data
                </button>
              </div>
            </PopoverContent>
          </Popover>
          {concursoEditando?.dataProva && !dateProva && (
            <span className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
              Atual: {concursoEditando.dataProva}
            </span>
          )}
        </div>
      </div>

      {/* LINHA 5 - LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Link do Edital{" "}
            <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="linkEdital"
            type="url"
            defaultValue={concursoEditando?.linkEdital || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="https://..."
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Link da Inscrição{" "}
            <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="linkInscricao"
            type="url"
            defaultValue={concursoEditando?.linkInscricao || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="https://..."
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
            Link do Cronograma{" "}
            <span className="text-gray-400 dark:text-neutral-500 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="linkCronograma"
            type="url"
            defaultValue={concursoEditando?.linkCronograma || ""}
            className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* LINHA 6 - DESCRIÇÃO */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200">
          Breve Descrição
        </label>
        <textarea
          name="descricao"
          rows={3}
          defaultValue={concursoEditando?.descricao || ""}
          className="border border-gray-200 dark:border-neutral-800 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 resize-none transition-colors"
          placeholder="Resumo sobre o concurso..."
        />
      </div>

      {/* UPLOAD DE THUMBNAIL */}
      <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-neutral-800 pt-6 transition-colors">
        <label className="text-sm font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Imagem do Concurso (Thumb)
        </label>

        {thumbnailUrl ? (
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 flex items-center justify-center group transition-colors">
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
            className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-8 bg-gray-50 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors ${isUploadingImage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Preparando...
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full flex items-center justify-center mb-3 shadow-sm transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-400 dark:text-neutral-500" />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-neutral-300 transition-colors">
                  Clique para escolher uma imagem
                </span>
                <span className="text-xs text-gray-400 dark:text-neutral-500 mt-1 transition-colors">
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

      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-neutral-800 transition-colors">
        <button
          type="submit"
          disabled={isUploadingImage || isSubmitting}
          className="px-8 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 duration-200 cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {concursoEditando ? "Atualizar Concurso" : "Cadastrar Concurso"}
        </button>
        {concursoEditando && (
          <Link
            href="/admin/concursos"
            className="px-6 py-3 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-bold rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 duration-200 cursor-pointer active:scale-95 transition-colors"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
