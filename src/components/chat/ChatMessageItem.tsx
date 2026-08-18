'use client';

import React, { useState } from 'react';
import {
  Smile,
  CornerUpRight,
  Pin,
  CheckSquare,
  MoreHorizontal,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Message, MessageAttachment } from '@/lib/types/nexus';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useNexus } from '@/lib/store/nexusContext';

interface ChatMessageItemProps {
  message: Message;
  displayContent: string;
  isMine: boolean;
  onOpenThread: (message: Message) => void;
  onCreateTaskFromMessage: (message: Message, content: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '🚀', '👀', '🎯', '📈', '✅'];

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  displayContent,
  isMine,
  onOpenThread,
  onCreateTaskFromMessage,
}) => {
  const { togglePinMessage, addReaction, deleteMessage } = useNexus();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSystem = message.message_type === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="my-3 mx-auto max-w-lg p-2.5 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs text-[#3B4F43] dark:text-slate-400 text-center font-mono card-shadow">
        {displayContent}
      </div>
    );
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMoreMenu(false);
  };

  const renderAttachmentIcon = (type: MessageAttachment['type']) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'SHEET':
        return <FileSpreadsheet className="w-5 h-5 text-[#2C6E49]" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-sky-600" />;
      default:
        return <FileCode className="w-5 h-5 text-[#5E7567]" />;
    }
  };

  return (
    <div className="relative group px-2 py-2 rounded-2xl hover:bg-[#EEF2EE]/40 dark:hover:bg-[#17261D]/50 transition-all font-sans">
      {/* Pinned Badge */}
      {message.pinned && (
        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#1B3026] dark:text-[#76B38B] mb-1 pl-10 font-mono">
          <Pin className="w-3 h-3 fill-current rotate-45" />
          <span>Mensagem Fixada no Canal</span>
        </div>
      )}

      <div className="flex items-start space-x-3">
        <UserAvatar name={message.sender?.name || 'U'} size="md" />

        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs text-[#111D15] dark:text-slate-100">
              {message.sender?.name || 'Colaborador'}
            </span>
            <span className="text-[10px] text-[#5E7567] dark:text-slate-400 font-semibold bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-0.5 rounded-md border border-[#D5E0D7] dark:border-[#1E3125]">
              {message.sender?.department || message.sender?.role || 'Nexus'}
            </span>
            <span className="text-[10px] font-mono text-[#5E7567] dark:text-slate-400">
              {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Content */}
          <div className="text-xs text-[#111D15] dark:text-slate-200 mt-1 leading-relaxed whitespace-pre-wrap selection:bg-[#2C6E49]/20">
            {displayContent}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2.5 space-y-2 max-w-md">
              {message.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between card-shadow hover:border-[#1B3026] transition-all"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <div className="p-2 rounded-lg bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125]">
                      {renderAttachmentIcon(att.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#111D15] dark:text-slate-100 truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-[#5E7567] dark:text-slate-400 font-mono">
                        {att.type} • {att.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => alert(`Abrindo visualizador para: ${att.name}`)}
                      className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-lg hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer text-xs font-semibold"
                      title="Visualizar"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alert(`Iniciando download seguro de: ${att.name}`)}
                      className="p-1.5 text-[#1B3026] dark:text-[#76B38B] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                      title="Baixar Arquivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reactions bar */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              {message.reactions.map((r, i) => (
                <button
                  key={i}
                  onClick={() => addReaction(message.conversation_id, message.id, r.emoji)}
                  className="px-2 py-0.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-full text-xs font-mono font-semibold flex items-center space-x-1 hover:border-[#1B3026] transition-all cursor-pointer card-shadow"
                  title={r.users.join(', ')}
                >
                  <span>{r.emoji}</span>
                  <span className="text-[#111D15] dark:text-slate-200">{r.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Thread Replies Button / Indicator */}
          {message.threadCount && message.threadCount > 0 ? (
            <button
              onClick={() => onOpenThread(message)}
              className="mt-2 px-3 py-1 bg-[#EEF2EE] dark:bg-[#1C2E24] hover:bg-[#D5E0D7] text-[#1B3026] dark:text-[#76B38B] rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer w-fit"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{message.threadCount} {message.threadCount === 1 ? 'resposta' : 'respostas'} • Abrir Thread</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Hover Quick-Action Toolbar ── */}
      <div className="absolute right-3 top-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto flex items-center bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl shadow-lg p-1 space-x-0.5 z-30 transition-all duration-150 card-shadow">
        {/* Reagir */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
            title="Reagir com emoji"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute right-0 bottom-full mb-1.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-1.5 shadow-xl flex items-center space-x-1 z-40 card-shadow">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    addReaction(message.conversation_id, message.id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="p-1 hover:scale-125 transition-transform text-sm cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Responder em Thread */}
        <button
          onClick={() => onOpenThread(message)}
          className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
          title="Responder em Thread"
        >
          <CornerUpRight className="w-3.5 h-3.5" />
        </button>

        {/* Fixar Mensagem */}
        <button
          onClick={() => togglePinMessage(message.conversation_id, message.id)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            message.pinned
              ? 'text-[#1B3026] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24]'
              : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
          }`}
          title={message.pinned ? 'Desafixar Mensagem' : 'Fixar Mensagem no Canal'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>

        {/* Criar Tarefa Diretamente */}
        <button
          onClick={() => onCreateTaskFromMessage(message, displayContent)}
          className="p-1.5 text-[#1B3026] dark:text-[#76B38B] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer flex items-center space-x-1 font-bold text-xs"
          title="Transformar Mensagem em Tarefa Oficial"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        {/* Mais Ações Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
            title="Mais Ações"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-1.5 shadow-xl w-40 z-40 card-shadow space-y-0.5">
              <button
                onClick={handleCopyText}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[#111D15] dark:text-slate-200 hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg flex items-center space-x-2 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2C6E49]" /> : <Copy className="w-3.5 h-3.5 text-[#5E7567]" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={() => {
                  deleteMessage(message.conversation_id, message.id);
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg flex items-center space-x-2 cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Mensagem</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
