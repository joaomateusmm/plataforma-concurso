// src/app/admin/questoes/image-upload.tsx
"use client";

import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import Image from "next/image";
import { X, ImagePlus } from "lucide-react";

export function ImageUpload() {
  const [imageUrl, setImageUrl] = useState<string>("");

  return (
    <div className="w-full h-64 relative">
      <input type="hidden" name="imagemApoio" value={imageUrl} />

      {imageUrl ? (
        <div className="w-full h-full border border-gray-200 dark:border-neutral-800 rounded-xl relative bg-white dark:bg-neutral-900 overflow-hidden shadow-sm group transition-colors duration-300">
          <Image
            src={imageUrl}
            alt="Imagem de apoio"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <UploadDropzone
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            setImageUrl(res[0].url);
          }}
          onUploadError={(error: Error) => {
            alert(`Erro no upload: ${error.message}`);
          }}
          // 1. O CONTEÚDO: Trocamos os textos e ícones para bater com a sua inspiração
          content={{
            uploadIcon: (
              <ImagePlus className="w-12 h-12 text-[#009966] dark:text-emerald-500 mb-3 transition-colors duration-300" />
            ),
            label: (
              <div className="text-gray-800 dark:text-neutral-200 font-medium text-lg flex flex-col gap-1 transition-colors duration-300">
                Arraste a imagem
                <span className="text-sm text-gray-500 dark:text-neutral-500 font-normal transition-colors duration-300">
                  ou{" "}
                  <span className="text-[#009966] dark:text-emerald-500 font-semibold transition-colors duration-300">
                    Escolha
                  </span>
                </span>
              </div>
            ),
            allowedContent: "Supports: JPEG, JPG, PNG",
          }}
          // 2. A APARÊNCIA: Controlamos o CSS de cada pedaço do Dropzone
          appearance={{
            // O container agora tem borda tracejada, fundo leve e o cursor-pointer
            container:
              "w-full h-full p-2 m-0 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/5 hover:border-[#009966] dark:hover:border-emerald-500 transition-all cursor-pointer bg-gray-50/50 dark:bg-neutral-900/50 flex flex-col items-center justify-center transition-colors duration-300",
            label:
              "cursor-pointer hover:text-[#009966] dark:hover:text-emerald-500 transition-colors duration-300",
            allowedContent:
              "text-gray-400 dark:text-neutral-500 text-xs mt-4 font-medium transition-colors duration-300",
            // ESCONDEMOS O BOTÃO PADRÃO: Assim a área toda do container assume o clique
            button: "hidden",
          }}
        />
      )}
    </div>
  );
}
