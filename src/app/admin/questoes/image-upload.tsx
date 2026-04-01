// src/app/admin/questoes/image-upload.tsx
"use client";

import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
// Trocamos o ícone para um mais amigável que combina com o design
import { X, ImagePlus } from "lucide-react";

export function ImageUpload() {
  const [imageUrl, setImageUrl] = useState<string>("");

  return (
    <div className="w-full h-64 relative">
      <input type="hidden" name="imagemApoio" value={imageUrl} />

      {imageUrl ? (
        <div className="w-full h-full border border-gray-200 rounded-xl relative bg-white overflow-hidden shadow-sm group">
          <img
            src={imageUrl}
            alt="Imagem de apoio"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
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
            uploadIcon: <ImagePlus className="w-12 h-12 text-green-500 mb-3" />,
            label: (
              <div className="text-gray-800 font-medium text-lg flex flex-col gap-1">
                Arraste a imagem
                <span className="text-sm text-gray-500 font-normal">
                  ou{" "}
                  <span className="text-green-600 font-semibold">Escolha</span>
                </span>
              </div>
            ),
            allowedContent: "Supports: JPEG, JPG, PNG",
          }}
          // 2. A APARÊNCIA: Controlamos o CSS de cada pedaço do Dropzone
          appearance={{
            // O container agora tem borda tracejada, fundo leve e o cursor-pointer
            container:
              "w-full h-full p-2 m-0 border-2 border-dashed border-gray-300 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all cursor-pointer bg-gray-50/50 flex flex-col items-center justify-center",
            label: "cursor-pointer hover:text-green-600",
            allowedContent: "text-gray-400 text-xs mt-4 font-medium",
            // ESCONDEMOS O BOTÃO PADRÃO: Assim a área toda do container assume o clique
            button: "hidden",
          }}
        />
      )}
    </div>
  );
}
