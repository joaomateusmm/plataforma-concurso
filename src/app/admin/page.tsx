// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; 

export default async function AdminDashboard() {
  // 1. Busca a sessão atual no lado do servidor
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Regra de Ouro: Se não tiver logado, OU se a role não for "admin", bloqueia o acesso!
  if (!session?.user || session.user.role !== "admin") {
    // Redireciona o usuário comum (ou deslogado) de volta para o painel de alunos
    redirect("/aluno");
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-full mx-12 space-y-12 mb-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Bem-vindo ao Painel Administrativo
      </h1>
      <p className="text-gray-600 mb-6">
        Utilize a barra lateral esquerda para navegar entre os módulos da
        plataforma. Aqui você poderá cadastrar toda a base de conhecimento
        (Bancas, Matérias, Assuntos e Questões) que alimentará os simulados dos
        seus alunos.
      </p>

      {/* Pequenos Cards de atalho visual para o futuro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-green-50 rounded-lg border border-green-100">
          <h2 className="text-xl font-semibold text-green-800">
            Questões no Banco
          </h2>
          {/* No futuro, podemos puxar esse número dinamicamente do Drizzle */}
          <p className="text-3xl font-bold text-green-600 mt-2">1</p>
        </div>
      </div>
    </div>
  );
}
