"use server";

import { db } from "../db/index";
// Não esqueças de importar as novas tabelas de junção!
import { noticias, noticiaConcursos, noticiaEditais } from "../db/schema";
import { eq, desc, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD") // Remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-") // Troca espaços e símbolos por traços
    .replace(/(^-|-$)+/g, ""); // Remove traços sobrando nas pontas
}

function parseDate(dateString: string | null): Date | null {
  if (!dateString || dateString.trim() === "") return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return date;
}

export async function salvarNoticia(formData: FormData) {
  try {
    const titulo = formData.get("titulo") as string;
    // Geramos o slug e adicionamos um número aleatório curto no final para evitar links duplicados caso tenham o mesmo título
    const slugFinal = `${gerarSlug(titulo)}-${Math.random().toString(36).substring(2, 6)}`;

    // E no db.insert ou db.update, adicionas a linha:

    const dataPublicacaoStr = formData.get("dataPublicacao") as string;
    const dataPublicacao = parseDate(dataPublicacaoStr) || new Date();

    const estado = formData.get("estado") as string;
    const municipio = formData.get("municipio") as string;

    // Recebemos os Arrays em formato de String JSON do Frontend
    const concursosIdsStr = formData.get("concursosIds") as string;
    const editaisIdsStr = formData.get("editaisIds") as string;

    let concursosIds: number[] = [];
    let editaisIds: string[] = [];

    if (concursosIdsStr) concursosIds = JSON.parse(concursosIdsStr);
    if (editaisIdsStr) editaisIds = JSON.parse(editaisIdsStr);

    // 1. Cria a notícia e retorna o ID gerado (usando .returning)
    const [novaNoticia] = await db

      .insert(noticias)
      .values({
        titulo: formData.get("titulo") as string,
        conteudo: formData.get("conteudo") as string,
        publicadoPor: formData.get("publicadoPor") as string,
        tipoConcurso: formData.get("tipoConcurso") as string,
        estado: estado || null,
        municipio: municipio || null,
        thumbnailUrl: formData.get("thumbnailUrl") as string,
        dataPublicacao: dataPublicacao,
        slug: slugFinal,
      })
      .returning({ id: noticias.id });

    // 2. Salva as vinculações de Múltiplos Concursos
    if (concursosIds.length > 0) {
      const vinculacoesConcursos = concursosIds.map((cid) => ({
        noticiaId: novaNoticia.id,
        concursoId: cid,
      }));
      await db.insert(noticiaConcursos).values(vinculacoesConcursos);
    }

    // 3. Salva as vinculações de Múltiplos Editais
    if (editaisIds.length > 0) {
      const vinculacoesEditais = editaisIds.map((eid) => ({
        noticiaId: novaNoticia.id,
        editalId: eid,
      }));
      await db.insert(noticiaEditais).values(vinculacoesEditais);
    }

    revalidatePath("/admin/noticias");
    revalidatePath("/aluno/noticias");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar notícia:", error);
    return { error: "Falha ao criar a notícia." };
  }
}

export async function atualizarNoticia(formData: FormData) {
  try {
    const id = parseInt(formData.get("id") as string);
    const dataPublicacaoStr = formData.get("dataPublicacao") as string;
    const dataPublicacao = parseDate(dataPublicacaoStr) || new Date();
    const titulo = formData.get("titulo") as string;
    const slugFinal = `${gerarSlug(titulo)}-${Math.random().toString(36).substring(2, 6)}`;
    const estado = formData.get("estado") as string;
    const municipio = formData.get("municipio") as string;
    const concursosIdsStr = formData.get("concursosIds") as string;
    const editaisIdsStr = formData.get("editaisIds") as string;
    let concursosIds: number[] = [];
    let editaisIds: string[] = [];
    if (concursosIdsStr) concursosIds = JSON.parse(concursosIdsStr);
    if (editaisIdsStr) editaisIds = JSON.parse(editaisIdsStr);
    await db
      .update(noticias)
      .set({
        titulo: formData.get("titulo") as string,
        conteudo: formData.get("conteudo") as string,
        publicadoPor: formData.get("publicadoPor") as string,
        tipoConcurso: formData.get("tipoConcurso") as string,
        estado: estado || null,
        municipio: municipio || null,
        thumbnailUrl: formData.get("thumbnailUrl") as string,
        dataPublicacao: dataPublicacao,
        slug: slugFinal,
      })
      .where(eq(noticias.id, id));

    await db.delete(noticiaConcursos).where(eq(noticiaConcursos.noticiaId, id));
    await db.delete(noticiaEditais).where(eq(noticiaEditais.noticiaId, id));

    if (concursosIds.length > 0) {
      const vinculacoesConcursos = concursosIds.map((cid) => ({
        noticiaId: id,
        concursoId: cid,
      }));
      await db.insert(noticiaConcursos).values(vinculacoesConcursos);
    }

    // 4. Insere as novas vinculações de Editais
    if (editaisIds.length > 0) {
      const vinculacoesEditais = editaisIds.map((eid) => ({
        noticiaId: id,
        editalId: eid,
      }));
      await db.insert(noticiaEditais).values(vinculacoesEditais);
    }

    revalidatePath("/admin/noticias");
    revalidatePath("/aluno/noticias");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    return { error: "Falha ao atualizar a notícia." };
  }
}

export async function deletarNoticia(id: number) {
  try {
    // Como colocaste onDelete: "cascade" no schema, ao deletar a notícia
    // o banco apagará automaticamente as relações nas tabelas de junção!
    await db.delete(noticias).where(eq(noticias.id, id));
    revalidatePath("/admin/noticias");
    revalidatePath("/aluno/noticias");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar notícia:", error);
    return { error: "Falha ao excluir a notícia." };
  }
}

// Para a listagem do painel de Admin
export async function obterNoticiasAdmin() {
  try {
    const lista = await db
      .select()
      .from(noticias)
      .orderBy(desc(noticias.criadoEm));
    return { success: true, noticias: lista };
  } catch (error) {
    console.error("Erro ao buscar notícias admin:", error);
    return { error: "Falha ao carregar as notícias." };
  }
}

// Para a listagem dos Alunos
export async function obterNoticiasPublicadas() {
  try {
    const agora = new Date();
    const lista = await db
      .select()
      .from(noticias)
      .where(lte(noticias.dataPublicacao, agora))
      .orderBy(desc(noticias.dataPublicacao));

    return { success: true, noticias: lista };
  } catch (error) {
    console.error("Erro ao buscar notícias publicadas:", error);
    return { error: "Falha ao carregar o feed de notícias." };
  }
}
