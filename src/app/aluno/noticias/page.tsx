import { Megaphone } from "lucide-react";
import { obterNoticiasPublicadas } from "@/actions/noticias";
import { ListaNoticias } from "./ListaNoticias"; // O componente que vamos criar a seguir

export const dynamic = "force-dynamic"; // Garante que as notícias estejam sempre atualizadas

export default async function NoticiasAlunoPage() {
  // Busca apenas as notícias que já atingiram a data/hora de publicação
  const res = await obterNoticiasPublicadas();
  const listaNoticias = res.success && res.noticias ? res.noticias : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 mt-6 mb-12">
      {/* CABEÇALHO HERO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300 flex items-center gap-3 mb-2">
            <Megaphone className="w-8 h-8 text-[#009966] dark:text-emerald-500 transition-colors duration-300" />
            Últimas Notícias
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 transition-colors duration-300 max-w-2xl">
            Fique atualizado com as últimas novidades sobre editais, bancas,
            autorizações e dicas exclusivas para turbinar a sua preparação.
          </p>
        </div>
      </div>

      <div className="border-t mt-7 mb-9 border-gray-200 dark:border-neutral-800 transition-colors duration-300"></div>

      {/* COMPONENTE CLIENTE DE LISTAGEM E FILTROS */}
      <ListaNoticias noticiasIniciais={listaNoticias} />
    </div>
  );
}
