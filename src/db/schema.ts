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

export const bancas = pgTable("bancas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
});

export const materias = pgTable("materias", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
});

export const assuntos = pgTable("assuntos", {
  id: serial("id").primaryKey(),
  materiaId: integer("materia_id").references(() => materias.id),
  nome: varchar("nome", { length: 355 }).notNull(),
});

export const aulas = pgTable("aulas", {
  id: serial("id").primaryKey(),
  materiaId: integer("materia_id").references(() => materias.id),
  assuntoId: integer("assunto_id").references(() => assuntos.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  videoUrl: text("video_url").notNull(),
});

export const concursos = pgTable("concursos", {
  id: serial("id").primaryKey(),
  orgao: varchar("orgao", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 255 }).notNull(),
  banca: varchar("banca", { length: 255 }).notNull(),
  descricao: text("descricao"),
  vagas: varchar("vagas", { length: 100 }),
  salario: varchar("salario", { length: 100 }),
  escolaridade: varchar("escolaridade", { length: 100 }),
  cursoTecnico: varchar("curso_tecnico", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(),
  linkEdital: text("link_edital"),
  linkInscricao: text("link_inscricao"),
  linkCronograma: text("link_cronograma"),
  periodoInscricao: varchar("periodo_inscricao", { length: 255 }),
  periodoIsencao: varchar("periodo_isencao", { length: 255 }),
  dataProva: varchar("data_prova", { length: 255 }),
  thumbnailUrl: text("thumbnail_url"),
  fimInscricao: timestamp("fim_inscricao"),
  dataProvaReal: timestamp("data_prova_real"),
});

export const questoes = pgTable("questoes", {
  id: serial("id").primaryKey(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  materiaId: integer("materia_id").references(() => materias.id),
  assuntoId: integer("assunto_id").references(() => assuntos.id),
  bancaId: integer("banca_id").references(() => bancas.id),
  textoApoio: text("texto_apoio"),
  imagemApoio: varchar("imagem_apoio", { length: 500 }),
  enunciado: text("enunciado").notNull(),
  itemCorreto: text("item_correto").notNull(),
  itensErrados: jsonb("itens_errados").notNull(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
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

export const simulados = pgTable("simulados", {
  id: varchar("id", { length: 50 }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  quantidadeQuestoes: integer("quantidade_questoes").notNull(),
  status: varchar("status", { length: 50 }).default("Pendente").notNull(),
  acertos: integer("acertos").default(0),
  estiloProva: varchar("estilo_prova", { length: 50 }).default("Todos"),
  tempoLimite: integer("tempo_limite"),

  criadoEm: timestamp("criado_em").defaultNow(),
});

export const simuladoQuestoes = pgTable("simulado_questoes", {
  id: serial("id").primaryKey(),
  simuladoId: varchar("simulado_id", { length: 50 })
    .notNull()
    .references(() => simulados.id, { onDelete: "cascade" }),
  questaoId: integer("questao_id")
    .notNull()
    .references(() => questoes.id),
  respostaUsuario: text("resposta_usuario"),
  isCorreta: boolean("is_correta"),
});

export const editais = pgTable("editais", {
  id: varchar("id", { length: 50 }).primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  banca: varchar("banca", { length: 100 }),
  ano: integer("ano"), 
  thumbnailUrl: text("thumbnail_url"),
  logoOrgao: text("logo_orgao"),
  // 👇 NOVO CAMPO PARA OS NOMES CUSTOMIZADOS 👇
  nomesPersonalizados: jsonb("nomes_personalizados").$type<Record<string, string>>().default({}),
  status: varchar("status", { length: 50 }).default("Rascunho").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
  pdfUrl: text("pdf_url"),
});

export const editalAssuntos = pgTable("edital_assuntos", {
  id: serial("id").primaryKey(),
  editalId: varchar("edital_id", { length: 50 })
    .notNull()
    .references(() => editais.id, { onDelete: "cascade" }),
  assuntoId: integer("assunto_id")
    .notNull()
    .references(() => assuntos.id, { onDelete: "cascade" }),
  tipoConhecimento: varchar("tipo_conhecimento", { length: 50 })
    .default("Básico")
    .notNull(),
});

export const lembretesConcursos = pgTable("lembretes_concursos", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  concursoId: integer("concurso_id")
    .notNull()
    .references(() => concursos.id, { onDelete: "cascade" }),
});

export const noticias = pgTable("noticias", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull(),
  conteudo: text("conteudo").notNull(),
  dataPublicacao: timestamp("data_publicacao").notNull(),
  publicadoPor: varchar("publicado_por", { length: 255 }).notNull(),
  tipoConcurso: varchar("tipo_concurso", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }),
  municipio: varchar("municipio", { length: 255 }),
  thumbnailUrl: text("thumbnail_url").notNull(),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const noticiaConcursos = pgTable("noticia_concursos", {
  id: serial("id").primaryKey(),
  noticiaId: integer("noticia_id")
    .notNull()
    .references(() => noticias.id, { onDelete: "cascade" }),
  concursoId: integer("concurso_id")
    .notNull()
    .references(() => concursos.id, { onDelete: "cascade" }),
});

export const noticiaEditais = pgTable("noticia_editais", {
  id: serial("id").primaryKey(),
  noticiaId: integer("noticia_id")
    .notNull()
    .references(() => noticias.id, { onDelete: "cascade" }),
  editalId: varchar("edital_id", { length: 50 })
    .notNull()
    .references(() => editais.id, { onDelete: "cascade" }),
});
