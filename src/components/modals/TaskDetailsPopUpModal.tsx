'use client';

import React, { useState } from 'react';
import {
 X,
 Send,
 Clock,
 CheckCircle2,
 AlertTriangle,
 PlayCircle,
 MessageSquare,
 Calendar,
 BadgeCheck,
 Paperclip,
 File,
 Download,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { HubTask, TaskStatus } from '@/lib/types/nexus';

interface TaskDetailsPopUpModalProps {
 task: HubTask | null;
 onClose: () => void;
}

export const TaskDetailsPopUpModal: React.FC<TaskDetailsPopUpModalProps> = ({
 task,
 onClose,
}) => {
 const { updateTaskStatus, addTaskComment } = useNexus();
 const [newComment, setNewComment] = useState('');

 if (!task) return null;

 const handleStatusChange = (newStatus: TaskStatus) => {
 updateTaskStatus(task.id, newStatus);
 };

 const handleAddComment = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newComment.trim()) return;
 addTaskComment(task.id, newComment);
 setNewComment('');
 };

 const formatExactDateTime = (isoString?: string) => {
 if (!isoString) return 'N/A';
 try {
 const date = new Date(isoString);
 if (isNaN(date.getTime())) return isoString;
 return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit',
 })}`;
 } catch {
 return isoString;
 }
 };

 const getInitials = (name?: string) => {
 if (!name) return 'NX';
 const parts = name.split(' ');
 if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
 return name.substring(0, 2).toUpperCase();
 };

 const taskCodeFormatted = task.code || `TASK-${task.id.replace('task-', '').padStart(4, '0')}`;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
 <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] card-shadow">
 {/* Top Header Bar */}
 <div className="px-5 py-4 bg-[#F5F7F5] dark:bg-[#0B120E] border-b border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between gap-3">
 <div className="flex items-center space-x-3 min-w-0">
 <span className="px-2.5 py-1 rounded-lg bg-[#EBF2EE] dark:bg-[#1C2E24] border border-[#D4E8DB] dark:border-[#1E3125] text-[#2C523D] dark:text-[#76B38B] font-mono font-bold text-xs sm:text-sm tracking-wider shrink-0">
 {taskCodeFormatted}
 </span>

 <div className="min-w-0">
 <div className="flex items-center space-x-2">
 <span className="text-[10px] font-bold text-[#4D7C5D] dark:text-[#76B38B] uppercase truncate">
 {task.area_name}
 </span>
 <span className="text-[#CBD5CE] dark:text-[#1E3125]">•</span>
 <span
 className={`text-[10px] font-bold ${
 task.priority === 'CRITICAL'
 ? 'text-rose-600 dark:text-rose-400'
 : task.priority === 'HIGH'
 ? 'text-amber-600 dark:text-amber-400'
 : task.priority === 'MEDIUM'
 ? 'text-[#4D7C5D] dark:text-[#76B38B]'
 : 'text-[#5C6E62] dark:text-slate-400'
 }`}
 >
 {task.priority === 'CRITICAL' ? ' CRÍTICA' : task.priority === 'HIGH' ? '▲ ALTA' : task.priority === 'MEDIUM' ? '◼ MÉDIA' : '▼ BAIXA'}
 </span>
 </div>
 <h2 className="text-sm sm:text-base font-bold text-[#1A281E] dark:text-slate-100 truncate mt-0.5">
 {task.title}
 </h2>
 </div>
 </div>

 <button
 onClick={onClose}
 className="p-1.5 text-[#8FA595] hover:text-[#1A281E] dark:hover:text-slate-200 rounded-lg hover:bg-[#E2E8E3] dark:hover:bg-[#1E3125] transition-colors cursor-pointer shrink-0"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content Body */}
 <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs no-scrollbar">
 {/* Employee Lifecycle Cards */}
 <div className="space-y-1.5">
 <span className="text-[10px] font-semibold text-[#8FA595] dark:text-slate-500 uppercase tracking-wider block">
 Ficha de Responsáveis & Prazos:
 </span>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px]">
 {/* Creator Staff Card */}
 <div className="bg-[#F5F7F5] dark:bg-[#0B120E] p-3 rounded-xl border border-[#E2E8E3] dark:border-[#1E3125] space-y-2">
 <div className="flex items-center justify-between border-b border-[#E2E8E3] dark:border-[#1E3125] pb-1.5">
 <span className="text-[9px] text-[#8FA595] dark:text-slate-500 uppercase font-bold">CRIADO / DELEGADO POR</span>
 <span className="text-[#4D7C5D] dark:text-[#76B38B] font-mono font-bold">{task.delegated_by_code || 'MAT-0001'}</span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-7 h-7 rounded-lg bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] font-bold text-xs flex items-center justify-center border border-[#D4E8DB] dark:border-[#1E3125] shrink-0">
 {getInitials(task.delegated_by_name)}
 </div>
 <div className="min-w-0">
 <strong className="text-[#1A281E] dark:text-slate-200 text-xs truncate block">
 {task.delegated_by_name}
 </strong>
 <span className="text-[#8FA595] dark:text-slate-400 text-[9px] truncate block">
 {task.delegated_by_role || 'Direção Executiva'}
 </span>
 </div>
 </div>
 <div className="text-[9px] text-[#8FA595] dark:text-slate-500 pt-1.5 border-t border-[#E2E8E3] dark:border-[#1E3125]">
 <span>Horário de Criação:</span>
 <strong className="text-[#1A281E] dark:text-slate-300 block font-semibold mt-0.5">{formatExactDateTime(task.created_at)}</strong>
 </div>
 </div>

 {/* Assignee / Executor Staff Card */}
 <div className="bg-[#F5F7F5] dark:bg-[#0B120E] p-3 rounded-xl border border-[#E2E8E3] dark:border-[#1E3125] space-y-2">
 <div className="flex items-center justify-between border-b border-[#E2E8E3] dark:border-[#1E3125] pb-1.5">
 <span className="text-[9px] text-[#8FA595] dark:text-slate-500 uppercase font-bold">ATRIBUÍDO A / EXECUTOR</span>
 <span className="text-[#4D7C5D] dark:text-[#76B38B] font-mono font-bold">{task.assigned_to_code || 'MAT-0104'}</span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-7 h-7 rounded-lg bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] font-bold text-xs flex items-center justify-center border border-[#D4E8DB] dark:border-[#1E3125] shrink-0">
 {getInitials(task.assigned_to_name)}
 </div>
 <div className="min-w-0">
 <strong className="text-[#1A281E] dark:text-slate-200 text-xs truncate block">
 {task.assigned_to_name || 'Setor Responsável'}
 </strong>
 <span className="text-[#8FA595] dark:text-slate-400 text-[9px] truncate block">
 {task.assigned_to_role || 'Gerente de Área'}
 </span>
 </div>
 </div>
 <div className="text-[9px] text-[#8FA595] dark:text-slate-500 pt-1.5 border-t border-[#E2E8E3] dark:border-[#1E3125]">
 <span>Início de Execução:</span>
 <strong className="text-[#1A281E] dark:text-slate-300 block font-semibold mt-0.5">
 {task.started_at ? formatExactDateTime(task.started_at) : 'Aguardando início...'}
 </strong>
 </div>
 </div>

 {/* Completer Staff Card */}
 <div className={`p-3 rounded-xl border space-y-2 ${
 task.status === 'COMPLETED'
 ? 'bg-[#EBF2EE] dark:bg-[#1C2E24] border-[#D4E8DB] dark:border-[#1E3125]'
 : 'bg-[#F5F7F5] dark:bg-[#0B120E] border-[#E2E8E3] dark:border-[#1E3125] opacity-60'
 }`}>
 <div className="flex items-center justify-between border-b border-[#E2E8E3] dark:border-[#1E3125] pb-1.5">
 <span className="text-[9px] text-[#8FA595] dark:text-slate-500 uppercase font-bold">FINALIZADO POR</span>
 <span className="text-[#4D7C5D] dark:text-[#76B38B] font-mono font-bold">{task.completed_by_code || 'MAT-0001'}</span>
 </div>
 <div className="flex items-center space-x-2">
 <div className="w-7 h-7 rounded-lg bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] font-bold text-xs flex items-center justify-center border border-[#D4E8DB] dark:border-[#1E3125] shrink-0">
 {getInitials(task.completed_by_name || task.assigned_to_name)}
 </div>
 <div className="min-w-0">
 <strong className="text-[#1A281E] dark:text-slate-200 text-xs truncate block">
 {task.completed_by_name || (task.status === 'COMPLETED' ? 'Carlos Santos' : 'Pendente')}
 </strong>
 <span className="text-[#8FA595] dark:text-slate-400 text-[9px] truncate block">
 {task.completed_by_role || (task.status === 'COMPLETED' ? 'Diretor Executivo' : 'N/A')}
 </span>
 </div>
 </div>
 <div className="text-[9px] text-[#8FA595] dark:text-slate-500 pt-1.5 border-t border-[#E2E8E3] dark:border-[#1E3125]">
 <span>Horário de Conclusão:</span>
 <strong className="text-[#2C523D] dark:text-[#76B38B] block font-semibold mt-0.5">
 {task.completed_at ? formatExactDateTime(task.completed_at) : 'Em andamento'}
 </strong>
 </div>
 </div>
 </div>
 </div>

 {/* Task Status Control Pills */}
 <div className="space-y-2 bg-[#F5F7F5] dark:bg-[#0B120E] p-3.5 rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
 <span className="text-[10px] font-semibold text-[#8FA595] dark:text-slate-500 uppercase tracking-wider block">
 Alterar Status da Tarefa:
 </span>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 <button
 onClick={() => handleStatusChange('OPEN')}
 className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
 task.status === 'OPEN'
 ? 'bg-amber-500 text-white border-transparent shadow-sm'
 : 'bg-white dark:bg-[#121D16] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-amber-400'
 }`}
 >
 <Clock className="w-3.5 h-3.5" />
 <span>Em Aberto</span>
 </button>

 <button
 onClick={() => handleStatusChange('IN_PROGRESS')}
 className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
 task.status === 'IN_PROGRESS'
 ? 'bg-[#4D7C5D] text-white border-transparent shadow-sm'
 : 'bg-white dark:bg-[#121D16] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-[#4D7C5D]'
 }`}
 >
 <PlayCircle className="w-3.5 h-3.5" />
 <span>Em Andamento</span>
 </button>

 <button
 onClick={() => handleStatusChange('COMPLETED')}
 className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
 task.status === 'COMPLETED'
 ? 'bg-[#2C523D] text-white border-transparent shadow-sm'
 : 'bg-white dark:bg-[#121D16] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-[#2C523D]'
 }`}
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>Concluído</span>
 </button>

 <button
 onClick={() => handleStatusChange('BLOCKED')}
 className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
 task.status === 'BLOCKED'
 ? 'bg-rose-600 text-white border-transparent shadow-sm'
 : 'bg-white dark:bg-[#121D16] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-rose-400'
 }`}
 >
 <AlertTriangle className="w-3.5 h-3.5" />
 <span>Impedido</span>
 </button>
 </div>
 </div>

 {/* Description Section */}
 <div className="space-y-1.5">
 <span className="text-[10px] font-semibold text-[#8FA595] dark:text-slate-500 uppercase tracking-wider">
 Instruções & Detalhes da Demanda:
 </span>
 <div className="p-3.5 bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125] text-[#1A281E] dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
 {task.description}
 </div>
 </div>

 {/* Attachments Section in Task Details */}
 {task.attachments && task.attachments.length > 0 && (
 <div className="space-y-2">
 <span className="text-[10px] font-semibold text-[#8FA595] dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
 <Paperclip className="w-3.5 h-3.5 text-[#4D7C5D]" />
 <span>Documentos & Arquivos Anexados ({task.attachments.length})</span>
 </span>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {task.attachments.map((att, idx) => (
 <div
 key={idx}
 className="p-2.5 rounded-xl bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between hover:border-[#4D7C5D] transition-colors group"
 >
 <div className="flex items-center space-x-2.5 min-w-0">
 <div className={`p-2 rounded-lg text-white ${
 att.type === 'PDF'
 ? 'bg-rose-600'
 : att.type === 'IMAGE'
 ? 'bg-blue-600'
 : att.type === 'SHEET'
 ? 'bg-emerald-600'
 : 'bg-slate-600'
 }`}>
 <File className="w-4 h-4" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-bold text-[#1A281E] dark:text-slate-200 truncate">
 {att.name}
 </p>
 <span className="text-[10px] text-[#8FA595] dark:text-slate-400">
 {att.type} • {att.size}
 </span>
 </div>
 </div>

 <a
 href={att.url || '#'}
 target="_blank"
 rel="noopener noreferrer"
 className="px-2.5 py-1.5 rounded-lg bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] hover:bg-[#2C523D] hover:text-white transition-colors text-xs font-semibold flex items-center space-x-1 cursor-pointer shrink-0 ml-2"
 title="Baixar ou Visualizar Documento"
 onClick={(e) => {
 if (!att.url) {
 e.preventDefault();
 alert(`Abrindo visualizador do arquivo: ${att.name} (${att.size})`);
 }
 }}
 >
 <Download className="w-3.5 h-3.5" />
 <span>Abrir</span>
 </a>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Observations & Feedback Stream */}
 <div className="space-y-2 pt-2 border-t border-[#E2E8E3] dark:border-[#1E3125]">
 <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-[#8FA595] dark:text-slate-500">
 <span className="flex items-center space-x-1.5">
 <MessageSquare className="w-3.5 h-3.5 text-[#4D7C5D]" />
 <span>Observações & Acompanhamento ({task.comments.length})</span>
 </span>
 <span>Histórico Registrado</span>
 </div>

 {/* Comment Timeline */}
 <div className="space-y-2 max-h-52 overflow-y-auto pr-1 no-scrollbar">
 {task.comments.length === 0 ? (
 <div className="p-4 text-center text-[#8FA595] text-xs bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
 Nenhuma observação registrada. Adicione a primeira atualização abaixo.
 </div>
 ) : (
 task.comments.map((cm) => (
 <div
 key={cm.id}
 className="p-3 rounded-xl bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] space-y-1"
 >
 <div className="flex items-center justify-between text-[10px]">
 <div className="flex items-center space-x-1.5">
 <strong className="text-[#1A281E] dark:text-slate-200">{cm.user_name}</strong>
 {cm.user_role && (
 <span className="px-1.5 py-0.2 rounded-full bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] font-semibold text-[9px]">
 {cm.user_role}
 </span>
 )}
 </div>
 <span className="text-[#8FA595] dark:text-slate-500 font-mono">
 {formatExactDateTime(cm.created_at)}
 </span>
 </div>
 <p className="text-[#5C6E62] dark:text-slate-300 text-xs leading-normal">
 {cm.content}
 </p>
 </div>
 ))
 )}
 </div>

 {/* Add Comment Input Form */}
 <form onSubmit={handleAddComment} className="pt-1 flex items-center space-x-2">
 <input
 type="text"
 value={newComment}
 onChange={(e) => setNewComment(e.target.value)}
 placeholder="Escreva uma observação ou relato de andamento..."
 className="flex-1 px-3.5 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] text-xs transition-colors"
 />
 <button
 type="submit"
 disabled={!newComment.trim()}
 className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer shrink-0 shadow-sm"
 >
 <Send className="w-3 h-3" />
 <span>Enviar</span>
 </button>
 </form>
 </div>
 </div>

 {/* Modal Footer */}
 <div className="px-5 py-3.5 bg-[#F5F7F5] dark:bg-[#0B120E] border-t border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between text-[11px] text-[#5C6E62] dark:text-slate-400">
 <span>
 Atualizado: <strong className="text-[#1A281E] dark:text-slate-300">{formatExactDateTime(task.updated_at)}</strong>
 </span>

 <button
 onClick={onClose}
 className="px-4 py-2 bg-white dark:bg-[#121D16] hover:bg-[#E2E8E3] dark:hover:bg-[#17261D] text-[#1A281E] dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-[#E2E8E3] dark:border-[#1E3125] shadow-xs"
 >
 Fechar
 </button>
 </div>
 </div>
 </div>
 );
};
