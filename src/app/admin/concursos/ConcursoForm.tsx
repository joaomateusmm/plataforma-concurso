"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ImageIcon, X } from "lucide-react";
import { salvarConcurso, atualizarConcurso } from "../../../actions/concursos";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

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

  // 1. SINCRONIZA A IMAGEM SEMPRE QUE O CONCURSO EDITANDO MUDAR
  useEffect(() => {
    setThumbnailUrl(concursoEditando?.thumbnailUrl || "");
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
    formData.append("thumbnailUrl", thumbnailUrl); // Adiciona a URL da imagem ao FormData

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
          <label className="font-semibold mb-1 text-gray-800">Órgão *</label>
          <input
            name="orgao"
            type="text"
            required
            defaultValue={concursoEditando?.orgao || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: Polícia Civil do Ceará"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">Cargo *</label>
          <input
            name="cargo"
            type="text"
            required
            defaultValue={concursoEditando?.cargo || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: Inspetor e Escrivão"
          />
        </div>
      </div>

      {/* LINHA 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">Banca *</label>
          <input
            name="banca"
            type="text"
            required
            defaultValue={concursoEditando?.banca || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: IDECAN"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">Vagas</label>
          <input
            name="vagas"
            type="text"
            defaultValue={concursoEditando?.vagas || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: 1.000 + CR"
          />
        </div>
      </div>

      {/* LINHA 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">Salário</label>
          <input
            name="salario"
            type="text"
            defaultValue={concursoEditando?.salario || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: R$ 5.800,00"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">
            Escolaridade
          </label>
          <select
            name="escolaridade"
            defaultValue={concursoEditando?.escolaridade || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Selecione o nível...</option>
            <option value="Nível Fundamental">Nível Fundamental</option>
            <option value="Nível Médio">Nível Médio</option>
            <option value="Nível Superior">Nível Superior</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">Status *</label>
          <select
            name="status"
            required
            defaultValue={concursoEditando?.status || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Selecione o status...</option>
            <option value="Edital Em Breve">Edital Em Breve</option>
            <option value="Em Breve">Em Breve</option>
            <option value="Inscrições Abertas">Inscrições Abertas</option>
            <option value="Inscrições Encerradas">Inscrições Encerradas</option>
            <option value="Encerrado">Encerrado</option>
          </select>
        </div>
      </div>

      {/* LINHA 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">
            Período de Inscrição{" "}
            <span className="text-gray-400 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="periodoInscricao"
            type="text"
            defaultValue={concursoEditando?.periodoInscricao || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: 09/03 a 02/04/2026"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">
            Período de Isenção{" "}
            <span className="text-gray-400 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="periodoIsencao"
            type="text"
            defaultValue={concursoEditando?.periodoIsencao || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: 09/03 a 11/03/2026"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">
            Data da Prova{" "}
            <span className="text-gray-400 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="dataProva"
            type="text"
            defaultValue={concursoEditando?.dataProva || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: 15/05/2026"
          />
        </div>
      </div>

      {/* LINHA 5 - LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">
            Link do Edital{" "}
            <span className="text-gray-400 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="linkEdital"
            type="url"
            defaultValue={concursoEditando?.linkEdital || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://..."
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">
            Link da Inscrição{" "}
            <span className="text-gray-400 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="linkInscricao"
            type="url"
            defaultValue={concursoEditando?.linkInscricao || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://..."
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1 text-gray-800">
            Link do Cronograma{" "}
            <span className="text-gray-400 font-normal text-sm">
              (Opcional)
            </span>
          </label>
          <input
            name="linkCronograma"
            type="url"
            defaultValue={concursoEditando?.linkCronograma || ""}
            className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* LINHA 6 - DESCRIÇÃO */}
      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-gray-800">
          Breve Descrição
        </label>
        <textarea
          name="descricao"
          rows={3}
          defaultValue={concursoEditando?.descricao || ""}
          className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="Resumo sobre o concurso..."
        />
      </div>

      {/* UPLOAD DE THUMBNAIL */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-6">
        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4" /> Imagem do Concurso (Thumb)
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
                  <X className="w-4 h-4" /> Remover Imagem
                </button>
              </div>
            )}
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 hover:bg-gray-100 transition-colors ${isUploadingImage ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
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

      <div className="flex gap-2 pt-4 border-t border-gray-100">
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
            className="px-6 py-3 bg-gray-100  text-gray-700 font-bold rounded-md hover:bg-gray-200 duration-200 cursor-pointer active:scale-95"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
