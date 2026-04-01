// src/db/schema.ts

import {
  pgTable,
  serial,
  text,
  varchar,
  jsonb,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// Tabela 1: Bancas (Ex: FCC, FGV, CEBRASPE)
export const bancas = pgTable("bancas", {
  id: serial("id").primaryKey(), // ID automático
  nome: varchar("nome", { length: 255 }).notNull(), // Nome da banca
});

// Tabela 2: Matérias (Ex: Língua Portuguesa)
export const materias = pgTable("materias", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
});

// Tabela 3: Assuntos (Ex: Compreensão de textos)
export const assuntos = pgTable("assuntos", {
  id: serial("id").primaryKey(),
  materiaId: integer("materia_id").references(() => materias.id), // Liga o assunto à matéria
  nome: varchar("nome", { length: 255 }).notNull(),
});

// Tabela 4: Questões (O coração da plataforma)
export const questoes = pgTable("questoes", {
  id: serial("id").primaryKey(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // Objetiva, Discursiva, Certo/Errado
  materiaId: integer("materia_id").references(() => materias.id),
  assuntoId: integer("assunto_id").references(() => assuntos.id),
  bancaId: integer("banca_id").references(() => bancas.id),
  textoApoio: text("texto_apoio"),
  imagemApoio: varchar("imagem_apoio", { length: 500 }),
  enunciado: text("enunciado").notNull(),
  itemCorreto: text("item_correto").notNull(),
  itensErrados: jsonb("itens_errados").notNull(),
});

// --- TABELAS DO BETTER AUTH ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  // AQUI: Adicionamos o campo role com "user" como padrão
  role: text("role").default("user").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
