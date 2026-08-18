import { NextRequest, NextResponse } from 'next/server';
import {
  AgentContext,
  AGENT_TOOLS,
  executeAgentTool,
  runLocalAgentInference,
} from '@/lib/services/aiAgentService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], context } = body;

    if (!message || !context || !context.currentUser) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos. Mensagem e contexto do usuário são obrigatórios.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Se a API key da Anthropic estiver configurada no backend, chamamos o Claude Haiku com Tool Calling
    if (apiKey) {
      try {
        const systemPrompt = `Você é o Personal AI Agent do usuário ${context.currentUser.name} (${context.currentUser.role} no departamento de ${context.currentUser.department || 'Geral'}) dentro do Command Center empresarial da Copper Group.

Seu objetivo é ajudar o usuário a executar seu trabalho com rapidez, precisão e segurança.
Você possui acesso apenas às informações disponibilizadas pelas ferramentas autorizadas.
Nunca invente dados. Quando não souber algo ou precisar de informações do sistema, utilize a ferramenta apropriada.
Nunca afirme que executou uma ação se a ferramenta não confirmou sua execução.
Respeite rigorosamente as permissões do usuário.
Seja conciso, profissional e útil.`;

        // Prepara mensagens para a Anthropic API
        const messagesPayload = [
          ...history.slice(-6).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.text,
          })),
          { role: 'user', content: message },
        ];

        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messagesPayload,
            tools: AGENT_TOOLS,
          }),
        });

        if (anthropicRes.ok) {
          const aiData = await anthropicRes.json();
          let finalResponseText = '';
          const toolsUsed: string[] = [];
          let actionTaken: any = undefined;

          // Processa chamadas de ferramentas se houver
          const toolCalls = (aiData.content || []).filter((c: any) => c.type === 'tool_use');
          const textBlocks = (aiData.content || []).filter((c: any) => c.type === 'text');

          if (toolCalls.length > 0) {
            for (const tc of toolCalls) {
              toolsUsed.push(tc.name);
              const toolResult = await executeAgentTool(tc.name, tc.input || {}, context as AgentContext);
              if (toolResult.actionTaken) {
                actionTaken = toolResult.actionTaken;
              }

              // Segunda chamada para gerar a resposta final com o resultado da ferramenta
              const secondPayload = [
                ...messagesPayload,
                { role: 'assistant', content: aiData.content },
                {
                  role: 'user',
                  content: [
                    {
                      type: 'tool_result',
                      tool_use_id: tc.id,
                      content: toolResult.content,
                    },
                  ],
                },
              ];

              const followUpRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                  model: 'claude-3-5-haiku-20241022',
                  max_tokens: 1024,
                  system: systemPrompt,
                  messages: secondPayload,
                }),
              });

              if (followUpRes.ok) {
                const followUpData = await followUpRes.json();
                finalResponseText = (followUpData.content || []).map((c: any) => c.text).join('\n');
              }
            }
          } else {
            finalResponseText = textBlocks.map((c: any) => c.text).join('\n');
          }

          if (finalResponseText) {
            return NextResponse.json({
              text: finalResponseText,
              toolsUsed,
              actionTaken,
            });
          }
        }
      } catch (err) {
        console.warn('Erro na chamada da Anthropic API, chave inválida ou offline. Recorrendo ao fallback local.', err);
      }
    }

    // Fallback Local Motor Inteligente
    const result = await runLocalAgentInference(message, context as AgentContext);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Agent API Error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar requisição do Personal Agent.' },
      { status: 500 }
    );
  }
}
