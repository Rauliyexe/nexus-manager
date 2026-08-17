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

  // Modals
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
      if (isMounted) {
        setDecryptedMessagesMap(newMap);
      }
    };

    processDecryption();
    return () => {
      isMounted = false;
    };
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
    <div className="h-[calc(100vh-5.5rem)] flex bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-xs font-sans">
      {/* Conversations List Sidebar */}
      <div className="w-64 border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0 select-none">
        <div className="p-3 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              CONVERSAS INTERNAS
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowPrivateModal(true)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Nova Conversa Privada"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Criar Grupo"
              >
                <Users className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filtrar conversas..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-sans"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {filteredConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full text-left p-2.5 flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 border-l-2 border-slate-300 font-semibold'
                    : 'hover:bg-slate-900/60 text-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    {conv.type === 'AREA' && <Building2 className="w-3 h-3 text-slate-400 shrink-0" />}
                    {conv.type === 'GROUP' && <Users className="w-3 h-3 text-slate-400 shrink-0" />}
                    {conv.type === 'PRIVATE' && <MessageSquare className="w-3 h-3 text-slate-400 shrink-0" />}
                    <p className="text-xs font-medium truncate text-slate-200">{conv.title}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                    {conv.lastMessage?.content
                      ? conv.lastMessage.content.slice(0, 30) + '...'
                      : 'Sem mensagens'}
                  </p>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase shrink-0">
                  {conv.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream Pane (Linear / Slack Style Stream) */}
      {currentConv ? (
        <div className="flex-1 flex flex-col bg-slate-900">
          {/* Header Bar */}
          <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div>
              <h3 className="text-xs font-bold text-slate-100 font-sans">{currentConv.title}</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Canal Operacional • {currentConv.type}
              </p>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>WebCrypto Encrypted</span>
            </div>
          </div>

          {/* Messages Stream (Clean B2B Rows) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {currentMessages.map((msg) => {
              let displayContent = decryptedMessagesMap[msg.id];
              if (!displayContent) {
                if (msg.content.startsWith('[NEXUS_CIPHER:')) {
                  displayContent = '🔒 Descriptografando mensagem segura...';
                } else {
                  displayContent = msg.content;
                }
              }
              const isSystem = msg.message_type === 'SYSTEM';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="my-3 mx-auto max-w-lg p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed text-center"
                  >
                    {displayContent}
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start space-x-2.5 p-2 rounded hover:bg-slate-800/30 transition-colors border-b border-slate-800/40">
                  <UserAvatar name={msg.sender?.name || 'N'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{msg.sender?.name || 'Usuário'}</span>
                      <span className="text-[10px] font-mono text-slate-500">({msg.sender?.department || msg.sender?.role})</span>
                      <span className="text-[9px] font-mono text-slate-500 ml-auto">
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{displayContent}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Footer */}
          <form
            onSubmit={handleSend}
            className="p-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 font-sans"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-3 py-1.5 rounded text-xs border border-slate-700 flex items-center space-x-1"
            >
              <span>Enviar</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
          Selecione uma conversa.
        </div>
      )}

      {/* Modals */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded w-full max-w-md p-4 space-y-3 shadow-xl text-xs">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
              Criar Novo Grupo Interno
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Grupo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Diretoria + Financeiro"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Participantes</label>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                  {profiles
                    .filter((p) => p.id !== currentUser.id)
                    .map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center space-x-2 text-slate-300 hover:bg-slate-900 p-1 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={p.id}
                          checked={selectedGroupMembers.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroupMembers([...selectedGroupMembers, p.id]);
                            } else {
                              setSelectedGroupMembers(
                                selectedGroupMembers.filter((id) => id !== p.id)
                              );
                            }
                          }}
                          className="accent-slate-400"
                        />
                        <span>
                          {p.name} ({p.department || p.role})
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded border border-slate-700"
                >
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrivateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded w-full max-w-md p-4 space-y-3 shadow-xl text-xs">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
              Nova Conversa Privada
            </h3>
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-800 bg-slate-950 rounded border border-slate-800">
              {profiles
                .filter((p) => p.id !== currentUser.id)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleStartPrivateChat(p.id)}
                    className="w-full text-left p-2 hover:bg-slate-900 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.department || p.role}</p>
                    </div>
                    <span className="text-slate-300 font-mono font-medium">Conversar →</span>
                  </button>
                ))}
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowPrivateModal(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
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
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs font-mono">Carregando Chat Nexus...</div>}>
      <ChatContent />
    </Suspense>
  );
}
