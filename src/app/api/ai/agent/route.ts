import { NextRequest, NextResponse } from 'next/server';
import {
  AgentContext,
  AGENT_TOOLS,
  executeAgentTool,
  runLocalAgentInference,
} from '@/lib/services/aiAgentService';
import { runGeminiAgentInference } from '@/lib/services/geminiService';

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

    const geminiKey =
      req.headers.get('x-gemini-api-key') ||
      body.geminiApiKey ||
      process.env.GEMINI_API_KEY;
    const geminiModel =
      req.headers.get('x-gemini-model') ||
      body.geminiModel ||
      process.env.GEMINI_MODEL;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // ── 1. PRIORIDADE: Google Gemini (Free Tier / Flash) com Tool Calling ──
    if (geminiKey) {
      try {
        const geminiResult = await runGeminiAgentInference(
          message,
          history,
          context as AgentContext,
          geminiKey,
          geminiModel
        );
        if (geminiResult && geminiResult.text) {
          return NextResponse.json(geminiResult);
        }
      } catch (geminiErr: any) {
        console.warn(
          'Aviso: Falha na requisição com a Gemini API. Tentando provedor secundário ou fallback.',
          geminiErr?.message || geminiErr
        );
      }
    }

    // ── 2. SEGUNDO PROVEDOR: Anthropic Claude ──
    if (anthropicKey) {
      try {
        const systemPrompt = `Você é o Personal AI Agent do usuário ${context.currentUser.name} (${context.currentUser.role} no departamento de ${context.currentUser.department || 'Geral'}) dentro do Command Center empresarial da Copper Group.

Seu objetivo é ajudar o usuário a executar seu trabalho com rapidez, precisão e segurança.
Você possui acesso apenas às informações disponibilizadas pelas ferramentas autorizadas.
Nunca invente dados. Quando não souber algo ou precisar de informações do sistema, utilize a ferramenta apropriada.
Nunca afirme que executou uma ação se a ferramenta não confirmou sua execução.
Respeite rigorosamente as permissões do usuário.
Seja conciso, profissional e útil.`;

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
            'x-api-key': anthropicKey,
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

          const toolCalls = (aiData.content || []).filter((c: any) => c.type === 'tool_use');
          const textBlocks = (aiData.content || []).filter((c: any) => c.type === 'text');

          if (toolCalls.length > 0) {
            for (const tc of toolCalls) {
              toolsUsed.push(tc.name);
              const toolResult = await executeAgentTool(tc.name, tc.input || {}, context as AgentContext);
              if (toolResult.actionTaken) {
                actionTaken = toolResult.actionTaken;
              }

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
                  'x-api-key': anthropicKey,
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
        console.warn('Erro na chamada da Anthropic API. Recorrendo ao fallback local.', err);
      }
    }

    // ── 3. FALLBACK SEGURO: Motor Heurístico Local Offline ──
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
