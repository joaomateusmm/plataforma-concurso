// src/app/admin/questoes/page.tsx

import { db } from "../../../db/index";
import { materias, assuntos, bancas, questoes } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { QuestaoForm } from "./questao-form";
import { ImportJsonButton } from "./import-button";
import { ExportDictionaryButton } from "./export-dictionary-button";

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
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Gerenciar Questões
            </h1>
            <p className="text-gray-600 mb-8">
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

      {/* Tabela de listagem */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-700 w-16">ID</th>
                <th className="p-4 font-semibold text-gray-700 w-32">Banca</th>
                <th className="p-4 font-semibold text-gray-700 w-48">
                  Matéria / Assunto
                </th>
                <th className="p-4 font-semibold text-gray-700">
                  Enunciado (Resumo)
                </th>
                <th className="p-4 font-semibold text-gray-700 w-24 text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {listaQuestoes.map((questao) => (
                <tr
                  key={questao.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-4 text-gray-500">#{questao.id}</td>
                  <td className="p-4 font-medium text-gray-800">
                    {questao.bancaNome}
                  </td>
                  <td className="p-4">
                    <div className="text-blue-600 font-medium text-sm">
                      {questao.materiaNome}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {questao.assuntoNome}
                    </div>
                    <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">
                      {questao.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {questao.enunciado.length > 80
                      ? `${questao.enunciado.substring(0, 80)}...`
                      : questao.enunciado}
                  </td>
                  <td className="p-4 flex justify-center">
                    <DeleteButton id={questao.id} />
                  </td>
                </tr>
              ))}

              {listaQuestoes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
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
