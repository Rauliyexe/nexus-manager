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
 BrainCircuit,
 ChevronDown,
 ChevronUp,
 Key,
 Settings2,
 ExternalLink,
 Save,
 Check,
 Loader2,
 Mic,
 MicOff,
 Ticket,
 DollarSign,
 Radio,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import {
 getStoredGeminiKey,
 setStoredGeminiKey,
 getStoredGeminiModel,
 setStoredGeminiModel,
 getStoredGeminiThinkingEnabled,
 setStoredGeminiThinkingEnabled,
 GEMINI_AVAILABLE_MODELS,
} from '@/lib/services/geminiClient';

interface PersonalAgentDrawerProps {
 isOpen: boolean;
 onClose: () => void;
}

interface AgentChatMessage {
 id: string;
 sender: 'user' | 'agent';
 text: string;
 thoughtProcess?: string;
 toolsUsed?: string[];
 actionTaken?: any;
 engineType?: 'gemini' | 'claude' | 'local';
 timestamp: string;
}

const QUICK_SUGGESTIONS = [
 { label: 'Valkyra, abrir chamado urgente para TI sobre o servidor', icon: Ticket },
 { label: 'Valkyra, delegar tarefa para Logística conferir frota', icon: Clock },
 { label: 'Valkyra, registrar fechamento da Fundição como OK', icon: CheckCircle2 },
 { label: 'Valkyra, qual o saldo de caixa e finanças hoje?', icon: DollarSign },
 { label: 'Quais tarefas estão atrasadas?', icon: AlertTriangle },
 { label: 'Resuma minhas atividades e projetos', icon: Layers },
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
 createTicket,
 submitDailyStatus,
 updateTaskStatus,
 playSound,
 } = useNexus();

 const [inputMessage, setInputMessage] = useState('');
 const [loading, setLoading] = useState(false);
 const [activeTool, setActiveTool] = useState<string | null>(null);
 const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
 const [showConfigModal, setShowConfigModal] = useState(false);

 // Estados de Comando por Voz
 const [isListeningVoice, setIsListeningVoice] = useState(false);
 const [voiceTranscript, setVoiceTranscript] = useState('');
 const recognitionRef = useRef<any>(null);

 // Estados de Chave e Modelo
 const [apiKeyInput, setApiKeyInput] = useState('');
 const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
 const [thinkingEnabled, setThinkingEnabled] = useState(true);
 const [keySaved, setKeySaved] = useState(false);
 const [testingKey, setTestingKey] = useState(false);
 const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

 const [chatHistory, setChatHistory] = useState<AgentChatMessage[]>([
 {
 id: 'welcome-msg',
 sender: 'agent',
 text: `Olá, **${currentUser.name}**! Sou o seu **Personal AI Copilot** no Command Center.\n\nEstou com o **Modo de Raciocínio Profundo** ativo e conectado às suas tarefas, projetos e indicadores operacionais. Como posso te ajudar agora?`,
 thoughtProcess: `[Inicialização]\n• Conexão estabelecida com o Command Center do Yggdron Manager\n• Perfil ativo: ${currentUser.name} (${currentUser.role} · ${currentUser.department || 'Geral'})\n• Raciocínio contextual e Function Calling ativados para respostas executivas`,
 timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
 },
 ]);

 const messagesEndRef = useRef<HTMLDivElement>(null);

 // Sincroniza configurações locais
 useEffect(() => {
 setApiKeyInput(getStoredGeminiKey());
 setSelectedModel(getStoredGeminiModel());
 setThinkingEnabled(getStoredGeminiThinkingEnabled());
 }, [isOpen]);

 // Auto-scroll to bottom
 useEffect(() => {
 if (isOpen) {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }
 }, [chatHistory, isOpen, loading]);

 if (!isOpen) return null;

 const toggleThought = (msgId: string) => {
 setExpandedThoughts((prev) => ({
 ...prev,
 [msgId]: !prev[msgId],
 }));
 };

 const handleSaveConfig = () => {
 setStoredGeminiKey(apiKeyInput);
 setStoredGeminiModel(selectedModel);
 setStoredGeminiThinkingEnabled(thinkingEnabled);
 setKeySaved(true);
 setTestResult(null);
 playSound('TASK_COMPLETED');
 setTimeout(() => {
 setKeySaved(false);
 setShowConfigModal(false);
 }, 1200);
 };

 const handleTestConnection = async () => {
 if (!apiKeyInput.trim()) {
 setTestResult({ success: false, message: 'Insira uma chave API do Google Gemini antes de testar.' });
 return;
 }
 setTestingKey(true);
 setTestResult(null);

 try {
 const res = await fetch('/api/ai/agent', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'x-gemini-api-key': apiKeyInput.trim(),
 'x-gemini-model': selectedModel,
 'x-gemini-thinking': String(thinkingEnabled),
 },
 body: JSON.stringify({
 message: 'Teste de conexão com Gemini Thinking.',
 history: [],
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

 if (res.ok) {
 setTestResult({
 success: true,
 message: `Conexão OK! Gemini ${selectedModel} respondendo com raciocínio ativo.`,
 });
 playSound('AI_READY');
 } else {
 const errData = await res.json().catch(() => ({}));
 setTestResult({
 success: false,
 message: errData.error || 'A chave retornou erro na API do Google AI Studio.',
 });
 }
 } catch {
 setTestResult({ success: false, message: 'Falha de rede ao contatar o endpoint da IA.' });
 } finally {
 setTestingKey(false);
 }
 };

 // Iniciar e Parar Reconhecimento de Voz de Comandos Operacionais
 const toggleVoiceRecording = () => {
  if (isListeningVoice) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
 };

 const startVoiceRecording = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Seu navegador não possui suporte direto ao Web Speech API. Digite o comando de voz no campo de texto.');
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListeningVoice(true);
      setVoiceTranscript('');
      playSound('BUTTON_CLICK');
    };

    recognition.onresult = (event: any) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i] && event.results[i][0]) {
          full += event.results[i][0].transcript + ' ';
        }
      }
      const clean = full.trim();
      setVoiceTranscript(clean);
      setInputMessage(clean);
    };

    recognition.onerror = (e: any) => {
      console.warn('Voice recognition error:', e);
      setIsListeningVoice(false);
    };

    recognition.onend = () => {
      setIsListeningVoice(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  } catch (e) {
    console.warn('Erro ao iniciar reconhecimento de voz:', e);
    setIsListeningVoice(false);
  }
 };

 const stopVoiceRecording = () => {
  if (recognitionRef.current) {
    try {
      recognitionRef.current.stop();
    } catch (e) {}
  }
  setIsListeningVoice(false);
  const spoken = (voiceTranscript || inputMessage).trim();
  if (spoken) {
    handleSendMessage(spoken);
    setVoiceTranscript('');
  }
 };

 const handleSendMessage = async (customText?: string) => {
  const textToSend = customText || inputMessage;
  if (!textToSend.trim() || loading) return;

  if (isListeningVoice) {
    stopVoiceRecording();
  }

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
  setActiveTool('Valkyra raciocinando e executando comandos operacionais...');

  try {
    const geminiKey = getStoredGeminiKey();
    const geminiModel = getStoredGeminiModel();
    const isThinking = getStoredGeminiThinkingEnabled();

    const response = await fetch('/api/ai/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
        ...(geminiModel ? { 'x-gemini-model': geminiModel } : {}),
        'x-gemini-thinking': String(isThinking),
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

    // ── Execução das Ações Operacionais Reais no Command Center ──
    if (data.actionTaken) {
      if (data.actionTaken.type === 'TASK_CREATED') {
        delegateTask(data.actionTaken.data);
        playSound('TASK_CREATED');
      } else if (data.actionTaken.type === 'TICKET_CREATED') {
        createTicket(data.actionTaken.data);
        playSound('TASK_CREATED');
      } else if (data.actionTaken.type === 'STATUS_SUBMITTED') {
        submitDailyStatus(
          data.actionTaken.data.area_id,
          data.actionTaken.data.status,
          data.actionTaken.data.justification
        );
        playSound('TASK_COMPLETED');
      } else if (data.actionTaken.type === 'TASK_UPDATED') {
        updateTaskStatus(data.actionTaken.data.taskId, data.actionTaken.data.status);
        playSound('TASK_COMPLETED');
      }
    }

    const agentMsgId = `agent-${Date.now()}`;
    const agentMsg: AgentChatMessage = {
      id: agentMsgId,
      sender: 'agent',
      text: data.text,
      thoughtProcess: data.thoughtProcess,
      toolsUsed: data.toolsUsed,
      actionTaken: data.actionTaken,
      engineType: data.engineType,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Abre automaticamente o pensamento se for uma resposta rica
    if (data.thoughtProcess) {
      setExpandedThoughts((prev) => ({ ...prev, [agentMsgId]: true }));
    }

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

 const hasApiKey = Boolean(apiKeyInput || getStoredGeminiKey());

 return (
 <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 dark:bg-black/60 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-150">
 <div className="w-full max-w-xl bg-white dark:bg-[#121D16] border-l border-[#D5E0D7] dark:border-[#1E3125] h-full flex flex-col shadow-2xl card-shadow select-none animate-in slide-in-from-right duration-200">
 
 {/* ── Top Header ── */}
 <div className="p-4 bg-[#EEF2EE]/90 dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between">
 <div className="flex items-center space-x-3 min-w-0">
 <div className="w-10 h-10 rounded-2xl bg-[#1B3026] text-white flex items-center justify-center shadow-xs shrink-0 relative">
 <Sparkles className="w-5 h-5 text-emerald-400" />
 <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0B120E]" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center space-x-2">
 <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 truncate">
 Personal AI Copilot · Valkyra
 </h3>
 <button
 onClick={() => setShowConfigModal(!showConfigModal)}
 className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition-all flex items-center space-x-1 cursor-pointer ${
 hasApiKey
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
 : 'bg-amber-600/90 hover:bg-amber-700 text-white shadow-2xs'
 }`}
 title="Configurar Chave / Modelo Gemini"
 >
 <BrainCircuit className="w-2.5 h-2.5" />
 <span>{hasApiKey ? 'Gemini 2.0 Thinking' : 'Modo Inteligente'}</span>
 </button>
 </div>
 <p className="text-[11px] text-[#5E7567] dark:text-slate-400 font-medium mt-0.5 truncate">
 Usuário: <strong className="text-[#111D15] dark:text-slate-200">{currentUser.name}</strong> ({currentUser.department || currentUser.role})
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-1 shrink-0">
 <button
 onClick={() => setShowConfigModal(!showConfigModal)}
 className={`p-2 rounded-xl transition-colors cursor-pointer ${
 showConfigModal
 ? 'bg-[#1B3026] text-white'
 : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24]'
 }`}
 title="Configurar IA Gemini"
 >
 <Settings2 className="w-4 h-4" />
 </button>
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

 {/* ── Quick Gemini Configuration Dropdown/Modal ── */}
 {showConfigModal && (
 <div className="p-4 bg-emerald-50/70 dark:bg-[#07130B] border-b border-emerald-200 dark:border-emerald-900/60 space-y-3 animate-in slide-in-from-top-2 duration-150 text-xs">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2 font-bold text-emerald-950 dark:text-emerald-300">
 <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <span>Configuração do Gemini & Modo Raciocínio (Thinking)</span>
 </div>
 <a
 href="https://aistudio.google.com/app/apikey"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
 >
 <span>Chave Grátis</span>
 <ExternalLink className="w-3 h-3" />
 </a>
 </div>

 <div className="space-y-2.5">
 <div>
 <label className="block text-[11px] font-bold text-[#111D15] dark:text-slate-200 mb-1 flex items-center space-x-1">
 <Key className="w-3 h-3 text-emerald-600" />
 <span>Google AI Studio API Key (Salva localmente no navegador):</span>
 </label>
 <input
 type="password"
 value={apiKeyInput}
 onChange={(e) => setApiKeyInput(e.target.value)}
 placeholder="Cole sua chave AIzaSy..."
 className="w-full px-3 py-1.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs font-mono text-[#111D15] dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 <div>
 <label className="block text-[11px] font-bold text-[#111D15] dark:text-slate-200 mb-1">
 Modelo de IA:
 </label>
 <select
 value={selectedModel}
 onChange={(e) => setSelectedModel(e.target.value)}
 className="w-full px-2.5 py-1.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs font-medium text-[#111D15] dark:text-slate-100"
 >
 {GEMINI_AVAILABLE_MODELS.map((m) => (
 <option key={m.id} value={m.id}>
 {m.name}
 </option>
 ))}
 </select>
 </div>

 <div className="flex items-center space-x-2 pt-4">
 <label className="flex items-center space-x-2 cursor-pointer">
 <input
 type="checkbox"
 checked={thinkingEnabled}
 onChange={(e) => setThinkingEnabled(e.target.checked)}
 className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
 />
 <span className="text-[11px] font-bold text-[#111D15] dark:text-slate-200">
 Exibir Pensamento / Raciocínio
 </span>
 </label>
 </div>
 </div>

 <div className="flex items-center space-x-2 pt-1">
 <button
 type="button"
 onClick={handleSaveConfig}
 className="flex-1 px-3 py-1.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
 >
 <Save className="w-3.5 h-3.5" />
 <span>{keySaved ? 'Configurações Salvas!' : 'Salvar Preferências'}</span>
 </button>

 <button
 type="button"
 onClick={handleTestConnection}
 disabled={testingKey}
 className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 rounded-xl font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
 >
 {testingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
 <span>Testar</span>
 </button>
 </div>

 {testResult && (
 <div
 className={`p-2 rounded-xl border text-[11px] flex items-start space-x-1.5 ${
 testResult.success
 ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200'
 : 'bg-rose-100/70 border-rose-300 text-rose-950 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200'
 }`}
 >
 {testResult.success ? (
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
 ) : (
 <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
 )}
 <span>{testResult.message}</span>
 </div>
 )}
 </div>
 </div>
 )}

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
 <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>{sug.label}</span>
 </button>
 );
 })}
 </div>

 {/* ── Messages Stream ── */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-sans">
 {chatHistory.map((msg) => {
 const isUser = msg.sender === 'user';
 const isThoughtOpen = expandedThoughts[msg.id] ?? false;

 return (
 <div
 key={msg.id}
 className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
 >
 {!isUser && (
 <div className="w-7 h-7 rounded-xl bg-[#1B3026] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
 <Bot className="w-4 h-4 text-emerald-400" />
 </div>
 )}

 <div className={`max-w-[88%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
 
 {/* Badges superiores (Tools & Motor) */}
 {!isUser && (
 <div className="flex flex-wrap items-center gap-1.5">
 {msg.toolsUsed && msg.toolsUsed.length > 0 && (
 <div className="flex items-center space-x-1 text-[10px] font-mono text-[#5E7567] dark:text-slate-400 bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-0.5 rounded-md border border-[#D5E0D7] dark:border-[#1E3125] w-fit">
 <ShieldCheck className="w-3 h-3 text-[#2C6E49]" />
 <span>Tools: {msg.toolsUsed.join(', ')}</span>
 </div>
 )}
 {msg.engineType && (
 <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
 {msg.engineType === 'gemini' ? ' Google Gemini' : msg.engineType === 'claude' ? 'Claude' : 'Modo Local'}
 </span>
 )}
 </div>
 )}

 {/* Accordion de Pensamento do Gemini (Chain-of-Thought) */}
 {!isUser && msg.thoughtProcess && (
 <div className="rounded-xl border border-emerald-500/25 bg-emerald-50/60 dark:bg-emerald-950/25 dark:border-emerald-800/40 overflow-hidden text-xs card-shadow transition-all">
 <button
 type="button"
 onClick={() => toggleThought(msg.id)}
 className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer select-none"
 >
 <div className="flex items-center space-x-1.5">
 <BrainCircuit className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>Processo de Raciocínio (Pensamento do Gemini)</span>
 </div>
 {isThoughtOpen ? (
 <ChevronUp className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
 ) : (
 <ChevronDown className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
 )}
 </button>

 {isThoughtOpen && (
 <div className="p-3 pt-2 border-t border-emerald-500/15 dark:border-emerald-800/30 bg-white/60 dark:bg-black/30 text-[11px] text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in duration-150">
 {msg.thoughtProcess}
 </div>
 )}
 </div>
 )}

 {/* Message Bubble Principal */}
 <div
 className={`p-3.5 rounded-2xl text-xs leading-relaxed card-shadow ${
 isUser
 ? 'bg-[#1B3026] text-white rounded-tr-xs'
 : 'bg-[#EEF2EE]/60 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] text-[#111D15] dark:text-slate-200 rounded-tl-xs'
 }`}
 >
 <MarkdownRenderer content={msg.text} isUser={isUser} />
 </div>

 {/* Executed Action Badge (Suporte a Tickets, Fechamentos e Tarefas) */}
 {msg.actionTaken && (
 <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl space-y-1 text-xs text-emerald-950 dark:text-emerald-200 card-shadow animate-in zoom-in-95 duration-150">
 <div className="flex items-center space-x-1.5 font-bold">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span className="font-mono text-[10px] uppercase tracking-wider">
 {msg.actionTaken.type === 'TASK_CREATED'
 ? 'AÇÃO EXECUTADA · Tarefa Criada no Hub'
 : msg.actionTaken.type === 'TICKET_CREATED'
 ? 'AÇÃO EXECUTADA · Chamado Aberto na Central'
 : msg.actionTaken.type === 'STATUS_SUBMITTED'
 ? 'AÇÃO EXECUTADA · Fechamento Diário Registrado'
 : 'AÇÃO EXECUTADA · Demanda Atualizada'}
 </span>
 </div>
 <p className="text-[11px] text-emerald-800 dark:text-emerald-300 pl-5">
 {msg.actionTaken.type === 'TASK_CREATED'
 ? `Demanda "${msg.actionTaken.data?.title}" registrada e delegada com sucesso.`
 : msg.actionTaken.type === 'TICKET_CREATED'
 ? `Chamado "${msg.actionTaken.data?.title}" aberto com prioridade ${msg.actionTaken.data?.priority}.`
 : msg.actionTaken.type === 'STATUS_SUBMITTED'
 ? `Status da área atualizado para ${msg.actionTaken.data?.status} no fechamento.`
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

 {/* Loading / Tool / Thinking State */}
 {loading && (
 <div className="flex items-start space-x-3 text-xs text-[#5E7567]">
 <div className="w-7 h-7 rounded-xl bg-[#1B3026] text-white flex items-center justify-center shrink-0 shadow-2xs">
 <Bot className="w-4 h-4 text-emerald-400" />
 </div>
 <div className="p-3.5 bg-emerald-50/70 dark:bg-[#07130B] border border-emerald-300/60 dark:border-emerald-900/60 rounded-2xl rounded-tl-xs space-y-2 card-shadow max-w-[85%] animate-in fade-in duration-150">
 <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
 <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
 <span>{activeTool || 'Valkyra processando comando...'}</span>
 </div>
 <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 font-mono">
 Interpretando intenção, acionando ferramentas operacionais e executando no Command Center...
 </p>
 </div>
 </div>
 )}

 <div ref={messagesEndRef} />
 </div>

 {/* ── Input Bar com Microfone de Comandos por Voz ── */}
 <div className="p-4 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border-t border-[#D5E0D7] dark:border-[#1E3125]">
 <form
 onSubmit={(e) => {
 e.preventDefault();
 handleSendMessage();
 }}
 className={`flex items-center space-x-2 bg-white dark:bg-[#121D16] border rounded-2xl p-2 card-shadow transition-all ${
 isListeningVoice
 ? 'border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
 : 'border-[#D5E0D7] dark:border-[#1E3125] focus-within:border-[#1B3026]'
 }`}
 >
 {/* Botão de Microfone / Comandos de Voz */}
 <button
 type="button"
 onClick={toggleVoiceRecording}
 disabled={loading}
 className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
 isListeningVoice
 ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-900/40'
 : 'bg-[#EEF2EE] dark:bg-[#1C2E24] hover:bg-[#D5E0D7] dark:hover:bg-[#2A4738] text-[#1B3026] dark:text-[#76B38B]'
 }`}
 title={isListeningVoice ? 'Parar escuta e enviar comando' : 'Falar comando por voz para Valkyra'}
 >
 {isListeningVoice ? <Radio className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
 </button>

 <input
 type="text"
 value={inputMessage}
 onChange={(e) => setInputMessage(e.target.value)}
 placeholder={
 isListeningVoice
 ? 'Ouvindo comando por voz... (ex: "Abrir chamado urgente para TI")'
 : 'Digite ou use o microfone (ex: "Valkyra, abrir chamado para TI")'
 }
 disabled={loading}
 className="flex-1 bg-transparent px-2 py-1.5 text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none font-medium"
 />

 <button
 type="submit"
 disabled={!inputMessage.trim() || loading}
 className={`p-2.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0 ${
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
