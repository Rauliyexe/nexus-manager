'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
 Paperclip,
 Smile,
 Send,
 AtSign,
 Slash,
 Mic,
 Image as ImageIcon,
 CheckSquare,
 Sparkles,
 LifeBuoy,
 FileText,
 X,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { MessageAttachment } from '@/lib/types/nexus';

interface ChatComposerProps {
 onSendMessage: (text: string, attachments?: MessageAttachment[]) => void;
 onTriggerSlashCommand?: (command: string) => void;
}

const SLASH_COMMANDS = [
 { cmd: '/tarefa', label: 'Criar Tarefa Oficial', icon: CheckSquare, desc: 'Abre o formulário para delegar tarefa vinculada a esta conversa' },
 { cmd: '/chamado', label: 'Abrir Chamado #INC', icon: LifeBuoy, desc: 'Registrar suporte técnico ou incidente operacional' },
 { cmd: '/ia', label: 'Assistente IA', icon: Sparkles, desc: 'Solicitar resumo, decisões ou plano de ação' },
 { cmd: '/relatorio', label: 'Anexar Relatório', icon: FileText, desc: 'Gerar e anexar indicador de desempenho' },
];

const EMOJI_LIST = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];

export const ChatComposer: React.FC<ChatComposerProps> = ({
 onSendMessage,
 onTriggerSlashCommand,
}) => {
 const { profiles, currentUser } = useNexus();
 const [text, setText] = useState('');
 const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
 const [showMentionMenu, setShowMentionMenu] = useState(false);
 const [showSlashMenu, setShowSlashMenu] = useState(false);
 const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 const [mentionQuery, setMentionQuery] = useState('');
 const [isRecording, setIsRecording] = useState(false);

 const textareaRef = useRef<HTMLTextAreaElement>(null);

 // Auto-resize textarea
 useEffect(() => {
 if (textareaRef.current) {
 textareaRef.current.style.height = 'auto';
 textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
 }
 }, [text]);

 const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
 const val = e.target.value;
 setText(val);

 // Slash command trigger
 if (val.startsWith('/')) {
 setShowSlashMenu(true);
 setShowMentionMenu(false);
 } else {
 setShowSlashMenu(false);
 }

 // Mention trigger (@)
 const lastWord = val.split(' ').pop() || '';
 if (lastWord.startsWith('@')) {
 setShowMentionMenu(true);
 setMentionQuery(lastWord.slice(1).toLowerCase());
 } else {
 setShowMentionMenu(false);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 handleSubmit();
 }
 };

 const handleSubmit = () => {
 if (!text.trim() && attachments.length === 0) return;
 onSendMessage(text.trim(), attachments);
 setText('');
 setAttachments([]);
 setShowMentionMenu(false);
 setShowSlashMenu(false);
 setShowEmojiPicker(false);
 if (textareaRef.current) {
 textareaRef.current.style.height = 'auto';
 }
 };

 const handleSelectMention = (profileName: string) => {
 const words = text.split(' ');
 words.pop();
 setText(`${words.join(' ')} @${profileName} `);
 setShowMentionMenu(false);
 textareaRef.current?.focus();
 };

 const handleSelectSlash = (cmd: string) => {
 if (onTriggerSlashCommand) {
 onTriggerSlashCommand(cmd);
 }
 setText('');
 setShowSlashMenu(false);
 };

 const handleAddSampleAttachment = (type: 'PDF' | 'SHEET') => {
 const sample: MessageAttachment =
 type === 'PDF'
 ? { name: `relatorio-operacional-${Date.now().toString().slice(-4)}.pdf`, size: '2.4 MB', type: 'PDF' }
 : { name: `planilha-fechamento-${Date.now().toString().slice(-4)}.xlsx`, size: '640 KB', type: 'SHEET' };
 setAttachments([...attachments, sample]);
 };

 const filteredProfiles = profiles
 .filter((p) => p.id !== currentUser.id)
 .filter((p) => p.name.toLowerCase().includes(mentionQuery));

 return (
 <div className="p-3.5 border-t border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE]/40 dark:bg-[#0B120E] relative">
 {/* ── Menu de Comandos "/" ── */}
 {showSlashMenu && (
 <div className="absolute bottom-full left-4 mb-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-2 shadow-2xl w-80 z-30 card-shadow space-y-1 animate-in fade-in zoom-in-95 duration-100">
 <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5E7567] dark:text-slate-400">
 Comandos Rápidos do Sistema
 </div>
 {SLASH_COMMANDS.map((sc) => {
 const Icon = sc.icon;
 return (
 <button
 key={sc.cmd}
 onClick={() => handleSelectSlash(sc.cmd)}
 className="w-full text-left p-2 hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-xl flex items-start space-x-2.5 transition-colors cursor-pointer"
 >
 <div className="p-1.5 rounded-lg bg-[#EEF2EE] dark:bg-[#0B120E] text-[#1B3026] dark:text-[#76B38B] mt-0.5">
 <Icon className="w-4 h-4" />
 </div>
 <div>
 <p className="font-bold text-xs text-[#111D15] dark:text-slate-100">{sc.cmd} — {sc.label}</p>
 <p className="text-[10px] text-[#5E7567] dark:text-slate-400">{sc.desc}</p>
 </div>
 </button>
 );
 })}
 </div>
 )}

 {/* ── Menu de Menções "@" ── */}
 {showMentionMenu && filteredProfiles.length > 0 && (
 <div className="absolute bottom-full left-12 mb-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-2 shadow-2xl w-72 z-30 card-shadow max-h-48 overflow-y-auto space-y-0.5">
 <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5E7567] dark:text-slate-400">
 Mencionar Colaborador
 </div>
 {filteredProfiles.map((p) => (
 <button
 key={p.id}
 onClick={() => handleSelectMention(p.name)}
 className="w-full text-left px-2.5 py-1.5 hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
 >
 <span className="font-bold text-[#111D15] dark:text-slate-100">{p.name}</span>
 <span className="text-[10px] text-[#5E7567] dark:text-slate-400 font-mono">{p.department || p.role}</span>
 </button>
 ))}
 </div>
 )}

 {/* ── Seletor de Emojis Pop-up ── */}
 {showEmojiPicker && (
 <div className="absolute bottom-full left-10 mb-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-2.5 shadow-2xl z-30 card-shadow flex flex-wrap gap-1 w-64">
 {EMOJI_LIST.map((em) => (
 <button
 key={em}
 onClick={() => {
 setText(text + em);
 setShowEmojiPicker(false);
 textareaRef.current?.focus();
 }}
 className="p-1.5 hover:scale-125 transition-transform text-base cursor-pointer"
 >
 {em}
 </button>
 ))}
 </div>
 )}

 {/* ── Previews de Anexos Pendentes ── */}
 {attachments.length > 0 && (
 <div className="flex items-center flex-wrap gap-2 mb-2">
 {attachments.map((att, i) => (
 <div
 key={i}
 className="flex items-center space-x-2 px-3 py-1.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs card-shadow"
 >
 <span className="font-bold text-[#111D15] dark:text-slate-100 truncate max-w-xs">{att.name}</span>
 <span className="text-[10px] text-[#5E7567] dark:text-slate-400 font-mono">({att.size})</span>
 <button
 onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
 className="text-[#5E7567] hover:text-rose-600 cursor-pointer"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 ))}
 </div>
 )}

 {/* ── Main Composer Container ── */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow focus-within:border-[#1B3026] transition-all p-2.5 space-y-2">
 <textarea
 ref={textareaRef}
 value={text}
 onChange={handleInputChange}
 onKeyDown={handleKeyDown}
 placeholder="Escreva uma mensagem... (Enter para enviar, Shift+Enter para nova linha, '/' para comandos, '@' para menções)"
 rows={1}
 className="w-full bg-transparent text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none resize-none font-medium leading-relaxed max-h-32"
 />

 {/* Toolbar */}
 <div className="flex items-center justify-between pt-1 border-t border-[#D5E0D7]/50 dark:border-[#1E3125]/50">
 <div className="flex items-center space-x-1">
 <button
 onClick={() => handleAddSampleAttachment('PDF')}
 className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
 title="Anexar Documento PDF"
 >
 <Paperclip className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleAddSampleAttachment('SHEET')}
 className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
 title="Anexar Planilha"
 >
 <ImageIcon className="w-4 h-4" />
 </button>
 <button
 onClick={() => setShowEmojiPicker(!showEmojiPicker)}
 className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
 title="Inserir Emoji"
 >
 <Smile className="w-4 h-4" />
 </button>
 <button
 onClick={() => {
 setText(text + '@');
 setShowMentionMenu(true);
 textareaRef.current?.focus();
 }}
 className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
 title="Mencionar Colaborador (@)"
 >
 <AtSign className="w-4 h-4" />
 </button>
 <button
 onClick={() => {
 setText('/');
 setShowSlashMenu(true);
 textareaRef.current?.focus();
 }}
 className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] rounded-lg transition-colors cursor-pointer"
 title="Comandos (/)"
 >
 <Slash className="w-4 h-4" />
 </button>

 {/* Voice record button */}
 <button
 onClick={() => {
 setIsRecording(!isRecording);
 if (!isRecording) {
 setTimeout(() => {
 setIsRecording(false);
 onSendMessage(' [Mensagem de Voz • 0:14s gravada e validada]');
 }, 2500);
 }
 }}
 className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
 isRecording
 ? 'bg-rose-600 text-white animate-pulse'
 : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-white hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
 }`}
 title={isRecording ? 'Gravando áudio...' : 'Gravar Áudio'}
 >
 <Mic className="w-4 h-4" />
 </button>
 </div>

 {/* Submit Button */}
 <button
 onClick={handleSubmit}
 disabled={!text.trim() && attachments.length === 0}
 className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
 text.trim() || attachments.length > 0
 ? 'bg-[#1B3026] hover:bg-[#2A4A3C] text-white'
 : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#5E7567] dark:text-slate-500 cursor-not-allowed'
 }`}
 >
 <span>Enviar</span>
 <Send className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 );
};
