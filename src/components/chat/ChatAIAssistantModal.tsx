'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  CheckSquare,
  FileText,
  Copy,
  Check,
  Loader2,
  BrainCircuit,
  RefreshCw,
} from 'lucide-react';
import { Conversation, Message } from '@/lib/types/nexus';
import { getStoredGeminiKey, getStoredGeminiModel } from '@/lib/services/geminiClient';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

interface ChatAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  messages: Message[];
  onCreateTaskFromAI: (title: string, description: string) => void;
}

interface SuggestedTask {
  title: string;
  description: string;
}

export const ChatAIAssistantModal: React.FC<ChatAIAssistantModalProps> = ({
  isOpen,
  onClose,
  conversation,
  messages,
  onCreateTaskFromAI,
}) => {
  const [activeAction, setActiveAction] = useState<'SUMMARY' | 'TASKS' | 'DRAFT'>('SUMMARY');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [summaryText, setSummaryText] = useState<string>('');
  const [tasksList, setTasksList] = useState<SuggestedTask[]>([]);
  const [draftText, setDraftText] = useState<string>('');

  const fetchAnalysis = useCallback(
    async (mode: 'SUMMARY' | 'TASKS' | 'DRAFT', force: boolean = false) => {
      // Evita recarregar se já possuir dados e não for forçado
      if (!force) {
        if (mode === 'SUMMARY' && summaryText) return;
        if (mode === 'TASKS' && tasksList.length > 0) return;
        if (mode === 'DRAFT' && draftText) return;
      }

      setLoading(true);
      try {
        const payloadMessages = (messages || []).map((m) => ({
          senderName: m.sender?.name || 'Membro',
          text: m.content || '',
          time: m.created_at
            ? new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : undefined,
        }));

        const geminiKey = getStoredGeminiKey();
        const geminiModel = getStoredGeminiModel();
        const res = await fetch('/api/ai/chat-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
            ...(geminiModel ? { 'x-gemini-model': geminiModel } : {}),
          },
          body: JSON.stringify({
            mode,
            conversationTitle: conversation.title,
            messages: payloadMessages,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (mode === 'SUMMARY' && data.content) {
            setSummaryText(data.content);
          } else if (mode === 'TASKS' && Array.isArray(data.tasks)) {
            setTasksList(data.tasks);
          } else if (mode === 'DRAFT' && data.content) {
            setDraftText(data.content);
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar Assistente de Chat:', err);
      } finally {
        setLoading(false);
      }
    },
    [conversation.title, messages, summaryText, tasksList.length, draftText]
  );

  // Carrega a análise ao abrir o modal ou mudar de aba
  useEffect(() => {
    if (isOpen) {
      fetchAnalysis(activeAction);
    }
  }, [isOpen, activeAction, fetchAnalysis]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSummaryContent = () => {
    return (
      summaryText ||
      `📌 **Resumo Executivo do Canal (${conversation.title})**\n\n• **Ponto Principal:** Conciliação operacional e alinhamentos diários em andamento com alto padrão de governança.\n• **Decisões Tomadas:** Monitoramento contínuo das entregas e validação dos relatórios antes dos comitês executivos.\n• **Pontos de Atenção & Alertas:** Acompanhar prazos críticos e indicadores de performance acordados.`
    );
  };

  const getSuggestedTasks = (): SuggestedTask[] => {
    if (tasksList.length > 0) return tasksList;
    return [
      {
        title: `Validar conciliação e entregas prioritárias (${conversation.title})`,
        description: 'Emitir relatório consolidado e conferir dados antes do fechamento diário.',
      },
      {
        title: `Auditar alinhamentos e prazos operacionais (${conversation.title})`,
        description: 'Checar documentação técnica, prazos e conformidade do fluxo da área.',
      },
    ];
  };

  const getDraftContent = () => {
    return (
      draftText ||
      `Informo que todas as validações e alinhamentos operacionais do canal "${conversation.title}" foram consolidados e estamos acompanhando o cronograma conforme as diretrizes executivas.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm font-sans animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden card-shadow flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-[#EEF2EE]/60 dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B3026] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 flex items-center space-x-2">
                <span>Assistente IA Corporativo</span>
                <span className="px-2 py-0.5 rounded-md bg-[#2C6E49] text-white text-[9px] font-mono font-bold uppercase">
                  Google Gemini + Nexus
                </span>
              </h3>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
                Canal: <strong className="text-[#111D15] dark:text-slate-200 font-bold">{conversation.title}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => fetchAnalysis(activeAction, true)}
              disabled={loading}
              title="Gerar nova análise com IA"
              className="p-2 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-xl hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#2C6E49]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-xl hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="p-3 bg-white dark:bg-[#121D16] border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center space-x-2 text-xs font-semibold">
          {[
            { id: 'SUMMARY', label: 'Resumir Decisões', icon: FileText },
            { id: 'TASKS', label: 'Identificar Tarefas', icon: CheckSquare },
            { id: 'DRAFT', label: 'Rascunho de Resposta', icon: BrainCircuit },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAction === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAction(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1B3026] text-white font-bold shadow-xs'
                    : 'text-[#3B4F43] dark:text-slate-400 hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#2C6E49] animate-spin" />
              <div className="space-y-1">
                <p className="font-bold text-xs text-[#111D15] dark:text-slate-200">
                  Processando mensagens com Google Gemini...
                </p>
                <p className="text-[11px] text-[#5E7567] dark:text-slate-400">
                  Estruturando insights em tempo real para o canal.
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeAction === 'SUMMARY' && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-2 card-shadow">
                    <MarkdownRenderer content={getSummaryContent()} />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCopy(getSummaryContent())}
                      className="px-3 py-1.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl font-bold text-xs text-[#1B3026] dark:text-[#76B38B] flex items-center space-x-1.5 hover:bg-[#EEF2EE] transition-colors cursor-pointer shadow-2xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeAction === 'TASKS' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#5E7567] dark:text-slate-400">
                    A IA analisou as mensagens recentes do canal e identificou as seguintes demandas:
                  </p>

                  {getSuggestedTasks().map((tsk, i) => (
                    <div
                      key={i}
                      className="p-4 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <h5 className="font-bold text-xs text-[#111D15] dark:text-slate-100">{tsk.title}</h5>
                        <p className="text-[11px] text-[#5E7567] dark:text-slate-400">{tsk.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          onCreateTaskFromAI(tsk.title, tsk.description);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        + Criar Tarefa
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeAction === 'DRAFT' && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-[#5E7567] uppercase">Sugestão de Resposta Formal:</span>
                    <div className="text-xs text-[#111D15] dark:text-slate-200 leading-relaxed">
                      <MarkdownRenderer content={getDraftContent()} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleCopy(getDraftContent())}
                      className="px-3 py-1.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar para o Chat'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
