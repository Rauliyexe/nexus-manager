import { AgentContext, AGENT_TOOLS, executeAgentTool } from './aiAgentService';

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * Converte as ferramentas do formato genérico para o formato FunctionDeclarations aceito pelo Google Gemini.
 */
function convertToolsToGeminiDeclarations() {
  return AGENT_TOOLS.map((tool) => {
    const rawProperties = tool.input_schema?.properties || {};
    const formattedProperties: Record<string, any> = {};

    for (const [key, prop] of Object.entries<any>(rawProperties)) {
      formattedProperties[key] = {
        type: (prop.type || 'STRING').toUpperCase(),
        description: prop.description || '',
        ...(prop.enum ? { enum: prop.enum } : {}),
      };
    }

    const parameters: any = {
      type: 'OBJECT',
      properties: formattedProperties,
    };

    if (tool.input_schema?.required && tool.input_schema.required.length > 0) {
      parameters.required = tool.input_schema.required;
    }

    return {
      name: tool.name,
      description: tool.description,
      parameters,
    };
  });
}

/**
 * Normaliza o histórico de mensagens para o formato estrito do Google Gemini:
 * - Deve começar obrigatoriamente com o papel 'user'.
 * - Os papéis devem alternar rigorosamente: 'user' -> 'model' -> 'user' -> 'model'.
 * - Não permite papéis consecutivos repetidos.
 */
function buildGeminiContents(
  message: string,
  history: Array<{ sender: 'user' | 'agent'; text: string }>
) {
  const rawItems: Array<{ role: 'user' | 'model'; text: string }> = [];

  // Filtra itens vazios e ignora a primeira mensagem se for do modelo sem pergunta anterior
  const sliced = history.slice(-6);
  for (const h of sliced) {
    if (!h.text || !h.text.trim()) continue;
    rawItems.push({
      role: h.sender === 'user' ? 'user' : 'model',
      text: h.text.trim(),
    });
  }

  // Adiciona a mensagem atual do usuário
  if (message && message.trim()) {
    rawItems.push({
      role: 'user',
      text: message.trim(),
    });
  }

  const normalizedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const item of rawItems) {
    if (normalizedContents.length === 0) {
      // O Gemini exige que a primeira mensagem seja 'user'
      if (item.role === 'user') {
        normalizedContents.push({
          role: 'user',
          parts: [{ text: item.text }],
        });
      }
    } else {
      const lastIndex = normalizedContents.length - 1;
      const lastRole = normalizedContents[lastIndex].role;

      if (item.role === lastRole) {
        // Concatena mensagens consecutivas do mesmo papel
        normalizedContents[lastIndex].parts[0].text += `\n\n${item.text}`;
      } else {
        normalizedContents.push({
          role: item.role,
          parts: [{ text: item.text }],
        });
      }
    }
  }

  // Se por qualquer razão estiver vazio, garante uma mensagem inicial do usuário
  if (normalizedContents.length === 0) {
    normalizedContents.push({
      role: 'user',
      parts: [{ text: message.trim() || 'Olá' }],
    });
  }

  return normalizedContents;
}

/**
 * Executa o fluxo do Personal Agent via Google Gemini REST API com Tool Calling nativo e Thinking Mode.
 */
