import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Rota para Imagens (Thumbnails)
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Image Upload complete:", file.url);
  }),

  // NOVA ROTA: Exclusiva para PDFs (Editais)
  pdfUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("PDF Upload complete:", file.url);
  }),

  assetUploader: f({
    blob: { maxFileSize: "32MB", maxFileCount: 10 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Asset upload complete:", file.url);
  }),

  videoUploader: f({
    video: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Video Upload complete:", file.url);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
