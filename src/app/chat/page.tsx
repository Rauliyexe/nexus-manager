'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Users,
  Building2,
  Search,
  Lock,
  Pin,
  Sparkles,
  Info,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { decryptMessage } from '@/lib/crypto/decryptMessage';
import { Message, MessageAttachment } from '@/lib/types/nexus';
import { UserAvatar } from '@/components/ui/UserAvatar';

// Specialized Chat Components
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessageItem } from '@/components/chat/ChatMessageItem';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { ChatThreadDrawer } from '@/components/chat/ChatThreadDrawer';
import { ChatContextDrawer } from '@/components/chat/ChatContextDrawer';
import { ChatAIAssistantModal } from '@/components/chat/ChatAIAssistantModal';
import { PinnedMessagesModal } from '@/components/chat/PinnedMessagesModal';
import { DelegateTaskModal } from '@/components/modals/DelegateTaskModal';
import {
  getStoredGeminiKey,
  getStoredGeminiModel,
  getStoredGeminiThinkingEnabled,
} from '@/lib/services/geminiClient';

function ChatContent() {
  const searchParams = useSearchParams();
  const urlConvId = searchParams.get('convId');

  const {
    conversations,
    messages,
    sendMessage,
    currentUser,
    profiles,
    createGroupConversation,
    createPrivateConversation,
    activeConversationId,
    setActiveConversationId,
    areas,
    tasks,
    notifications,
    delegateTask,
    updateTaskStatus,
    playSound,
  } = useNexus();

  // Drawers & Modals State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isPinnedModalOpen, setIsPinnedModalOpen] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Task Delegation Pre-fill Modal State
  const [isDelegateTaskOpen, setIsDelegateTaskOpen] = useState(false);
  const [taskDefaultAreaId, setTaskDefaultAreaId] = useState<string | undefined>(undefined);

  // Search in conversation
  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');

  // Group creation form state
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);

  // Decrypted messages state
  const [decryptedMessagesMap, setDecryptedMessagesMap] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active conversation with URL or default
  useEffect(() => {
    if (urlConvId && conversations.some((c) => c.id === urlConvId)) {
      setActiveConversationId(urlConvId);
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [urlConvId, conversations, activeConversationId, setActiveConversationId]);

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = (activeConversationId && messages[activeConversationId]) ? messages[activeConversationId] : [];
  const messagesKey = currentMessages.map((m) => m.id + m.content + (m.pinned ? 'p' : '') + (m.threadCount || 0) + (m.reactions?.map(r=>r.count).join('') || '')).join('|');

  // Decryption effect
  useEffect(() => {
    let isMounted = true;
    const processDecryption = async () => {
      const newMap: Record<string, string> = {};
      for (const msg of currentMessages) {
        if (msg.content.startsWith('[NEXUS_CIPHER:')) {
          newMap[msg.id] = await decryptMessage(msg.content, '', msg.conversation_id);
        } else {
          newMap[msg.id] = msg.content;
        }
      }
      if (isMounted) setDecryptedMessagesMap(newMap);
    };
    processDecryption();
    return () => { isMounted = false; };
  }, [messagesKey]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesKey]);

  // Send message handler
  const handleSendMessage = async (text: string, attachments?: MessageAttachment[]) => {
    if (!activeConversationId) return;
    const targetConvId = activeConversationId;
    await sendMessage(targetConvId, text, 'TEXT', attachments);

    const isAIChat = targetConvId === 'conv-ai-copilot';
    const isAIMention =
      text.toLowerCase().includes('@nexus') ||
      text.toLowerCase().includes('@ia') ||
      text.toLowerCase().startsWith('/ia') ||
      text.toLowerCase().startsWith('/gemini');

    if (isAIChat || isAIMention) {
      setIsAiTyping(true);
      try {
        const geminiKey = getStoredGeminiKey();
        const geminiModel = getStoredGeminiModel();
        const aiProfile = profiles.find((p) => p.id === 'usr-valkyra-ai') || {
          id: 'usr-valkyra-ai',
          name: 'Valkyra AI Copilot',
          email: 'ai@yggdron.com.br',
          role: 'GERENTE' as const,
          department: 'Valkyra Intelligence',
          active: true,
        };

        const cleanedPrompt = text.replace(/@nexus|@ia|\/ia|\/gemini/gi, '').trim() || text;

        const res = await fetch('/api/ai/agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
            ...(geminiModel ? { 'x-gemini-model': geminiModel } : {}),
            'x-gemini-thinking': String(getStoredGeminiThinkingEnabled()),
          },
          body: JSON.stringify({
            message: cleanedPrompt,
            history: (messages[targetConvId] || []).slice(-6).map((m) => ({
              sender: m.sender_id === 'usr-valkyra-ai' ? 'agent' : 'user',
              text: decryptedMessagesMap[m.id] || m.content,
            })),
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
          const aiData = await res.json();
          if (aiData.actionTaken) {
            if (aiData.actionTaken.type === 'TASK_CREATED') {
              delegateTask(aiData.actionTaken.data);
            } else if (aiData.actionTaken.type === 'TASK_UPDATED') {
              updateTaskStatus(aiData.actionTaken.data.taskId, aiData.actionTaken.data.status);
            }
          }
          await sendMessage(targetConvId, aiData.text || 'Comando processado com sucesso!', 'TEXT', undefined, aiProfile);
          playSound('AI_READY');
        }
      } catch (aiErr) {
        console.warn('Erro ao processar mensagem com o Valkyra AI:', aiErr);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  // Handle Slash Command Trigger
  const handleSlashCommand = (cmd: string) => {
    if (cmd === '/tarefa') {
      if (currentConv?.area_id) {
        setTaskDefaultAreaId(currentConv.area_id);
      }
      setIsDelegateTaskOpen(true);
    } else if (cmd === '/ia') {
      setIsAIAssistantOpen(true);
    } else if (cmd === '/chamado') {
      alert('Abrindo modal de chamado...');
    }
  };

  // Handle Create Task from a Specific Message
  const handleCreateTaskFromMessage = (msg: Message, content: string) => {
    if (currentConv?.area_id) {
      setTaskDefaultAreaId(currentConv.area_id);
    }
    setIsDelegateTaskOpen(true);
  };

  // Handle Create Task from AI recommendation
  const handleCreateTaskFromAI = (title: string, description: string) => {
    if (currentConv?.area_id) {
      setTaskDefaultAreaId(currentConv.area_id);
    }
    setIsDelegateTaskOpen(true);
  };

  // Filter messages if search inside chat is active
  const displayedMessages = inChatSearchQuery.trim()
    ? currentMessages.filter((m) => {
        const text = decryptedMessagesMap[m.id] || m.content;
        return text.toLowerCase().includes(inChatSearchQuery.toLowerCase());
      })
    : currentMessages;

  const pinnedMessages = currentMessages.filter((m) => m.pinned);

  // Modal Handlers
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || selectedGroupMembers.length === 0) return;
    const newId = createGroupConversation(groupTitle.trim(), selectedGroupMembers);
    setActiveConversationId(newId);
    setGroupTitle('');
    setSelectedGroupMembers([]);
    setShowGroupModal(false);
  };

  const handleStartPrivateChat = (targetUserId: string) => {
    const newId = createPrivateConversation(targetUserId);
    setActiveConversationId(newId);
    setShowPrivateModal(false);
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl overflow-hidden card-shadow font-sans relative">
      {/* ── 1. Sidebar Desktop (Esquerda fixa) ── */}
      <div className="hidden md:flex md:w-80 shrink-0 h-full">
        <ChatSidebar
          onOpenPrivateModal={() => setShowPrivateModal(true)}
          onOpenGroupModal={() => setShowGroupModal(true)}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />
      </div>

      {/* ── 1b. Mobile Drawer de Conversas (Abre e fecha em celulares) ── */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Slide-in Panel */}
          <div className="relative z-10 w-[85%] max-w-xs h-full bg-white dark:bg-[#0B120E] shadow-2xl border-r border-[#D5E0D7] dark:border-[#1E3125] flex flex-col animate-in slide-in-from-left duration-200">
            <ChatSidebar
              onOpenPrivateModal={() => {
                setIsMobileSidebarOpen(false);
                setShowPrivateModal(true);
              }}
              onOpenGroupModal={() => {
                setIsMobileSidebarOpen(false);
                setShowGroupModal(true);
              }}
              onOpenAIAssistant={() => {
                setIsMobileSidebarOpen(false);
                setIsAIAssistantOpen(true);
              }}
              onSelectConversation={() => setIsMobileSidebarOpen(false)}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* ── 2. Área Central de Mensagens ── */}
      {currentConv ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#121D16] min-w-0 h-full">
          {/* Header da Conversa */}
          <div className="px-3.5 sm:px-5 py-3 border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between bg-white/70 dark:bg-[#0B120E]/80 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              {/* Mobile Toggle Button for Sidebar */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 -ml-1 rounded-xl text-[#111D15] dark:text-slate-100 hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer shrink-0 flex items-center justify-center border border-[#D5E0D7] dark:border-[#1E3125]"
                title="Abrir Lista de Conversas"
                aria-label="Abrir Lista de Conversas"
              >
                <ArrowLeft className="w-4 h-4 text-[#1B3026] dark:text-[#76B38B]" />
              </button>

              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#1B3026] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {currentConv.type === 'AREA' ? (
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : currentConv.type === 'GROUP' ? (
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <UserAvatar name={currentConv.title || 'U'} size="md" />
                  )}
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2C6E49] border-2 border-white dark:border-[#121D16] absolute -bottom-0.5 -right-0.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <h3 className="text-xs sm:text-sm font-bold text-[#111D15] dark:text-slate-100 truncate">
                    {currentConv.title}
                  </h3>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] text-[9px] font-mono font-bold uppercase shrink-0">
                    {currentConv.type}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#5E7567] dark:text-slate-400 mt-0.5 truncate">
                  {currentConv.type === 'AREA'
                    ? 'Canal vinculado ao nó operacional'
                    : currentConv.type === 'GROUP'
                    ? 'Comitê executivo'
                    : 'Canal seguro privado'}
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Internal Search Toggle */}
              <button
                onClick={() => setInChatSearchOpen(!inChatSearchOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  inChatSearchOpen
                    ? 'bg-[#1B3026] text-white'
                    : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
                }`}
                title="Buscar nesta conversa"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Pinned Messages Button */}
              <button
                onClick={() => setIsPinnedModalOpen(true)}
                className="p-2 rounded-xl text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer relative"
                title="Ver Mensagens Fixadas"
              >
                <Pin className="w-4 h-4 rotate-45" />
                {pinnedMessages.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#1B3026] dark:bg-[#76B38B]" />
                )}
              </button>

              {/* AI Assistant Button */}
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="p-2 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] hover:bg-[#D5E0D7] dark:hover:bg-[#2A4A3C] transition-colors cursor-pointer flex items-center space-x-1 font-bold text-xs shadow-2xs"
                title="Abrir Assistente IA"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">IA</span>
              </button>

              {/* Context Drawer Toggle */}
              <button
                onClick={() => setIsContextDrawerOpen(!isContextDrawerOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isContextDrawerOpen
                    ? 'bg-[#1B3026] text-white'
                    : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
                }`}
                title="Ver Contexto Empresarial"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* In-Chat Search Bar (Conditional) */}
          {inChatSearchOpen && (
            <div className="p-2.5 bg-[#EEF2EE] dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center space-x-2 animate-in slide-in-from-top-2 duration-150">
              <Search className="w-3.5 h-3.5 text-[#5E7567]" />
              <input
                type="text"
                placeholder="Filtrar mensagens nesta conversa..."
                value={inChatSearchQuery}
                onChange={(e) => setInChatSearchQuery(e.target.value)}
                className="flex-1 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-1.5 text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026]"
              />
              <button
                onClick={() => {
                  setInChatSearchQuery('');
                  setInChatSearchOpen(false);
                }}
                className="text-xs font-bold text-[#5E7567] hover:text-[#111D15] px-2 py-1 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Messages Flow Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1 font-sans text-xs">
            {displayedMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center pt-24 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-[#111D15] dark:text-slate-200">
                  {inChatSearchQuery ? 'Nenhuma mensagem encontrada para a busca.' : 'Início da conversa operacional.'}
                </p>
                <p className="text-[11px] text-[#5E7567] dark:text-slate-400 max-w-sm text-center">
                  Envie mensagens, compartilhe relatórios ou use '/' para transformar decisões em tarefas oficiais.
                </p>
              </div>
            ) : (
              displayedMessages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  displayContent={decryptedMessagesMap[msg.id] || msg.content}
                  isMine={msg.sender?.id === currentUser.id}
                  onOpenThread={(m) => setActiveThreadMessage(m)}
                  onCreateTaskFromMessage={handleCreateTaskFromMessage}
                />
              ))
            )}
            {isAiTyping && (
              <div className="flex items-center space-x-2.5 p-3 bg-[#EEF2EE]/60 dark:bg-[#0B120E] rounded-2xl border border-[#D5E0D7] dark:border-[#1E3125] max-w-xs animate-pulse my-2">
                <div className="w-6 h-6 rounded-lg bg-[#1B3026] text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                </div>
                <span className="text-xs text-[#5E7567] dark:text-slate-300 font-medium">
                  Valkyra AI Copilot digitando...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <ChatComposer
            onSendMessage={handleSendMessage}
            onTriggerSlashCommand={handleSlashCommand}
          />
        </div>
      ) : (
        <>
          {/* Mobile view when no conversation is active: show ChatSidebar full screen */}
          <div className="flex-1 md:hidden h-full">
            <ChatSidebar
              onOpenPrivateModal={() => setShowPrivateModal(true)}
              onOpenGroupModal={() => setShowGroupModal(true)}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            />
          </div>

          {/* Desktop empty placeholder */}
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-[#5E7567] text-xs font-medium space-y-2">
            <MessageSquare className="w-10 h-10 text-[#D5E0D7] dark:text-[#1E3125]" />
            <p>Selecione uma conversa para iniciar.</p>
          </div>
        </>
      )}

      {/* ── 3. Painel de Threads Lateral (Drawer) ── */}
      {activeThreadMessage && (
        <ChatThreadDrawer
          parentMessage={activeThreadMessage}
          onClose={() => setActiveThreadMessage(null)}
        />
      )}

      {/* ── 4. Painel de Contexto Empresarial (Drawer) ── */}
      {isContextDrawerOpen && currentConv && (
        <ChatContextDrawer
          conversation={currentConv}
          messages={currentMessages}
          onClose={() => setIsContextDrawerOpen(false)}
          onOpenDelegateTask={() => {
            if (currentConv.area_id) setTaskDefaultAreaId(currentConv.area_id);
            setIsDelegateTaskOpen(true);
          }}
        />
      )}

      {/* ── 5. Modal de Assistente IA ── */}
      {isAIAssistantOpen && currentConv && (
        <ChatAIAssistantModal
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          conversation={currentConv}
          messages={currentMessages}
          onCreateTaskFromAI={handleCreateTaskFromAI}
        />
      )}

      {/* ── 6. Modal de Mensagens Fixadas ── */}
      {isPinnedModalOpen && currentConv && (
        <PinnedMessagesModal
          isOpen={isPinnedModalOpen}
          onClose={() => setIsPinnedModalOpen(false)}
          pinnedMessages={pinnedMessages}
          conversationTitle={currentConv.title || 'Canal'}
        />
      )}

      {/* ── 7. Modal de Delegação de Tarefa (Integrado nativamente) ── */}
      <DelegateTaskModal
        isOpen={isDelegateTaskOpen}
        onClose={() => setIsDelegateTaskOpen(false)}
        defaultAreaId={taskDefaultAreaId}
      />

      {/* ── 8. Modal: Criar Grupo ── */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl card-shadow">
            <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100">Criar Novo Comitê / Grupo</h3>
            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111D15] dark:text-slate-300 mb-1">Nome do Grupo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Diretoria + Comercial + Auditoria"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-200 focus:outline-none focus:border-[#1B3026] text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#111D15] dark:text-slate-300 mb-1">Participantes</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-[#EEF2EE] dark:bg-[#0B120E] p-2.5 rounded-2xl border border-[#D5E0D7] dark:border-[#1E3125]">
                  {profiles
                    .filter((p) => p.id !== currentUser.id)
                    .map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2.5 text-[#111D15] dark:text-slate-300 hover:bg-white dark:hover:bg-[#17261D] p-2 rounded-xl cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={p.id}
                          checked={selectedGroupMembers.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroupMembers([...selectedGroupMembers, p.id]);
                            } else {
                              setSelectedGroupMembers(selectedGroupMembers.filter((id) => id !== p.id));
                            }
                          }}
                          className="accent-[#1B3026] rounded"
                        />
                        <span className="text-xs font-semibold">{p.name} <span className="text-[#5E7567] font-normal">({p.department || p.role})</span></span>
                      </label>
                    ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 text-[#5E7567] hover:text-[#111D15] dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 9. Modal: Nova Conversa Privada ── */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl card-shadow">
            <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100">Iniciar Nova Conversa Direta</h3>
            <div className="max-h-60 overflow-y-auto divide-y divide-[#D5E0D7] dark:divide-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] rounded-2xl border border-[#D5E0D7] dark:border-[#1E3125]">
              {profiles
                .filter((p) => p.id !== currentUser.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleStartPrivateChat(p.id)}
                    className="w-full text-left p-3 hover:bg-white dark:hover:bg-[#17261D] flex items-center justify-between text-[#111D15] dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserAvatar name={p.name} size="sm" />
                      <div>
                        <p className="text-xs font-bold">{p.name}</p>
                        <p className="text-[10px] text-[#5E7567] dark:text-slate-400 font-mono">{p.department || p.role}</p>
                      </div>
                    </div>
                    <span className="text-[#1B3026] dark:text-[#76B38B] font-bold text-xs">Conversar →</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowPrivateModal(false)}
                className="px-4 py-2 text-xs text-[#5E7567] hover:text-[#111D15] dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#5E7567] text-xs font-medium">Carregando Hub de Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