export async function runGeminiAgentInference(
  message: string,
  history: Array<{ sender: 'user' | 'agent'; text: string }>,
  context: AgentContext,
  apiKey: string,
  preferredModel?: string,
  enableThinking: boolean = true
): Promise<{ text: string; thoughtProcess?: string; toolsUsed: string[]; actionTaken?: any; engineType: 'gemini' }> {
  const modelName = preferredModel || DEFAULT_GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const systemInstruction = `Você é o Personal AI Copilot Executivo do usuário ${context.currentUser.name} (${context.currentUser.role} no departamento de ${context.currentUser.department || 'Geral'}) dentro do Command Center do Nexus Manager.

MODO DE PENSAMENTO E RACIOCÍNIO PROFUNDO:
1. RACIOCINE PASSO A PASSO sobre a solicitação do usuário antes de formular a resposta.
2. Analise criticamente o contexto da conversa e o histórico recente. Se o usuário fizer perguntas contextuais ou de acompanhamento (como "Como posso concluí-las?", "O que fazer agora?", "Quais são as prioridades?"), relacione imediatamente com as tarefas, projetos ou alertas mencionados no histórico.
3. Se precisar de dados do sistema para fundamentar seu raciocínio, USE as ferramentas disponíveis (get_my_tasks, get_my_projects, get_my_notifications, etc.).
4. Nunca forneça respostas prontas e vazias. Seja consultivo, estratégico e forneça instruções acionáveis de resolução (ex: como atualizar o status da tarefa, como delegar, ou links e caminhos no Command Center).
5. Responda em português brasileiro de forma executiva, profissional, formatando em markdown com listas claras, negritos estratégicos e tabelas quando apropriado.`;

  const initialContents = buildGeminiContents(message, history);
  const toolsPayload = [
    {
      functionDeclarations: convertToolsToGeminiDeclarations(),
    },
  ];

  const toolsUsed: string[] = [];
  const thoughtsAccumulator: string[] = [];
  let actionTaken: any = undefined;
  let currentContents: any[] = [...initialContents];
  let finalResponseText = '';

  // Configuração de geração com suporte a Thinking Budget quando suportado
  const isThinkingModel = modelName.includes('2.0') || modelName.includes('thinking') || enableThinking;
  const generationConfig: Record<string, any> = {
    temperature: 0.3,
    maxOutputTokens: 2048,
  };

  if (isThinkingModel && !modelName.includes('1.5')) {
    // Modelos Gemini 2.0 aceitam thinkingConfig
    generationConfig.thinkingConfig = {
      thinkingBudget: 2048,
    };
  }

  // Loop de iterações para Function Calling (máximo 3 turnos para segurança)
  for (let turn = 0; turn < 3; turn++) {
    const requestBody: any = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: currentContents,
      tools: toolsPayload,
      generationConfig,
    };

    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // Se o modelo rejeitar thinkingConfig com erro 400, faz retry sem o thinkingConfig
    if (!res.ok && res.status === 400 && generationConfig.thinkingConfig) {
      delete requestBody.generationConfig.thinkingConfig;
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erro na API do Gemini (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content) {
      break;
    }

    const modelParts = candidate.content.parts || [];
    const functionCalls = modelParts.filter((p: any) => p.functionCall);

    // Extrai blocos de pensamento nativos (part.thought === true)
    const thoughtParts = modelParts.filter((p: any) => p.thought === true || (p.text && p.thought));
    const normalTextParts = modelParts.filter((p: any) => p.text && !p.thought && !p.functionCall);

    for (const tp of thoughtParts) {
      if (tp.text && tp.text.trim()) {
        thoughtsAccumulator.push(tp.text.trim());
      }
    }

    if (normalTextParts.length > 0) {
      const rawText = normalTextParts.map((p: any) => p.text).join('\n');
      
      // Checa se o modelo incluiu tags <thought> no texto
      const thoughtTagMatch = rawText.match(/<thought>([\s\S]*?)<\/thought>/i);
      if (thoughtTagMatch) {
        thoughtsAccumulator.push(thoughtTagMatch[1].trim());
        finalResponseText = rawText.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();
      } else {
        finalResponseText = rawText;
      }
    }

    // Se o Gemini não chamou nenhuma ferramenta, concluímos a resposta
    if (functionCalls.length === 0) {
      break;
    }

    // Processa chamadas de função
    currentContents.push({
      role: 'model',
      parts: modelParts,
    });

    const functionResponseParts: any[] = [];

    for (const fc of functionCalls) {
      const call = fc.functionCall;
      const fnName = call.name;
      const fnArgs = call.args || {};

      toolsUsed.push(fnName);
      thoughtsAccumulator.push(`[Ação] Executando ferramenta oficial: ${fnName}(${JSON.stringify(fnArgs)})`);
      
      const toolResult = await executeAgentTool(fnName, fnArgs, context);
      if (toolResult.actionTaken) {
        actionTaken = toolResult.actionTaken;
      }

      let parsedContent: any = toolResult.content;
      try {
        parsedContent = JSON.parse(toolResult.content);
      } catch {
        parsedContent = { output: toolResult.content };
      }

      functionResponseParts.push({
        functionResponse: {
          name: fnName,
          response: {
            name: fnName,
            content: parsedContent,
          },
        },
      });
    }

    // Adiciona o resultado das funções para o próximo turno do Gemini
    currentContents.push({
      role: 'function',
      parts: functionResponseParts,
    });
  }

  const compiledThoughts = thoughtsAccumulator.length > 0
    ? thoughtsAccumulator.join('\n\n')
    : undefined;

  return {
    text: finalResponseText || 'Comando processado com sucesso pelo Personal Copilot.',
    thoughtProcess: compiledThoughts,
    toolsUsed,
    actionTaken,
    engineType: 'gemini',
  };
}

