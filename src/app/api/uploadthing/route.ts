import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Cria os handlers GET e POST para a API do Next.js
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
