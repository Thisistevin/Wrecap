import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  logger.error('⚠️ GEMINI_API_KEY is not set in environment variables');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const PROMPT = `Analise o arquivo de conversa enviado e gere uma retrospectiva de amizade estruturada estritamente em formato JSON. A análise deve ser criativa, capturar a essência da relação e extrair métricas exatas de constância (dias ativos).

Regras de Geração do JSON (Siga Rigorosamente):

Sem Citações: Não utilize marcadores como \`\` ou qualquer tag de sistema. O texto deve ser limpo.

Título: O campo titulo deve conter apenas os nomes identificados no log (ex: "Clarinha & Estevão Moreira").

Descrição do Tipo de Amizade: O campo descricao deve seguir obrigatoriamente este formato: "Uma conexão divertida marcada por [caracteristica 1], [caracteristica 2] e muitas [caracteristica 3].".

Explicação do Nome (Porque): O campo por_que deve ser uma frase livre e criativa que explique a escolha do nome_criativo.

Pilares da Amizade: O campo pilares deve seguir obrigatoriamente este formato de separadores: "A amizade se sustenta [artigo + pilar 1]@ [artigo + pilar 2] # [artigo + pilar 3].".

Cálculo de Constância: * Identifique a data da primeira e da última mensagem para calcular o "Intervalo Total" (em dias).

Conte quantos dias únicos possuem ao menos uma mensagem enviada ("Dias Ativos").

Formate o campo constancia_conversa exatamente como: "Vocês conversaram X dias de um total de Y dias entre a primeira e última mensagem".

Quantidade Fixa de Itens:

melhores_momentos_eventos: Exatamente 4 strings.

momentos_engracados_piadas -> itens: Exatamente 4 strings.

expressoes_internas: Exatamente 4 strings.

metas_proximo_ano: Exatamente 3 strings.

Estrutura Obrigatória:

{
  "titulo": "Nome A & Nome B",
  "metricas_temporais": {
    "inicio": "DD/MM/AAAA",
    "fim": "DD/MM/AAAA",
    "constancia_conversa": "string"
  },
  "tipo_de_amizade": {
    "nome_criativo": "string",
    "descricao": "Uma conexão divertida marcada por [caracteristica 1], [caracteristica 2] e muitas [caracteristica 3].",
    "por_que": "Frase livre explicando o nome criativo.",
    "pilares": "A amizade se sustenta [artigo + pilar 1]@ [artigo + pilar 2] # [artigo + pilar 3].",
    "exemplo_real": {
      "autor": "string",
      "message": "string",
      "hour": "string"
    }
  },
  "melhores_momentos_eventos": ["string", "string", "string", "string"],
  "momentos_engracados_piadas": {
    "itens": ["string", "string", "string", "string"],
    "exemplo_real": {
      "autor": "string",
      "message": "string",
      "hour": "string"
    }
  },
  "expressoes_internas": ["string", "string", "string", "string"],
  "metas_proximo_ano": ["string", "string", "string"],
  "fechamento": "string"
}

Instruções de Privacidade:

Nunca exponha números de telefone, endereços completos ou CPFs.`;

export async function generateRetrospective(chatText: string): Promise<string> {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not set. Please configure it in your .env.local file.');
  }

  if (!chatText || chatText.trim().length === 0) {
    throw new Error('Chat text is empty. Cannot generate retrospective.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const fullPrompt = `${PROMPT}\n\nArquivo de conversa:\n\n${chatText}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Gemini API returned empty response');
    }
    
    // Clean up the response - remove markdown code blocks if present
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    text = text.trim();
    
    // Validate JSON format
    try {
      const parsed = JSON.parse(text);
      // Ensure it has the required structure
      if (!parsed.titulo || !parsed.metricas_temporais || !parsed.tipo_de_amizade) {
        logger.warn('⚠️ Gemini response missing required fields, but JSON is valid');
      }
      // Return as string (will be re-parsed later)
      return JSON.stringify(parsed, null, 2);
    } catch (parseError) {
      logger.error('❌ Gemini returned invalid JSON:', parseError);
      logger.error('📝 Raw response:', text.substring(0, 500));
      throw new Error(`Gemini returned invalid JSON. Response: ${text.substring(0, 200)}...`);
    }
  } catch (error: any) {
    logger.error('Error generating retrospective with Gemini:', error);
    throw new Error(`Failed to generate retrospective: ${error.message || 'Unknown error'}`);
  }
}

