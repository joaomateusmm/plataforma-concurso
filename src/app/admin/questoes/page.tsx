// src/app/admin/questoes/page.tsx
import { db } from "../../../db/index";
import { materias, assuntos, bancas, questoes } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { QuestaoForm } from "./questao-form";
import { ImportJsonButton } from "./import-button";
import { ExportDictionaryButton } from "./export-dictionary-button";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { InlineEditEnunciado } from "./inline-edit-enunciado"; // <-- IMPORTA AQUI

export default async function GerenciarQuestoesPage() {
  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);
  const listaBancas = await db.select().from(bancas);
  const listaQuestoes = await db
    .select({
      id: questoes.id,
      tipo: questoes.tipo,
      enunciado: questoes.enunciado,
      materiaNome: materias.nome,
      assuntoNome: assuntos.nome,
      bancaNome: bancas.nome,
    })
    .from(questoes)
    .innerJoin(materias, eq(questoes.materiaId, materias.id))
    .innerJoin(assuntos, eq(questoes.assuntoId, assuntos.id))
    .innerJoin(bancas, eq(questoes.bancaId, bancas.id))
    .orderBy(desc(questoes.id));

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
              Gerenciar Questões
            </h1>
            <p className="text-gray-600 dark:text-neutral-400 mb-8 transition-colors duration-300">
              Adicione novas questões ao banco de simulados.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <ImportJsonButton />
            <ExportDictionaryButton />
          </div>
        </div>

        <QuestaoForm
          listaMaterias={listaMaterias}
          listaAssuntos={listaAssuntos}
          listaBancas={listaBancas}
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-gray-50 dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-300">
                <th className="p-4 font-semibold text-gray-700 dark:text-neutral-300 w-16 transition-colors duration-300">
                  ID
                </th>
                <th className="p-4 font-semibold text-gray-700 dark:text-neutral-300 w-32 transition-colors duration-300">
                  Banca
                </th>
                <th className="p-4 font-semibold text-gray-700 dark:text-neutral-300 w-48 transition-colors duration-300">
                  Matéria / Assunto
                </th>
                <th className="p-4 font-semibold text-gray-700 dark:text-neutral-300 transition-colors duration-300">
                  Enunciado (Resumo)
                </th>
                <th className="p-4 font-semibold text-gray-700 dark:text-neutral-300 w-32 text-center transition-colors duration-300">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {listaQuestoes.map((questao) => (
                <tr
                  key={questao.id}
                  className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors duration-300"
                >
                  <td className="p-4 text-gray-500 dark:text-neutral-500 transition-colors duration-300">
                    #{questao.id}
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-neutral-200 transition-colors duration-300">
                    {questao.bancaNome}
                  </td>
                  <td className="p-4">
                    <div className="text-blue-600 dark:text-blue-400 font-medium text-sm transition-colors duration-300">
                      {questao.materiaNome}
                    </div>
                    <div className="text-gray-500 dark:text-neutral-400 text-xs transition-colors duration-300">
                      {questao.assuntoNome}
                    </div>
                    <span className="inline-block mt-1 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 text-[10px] px-2 py-0.5 rounded font-semibold uppercase transition-colors duration-300">
                      {questao.tipo}
                    </span>
                  </td>

                  {/* SUBSTITUÍMOS A CÉLULA DE TEXTO PELO COMPONENTE INLINE */}
                  <td className="p-4 align-top">
                    <InlineEditEnunciado
                      id={questao.id}
                      initialText={questao.enunciado}
                    />
                  </td>

                  <td className="p-4 flex items-center justify-center gap-3">
                    <Link
                      href={`/admin/questoes/${questao.id}/editar`}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edição Completa (Gabarito, Imagem, etc)"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <DeleteButton id={questao.id} />
                  </td>
                </tr>
              ))}

              {listaQuestoes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-500 dark:text-neutral-500 transition-colors duration-300"
                  >
                    Nenhuma questão cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
