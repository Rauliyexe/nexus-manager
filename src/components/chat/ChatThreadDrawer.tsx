'use client';

import React, { useState } from 'react';
import { X, Send, CornerUpRight, MessageSquare } from 'lucide-react';
import { Message } from '@/lib/types/nexus';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { useNexus } from '@/lib/store/nexusContext';

interface ChatThreadDrawerProps {
  parentMessage: Message | null;
  onClose: () => void;
}

export const ChatThreadDrawer: React.FC<ChatThreadDrawerProps> = ({
  parentMessage,
  onClose,
}) => {
  const { sendThreadReply, currentUser } = useNexus();
  const [replyText, setReplyText] = useState('');

  if (!parentMessage) return null;

  const replies = parentMessage.threadReplies || [];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendThreadReply(parentMessage.conversation_id, parentMessage.id, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 sm:relative border-l border-[#D5E0D7] dark:border-[#1E3125] bg-white dark:bg-[#121D16] flex flex-col h-full z-40 card-shadow select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE]/60 dark:bg-[#0B120E] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#1B3026] text-white">
            <CornerUpRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111D15] dark:text-slate-100">
              Thread de Respostas
            </h3>
            <p className="text-[10px] text-[#5E7567] dark:text-slate-400">
              {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-lg hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Parent Message Card */}
      <div className="p-4 bg-[#EEF2EE]/40 dark:bg-[#0B120E]/60 border-b border-[#D5E0D7] dark:border-[#1E3125]">
        <div className="flex items-start space-x-2.5">
          <UserAvatar name={parentMessage.sender?.name || 'U'} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs text-[#111D15] dark:text-slate-100">
                {parentMessage.sender?.name || 'Colaborador'}
              </span>
              <span className="text-[10px] font-mono text-[#5E7567] dark:text-slate-400">
                {new Date(parentMessage.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-xs text-[#111D15] dark:text-slate-200 mt-1 leading-relaxed">
              {parentMessage.content.startsWith('[NEXUS_CIPHER:') ? (
                <span>🔒 Mensagem com Criptografia</span>
              ) : (
                <MarkdownRenderer content={parentMessage.content} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {replies.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <MessageSquare className="w-8 h-8 text-[#8FA595] mx-auto opacity-40" />
            <p className="text-xs text-[#5E7567] dark:text-slate-400 font-medium">
              Nenhuma resposta nesta thread ainda. Seja o primeiro a responder!
            </p>
          </div>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="flex items-start space-x-2.5 p-2 rounded-xl bg-[#EEF2EE]/30 dark:bg-[#17261D]/40 border border-[#D5E0D7]/60 dark:border-[#1E3125]">
              <UserAvatar name={reply.sender?.name || 'U'} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-[#111D15] dark:text-slate-100">
                    {reply.sender?.name || 'Colaborador'}
                  </span>
                  <span className="text-[9px] font-mono text-[#5E7567] dark:text-slate-400">
                    {new Date(reply.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-[#111D15] dark:text-slate-200 mt-0.5 leading-relaxed">
                  <MarkdownRenderer content={reply.content} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thread Reply Composer */}
      <form onSubmit={handleSendReply} className="p-3 border-t border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE]/40 dark:bg-[#0B120E] flex items-center space-x-2">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Responder nesta thread..."
          className="flex-1 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-2 text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] font-medium"
        />
        <button
          type="submit"
          className="p-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
