'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getStoredGeminiKey } from '@/lib/services/geminiClient';

interface PersonalAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  toolsUsed?: string[];
  actionTaken?: any;
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  { label: 'O que preciso fazer hoje?', icon: Clock },
  { label: 'Quais tarefas estão atrasadas?', icon: AlertTriangle },
  { label: 'Resuma minhas atividades', icon: Layers },
  { label: 'Mostre meus projetos e status', icon: Building2 },
  { label: 'Existe algo urgente?', icon: ShieldCheck },
];

export const PersonalAgentDrawer: React.FC<PersonalAgentDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    tasks,
    areas,
    notifications,
    conversations,
    messages,
    delegateTask,
    updateTaskStatus,
    playSound,
  } = useNexus();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<AgentChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      text: `Olá, **${currentUser.name}**! Sou o seu **Personal AI Copilot** no Command Center.\n\nEstou conectado às suas tarefas, projetos, rituais diários e canais de comunicação. Como posso te ajudar agora?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userTimestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: userTimestamp,
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);
    setActiveTool('Consultando base do Command Center...');

    try {
      const geminiKey = getStoredGeminiKey();
      const response = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: chatHistory,
          context: {
            currentUser,
            tasks,
            areas,
            notifications,
            conversations,
            messages,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar solicitação com o agente');
      }

      const data = await response.json();

      // Se a IA disparou uma ação no backend, refletimos no store local do Nexus
      if (data.actionTaken) {
        if (data.actionTaken.type === 'TASK_CREATED') {
          delegateTask(data.actionTaken.data);
        } else if (data.actionTaken.type === 'TASK_UPDATED') {
          updateTaskStatus(data.actionTaken.data.taskId, data.actionTaken.data.status);
        }
      }

      const agentMsg: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.text,
        toolsUsed: data.toolsUsed,
        actionTaken: data.actionTaken,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory((prev) => [...prev, agentMsg]);
      playSound('AI_READY');
    } catch (err) {
      const errorMsg: AgentChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: 'Não consegui processar essa requisição no momento. Por favor, tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setActiveTool(null);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([
      {
        id: 'welcome-msg',
        sender: 'agent',
        text: `Histórico reiniciado. Como posso te ajudar, **${currentUser.name}**?`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 dark:bg-black/60 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#121D16] border-l border-[#D5E0D7] dark:border-[#1E3125] h-full flex flex-col shadow-2xl card-shadow select-none animate-in slide-in-from-right duration-200">
        {/* ── Top Header ── */}
        <div className="p-4 bg-[#EEF2EE]/80 dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B3026] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100">
                  Personal AI Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#2C6E49] text-white text-[9px] font-mono font-bold uppercase">
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-[#5E7567] dark:text-slate-400 font-medium mt-0.5">
                Usuário: <strong className="text-[#111D15] dark:text-slate-200">{currentUser.name}</strong> ({currentUser.department || currentUser.role})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleClearHistory}
              className="p-2 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-xl hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
              title="Limpar Conversa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-xl hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
              title="Fechar Painel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Quick Suggestions Bar ── */}
        <div className="p-3 bg-white/60 dark:bg-[#121D16]/60 border-b border-[#D5E0D7] dark:border-[#1E3125] overflow-x-auto no-scrollbar flex items-center space-x-2">
          {QUICK_SUGGESTIONS.map((sug, i) => {
            const Icon = sug.icon;
            return (
              <button
                key={i}
                onClick={() => handleSendMessage(sug.label)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] hover:bg-[#D5E0D7] dark:hover:bg-[#2A4A3C] text-[#1B3026] dark:text-[#76B38B] font-bold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 shadow-2xs"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sug.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Messages Stream ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-sans">
          {chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#1B3026] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Tool Badge if tool was used */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="flex items-center space-x-1 text-[10px] font-mono text-[#5E7567] dark:text-slate-400 bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-0.5 rounded-md border border-[#D5E0D7] dark:border-[#1E3125] w-fit">
                      <ShieldCheck className="w-3 h-3 text-[#2C6E49]" />
                      <span>Tools: {msg.toolsUsed.join(', ')}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed card-shadow whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[#1B3026] text-white rounded-tr-xs'
                        : 'bg-[#EEF2EE]/60 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] text-[#111D15] dark:text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Executed Action Badge */}
                  {msg.actionTaken && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-xl space-y-0.5 text-xs text-emerald-950 dark:text-emerald-200 card-shadow animate-in fade-in duration-150">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">
                          {msg.actionTaken.type === 'TASK_CREATED'
                            ? 'AÇÃO EXECUTADA · Tarefa Criada'
                            : 'AÇÃO EXECUTADA · Tarefa Atualizada'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 pl-5">
                        {msg.actionTaken.type === 'TASK_CREATED'
                          ? `Demanda "${msg.actionTaken.data?.title}" registrada no Command Center.`
                          : `Status da tarefa atualizado para ${msg.actionTaken.data?.status}.`}
                      </p>
                    </div>
                  )}

                  <span className={`text-[9px] font-mono text-[#5E7567] block ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="shrink-0 mt-0.5">
                    <UserAvatar name={currentUser.name} size="sm" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading / Tool execution badge */}
          {loading && (
            <div className="flex items-center space-x-3 text-xs text-[#5E7567]">
              <div className="w-7 h-7 rounded-xl bg-[#1B3026] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-[#EEF2EE]/60 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl rounded-tl-xs flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#2C6E49] animate-spin" />
                <span className="font-medium text-xs text-[#111D15] dark:text-slate-300">
                  {activeTool || 'Analisando requisição com Claude Haiku...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="p-4 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border-t border-[#D5E0D7] dark:border-[#1E3125]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-2 card-shadow focus-within:border-[#1B3026] transition-all"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Peça algo ao seu agente... (ex: 'O que tenho hoje?')"
              disabled={loading}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none font-medium"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className={`p-2.5 rounded-xl transition-all shadow-xs cursor-pointer ${
                inputMessage.trim() && !loading
                  ? 'bg-[#1B3026] hover:bg-[#2A4A3C] text-white'
                  : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#5E7567] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
