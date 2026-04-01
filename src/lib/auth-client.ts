// src/lib/auth-client.ts

import { createAuthClient } from "better-auth/react";
// Importamos o recurso para inferir os campos adicionais
import { inferAdditionalFields } from "better-auth/client/plugins";
// Importamos o auth original do servidor apenas para pegar a tipagem
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // AQUI É A MÁGICA: Dizemos ao cliente para aprender os campos (como "role") que estão no servidor
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, useSession, signOut } = authClient;
