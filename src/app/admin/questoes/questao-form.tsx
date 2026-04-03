/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ImageUpload } from "./image-upload";
import { salvarQuestao } from "../../../actions/questoes";

// Definimos o formato dos dados que o form vai receber da página principal
interface QuestaoFormProps {
  listaMaterias: any[];
  listaAssuntos: any[];
  listaBancas: any[];
}

export function QuestaoForm({
  listaMaterias,
  listaAssuntos,
  listaBancas,
}: QuestaoFormProps) {
  // Estado para controlar o tipo de questão selecionada
  const [tipo, setTipo] = useState("Objetiva");

  return (
    <form action={salvarQuestao} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex flex-col">
          <label className="font-semibold text-sm mb-1 text-gray-700">
            Matéria *
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
            Assunto *
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
            Banca *
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
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
          required
        >
          <option value="Objetiva">Objetiva (Múltipla Escolha)</option>
          <option value="Certo ou Errado">Certo ou Errado</option>
          <option value="Discursiva">Discursiva</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div className="flex flex-col">
          <h1 className="font-semibold mb-1 text-gray-800">
            Imagem de Apoio (Opcional)
          </h1>
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

      {/* ÁREA DINÂMICA DE RESPOSTAS BASEADA NO TIPO DE QUESTÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
        {/* TIPO: OBJETIVA */}
        {tipo === "Objetiva" && (
          <>
            <div className="flex flex-col">
              <label className="font-semibold mb-2 text-green-600">
                Item Correto *
              </label>
              <input
                name="itemCorreto"
                type="text"
                required
                className="border border-neutral-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Digite a resposta certa..."
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-2 text-red-600">
                Itens Errados (Múltiplas Opções) *
              </label>
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map((numero) => (
                  <input
                    key={numero}
                    name="itensErrados"
                    type="text"
                    required={numero === 1} // Pelo menos 1 errada é obrigatória
                    className="border border-neutral-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder={`Opção Incorreta ${numero}...`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 mt-2">
                O sistema irá organizá-las e embaralhá-las automaticamente nos
                simulados.
              </span>
            </div>
          </>
        )}

        {/* TIPO: CERTO OU ERRADO */}
        {tipo === "Certo ou Errado" && (
          <div className="flex flex-col md:col-span-2">
            <label className="font-semibold mb-2 text-green-600">
              Gabarito da Questão *
            </label>
            <select
              name="itemCorreto"
              required
              className="border border-neutral-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Selecione o gabarito oficial...</option>
              <option value="Certo">Certo</option>
              <option value="Errado">Errado</option>
            </select>
          </div>
        )}

        {/* TIPO: DISCURSIVA */}
        {tipo === "Discursiva" && (
          <div className="flex flex-col md:col-span-2">
            <label className="font-semibold mb-2 text-green-600">
              Padrão de Resposta Esperado *
            </label>
            <textarea
              name="itemCorreto"
              required
              className="border border-neutral-300 p-3 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
              placeholder="Digite o espelho de resposta ou os critérios de correção esperados..."
            />
          </div>
        )}
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
  );
}
