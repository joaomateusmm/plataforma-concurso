import { auth } from "@/lib/auth"; // Caminho até o ficheiro auth.ts
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
