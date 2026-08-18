'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Building2,
  Plus,
  Search,
  Pin,
  Sparkles,
  ChevronDown,
  Hash,
  User,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { Conversation } from '@/lib/types/nexus';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface ChatSidebarProps {
  onOpenPrivateModal: () => void;
  onOpenGroupModal: () => void;
  onOpenAIAssistant: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onOpenPrivateModal,
  onOpenGroupModal,
  onOpenAIAssistant,
}) => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    profiles,
    currentUser,
  } = useNexus();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'PINNED' | 'AREAS' | 'DIRECT'>('ALL');

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      (conv.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.type || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'UNREAD') {
      // Mock unread if conversation has messages
      const convMessages = messages[conv.id] || [];
      return convMessages.length > 1;
    }
    if (filterTab === 'PINNED') {
      return conv.type === 'GROUP' || conv.id === 'conv-area-4';
    }
    if (filterTab === 'AREAS') {
      return conv.type === 'AREA';
    }
    if (filterTab === 'DIRECT') {
      return conv.type === 'PRIVATE';
    }
    return true;
  });

  const areaConversations = filteredConversations.filter((c) => c.type === 'AREA');
  const groupConversations = filteredConversations.filter((c) => c.type === 'GROUP');
  const privateConversations = filteredConversations.filter((c) => c.type === 'PRIVATE');

  return (
    <div className="w-80 border-r border-[#D5E0D7] dark:border-[#1E3125] flex flex-col bg-[#EEF2EE]/60 dark:bg-[#0B120E] shrink-0 select-none h-full">
      {/* Top Header & Search */}
      <div className="p-3.5 border-b border-[#D5E0D7] dark:border-[#1E3125] space-y-3 bg-white/50 dark:bg-[#121D16]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#1B3026] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
                Hub de Conversas
              </h2>
              <p className="text-[10px] text-[#5E7567] dark:text-slate-400 font-medium">
                Workspace Integrado
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenAIAssistant}
              className="p-1.5 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] hover:bg-[#D5E0D7] dark:hover:bg-[#2A4A3C] transition-colors cursor-pointer"
              title="Assistente IA • Resumos & Decisões"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenPrivateModal}
              className="p-1.5 rounded-lg bg-[#1B3026] hover:bg-[#2A4A3C] text-white transition-colors cursor-pointer shadow-xs"
              title="Nova Conversa Direta"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#5E7567] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar canais, pessoas, tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] transition-colors font-medium shadow-2xs"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-semibold">
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'UNREAD', label: 'Não Lidas' },
            { id: 'AREAS', label: 'Projetos' },
            { id: 'DIRECT', label: 'Diretas' },
            { id: 'PINNED', label: 'Fixadas' },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1B3026] text-white font-bold shadow-xs'
                    : 'text-[#3B4F43] dark:text-slate-400 hover:text-[#111D15] hover:bg-[#D5E0D7]/60 dark:hover:bg-[#1C2E24]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 divide-y divide-[#D5E0D7]/40 dark:divide-[#1E3125]/40">
        {/* Category: Áreas / Projetos */}
        {areaConversations.length > 0 && (
          <div className="space-y-1 pt-1 first:pt-0">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5E7567] dark:text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Building2 className="w-3 h-3 text-[#1B3026] dark:text-[#76B38B]" />
                <span>Canais por Projeto ({areaConversations.length})</span>
              </span>
            </div>

            {areaConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const convMessages = messages[conv.id] || [];
              const lastMsg = convMessages[convMessages.length - 1];

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start space-x-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] card-shadow font-semibold'
                      : 'hover:bg-white/60 dark:hover:bg-[#121D16]/60 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-[#1B3026] text-white'
                        : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125]'
                    }`}>
                      <Hash className="w-4 h-4" />
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C6E49] border-2 border-white dark:border-[#121D16] absolute -bottom-0.5 -right-0.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${isActive ? 'font-bold text-[#111D15] dark:text-slate-100' : 'font-medium text-[#111D15] dark:text-slate-200'}`}>
                        {conv.title}
                      </p>
                      {lastMsg && (
                        <span className="text-[9px] font-mono text-[#5E7567] dark:text-slate-400 shrink-0 ml-1">
                          {new Date(lastMsg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5E7567] dark:text-slate-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.content.slice(0, 36) + (lastMsg.content.length > 36 ? '...' : '') : 'Canal operacional ativo'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Category: Grupos Executivos */}
        {groupConversations.length > 0 && (
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5E7567] dark:text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Users className="w-3 h-3 text-[#1B3026] dark:text-[#76B38B]" />
                <span>Grupos Executivos ({groupConversations.length})</span>
              </span>
              <button
                onClick={onOpenGroupModal}
                className="hover:text-[#111D15] dark:hover:text-white cursor-pointer"
                title="Criar Grupo"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {groupConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const convMessages = messages[conv.id] || [];
              const lastMsg = convMessages[convMessages.length - 1];

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start space-x-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] card-shadow font-semibold'
                      : 'hover:bg-white/60 dark:hover:bg-[#121D16]/60 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-center text-xs font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${isActive ? 'font-bold text-[#111D15] dark:text-slate-100' : 'font-medium text-[#111D15] dark:text-slate-200'}`}>
                        {conv.title}
                      </p>
                      {lastMsg && (
                        <span className="text-[9px] font-mono text-[#5E7567] dark:text-slate-400 shrink-0 ml-1">
                          {new Date(lastMsg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5E7567] dark:text-slate-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.content.slice(0, 36) + (lastMsg.content.length > 36 ? '...' : '') : 'Comitê criado'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Category: Mensagens Diretas */}
        {privateConversations.length > 0 && (
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5E7567] dark:text-slate-400">
              <span className="flex items-center space-x-1.5">
                <User className="w-3 h-3 text-[#1B3026] dark:text-[#76B38B]" />
                <span>Mensagens Diretas ({privateConversations.length})</span>
              </span>
              <button
                onClick={onOpenPrivateModal}
                className="hover:text-[#111D15] dark:hover:text-white cursor-pointer"
                title="Nova Conversa"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {privateConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const convMessages = messages[conv.id] || [];
              const lastMsg = convMessages[convMessages.length - 1];

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start space-x-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] card-shadow font-semibold'
                      : 'hover:bg-white/60 dark:hover:bg-[#121D16]/60 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <UserAvatar name={conv.title || 'U'} size="sm" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C6E49] border-2 border-white dark:border-[#121D16] absolute -bottom-0.5 -right-0.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${isActive ? 'font-bold text-[#111D15] dark:text-slate-100' : 'font-medium text-[#111D15] dark:text-slate-200'}`}>
                        {conv.title}
                      </p>
                      {lastMsg && (
                        <span className="text-[9px] font-mono text-[#5E7567] dark:text-slate-400 shrink-0 ml-1">
                          {new Date(lastMsg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5E7567] dark:text-slate-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.content.slice(0, 36) + (lastMsg.content.length > 36 ? '...' : '') : 'Conversa privada'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
