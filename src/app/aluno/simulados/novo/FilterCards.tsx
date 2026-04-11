/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Check,
  Folder,
  FolderOpen,
  ChevronDown,
  CornerDownRight,
} from "lucide-react";

// --- BANCA (Seleção Simples) ---
export function FilterCardBancas({
  title,
  items,
  selectedIds,
  onToggle,
  placeholder,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item: any) =>
        item.nome.toLowerCase().includes(lowerSearch),
      );
    }
    return result.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
  }, [items, searchTerm]);

  // Lógica do Selecionar Todas
  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item: any) => selectedIds.includes(item.id));

  const handleSelectAll = () => {
    filteredItems.forEach((item: any) => {
      const isSelected = selectedIds.includes(item.id);
      if (isAllSelected && isSelected) onToggle(item.id); // Desmarca se já tiverem todas
      if (!isAllSelected && !isSelected) onToggle(item.id); // Marca as que faltam
    });
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex justify-between items-center transition-colors duration-300">
        {title}
        <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-[#009966] dark:text-emerald-400 transition-colors duration-300">
          {selectedIds.length} marcadas
        </span>
      </label>
      <div className="flex flex-col h-200 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm dark:shadow-inner transition-colors duration-300">
        <div className="flex items-center px-4 h-12 shrink-0 border-b border-gray-200 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 transition-colors duration-300">
          <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 mr-2 transition-colors duration-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors duration-300"
          />
        </div>

        <div
          className="custom-scrollbar relative flex-1 overflow-y-auto py-1 overscroll-contain"
          data-lenis-prevent="true"
        >
          {/* BOTÃO SELECIONAR TODAS */}
          {filteredItems.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-300 ${
                isAllSelected
                  ? "bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900"
                  : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors duration-300 ${isAllSelected ? "bg-[#009966] dark:bg-emerald-500 border-[#009966] dark:border-emerald-500" : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"}`}
              >
                {isAllSelected && (
                  <Check className="w-3.5 h-3.5 text-white dark:text-neutral-950 stroke-3 transition-colors duration-300" />
                )}
              </div>
              <span className="truncate text-sm flex-1 font-medium">
                Selecionar Todas
              </span>
            </button>
          )}

          {filteredItems.map((item: any) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-300 ${
                  isSelected
                    ? "bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900"
                    : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors duration-300 ${isSelected ? "bg-[#009966] dark:bg-emerald-500 border-[#009966] dark:border-emerald-500" : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"}`}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white dark:text-neutral-950 stroke-3 transition-colors duration-300" />
                  )}
                </div>
                <span className="truncate text-sm flex-1">{item.nome}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- MATÉRIAS (Seleção Simples do "Pai") ---
export function FilterCardMaterias({
  title,
  items,
  selections,
  onToggle,
  placeholder,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item: any) =>
        item.nome.toLowerCase().includes(lowerSearch),
      );
    }
    return result.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
  }, [items, searchTerm]);

  // Lógica do Selecionar Todas
  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item: any) => selections[item.id] !== undefined);

  const handleSelectAll = () => {
    filteredItems.forEach((item: any) => {
      const isSelected = selections[item.id] !== undefined;
      if (isAllSelected && isSelected) onToggle(item.id);
      if (!isAllSelected && !isSelected) onToggle(item.id);
    });
  };

  const selectedCount = Object.keys(selections).length;

  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex justify-between items-center transition-colors duration-300">
        {title}
        <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-[#009966] dark:text-emerald-400 transition-colors duration-300">
          {selectedCount} marcadas
        </span>
      </label>
      <div className="flex flex-col h-200 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm dark:shadow-inner transition-colors duration-300">
        <div className="flex items-center px-4 h-12 shrink-0 border-b border-gray-200 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 transition-colors duration-300">
          <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 mr-2 transition-colors duration-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors duration-300"
          />
        </div>

        <div
          className="custom-scrollbar relative flex-1 overflow-y-auto py-1 overscroll-contain"
          data-lenis-prevent="true"
        >
          {/* BOTÃO SELECIONAR TODAS */}
          {filteredItems.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-300  ${
                isAllSelected
                  ? "bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900"
                  : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors duration-300 ${isAllSelected ? "bg-[#009966] dark:bg-emerald-500 border-[#009966] dark:border-emerald-500" : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"}`}
              >
                {isAllSelected && (
                  <Check className="w-3.5 h-3.5 text-white dark:text-neutral-950 stroke-3 transition-colors duration-300" />
                )}
              </div>
              <span className="truncate text-sm flex-1 font-medium">
                Selecionar Todas
              </span>
            </button>
          )}

          {filteredItems.map((item: any) => {
            const isSelected = selections[item.id] !== undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-300 ${
                  isSelected
                    ? "bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900"
                    : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors duration-300 ${isSelected ? "bg-[#009966] dark:bg-emerald-500 border-[#009966] dark:border-emerald-500" : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"}`}
                >
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-white dark:text-neutral-950 stroke-3 transition-colors duration-300" />
                  )}
                </div>
                <span className="truncate text-sm flex-1">{item.nome}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- ASSUNTOS EM PASTAS (Lógica de Mestre/Escravo) ---
export function FilterCardAssuntosAvancado({
  items,
  materias,
  selections,
  materiasSel,
  onToggleAssunto,
  onToggleMateria,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);

  // Agrupamento super seguro
  const grouped = useMemo(() => {
    let result = [...items];
    if (searchTerm.trim()) {
      result = result.filter((item: any) =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    const groups: Record<
      number,
      { id: number; nome: string; assuntos: any[] }
    > = {};

    result.forEach((item: any) => {
      let mId = Number(item.materiaId || item.materia_id || 0);
      let materiaPai = materias?.find((m: any) => Number(m.id) === mId);

      if (!materiaPai && (item.materiaNome || item.materia?.nome)) {
        const nomeBusca = item.materiaNome || item.materia?.nome;
        materiaPai = materias?.find((m: any) => m.nome === nomeBusca);
        if (materiaPai) mId = Number(materiaPai.id);
      }

      const mName = materiaPai ? materiaPai.nome : "Matéria Desconhecida";

      if (!groups[mId]) {
        groups[mId] = { id: mId, nome: mName, assuntos: [] };
      }
      groups[mId].assuntos.push(item);
    });

    return Object.values(groups).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [items, materias, searchTerm]);

  // Lógica do Selecionar Todas as Pastas (Matérias)
  const isAllSelected =
    grouped.length > 0 && grouped.every((data) => !!materiasSel[data.id]);

  const handleSelectAll = () => {
    grouped.forEach((data) => {
      const isSelected = !!materiasSel[data.id];
      if (isAllSelected && isSelected) onToggleMateria(data.id);
      if (!isAllSelected && !isSelected) onToggleMateria(data.id);
    });
  };

  const totalAssuntosMarcados = Object.keys(selections).length;

  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-3 flex justify-between items-center transition-colors duration-300">
        Assuntos
        <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-[#009966] dark:text-emerald-400 transition-colors duration-300">
          {totalAssuntosMarcados} personalizados
        </span>
      </label>
      <div className="flex flex-col h-200 bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm dark:shadow-inner transition-colors duration-300">
        <div className="flex items-center px-4 h-12 shrink-0 border-b border-gray-200 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 transition-colors duration-300">
          <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 mr-2 transition-colors duration-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar assunto..."
            className="flex-1 bg-transparent border-none text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-neutral-600 transition-colors duration-300"
          />
        </div>

        <div
          className="custom-scrollbar flex-1 overflow-y-auto py-1 overscroll-contain"
          data-lenis-prevent="true"
        >
          {/* BOTÃO SELECIONAR TODAS */}
          {grouped.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-300 border-b border-gray-200 dark:border-neutral-800/60 ${
                isAllSelected
                  ? "bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900"
                  : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors duration-300 ${isAllSelected ? "bg-[#009966] dark:bg-emerald-500 border-[#009966] dark:border-emerald-500" : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-950"}`}
              >
                {isAllSelected && (
                  <Check className="w-3.5 h-3.5 text-white dark:text-neutral-950 stroke-3 transition-colors duration-300" />
                )}
              </div>
              <span className="truncate text-sm flex-1 font-medium">
                Selecionar Todas
              </span>
            </button>
          )}

          {grouped.map((data) => {
            const mId = data.id;
            const mName = data.nome;

            const isExpanded =
              expandedFolders.includes(mId) || searchTerm.length > 0;
            const isFolderSelected = !!materiasSel[mId];

            return (
              <div
                key={mId}
                className="border-b border-gray-200 dark:border-neutral-800/50 last:border-0 transition-colors duration-300"
              >
                <div className="flex items-center justify-between w-full px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-neutral-950 transition-colors duration-300">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleMateria(mId)}
                      className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors duration-300 ${
                        isFolderSelected
                          ? "bg-[#009966] dark:bg-emerald-500 border-[#009966] dark:border-emerald-500"
                          : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 hover:border-gray-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {isFolderSelected && (
                        <Check className="w-3.5 h-3.5 text-white dark:text-neutral-950 stroke-3 transition-colors duration-300" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFolders((prev) =>
                          prev.includes(mId)
                            ? prev.filter((n) => n !== mId)
                            : [...prev, mId],
                        )
                      }
                      className="flex flex-1 items-center gap-2 text-left"
                    >
                      {isExpanded ? (
                        <FolderOpen className="w-4 h-4 text-[#009966] dark:text-emerald-500 shrink-0 transition-colors duration-300" />
                      ) : (
                        <Folder className="w-4 h-4 text-gray-400 dark:text-neutral-400 shrink-0 transition-colors duration-300" />
                      )}
                      <span className="font-semibold text-sm text-gray-700 dark:text-neutral-300 truncate transition-colors duration-300">
                        {mName}
                      </span>
                    </button>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 dark:text-neutral-500 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>

                {isExpanded && (
                  <div className="flex flex-col bg-gray-50 dark:bg-neutral-950 pb-2 transition-colors duration-300">
                    {data.assuntos.map((item: any) => {
                      const isSelected =
                        isFolderSelected || selections[item.id] !== undefined;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onToggleAssunto(item.id, mId)}
                          className={`flex items-start gap-3 w-full text-left pr-4 py-2.5 transition-colors duration-300 group ${
                            isSelected
                              ? "bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white"
                              : "hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
                          }`}
                        >
                          <div className="w-12 shrink-0 flex justify-end opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                            <CornerDownRight
                              className={`w-4 h-4 mt-0.5 transition-colors duration-300 ${isSelected ? "text-[#009966] dark:text-emerald-500" : "text-gray-400 dark:text-neutral-600"}`}
                            />
                          </div>
                          <div
                            className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center transition-colors duration-300 ${
                              isSelected
                                ? "bg-[#009966] dark:bg-emerald-500 border-[#009966] dark:border-emerald-500"
                                : "border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 group-hover:border-gray-400 dark:group-hover:border-neutral-500"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white dark:text-neutral-950 stroke-3 transition-colors duration-300" />
                            )}
                          </div>
                          <span
                            className={`flex-1 truncate text-[13px] leading-snug transition-colors duration-300 ${isSelected ? "text-gray-900 dark:text-neutral-200" : "text-gray-500 dark:text-neutral-500"}`}
                          >
                            {item.nome}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
