/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// COMPONENTE AUXILIAR: SELECT COM PESQUISA (COMBOBOX)
// ---------------------------------------------------------------------------
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  name,
  disabled = false,
}: {
  options: { value: string | number; label: string }[];
  value: string | number;
  onChange: (val: string | number) => void;
  placeholder: string;
  name: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input oculto para enviar o valor no FormData */}
      <input type="hidden" name={name} value={value || ""} required />

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`border p-3 rounded-md bg-white flex justify-between items-center transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-50"
            : "cursor-pointer hover:border-green-400 focus:ring-2 focus:ring-green-500"
        }`}
      >
        <span
          className={
            selectedLabel
              ? "text-gray-900 font-medium truncate pr-4"
              : "text-gray-500"
          }
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full border border-gray-200 pl-9 pr-3 py-2 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm transition-all"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <div
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                    value === o.value
                      ? "bg-green-50 text-green-700 font-bold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {o.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhum resultado encontrado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL DO FORMULÁRIO
// ---------------------------------------------------------------------------
export function AulaForm({
  materias,
  assuntos,
  aulaEditando,
  onSubmitAction,
}: {
  materias: any[];
  assuntos: any[];
  aulaEditando: any | null;
  onSubmitAction: (formData: FormData) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para controlar os valores selecionados
  const [materiaId, setMateriaId] = useState<string | number>(
    aulaEditando?.materiaId || "",
  );
  const [assuntoId, setAssuntoId] = useState<string | number>(
    aulaEditando?.assuntoId || "",
  );

  // Filtramos os assuntos dinamicamente sempre que a matéria muda
  const assuntosFiltrados = assuntos.filter(
    (assunto) => assunto.materiaId === Number(materiaId),
  );

  // Se a matéria mudar, e o assunto atual não pertencer mais àquela matéria, limpamos o assunto
  useEffect(() => {
    if (materiaId) {
      const assuntoValido = assuntosFiltrados.find(
        (a) => a.id === Number(assuntoId),
      );
      if (!assuntoValido) {
        setAssuntoId("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materiaId]);

  // Prepara as opções formatadas para o Dropdown
  const materiaOptions = materias.map((m) => ({ value: m.id, label: m.nome }));
  const assuntoOptions = assuntosFiltrados.map((a) => ({
    value: a.id,
    label: a.nome,
  }));

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    await onSubmitAction(formData);
    setIsSubmitting(false);
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {aulaEditando ? "Editar Videoaula" : "Cadastrar Nova Videoaula"}
      </h1>
      <p className="text-gray-600 mb-8">
        {aulaEditando
          ? "Altere os dados da aula selecionada."
          : "Selecione a matéria e o assunto para organizar suas aulas de forma inteligente."}
      </p>

      <form action={handleSubmit} className="space-y-6">
        {aulaEditando && (
          <input type="hidden" name="id" value={aulaEditando.id} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MATÉRIA COM PESQUISA */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-800 text-sm">
              Matéria *
            </label>
            <SearchableDropdown
              name="materiaId"
              placeholder="Pesquisar matéria..."
              options={materiaOptions}
              value={materiaId}
              onChange={(val) => setMateriaId(val)}
            />
          </div>

          {/* ASSUNTO COM PESQUISA (FILTRADO) */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-800 text-sm">
              Assunto *
            </label>
            <SearchableDropdown
              name="assuntoId"
              placeholder={
                materiaId
                  ? "Pesquisar assunto..."
                  : "Selecione a matéria primeiro"
              }
              options={assuntoOptions}
              value={assuntoId}
              onChange={(val) => setAssuntoId(val)}
              disabled={!materiaId} // Só habilita se a matéria já estiver selecionada
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TÍTULO DA AULA */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-800 text-sm">
              Título da Aula *
            </label>
            <input
              name="titulo"
              type="text"
              required
              defaultValue={aulaEditando ? aulaEditando.titulo : ""}
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              placeholder="Ex: Concordância Verbal - Parte 1"
            />
          </div>

          {/* LINK DO YOUTUBE */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-gray-800 text-sm">
              Link do YouTube *
            </label>
            <input
              name="videoUrl"
              type="url"
              required
              defaultValue={aulaEditando ? aulaEditando.videoUrl : ""}
              className="border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              placeholder="Ex: https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-green-600 cursor-pointer active:scale-95 text-white font-bold rounded-lg hover:bg-green-700 duration-200 shadow-md shadow-green-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {aulaEditando ? "Atualizar Aula" : "Salvar Aula"}
          </button>

          {aulaEditando && (
            <Link
              href="/admin/aulas"
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              Cancelar Edição
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