/**
 * Análise de Canais de Chat (Resumo, Identificação de Tarefas ou Rascunho de Resposta).
 */
export async function generateGeminiChatAnalysis(
  mode: 'SUMMARY' | 'TASKS' | 'DRAFT',
  conversationTitle: string,
  channelMessages: Array<{ senderName: string; text: string; time?: string }>,
  apiKey: string,
  preferredModel?: string
): Promise<{ content: string; tasks?: Array<{ title: string; description: string }> }> {
  const modelName = preferredModel || DEFAULT_GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const formattedMessages = channelMessages
    .slice(-30)
    .map((m) => `[${m.time || 'Recente'}] ${m.senderName}: ${m.text}`)
    .join('\n');

  let prompt = '';
  let jsonOutput = false;

  if (mode === 'SUMMARY') {
    prompt = `Você é o assistente executivo de inteligência corporativa do Nexus Manager.
Analise a conversa recente do canal "${conversationTitle}" abaixo e forneça um RESUMO EXECUTIVO estruturado e direto.

Formate a resposta EXATAMENTE com a seguinte estrutura em Markdown:
📌 **Resumo Executivo do Canal (${conversationTitle})**

• **Ponto Principal:** (1 parágrafo claro sobre o assunto central debatido)
• **Decisões Tomadas:** (lista de decisões acertadas ou combinados)
• **Pontos de Atenção & Alertas:** (bloqueios, prazos ou riscos levantados)

Mensagens do Canal:
${formattedMessages || '(Nenhuma mensagem recente encontrada)'}`;
  } else if (mode === 'TASKS') {
    jsonOutput = true;
    prompt = `Você é o assistente de produtividade do Nexus Manager.
Analise as mensagens do canal "${conversationTitle}" abaixo e extraia TODAS as tarefas, compromissos ou pendências mencionadas que precisam ser executadas.

Retorne APENAS um JSON válido no formato:
{
  "tasks": [
    {
      "title": "Título conciso da tarefa com verbo no infinitivo",
      "description": "Descrição detalhada explicando o contexto, quem solicitou ou prazo se houver"
    }
  ]
}

Se não houver tarefas explícitas, deduza 2 tarefas de alinhamento/acompanhamento relevantes para o canal.
Mensagens do Canal:
${formattedMessages || '(Nenhuma mensagem recente encontrada)'}`;
  } else if (mode === 'DRAFT') {
    prompt = `Você é o assistente executivo do Nexus Manager.
Com base nas últimas mensagens do canal "${conversationTitle}", redija uma SUGESTÃO DE RESPOSTA profissional, clara, cordial e resolutiva para dar andamento aos tópicos debatidos.

Retorne apenas o texto sugerido entre aspas ou em formato de mensagem pronta para envio.

Mensagens do Canal:
${formattedMessages || '(Nenhuma mensagem recente encontrada)'}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        ...(jsonOutput ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro na API Gemini (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (mode === 'TASKS') {
    try {
      const parsed = JSON.parse(rawText);
      return {
        content: '',
        tasks: parsed.tasks || [],
      };
    } catch {
      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        content: '',
        tasks: parsed.tasks || [],
      };
    }
  }

  return {
    content: rawText.trim(),
  };
}
