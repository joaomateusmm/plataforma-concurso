import { db } from "@/db/index";
import { materias, assuntos, bancas, questoes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { QuestaoForm } from "../../questao-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// O params agora é tipado como uma Promise no Next.js 15
interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarQuestaoPage({ params }: Props) {
  // AQUI ESTÁ A CORREÇÃO: Resolvemos a Promise do params primeiro
  const resolvedParams = await params;
  const questaoId = parseInt(resolvedParams.id);

  if (isNaN(questaoId)) {
    return notFound();
  }

  // 1. Busca os dicionários necessários para preencher os selects (igual à página de criar)
  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);
  const listaBancas = await db.select().from(bancas);

  // 2. Busca a questão específica que vamos editar
  const questaoData = await db
    .select()
    .from(questoes)
    .where(eq(questoes.id, questaoId))
    .limit(1);

  // Se a questão não existir (alguém digitou um ID falso na URL), mostra a página 404
  if (!questaoData || questaoData.length === 0) {
    return notFound();
  }

  const questao = questaoData[0];

  return (
    <div className="max-w-full mx-12 space-y-8 mb-12 mt-6">
      {/* CABEÇALHO COM BOTÃO DE VOLTAR */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/questoes"
          className="p-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm group"
          title="Voltar para Questões"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-neutral-400 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
            Editar Questão #{questao.id}
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 transition-colors duration-300">
            Atualize as informações e o gabarito desta questão.
          </p>
        </div>
      </div>

      {/* FORMULÁRIO PREENCHIDO COM initialData */}
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        <QuestaoForm
          listaMaterias={listaMaterias}
          listaAssuntos={listaAssuntos}
          listaBancas={listaBancas}
          initialData={questao} // <-- O SEGREDO ESTÁ AQUI
        />
      </div>
    </div>
  );
}
