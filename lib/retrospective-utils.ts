import { RetrospectiveTextData } from '@/hooks/use-retrospective-data';

export function parseRetrospectiveData(textContent: RetrospectiveTextData) {
  // Separa nomes
  const [primeiroNome, segundoNome] = textContent.titulo
    .split(" & ")
    .map(nome => nome.split(" ")[0]);

  // Pega os dias conversados
  const totalDeDias = textContent.metricas_temporais.constancia_conversa
    .split("total de ")[1]
    ?.split(" dias")[0] || '0';

  const diasConversados = textContent.metricas_temporais.constancia_conversa
    .split("conversaram")[1]
    ?.split("dias de um total")[0]?.trim() || '0';

  const caracteristica1 = textContent.tipo_de_amizade.descricao
    .split("marcada por")[1]
    ?.split(",")[0]?.trim() || '';

  const caracteristica2 = textContent.tipo_de_amizade.descricao
    .split(",")[1]
    ?.split("e")[0]?.trim() || '';

  const caracteristica3 = textContent.tipo_de_amizade.descricao
    .split("e muitas")[1]
    ?.split(".")[0]?.trim() || '';

  const pilar1 = textContent.tipo_de_amizade.pilares
    .split("amizade se sustenta")[1]
    ?.split("@")[0]?.trim() || '';

  const pilar2 = textContent.tipo_de_amizade.pilares
    .split("@")[1]
    ?.split("#")[0]?.trim() || '';

  const pilar3 = textContent.tipo_de_amizade.pilares
    .split("#")[1]
    ?.split(".")[0]?.trim() || '';

  const porqueDoNome = textContent.tipo_de_amizade.por_que;

  return {
    primeiroNome,
    segundoNome,
    totalDeDias,
    diasConversados,
    caracteristica1,
    caracteristica2,
    caracteristica3,
    pilar1,
    pilar2,
    pilar3,
    porqueDoNome,
  };
}

