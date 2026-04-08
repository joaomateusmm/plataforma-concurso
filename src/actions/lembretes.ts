"use server";

import { db } from "../db/index";
import { lembretesConcursos, concursos, user } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function obterTemplateEmail(novoStatus: string, concurso: any) {
  const nomeConcurso = `${concurso.orgao} ${concurso.cargo ? `(${concurso.cargo})` : ""}`;

  let subject = "";
  let mensagemHtml = "";
  let textoBotao = "Acessar Plataforma";
  let linkBotao = "https://mateusdev.shop/aluno/concursos";

  switch (novoStatus) {
    case "Concurso Autorizado":
      subject = `🟢 Boas Notícias: ${concurso.orgao} foi Autorizado!`;
      textoBotao = "Começar a Preparação";
      mensagemHtml = `
        <p style="margin-bottom: 20px;">Temos excelentes notícias! O <strong>CONCURSO FOI OFICIALMENTE AUTORIZADO.</strong></p>
        <p style="margin-bottom: 20px;">Esta é a etapa <strong>IDEAL</strong> para iniciares a tua jornada até à aprovação com um estudo focado para o <span style="color: #10b981;">${nomeConcurso}</span>.</p>
        <p style="margin-bottom: 20px;">Sai na frente da concorrência antes do edital ser lançado. Tenha acesso a questões ilimitadas, aulas gravadas e simulados a vontade, tudo para alcançar a sua aprovação da maneira certa!</p>
        <p style="margin-bottom: 20px;">Clique abaixo e comece a estudar:</p>
      `;
      break;

    case "Banca Definida":
      subject = `🏢 Banca Definida para ${concurso.orgao}!`;
      textoBotao = "Fazer Questões da Banca";
      mensagemHtml = `
        <p style="margin-bottom: 20px;">Mais um grande passo: <strong>A BANCA FOI DEFINIDA!</strong></p>
        <p style="margin-bottom: 20px;">Agora já sabemos as regras do jogo. Esta é uma das etapas <strong>MAIS IMPORTANTES</strong> da sua jornada até a aprovação no <span style="color: #10b981;">${nomeConcurso}</span>.</p>
        <p style="margin-bottom: 20px;">Estudar a banca é o segredo do sucesso. Tenha acesso a questões ilimitadas e simulados focados, tudo para alcançar a sua aprovação da maneira certa!</p>
        <p style="margin-bottom: 20px;">Clique abaixo e comece a treinar o estilo da banca:</p>
      `;
      break;

    case "Edital Iminente":
      subject = `🚨 Alerta: Edital Iminente para ${concurso.orgao}!`;
      textoBotao = "Foco Total";
      mensagemHtml = `
        <p style="margin-bottom: 20px;">Atenção! O edital do seu concurso <strong>ESTÁ QUASE A SAIR!</strong></p>
        <p style="margin-bottom: 20px;">Uma das etapas <strong>MAIS IMPORTANTES</strong> da sua jornada até a aprovação, tenha um estudo diferenciado e focado para o <span style="color: #10b981;">${nomeConcurso}</span>.</p>
        <p style="margin-bottom: 20px;">A banca já está a organizar os últimos detalhes. Tenha acesso a questões ilimitadas, aulas gravadas e simulados a vontade, tudo para alcançar a sua aprovação da maneira certa!</p>
        <p style="margin-bottom: 20px;">Clique abaixo e intensifique a preparação:</p>
      `;
      break;

    case "Edital Lançado":
      subject = `📢 Saiu! Edital Lançado: ${concurso.orgao}!`;
      textoBotao = "Acessar Edital";
      linkBotao = concurso.linkEdital || linkBotao;
      mensagemHtml = `
        <p style="margin-bottom: 20px;">O edital do seu concurso <strong>ACABA DE SER LANÇADO!</strong></p>
        <p style="margin-bottom: 20px;">A corrida oficial começou! Para chegar à aprovação, tenha um estudo focado 100% no novo edital do <span style="color: #10b981;">${nomeConcurso}</span>.</p>
        <p style="margin-bottom: 20px;">Confira as disciplinas, as datas e tenha acesso a questões e simulados a vontade, tudo para alcançar a sua aprovação da maneira certa!</p>
        <p style="margin-bottom: 20px;">Clique abaixo e leia os detalhes do edital:</p>
      `;
      break;

    case "Inscrições Abertas":
      subject = `🟢 Não perca o prazo! Inscrições abertas para ${concurso.orgao}!`;
      textoBotao = "Ir para Inscrição";
      linkBotao = concurso.linkInscricao || linkBotao;
      mensagemHtml = `
        <p style="margin-bottom: 20px;">As inscrições do seu concurso <strong>ESTÃO ABERTAS!</strong></p>
        <p style="margin-bottom: 20px;">Não deixe para o último dia! Garanta a sua participação no <span style="color: #10b981;">${nomeConcurso}</span> e não corra riscos.</p>
        <p style="margin-bottom: 20px;">Acede à plataforma, confere o link oficial da banca organizadora e faça a sua inscrição agora mesmo!</p>
        <p style="margin-bottom: 20px;">Clique abaixo para garantir a sua vaga:</p>
      `;
      break;

    case "Inscrições Encerradas":
      subject = `⏳ Reta Final: Inscrições encerradas para ${concurso.orgao}`;
      textoBotao = "Fazer Simulados";
      mensagemHtml = `
        <p style="margin-bottom: 20px;">As inscrições do seu concurso <strong>FORAM ENCERRADAS!</strong></p>
        <p style="margin-bottom: 20px;">A prova está a chegar. Esta é a etapa <strong>MAIS IMPORTANTE</strong> da sua jornada até a aprovação. Mantenha o foco total no <span style="color: #10b981;">${nomeConcurso}</span>.</p>
        <p style="margin-bottom: 20px;">Tenha acesso a questões ilimitadas, aulas gravadas e simulados a vontade, tudo para alcançar a sua aprovação da maneira certa!</p>
        <p style="margin-bottom: 20px;">Clique abaixo e teste os seus conhecimentos finais:</p>
      `;
      break;

    case "Concurso Encerrado":
      subject = `🏁 Concurso Encerrado: ${concurso.orgao}`;
      textoBotao = "Ver Histórico";
      mensagemHtml = `
        <p style="margin-bottom: 20px;">O concurso que acompanhava <strong>FOI ENCERRADO!</strong></p>
        <p style="margin-bottom: 20px;">Esperamos que tenha tido um excelente resultado no <span style="color: #10b981;">${nomeConcurso}</span>. Lembre-se que a jornada só termina com a posse!</p>
        <p style="margin-bottom: 20px;">Continue a ter acesso a questões ilimitadas, aulas gravadas e simulados a vontade, tudo para alcançar a sua aprovação no seu próximo desafio!</p>
        <p style="margin-bottom: 20px;">Clique abaixo e continue a estudar para novas metas:</p>
      `;
      break;

    default:
      subject = `Atualização de Status: ${concurso.orgao}`;
      mensagemHtml = `
        <p style="margin-bottom: 20px;">O status do seu concurso acaba de <strong>SER ATUALIZADO!</strong></p>
        <p style="margin-bottom: 20px;">O concurso para o <span style="color: #10b981;">${nomeConcurso}</span> mudou para o status: <strong style="color: #10b981;">${novoStatus}</strong>.</p>
        <p style="margin-bottom: 20px;">Tenha acesso a questões ilimitadas, aulas gravadas e simulados a vontade, tudo para alcançar a sua aprovação da maneira certa!</p>
        <p style="margin-bottom: 20px;">Clique abaixo e comece a estudar:</p>
      `;
  }

  const bannerHtml = concurso.thumbnailUrl
    ? `<img src="${concurso.thumbnailUrl}" alt="Banner do Concurso" style="width: 100%; height: auto; max-height: 150px; object-fit: cover; display: block;" />`
    : ``;

  // A MÁGICA ACONTECE AQUI NO WRAPPER PRINCIPAL
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet">
      </head>

        <div style="max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">
          
          ${bannerHtml}
          
          <div style="padding: 30px 20px;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="display: inline-flex; align-items: center; justify-content: center;">
                <img src="https://z980u265n9.ufs.sh/f/quHfr8SiDl3Z2k9P9vyvBQPqseWdog3FI7kSawi6hZpGUTyj" alt="Logo +Aprovado" style="height: 34px; margin-right: 8px; display: block;" />
                
                <span style="font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.025em; line-height: 1.25;">
                  +Aprovado
                </span>
              </div>
            </div>
            
            <hr style="border: none; border-top: 1px solid #333333; margin-bottom: 30px;" />
            
            <div style="color: #e5e5e5; font-size: 15px; line-height: 1.6; font-family: sans-serif;">
              ${mensagemHtml}
            </div>
            
            <div style="margin-top: 35px;">
              <a href="${linkBotao}" style="display: block; box-sizing: border-box; width: 100%; text-align: center; background-color: #059669; color: #ffffff; padding: 16px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; font-family: sans-serif;">
                ${textoBotao}
              </a>
            </div>
            
            <div style="margin-top: 40px; color: #e5e5e5; font-size: 15px; line-height: 1.6; font-family: sans-serif;">
              <p style="margin: 0;">Bons estudos,</p>
              <p style="margin-top: 10px;">Equipe <span style="color: #10b981;">+Aprovado</span></p>
            </div>
          </div>

        </div>
    </html>
  `;

  return { subject, html };
}

export async function toggleLembrete(userId: string, concursoId: number) {
  try {
    const lembreteExistente = await db
      .select()
      .from(lembretesConcursos)
      .where(
        and(
          eq(lembretesConcursos.userId, userId),
          eq(lembretesConcursos.concursoId, concursoId),
        ),
      );

    if (lembreteExistente.length > 0) {
      await db
        .delete(lembretesConcursos)
        .where(eq(lembretesConcursos.id, lembreteExistente[0].id));

      revalidatePath("/aluno/concursos");
      return { success: true, active: false };
    }

    await db.insert(lembretesConcursos).values({
      userId: userId,
      concursoId: concursoId,
    });

    revalidatePath("/aluno/concursos");
    return { success: true, active: true };
  } catch (error) {
    console.error("Erro ao alternar lembrete:", error);
    return { error: "Ocorreu um erro ao processar o lembrete." };
  }
}

export async function notificarAlunosStatusConcurso(
  concursoId: number,
  novoStatus: string,
) {
  try {
    const dadosConcurso = await db
      .select()
      .from(concursos)
      .where(eq(concursos.id, concursoId));

    if (dadosConcurso.length === 0)
      return { error: "Concurso não encontrado." };
    const concurso = dadosConcurso[0];

    console.log(
      `[LEMBRETES] Buscando alunos para o concurso ID: ${concursoId}`,
    );

    const inscritos = await db
      .select({ email: user.email, nome: user.name })
      .from(lembretesConcursos)
      .innerJoin(user, eq(lembretesConcursos.userId, user.id))
      .where(eq(lembretesConcursos.concursoId, concursoId));

    console.log(`[LEMBRETES] Encontrou ${inscritos.length} alunos inscritos.`);

    if (inscritos.length === 0)
      return { success: true, message: "Nenhum aluno para notificar." };

    const emails = inscritos.map((i) => i.email).filter(Boolean) as string[];

    if (emails.length > 0) {
      const { subject, html } = obterTemplateEmail(novoStatus, concurso);

      console.log(
        `[LEMBRETES] Disparando Resend para ${emails.length} emails ocultos (BCC)...`,
      );

      await resend.emails.send({
        from: "Aprovado <contato@mateusdev.shop>",
        to: ["Aprovado <contato@mateusdev.shop>"],
        bcc: emails,
        subject: subject,
        html: html,
      });

      console.log(`[LEMBRETES] Resend disparado com sucesso!`);
    }

    return {
      success: true,
      message: `Notificações enviadas para ${emails.length} alunos.`,
    };
  } catch (error) {
    console.error("[LEMBRETES] Erro Fatal no Resend:", error);
    return { error: "Falha ao enviar e-mails de notificação." };
  }
}
