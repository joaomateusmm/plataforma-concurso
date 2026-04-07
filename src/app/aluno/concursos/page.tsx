// src/app/aluno/concursos/page.tsx
import { db } from "../../../db/index";
import { concursos } from "../../../db/schema";
import { BellRing } from "lucide-react";

// Importa o nosso novo componente de cliente
import { ListaConcursos } from "./ListaConcursos";

export default async function ConcursosAbertosPage() {
  // Busca os dados no servidor (Rápido e seguro)
  const listaConcursos = await db.select().from(concursos);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 mt-6 mb-12">
      {/* CABEÇALHO (Mantido no servidor para SEO e velocidade) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <BellRing className="w-8 h-8 text-emerald-500" />
            Concursos Abertos
          </h1>
          <p className="text-neutral-400">
            Fique por dentro das melhores oportunidades. Acompanhe os editais
            abertos, próximos concursos e planeje os seus estudos.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-neutral-800"></div>

      <ListaConcursos concursosIniciais={listaConcursos} />
    </div>
  );
}
