/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Clock,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { obterEditaisAdmin, deletarEditalAdmin } from "@/actions/editais";

// Importações do Shadcn Alert Dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GestaoEditaisAdminPage() {
  const [editais, setEditais] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Estado para controlar qual edital estamos prestes a deletar no Modal do Shadcn
  const [editalToDelete, setEditalToDelete] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEditais() {
      try {
        const res = await obterEditaisAdmin();
        if (isMounted) {
          if (res.success && res.editais) {
            setEditais(res.editais);
          } else {
            toast.error("Ops!", { description: res.error });
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (isMounted) {
          toast.error("Erro", { description: "Falha ao buscar editais." });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchEditais();

    return () => {
      isMounted = false;
    };
  }, []);

  const confirmarDelecao = async () => {
    if (!editalToDelete) return;

    const id = editalToDelete;
    setEditalToDelete(null);
    setDeletingId(id);

    const res = await deletarEditalAdmin(id);

    if (res.success) {
      toast.success("Excluído!", {
        description: "O edital foi apagado com sucesso.",
      });
      setEditais((prev) => prev.filter((e) => e.id !== id));
    } else {
      toast.error("Erro", { description: res.error });
    }
    setDeletingId(null);
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "";
    return new Date(dataStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-full mx-12 space-y-12 mb-12">
        {/* CABEÇALHO DO ADMIN - Tema Claro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldAlert className="w-4 h-4" /> Gestão de Editais
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 mb-2">
              Editais Cadastrados
            </h1>
            <p className="text-gray-500">
              Crie, edite ou remova os mapeamentos de editais disponíveis para
              os alunos.
            </p>
          </div>

          <Link
            href="/admin/editais/novo"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
            Novo Edital
          </Link>
        </div>

        {/* LISTAGEM DE EDITAIS */}
        {editais.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-2">
              Nenhum edital cadastrado
            </h3>
            <p className="text-gray-500 max-w-md mb-8">
              Você ainda não mapeou nenhum edital na plataforma. Clique no botão
              abaixo para começar.
            </p>
            <Link
              href="/admin/editais/novo"
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-colors shadow-sm"
            >
              Cadastrar 1º Edital
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editais.map((edital) => {
              const isPublicado = edital.status === "Publicado";

              return (
                <div
                  key={edital.id}
                  className="bg-white border border-gray-200 rounded-3xl flex flex-col overflow-hidden hover:border-gray-300 hover:shadow-md transition-all group relative"
                >
                  {/* Linha de Status no topo */}
                  <div
                    className={`h-1.5 w-full ${isPublicado ? "bg-emerald-500" : "bg-gray-300"}`}
                  />

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Status Badge & Lixeira */}
                    <div className="flex justify-between items-start mb-5">
                      <span
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                          isPublicado
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {isPublicado ? "Publicado" : "Rascunho"}
                      </span>

                      <button
                        onClick={() => setEditalToDelete(edital.id)}
                        disabled={deletingId === edital.id}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                        title="Excluir Edital"
                      >
                        {deletingId === edital.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Título e Metadados */}
                    <h3 className="text-xl font-extrabold text-gray-900 mb-4 leading-tight group-hover:text-emerald-600 transition-colors">
                      {edital.titulo}
                    </h3>

                    <div className="flex flex-col gap-2 mt-auto">
                      {edital.banca && (
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span className="truncate">{edital.banca}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Criado em {formatarData(edital.criadoEm)}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Edição Inferior */}
                  <Link
                    href={`/admin/editais/${edital.id}/editar`}
                    className="w-full py-4 text-sm font-bold flex items-center justify-center gap-2 bg-gray-50 border-t border-gray-100 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Editar Edital
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPONENTE DO MODAL DE EXCLUSÃO - Tema Claro adaptado */}
      <AlertDialog
        open={!!editalToDelete}
        onOpenChange={(open) => !open && setEditalToDelete(null)}
      >
        <AlertDialogContent className="bg-white border border-gray-200 rounded-2xl shadow-xl sm:max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl font-extrabold text-gray-900">
              Excluir Edital?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 mt-2">
              Tem a certeza que deseja excluir este edital permanentemente? Esta
              ação também removerá todas as vinculações de assuntos atreladas a
              ele. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
            <AlertDialogCancel className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelecao}
              className="bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 border-none"
            >
              Sim, excluir edital
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
