// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  // 1. AVISAMOS O BETTER AUTH SOBRE A NOVA COLUNA
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false, // Define como falso porque adicionamos com default('user')
        defaultValue: "user",
      },
    },
  },
});
