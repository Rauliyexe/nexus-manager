'use client';

import React from 'react';
import { Pin, X, MessageSquare, Trash2 } from 'lucide-react';
import { Message } from '@/lib/types/nexus';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useNexus } from '@/lib/store/nexusContext';

interface PinnedMessagesModalProps {
 isOpen: boolean;
 onClose: () => void;
 pinnedMessages: Message[];
 conversationTitle: string;
}

export const PinnedMessagesModal: React.FC<PinnedMessagesModalProps> = ({
 isOpen,
 onClose,
 pinnedMessages,
 conversationTitle,
}) => {
 const { togglePinMessage } = useNexus();

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm font-sans animate-in fade-in duration-150">
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden card-shadow flex flex-col max-h-[80vh]">
 {/* Header */}
 <div className="p-4 bg-[#EEF2EE]/60 dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between">
 <div className="flex items-center space-x-2.5">
 <div className="p-2 rounded-xl bg-[#1B3026] text-white">
 <Pin className="w-4 h-4 fill-current rotate-45" />
 </div>
 <div>
 <h3 className="text-xs font-bold text-[#111D15] dark:text-slate-100">
 Mensagens Fixadas ({pinnedMessages.length})
 </h3>
 <p className="text-[10px] text-[#5E7567] dark:text-slate-400">
 Canal: <strong className="text-[#111D15] dark:text-slate-200">{conversationTitle}</strong>
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

 {/* List */}
 <div className="p-4 overflow-y-auto flex-1 space-y-3">
 {pinnedMessages.length === 0 ? (
 <div className="text-center py-10 space-y-2">
 <Pin className="w-8 h-8 text-[#8FA595] mx-auto opacity-30 rotate-45" />
 <p className="text-xs text-[#5E7567] font-medium">Nenhuma mensagem fixada neste canal.</p>
 </div>
 ) : (
 pinnedMessages.map((msg) => (
 <div
 key={msg.id}
 className="p-3 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-2 card-shadow"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <UserAvatar name={msg.sender?.name || 'U'} size="sm" />
 <div>
 <span className="font-bold text-xs text-[#111D15] dark:text-slate-100">
 {msg.sender?.name || 'Colaborador'}
 </span>
 <span className="text-[10px] text-[#5E7567] font-mono ml-2">
 {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 </div>

 <button
 onClick={() => togglePinMessage(msg.conversation_id, msg.id)}
 className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
 >
 Desafixar
 </button>
 </div>

 <p className="text-xs text-[#111D15] dark:text-slate-200 leading-relaxed">
 {msg.content.startsWith('[NEXUS_CIPHER:')
 ? ' Mensagem com Criptografia'
 : msg.content}
 </p>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 );
};
