"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";
import { VerticalCarousel } from "@/components/VerticalCarousel";

// Lista de imagens do nosso carrossel
const carouselItems = [
  {
    image: "/bombeiro.webp",
    text: "BMC",
    href: "/aluno",
  },
  {
    image: `/simulado.webp`,
    text: "Provas",
    href: "/aluno",
  },
  {
    image: `/policial.webp`,
    text: "PM",
    href: "/aluno",
  },
  {
    image: "/prf.webp",
    text: "PRF",
    href: "/aluno",
  },
  {
    image: `/gcm.webp`,
    text: "GCM",
    href: "/aluno",
  },
  {
    image: `/militar.webp`,
    text: "ESA",
    href: "/aluno",
  },
  {
    image: `/pp.webp`,
    text: "PCCE",
    href: "/aluno",
  },
  {
    image: `/pmce.webp`,
    text: "PMCE",
    href: "/aluno",
  },
];

const Authentication = () => {
  // Agora controlamos as Tabs de forma direta e simples!
  const [activeTab, setActiveTab] = useState<string>("sign-in");

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-black text-white">
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 lg:w-1/2 lg:px-12">
        <div className="relative z-10 w-full max-w-sm">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent
              value="sign-in"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {/* Passamos a função para mudar para a tab de cadastro */}
              <SignInForm switchToSignUp={() => setActiveTab("sign-up")} />
            </TabsContent>

            <TabsContent
              value="sign-up"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {/* Passamos a função para mudar para a tab de login */}
              <SignUpForm switchToSignIn={() => setActiveTab("sign-in")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* --- LADO DIREITO: Carrossel --- */}
      <div className="relative hidden h-full w-[40vw] lg:block">
        <div className="absolute inset-0 px-25">
          <VerticalCarousel
            items={carouselItems}
            speed={50}
            col1Direction="up"
            col2Direction="down"
            pauseOnHover={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Authentication;
