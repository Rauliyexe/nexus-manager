'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Users,
  Building2,
  Plus,
  Send,
  Search,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { decryptMessage } from '@/lib/crypto/decryptMessage';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Message } from '@/lib/types/nexus';

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
  } = useNexus();

  const [chatSearch, setChatSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const [decryptedMessagesMap, setDecryptedMessagesMap] = useState<Record<string, string>>({});

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlConvId && conversations.some((c) => c.id === urlConvId)) {
      setActiveConversationId(urlConvId);
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [urlConvId, conversations, activeConversationId, setActiveConversationId]);

  const currentConv = conversations.find((c) => c.id === activeConversationId);
  const EMPTY_MESSAGES: Message[] = [];
  const currentMessages = (activeConversationId && messages[activeConversationId]) ? messages[activeConversationId] : EMPTY_MESSAGES;
  const messagesKey = currentMessages.map((m) => m.id + m.content).join('|');

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesKey]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;
    const textToSend = inputText.trim();
    setInputText('');
    await sendMessage(activeConversationId, textToSend, 'TEXT');
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(chatSearch.toLowerCase())
  );

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
    <div className="h-[calc(100vh-5.5rem)] flex bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl overflow-hidden card-shadow font-sans">
      {/* ── Sidebar de conversas ── */}
      <div className="w-64 border-r border-[#E2E8E3] dark:border-[#1E3125] flex flex-col bg-[#F5F7F5] dark:bg-[#0B120E] shrink-0 select-none">
        {/* Header */}
        <div className="p-3 border-b border-[#E2E8E3] dark:border-[#1E3125] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
              Conversas Internas
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowPrivateModal(true)}
                className="p-1 rounded-lg text-[#8FA595] hover:text-[#4D7C5D] hover:bg-[#EBF2EE] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
                title="Nova Conversa Privada"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                className="p-1 rounded-lg text-[#8FA595] hover:text-[#4D7C5D] hover:bg-[#EBF2EE] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
                title="Criar Grupo"
              >
                <Users className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-[#8FA595] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar conversas..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl pl-7 pr-2 py-1.5 text-xs text-[#1A281E] dark:text-slate-200 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] transition-colors"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors border-b border-[#E2E8E3] dark:border-[#1E3125]/60 cursor-pointer ${
                  isActive
                    ? 'bg-[#EBF2EE] dark:bg-[#1C2E24] border-l-2 border-l-[#4D7C5D]'
                    : 'hover:bg-white dark:hover:bg-[#121D16]'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    {conv.type === 'AREA' && <Building2 className={`w-3 h-3 shrink-0 ${isActive ? 'text-[#4D7C5D]' : 'text-[#8FA595]'}`} />}
                    {conv.type === 'GROUP' && <Users className={`w-3 h-3 shrink-0 ${isActive ? 'text-[#4D7C5D]' : 'text-[#8FA595]'}`} />}
                    {conv.type === 'PRIVATE' && <MessageSquare className={`w-3 h-3 shrink-0 ${isActive ? 'text-[#4D7C5D]' : 'text-[#8FA595]'}`} />}
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-[#1A281E] dark:text-white' : 'text-[#1A281E] dark:text-slate-200'}`}>
                      {conv.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#8FA595] dark:text-slate-500 truncate mt-0.5 font-normal">
                    {conv.lastMessage?.content
                      ? conv.lastMessage.content.slice(0, 28) + '...'
                      : 'Sem mensagens'}
                  </p>
                </div>
                <span className={`text-[9px] font-semibold uppercase shrink-0 px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-[#D4E8DB] dark:bg-[#1E3125] text-[#2C523D] dark:text-[#76B38B]'
                    : 'text-[#8FA595] dark:text-slate-500'
                }`}>
                  {conv.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Chat Pane ── */}
      {currentConv ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#121D16]">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between bg-[#F5F7F5] dark:bg-[#0B120E]">
            <div>
              <h3 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">{currentConv.title}</h3>
              <p className="text-[10px] text-[#5C6E62] dark:text-slate-400 font-mono mt-0.5">
                Canal Operacional • {currentConv.type}
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] text-[#8FA595] dark:text-slate-400 font-mono">
              <Lock className="w-3 h-3 text-[#4D7C5D]" />
              <span>WebCrypto Encrypted</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 font-sans text-xs">
            {currentMessages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center pt-16 space-y-2">
                <MessageSquare className="w-8 h-8 text-[#D4E8DB] dark:text-[#1E3125]" />
                <p className="text-[#8FA595] text-xs font-medium">Sem mensagens ainda</p>
              </div>
            )}
            {currentMessages.map((msg) => {
              let displayContent = decryptedMessagesMap[msg.id];
              if (!displayContent) {
                displayContent = msg.content.startsWith('[NEXUS_CIPHER:')
                  ? '🔒 Descriptografando...'
                  : msg.content;
              }
              const isSystem = msg.message_type === 'SYSTEM';
              const isMine = msg.sender?.id === currentUser.id;

              if (isSystem) {
                return (
                  <div key={msg.id} className="my-3 mx-auto max-w-lg p-2.5 bg-[#F0F4F1] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[11px] text-[#5C6E62] dark:text-slate-400 text-center">
                    {displayContent}
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start space-x-2.5 p-2 rounded-xl hover:bg-[#F5F7F5] dark:hover:bg-[#17261D] transition-colors group">
                  <UserAvatar name={msg.sender?.name || 'N'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-xs ${isMine ? 'text-[#2C523D] dark:text-[#76B38B]' : 'text-[#1A281E] dark:text-slate-200'}`}>
                        {msg.sender?.name || 'Usuário'}
                      </span>
                      <span className="text-[10px] text-[#8FA595] dark:text-slate-500 font-mono">
                        {msg.sender?.department || msg.sender?.role}
                      </span>
                      <span className="text-[9px] text-[#8FA595] dark:text-slate-500 font-mono ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#1A281E] dark:text-slate-300 mt-0.5 leading-relaxed">{displayContent}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-[#E2E8E3] dark:border-[#1E3125] bg-[#F5F7F5] dark:bg-[#0B120E] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl px-3 py-2 text-xs text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Enviar</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#8FA595] text-xs font-medium">
          Selecione uma conversa.
        </div>
      )}

      {/* ── Modal: Criar Grupo ── */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl text-xs card-shadow">
            <h3 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">Criar Novo Grupo</h3>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C6E62] dark:text-slate-400 mb-1">Nome do Grupo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Diretoria + Financeiro"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl p-2.5 text-[#1A281E] dark:text-slate-200 focus:outline-none focus:border-[#4D7C5D] text-xs transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C6E62] dark:text-slate-400 mb-1">Participantes</label>
                <div className="max-h-36 overflow-y-auto space-y-0.5 bg-[#F5F7F5] dark:bg-[#0B120E] p-2 rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
                  {profiles
                    .filter((p) => p.id !== currentUser.id)
                    .map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2 text-[#1A281E] dark:text-slate-300 hover:bg-[#EBF2EE] dark:hover:bg-[#17261D] p-1.5 rounded-lg cursor-pointer transition-colors"
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
                          className="accent-[#4D7C5D]"
                        />
                        <span className="text-xs">{p.name} <span className="text-[#8FA595] font-normal">({p.department || p.role})</span></span>
                      </label>
                    ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-3 py-1.5 text-[#5C6E62] dark:text-slate-400 hover:text-[#1A281E] dark:hover:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Conversa Privada ── */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl w-full max-w-md p-5 space-y-3 shadow-xl card-shadow">
            <h3 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">Nova Conversa Privada</h3>
            <div className="max-h-52 overflow-y-auto divide-y divide-[#E2E8E3] dark:divide-[#1E3125] bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
              {profiles
                .filter((p) => p.id !== currentUser.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleStartPrivateChat(p.id)}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#EBF2EE] dark:hover:bg-[#17261D] flex items-center justify-between text-[#1A281E] dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold">{p.name}</p>
                      <p className="text-[10px] text-[#8FA595] dark:text-slate-400 font-mono">{p.department || p.role}</p>
                    </div>
                    <span className="text-[#4D7C5D] dark:text-[#76B38B] font-semibold text-xs">Conversar →</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPrivateModal(false)}
                className="px-3 py-1.5 text-xs text-[#5C6E62] dark:text-slate-400 hover:text-[#1A281E] dark:hover:text-slate-200 font-medium cursor-pointer"
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
    <Suspense fallback={<div className="p-8 text-center text-[#8FA595] text-xs font-medium">Carregando Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
