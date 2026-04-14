/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Download, Check, CheckSquare, Square, Search } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportAssuntosProps {
  listaAssuntos: any[];
}

export function ExportAssuntosJson({
  listaAssuntos = [],
}: ExportAssuntosProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Limpa a pesquisa sempre que o menu for fechado
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const materiasUnicas = useMemo(() => {
    const materias = listaAssuntos
      .map((a) => a.materiaNome)
      .filter((nome) => nome && typeof nome === "string");
    return Array.from(new Set(materias)).sort();
  }, [listaAssuntos]);

  // Filtra as matérias baseado na pesquisa do usuário
  const materiasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return materiasUnicas;
    return materiasUnicas.filter((m) =>
      m.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [materiasUnicas, searchTerm]);

  const toggleMateria = (materia: string) => {
    setSelectedMaterias((prev) =>
      prev.includes(materia)
        ? prev.filter((m) => m !== materia)
        : [...prev, materia],
    );
  };

  // O "Selecionar Tudo" agora respeita o filtro de pesquisa
  const handleSelectAll = () => {
    const todasFiltradasSelecionadas = materiasFiltradas.every((m) =>
      selectedMaterias.includes(m),
    );

    if (todasFiltradasSelecionadas) {
      // Remove da seleção as que estão visíveis no filtro atual
      setSelectedMaterias((prev) =>
        prev.filter((m) => !materiasFiltradas.includes(m)),
      );
    } else {
      // Adiciona à seleção todas as que estão visíveis no filtro atual
      setSelectedMaterias((prev) => {
        const novos = materiasFiltradas.filter((m) => !prev.includes(m));
        return [...prev, ...novos];
      });
    }
  };

  const handleDownload = () => {
    if (selectedMaterias.length === 0) {
      return toast.warning("Aviso", {
        description: "Selecione pelo menos uma matéria para exportar.",
      });
    }

    const exportData = selectedMaterias.map((materiaNome) => {
      const assuntosDaMateria = listaAssuntos
        .filter((a) => a.materiaNome === materiaNome)
        .map((a) => a.nome);

      return {
        materia: materiaNome,
        assuntos: assuntosDaMateria,
      };
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "base_assuntos_gemini.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Download Concluído!", {
      description: `Foram exportadas ${selectedMaterias.length} matérias para o GEM.`,
    });

    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shadow-sm group">
          <Download className="w-4 h-4 text-emerald-500" />
          Baixar JSON
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-120 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 transition-colors duration-300"
      >
        <DropdownMenuLabel className="text-gray-800 dark:text-white font-bold text-base">
          Exportar para o GEM
        </DropdownMenuLabel>
        <p className="text-xs text-gray-500 dark:text-neutral-400 px-2 pb-2 leading-relaxed">
          Selecione apenas as matérias exigidas neste edital para economizar
          tokens.
        </p>

        {/* BARRA DE PESQUISA */}
        <div className="px-2 pb-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-2.5 text-gray-400 dark:text-neutral-500" />
            <input
              type="text"
              placeholder="Pesquisar matéria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()} // IMPEDE O MENU DE FECHAR AO DIGITAR ESPAÇO
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800" />

        <div className="p-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSelectAll();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {materiasFiltradas.length > 0 &&
            materiasFiltradas.every((m) => selectedMaterias.includes(m)) ? (
              <CheckSquare className="w-4 h-4 text-emerald-500" />
            ) : (
              <Square className="w-4 h-4 text-gray-400 dark:text-neutral-500" />
            )}
            {searchTerm.trim() ? "Selecionar Visíveis" : "Selecionar Todas"}
          </button>
        </div>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800" />

        {/* AQUI ESTÁ A CORREÇÃO DO LENIS SCROLL */}
        <div
          className="max-h-120 overflow-y-auto custom-scrollbar p-1 flex flex-col gap-1 hide-native-scroll"
          data-lenis-prevent="true"
          data-force-scroll="true"
        >
          {materiasFiltradas.map((materia) => {
            const isSelected = selectedMaterias.includes(materia);
            return (
              <button
                key={materia}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMateria(materia);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${
                  isSelected
                    ? "bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium"
                    : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-white dark:text-neutral-950 stroke-[3]" />
                  )}
                </div>
                <span className="truncate flex-1">{materia}</span>
              </button>
            );
          })}
          {materiasFiltradas.length === 0 && (
            <div className="text-center text-xs text-gray-500 dark:text-neutral-500 py-6">
              Nenhuma matéria encontrada.
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="bg-gray-100 dark:bg-neutral-800" />

        <div className="p-2 mt-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDownload();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#009966] hover:bg-[#007a52] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Baixar ({selectedMaterias.length})
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
