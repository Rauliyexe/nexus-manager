'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckSquare,
  FileText,
  Copy,
  Check,
  Send,
  Loader2,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';
import { Conversation, Message } from '@/lib/types/nexus';

interface ChatAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  messages: Message[];
  onCreateTaskFromAI: (title: string, description: string) => void;
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

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSummaryContent = () => {
    return `📌 **Resumo Executivo do Canal (${conversation.title})**\n\n• **Ponto Principal:** Conciliação financeira e cotações operacionais em andamento com 100% de conformidade.\n• **Decisão Tomada:** Revisar tabela de precificação e validação de relatórios antes das reuniões diárias das 16:30.\n• **Pontos de Atenção:** Monitorar tempos de resposta e integração de dados com as filiais.`;
  };

  const getSuggestedTasks = () => [
    {
      title: `Validar conciliação e prévia do EBITDA com diretoria (${conversation.title})`,
      description: 'Emitir relatório consolidado e conferir saldos bancários para a apresentação executiva.',
    },
    {
      title: `Auditoria de lotes e conformidade operacional (${conversation.title})`,
      description: 'Checar documentação técnica, prazos e laudos antes do fechamento diário.',
    },
  ];

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
                  Nexus Intelligence
                </span>
              </h3>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
                Canal: <strong className="text-[#111D15] dark:text-slate-200 font-bold">{conversation.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-xl hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
          {activeAction === 'SUMMARY' && (
            <div className="space-y-3">
              <div className="p-4 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-2 card-shadow">
                <p className="text-xs text-[#111D15] dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {getSummaryContent()}
                </p>
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
                A IA analisou as mensagens recentes e identificou as seguintes tarefas recomendadas:
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
                <p className="text-xs text-[#111D15] dark:text-slate-200 leading-relaxed italic">
                  "Informo que todas as validações operacionais da nossa área foram concluídas com sucesso e os dados já constam no painel gerencial para consulta do comitê executivo."
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy("Informo que todas as validações operacionais da nossa área foram concluídas com sucesso e os dados já constam no painel gerencial para consulta do comitê executivo.")}
                  className="px-3 py-1.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar para o Chat'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
