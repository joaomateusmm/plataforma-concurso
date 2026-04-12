/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ImageUpload } from "./image-upload";
import { salvarQuestao, editarQuestao } from "../../../actions/questoes";

interface QuestaoFormProps {
  listaMaterias: any[];
  listaAssuntos: any[];
  listaBancas: any[];
  initialData?: any;
}

export function QuestaoForm({
  listaMaterias,
  listaAssuntos,
  listaBancas,
  initialData,
}: QuestaoFormProps) {
  const [tipo, setTipo] = useState(initialData?.tipo || "Objetiva");
  const [imagemAtual] = useState(initialData?.imagemApoio || "");
  const formAction = async (formData: FormData) => {
    if (initialData?.id) {
      await editarQuestao(initialData.id, formData);
    } else {
      await salvarQuestao(formData);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-neutral-950 rounded-lg border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
        <div className="flex flex-col">
          <label className="font-semibold text-sm mb-1 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
            Matéria *
          </label>
          <select
            name="materiaId"
            defaultValue={initialData?.materiaId || ""}
            className="border border-gray-200 dark:border-neutral-700 p-2 rounded-md bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 transition-colors duration-300"
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
          <label className="font-semibold text-sm mb-1 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
            Assunto *
          </label>
          <select
            name="assuntoId"
            defaultValue={initialData?.assuntoId || ""}
            className="border border-gray-200 dark:border-neutral-700 p-2 rounded-md bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 transition-colors duration-300"
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
          <label className="font-semibold text-sm mb-1 text-gray-700 dark:text-neutral-300 transition-colors duration-300">
            Banca *
          </label>
          <select
            name="bancaId"
            defaultValue={initialData?.bancaId || ""}
            className="border border-gray-200 dark:border-neutral-700 p-2 rounded-md bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 transition-colors duration-300"
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

      <div className="flex flex-col w-full md:w-1/3">
        <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200 transition-colors duration-300">
          Tipo de Questão *
        </label>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border border-gray-200 dark:border-neutral-700 p-2 rounded-md focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 transition-colors duration-300"
          required
        >
          <option value="Objetiva">Objetiva (Múltipla Escolha)</option>
          <option value="Certo ou Errado">Certo ou Errado</option>
          <option value="Discursiva">Discursiva</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col">
          <h1 className="font-semibold mb-3 text-gray-800 dark:text-neutral-200 transition-colors duration-300">
            Texto de Apoio (Opcional)
          </h1>
          <textarea
            name="textoApoio"
            defaultValue={initialData?.textoApoio || ""}
            className="border border-gray-200 dark:border-neutral-700 p-3 rounded-md h-64 focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none resize-none w-full transition-colors duration-300"
            placeholder="Digite o texto de apoio aqui (se houver)..."
          />
        </div>

        <div className="flex flex-col">
          <h1 className="font-semibold mb-1 text-gray-800 dark:text-neutral-200 transition-colors duration-300">
            Imagem de Apoio (Opcional)
          </h1>
          <div className="h-52 w-full">
            <ImageUpload />
            {imagemAtual && (
              <input type="hidden" name="imagemAtual" value={imagemAtual} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1 text-gray-800 dark:text-neutral-200 transition-colors duration-300">
          Enunciado da Questão *
        </label>
        <textarea
          name="enunciado"
          required
          defaultValue={initialData?.enunciado || ""}
          className="border border-gray-200 dark:border-neutral-700 p-3 rounded-md h-32 focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none resize-none transition-colors duration-300"
          placeholder="Digite o enunciado completo aqui..."
        />
      </div>

      {/* ÁREA DINÂMICA DE RESPOSTAS BASEADA NO TIPO DE QUESTÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-neutral-950 p-6 rounded-lg border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
        {/* TIPO: OBJETIVA */}
        {tipo === "Objetiva" && (
          <>
            <div className="flex flex-col">
              <label className="font-semibold mb-2 text-[#009966] dark:text-emerald-500 transition-colors duration-300">
                Item Correto *
              </label>
              <input
                name="itemCorreto"
                type="text"
                required
                defaultValue={initialData?.itemCorreto || ""}
                className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 placeholder:text-gray-400 dark:placeholder:text-neutral-600 text-sm transition-colors duration-300"
                placeholder="Digite a resposta certa..."
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-2 text-red-600 dark:text-red-500 transition-colors duration-300">
                Itens Errados (Múltiplas Opções) *
              </label>
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    name="itensErrados"
                    type="text"
                    required={index === 0}
                    defaultValue={initialData?.itensErrados?.[index] || ""}
                    className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 dark:focus:ring-red-500 placeholder:text-gray-400 dark:placeholder:text-neutral-600 text-sm transition-colors duration-300"
                    placeholder={`Opção Incorreta ${index + 1}...`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-neutral-500 mt-2 transition-colors duration-300">
                O sistema irá organizá-las e embaralhá-las automaticamente nos
                simulados.
              </span>
            </div>
          </>
        )}

        {/* TIPO: CERTO OU ERRADO */}
        {tipo === "Certo ou Errado" && (
          <div className="flex flex-col md:col-span-2">
            <label className="font-semibold mb-2 text-[#009966] dark:text-emerald-500 transition-colors duration-300">
              Gabarito da Questão *
            </label>
            <select
              name="itemCorreto"
              required
              defaultValue={initialData?.itemCorreto || ""}
              className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 transition-colors duration-300"
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
            <label className="font-semibold mb-2 text-[#009966] dark:text-emerald-500 transition-colors duration-300">
              Padrão de Resposta Esperado *
            </label>
            <textarea
              name="itemCorreto"
              required
              defaultValue={initialData?.itemCorreto || ""}
              className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white p-3 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-[#009966] dark:focus:ring-emerald-500 resize-none placeholder:text-gray-400 dark:placeholder:text-neutral-600 text-sm transition-colors duration-300"
              placeholder="Digite o espelho de resposta ou os critérios de correção esperados..."
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 transition-colors duration-300">
        <button
          type="submit"
          className="px-8 py-3 bg-[#009966] hover:bg-[#007a52] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold rounded-md transition-colors shadow-sm duration-300"
        >
          {initialData ? "Salvar Alterações" : "Salvar Questão"}
        </button>
      </div>
    </form>
  );
}
