import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Define a rota de upload e os limites (ex: 4MB, só 1 ficheiro, apenas imagens)
export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    // Esta função roda no servidor quando o upload termina com sucesso
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
