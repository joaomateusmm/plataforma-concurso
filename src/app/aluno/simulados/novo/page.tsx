// src/app/aluno/simulados/novo/page.tsx
import { db } from "../../../../db/index";
import { bancas, materias, assuntos } from "../../../../db/schema";
import { NovoSimuladoForm } from "./novo-simulado-form";
import { BrainCircuit } from "lucide-react";

export default async function NovoSimuladoPage() {
  // Busca todas as opções disponíveis no banco de dados para o aluno escolher
  const listaBancas = await db.select().from(bancas);
  const listaMaterias = await db.select().from(materias);
  const listaAssuntos = await db.select().from(assuntos);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 mt-6">
      {/* CABEÇALHO */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-neutral-100 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-emerald-500" />
            Gerador de Simulados
          </h1>
          <p className="text-neutral-400 max-w-2xl text-lg">
            Crie provas personalizadas escolhendo as bancas, matérias e assuntos
            específicos que você precisa treinar hoje.
          </p>
        </div>
      </div>

      {/* FORMULÁRIO INTERATIVO */}
      <NovoSimuladoForm
        bancas={listaBancas}
        materias={listaMaterias}
        assuntos={listaAssuntos}
      />
    </div>
  );
}
