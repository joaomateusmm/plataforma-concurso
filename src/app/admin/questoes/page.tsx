// src/app/admin/questoes/page.tsx

import { salvarQuestao } from "../../../actions/questoes";
import { db } from "../../../db/index";
import { materias, assuntos, bancas, questoes } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { DeleteButton } from "./delete-button";
import { ImageUpload } from "./image-upload";

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
    .innerJoin(bancas, eq(questoes.bancaId, bancas.id));

  return (
    <div className="max-w-full mx-12 space-y-12 mb-12">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Gerenciar Questões
        </h1>
        <p className="text-gray-600 mb-8">
          Adicione novas questões ao banco de simulados.
        </p>

        <form action={salvarQuestao} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex flex-col">
              <label className="font-semibold text-sm mb-1 text-gray-700">
                Matéria
              </label>
              <select
                name="materiaId"
                className="border p-2 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {listaMaterias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-sm mb-1 text-gray-700">
                Assunto
              </label>
              <select
                name="assuntoId"
                className="border p-2 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {listaAssuntos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold text-sm mb-1 text-gray-700">
                Banca
              </label>
              <select
                name="bancaId"
                className="border p-2 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {listaBancas.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col w-1/3">
            <label className="font-semibold mb-1 text-gray-800">
              Tipo de Questão *
            </label>
            <select
              name="tipo"
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Objetiva">Objetiva (Múltipla Escolha)</option>
              <option value="Certo ou Errado">Certo ou Errado</option>
              <option value="Discursiva">Discursiva</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Coluna 1: Texto de Apoio (50%) */}
            <div className="flex flex-col">
              <h1 className="font-semibold mb-3 text-gray-800">
                Texto de Apoio (Opcional)
              </h1>
              <textarea
                name="textoApoio"
                className="border p-3 rounded-md h-64 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none w-full"
                placeholder="Digite o texto de apoio aqui (se houver)..."
              />
            </div>

            {/* Coluna 2: Imagem de Apoio (50%) */}
            <div className="flex flex-col">
              <h1 className="font-semibold mb-1 text-gray-800">
                Imagem de Apoio (Opcional)
              </h1>
              {/* Colocamos numa div com altura fixa (h-52) para ficar exatamente do mesmo tamanho do textarea */}
              <div className="h-52 w-full">
                <ImageUpload />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-gray-800">
              Enunciado da Questão *
            </label>
            <textarea
              name="enunciado"
              required
              className="border p-3 rounded-md h-32 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
              placeholder="Digite o enunciado completo aqui..."
            />
          </div>

          {/* Respostas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="font-semibold mb-2 text-green-600">
                Item Correto *
              </label>
              <input
                name="itemCorreto"
                type="text"
                required
                className="border border-neutral-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 text-sm"
                placeholder="Digite a resposta certa..."
              />
            </div>

            {/* A NOVA ÁREA DOS ITENS ERRADOS */}
            <div className="flex flex-col">
              <label className="font-semibold mb-2 text-red-600">
                Itens Errados (Múltiplas Opções)
              </label>

              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map((numero) => (
                  <input
                    key={numero}
                    name="itensErrados"
                    type="text"
                    required={numero === 1}
                    className="border border-neutral-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 text-sm"
                    placeholder={`Opção Incorreta ${numero}...`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                Preencha as opções erradas. O sistema irá organizá-las e
                embaralhá-las automaticamente nos simulados.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition shadow-sm"
            >
              Salvar Questão
            </button>
          </div>
        </form>
      </div>

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

                  {/* Nome da Banca */}
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
                  </td>

                  {/* Exibimos apenas os primeiros 80 caracteres do enunciado com "..." no final */}
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
