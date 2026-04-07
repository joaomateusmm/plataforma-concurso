// src/app/aluno/concursos/page.tsx
import { db } from "@/db/index";
import { concursos, lembretesConcursos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { BellRing } from "lucide-react";

import { ListaConcursos } from "./ListaConcursos";

export default async function ConcursosAbertosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const listaConcursos = await db.select().from(concursos);
  let meusLembretes: number[] = [];
  if (session?.user) {
    const lembretesDb = await db
      .select({ concursoId: lembretesConcursos.concursoId })
      .from(lembretesConcursos)
      .where(eq(lembretesConcursos.userId, session.user.id));

    meusLembretes = lembretesDb.map((l) => l.concursoId);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 mt-6 mb-12">
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

      <ListaConcursos
        concursosIniciais={listaConcursos}
        lembretesAtivosIniciais={meusLembretes} 
      />
    </div>
  );
}
