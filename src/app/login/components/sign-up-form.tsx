"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

// Ícone do Google reutilizado para manter consistência
const GoogleIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function SignUpForm({
  switchToSignIn,
}: {
  switchToSignIn: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: "/aluno", // Redireciona para o painel do aluno
      },
      {
        onRequest: () => setLoading(true),
        onError: (ctx) => {
          console.log("ERRO REAL DO BETTER AUTH:", ctx.error);
          setError(
            ctx.error.message || "Algo deu errado. Por favor, tente novamente.",
          );
          setLoading(false);
        },
        onSuccess: () => {
          router.push("/aluno");
          router.refresh();
        },
      },
    );
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    setError(null);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/aluno",
      });
    } catch {
      setSocialLoading(null);
      setError("Falha ao conectar com o provedor social.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto flex w-full max-w-sm flex-col gap-6 duration-500">
      {/* Cabeçalho */}
      <div className="mb-2 flex flex-col text-start">
        <Link href="/">
          <span className="text-xs text-neutral-500 hover:text-neutral-400 hover:underline">
            ⟵ voltar para o início
          </span>
        </Link>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
          Crie sua conta
        </h1>
        <p className="text-md mt-1 text-neutral-400">
          Cadastre-se e comece a acelerar a sua aprovação.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Nome Completo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João da Silva"
            required
            className="h-12 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 text-white transition-all placeholder:text-neutral-600 focus:border-white focus:ring-2 focus:ring-white/10 focus:outline-none"
          />
        </div>

        {/* E-mail */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="h-12 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 text-white transition-all placeholder:text-neutral-600 focus:border-white focus:ring-2 focus:ring-white/10 focus:outline-none"
          />
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Senha</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mín. 8 caracteres"
              required
              className="h-12 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 pr-12 text-white transition-all placeholder:text-neutral-600 focus:border-white focus:ring-2 focus:ring-white/10 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !!socialLoading}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-emerald-600 font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Criar Conta"}
        </button>
      </form>

      {/* Divisor Social */}
      <div className="relative flex items-center py-2">
        <div className="grow border-t border-neutral-800"></div>
        <span className="mx-4 shrink-0 text-xs font-medium tracking-wider text-neutral-500 uppercase">
          ou cadastre-se com
        </span>
        <div className="grow border-t border-neutral-800"></div>
      </div>

      {/* Botões Sociais */}
      <div className="grid grid-cols-2 gap-4">
        {/* Botão do GitHub */}
        <button
          type="button"
          disabled={loading || !!socialLoading}
          onClick={() => handleSocialSignIn("github")}
          className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 font-medium text-white transition-all hover:border-neutral-700 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {socialLoading === "github" ? (
            <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
          ) : (
            <>
              <span>GitHub</span>
            </>
          )}
        </button>

        {/* Botão do Google */}
        <button
          type="button"
          disabled={loading || !!socialLoading}
          onClick={() => handleSocialSignIn("google")}
          className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 font-medium text-white transition-all hover:border-neutral-700 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {socialLoading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
          ) : (
            <>
              <GoogleIcon />
              <span>Google</span>
            </>
          )}
        </button>
      </div>

      {/* Rodapé */}
      <p className="mt-2 text-center text-sm text-neutral-500">
        Já tem uma conta?{" "}
        <button
          onClick={switchToSignIn}
          className="font-bold text-white transition-colors hover:underline"
        >
          Entrar
        </button>
      </p>
    </div>
  );
}
