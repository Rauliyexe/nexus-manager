'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
 CheckSquare,
 Clock,
 CheckCircle2,
 Ticket,
 Plus,
 ArrowUpRight,
 ChevronRight,
 Calendar,
 AlertCircle,
 Sparkles,
 Flame,
 Check,
 TrendingUp,
 Circle,
 Play,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { USER_ROLE_LABELS, HubTask } from '@/lib/types/nexus';

interface HubEmployeeDashboardProps {
 onOpenDelegateModal: () => void;
 onOpenTicketModal: () => void;
}

export const HubEmployeeDashboard: React.FC<HubEmployeeDashboardProps> = ({
 onOpenDelegateModal,
 onOpenTicketModal,
}) => {
 const { currentUser, obligations, tasks, tickets, areas, updateTaskStatus, playSound } = useNexus();
 const [taskFilter, setTaskFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

 const myArea = areas.find((a) => a.name.toLowerCase() === currentUser.department?.toLowerCase()) || areas.find((a) => a.id === 'area-3') || areas[0];
 const myObligations = obligations.filter((o) => o.area_id === myArea?.id);
 const myTasks = tasks.filter((t) => t.assigned_to_id === currentUser.id || t.area_id === myArea?.id);
 const myTickets = tickets.filter((t) => t.created_by_id === currentUser.id || t.area_id === myArea?.id);

 const completedTasks = myTasks.filter((t) => t.status === 'COMPLETED');
 const inProgressTasks = myTasks.filter((t) => t.status === 'IN_PROGRESS');
 const openTasks = myTasks.filter((t) => t.status === 'OPEN');
 const pendingTasksCount = inProgressTasks.length + openTasks.length;
 const totalTasksCount = myTasks.length || 1;
 const progressPercentage = Math.round((completedTasks.length / totalTasksCount) * 100);

 const filteredTasks = myTasks.filter((t) => {
 if (taskFilter === 'PENDING') return t.status !== 'COMPLETED';
 if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
 return true;
 });

 const handleToggleComplete = (task: HubTask) => {
 const nextStatus = task.status === 'COMPLETED' ? 'OPEN' : 'COMPLETED';
 updateTaskStatus(task.id, nextStatus);
 playSound(nextStatus === 'COMPLETED' ? 'TASK_COMPLETED' : 'MESSAGE_SENT');
 };

 return (
 <div className="space-y-5 font-sans">
 {/* ── Personal Greeting & Work Shift Banner ── */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl card-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-4">
 <div className="flex items-center space-x-4">
 {/* Avatar */}
 <div className="w-14 h-14 rounded-2xl bg-[#1B3026] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs border-2 border-emerald-500/30">
 {currentUser.name.substring(0, 2).toUpperCase()}
 </div>
 <div>
 <div className="flex items-center space-x-2 flex-wrap gap-y-1">
 <h2 className="text-lg font-bold text-[#111D15] dark:text-slate-100">
 Olá, {currentUser.name.split(' ')[0]}!
 </h2>
 <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-300 dark:border-emerald-800">
 {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
 </span>
 <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800 flex items-center space-x-1">
 <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
 <span>Dia Moderado / Cheio</span>
 </span>
 </div>
 <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-1">
 Setor: <strong className="text-[#111D15] dark:text-slate-200">{myArea?.name || currentUser.department}</strong> • Matrícula{' '}
 <span className="font-mono font-bold text-[#1B3026] dark:text-[#76B38B]">MAT-0130</span> • Turno Integral (08:00 - 17:30)
 </p>
 </div>
 </div>

 {/* Quick Action Buttons */}
 <div className="flex items-center space-x-2 shrink-0">
 <button
 onClick={onOpenTicketModal}
 className="px-4 py-2.5 bg-[#EEF2EE] dark:bg-[#17261D] hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] text-[#111D15] dark:text-slate-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-[#D5E0D7] dark:border-[#1E3125] cursor-pointer shadow-2xs"
 >
 <Ticket className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
 <span>Abrir Chamado</span>
 </button>
 <button
 onClick={onOpenDelegateModal}
 className="px-4 py-2.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
 >
 <Plus className="w-3.5 h-3.5" />
 <span>Nova Demanda</span>
 </button>
 </div>
 </div>

 {/* ── Turn Progress Bar (Jornada do Dia Moderado) ── */}
 <div className="bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-transparent dark:from-[#0B1A11] dark:to-[#121D16] border border-emerald-300/60 dark:border-emerald-900/40 p-4 sm:p-5 rounded-2xl card-shadow space-y-2.5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
 <div className="flex items-center space-x-2">
 <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
 <span className="font-bold text-[#111D15] dark:text-slate-100">
 Progresso do Turno de Trabalho ({completedTasks.length} de {myTasks.length} tarefas concluídas)
 </span>
 </div>
 <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-400 text-xs">
 {progressPercentage}% CONCLUÍDO
 </span>
 </div>

 <div className="w-full bg-slate-200 dark:bg-[#1E3125] h-2.5 rounded-full overflow-hidden">
 <div
 className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
 style={{ width: `${progressPercentage}%` }}
 />
 </div>

 <div className="flex flex-wrap items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 pt-0.5">
 <span> 2 tarefas matinais finalizadas com sucesso</span>
 <span>⏳ 1 demanda em andamento para as 15:30</span>
 <span> Fechamento oficial de expedição: 17:00</span>
 </div>
 </div>

 {/* ── 3 Metric Cards ── */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {/* Tarefas Periódicas do Setor */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow card-shadow-hover transition-all flex flex-col justify-between min-h-[115px]">
 <div className="flex items-start justify-between">
 <span className="text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
 Tarefas do Setor
 </span>
 <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
 <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 </div>
 </div>
 <div>
 <h3 className="text-2xl font-extrabold text-[#111D15] dark:text-slate-100 mt-2 leading-none">
 {myObligations.length} <span className="text-sm font-semibold text-[#5E7567]">Tarefas</span>
 </h3>
 <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
 Rotinas matinais & fechamento do setor
 </p>
 </div>
 </div>

 {/* Minhas Tarefas */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow card-shadow-hover transition-all flex flex-col justify-between min-h-[115px]">
 <div className="flex items-start justify-between">
 <span className="text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
 Tarefas do Dia
 </span>
 <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
 <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 </div>
 </div>
 <div>
 <h3 className="text-2xl font-extrabold text-[#111D15] dark:text-slate-100 mt-2 leading-none">
 {pendingTasksCount} <span className="text-sm font-semibold text-[#5E7567]">Pendentes</span>
 </h3>
 <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
 {inProgressTasks.length} em andamento • {completedTasks.length} concluídas
 </p>
 </div>
 </div>

 {/* Chamados */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow card-shadow-hover transition-all flex flex-col justify-between min-h-[115px]">
 <div className="flex items-start justify-between">
 <span className="text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
 Suporte & TI
 </span>
 <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center">
 <AlertCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
 </div>
 </div>
 <div>
 <h3 className="text-2xl font-extrabold text-[#111D15] dark:text-slate-100 mt-2 leading-none">
 {myTickets.length} <span className="text-sm font-semibold text-[#5E7567]">Chamado</span>
 </h3>
 <p className="text-xs text-sky-700 dark:text-sky-400 mt-1 font-medium">
 INC-0010 em atendimento pela TI
 </p>
 </div>
 </div>
 </div>

 {/* ── Core Content: Tasks Breakdown + Rituals ── */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 
 {/* Minhas Tarefas (Colunas 1 e 2) */}
 <div className="lg:col-span-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl card-shadow space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
 <div>
 <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide flex items-center space-x-2">
 <span>Quadro Operacional de Atividades</span>
 <span className="px-2 py-0.5 bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] rounded-full text-[10px] font-mono font-bold">
 {myTasks.length}
 </span>
 </h3>
 <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
 Clique no botão circular de checkmark para concluir ou reabrir uma tarefa
 </p>
 </div>

 {/* Filter Pills */}
 <div className="flex items-center space-x-1.5 bg-[#EEF2EE] dark:bg-[#0B120E] p-1 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
 <button
 onClick={() => setTaskFilter('ALL')}
 className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
 taskFilter === 'ALL'
 ? 'bg-white dark:bg-[#1C2E24] text-[#111D15] dark:text-slate-100 shadow-2xs'
 : 'text-[#5E7567] hover:text-[#111D15]'
 }`}
 >
 Todas ({myTasks.length})
 </button>
 <button
 onClick={() => setTaskFilter('PENDING')}
 className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
 taskFilter === 'PENDING'
 ? 'bg-white dark:bg-[#1C2E24] text-amber-700 dark:text-amber-400 shadow-2xs'
 : 'text-[#5E7567] hover:text-amber-700'
 }`}
 >
 Pendentes ({pendingTasksCount})
 </button>
 <button
 onClick={() => setTaskFilter('COMPLETED')}
 className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
 taskFilter === 'COMPLETED'
 ? 'bg-white dark:bg-[#1C2E24] text-emerald-700 dark:text-emerald-400 shadow-2xs'
 : 'text-[#5E7567] hover:text-emerald-700'
 }`}
 >
 Concluídas ({completedTasks.length})
 </button>
 </div>
 </div>

 <div className="space-y-3">
 {filteredTasks.map((task) => {
 const isDone = task.status === 'COMPLETED';
 const isInProgress = task.status === 'IN_PROGRESS';

 return (
 <div
 key={task.id}
 className={`p-4 rounded-xl border transition-all space-y-2 card-shadow ${
 isDone
 ? 'bg-[#EEF2EE]/40 dark:bg-[#0B120E]/40 border-[#D5E0D7]/60 dark:border-[#1E3125]/60 opacity-80'
 : isInProgress
 ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-300 dark:border-amber-900/50'
 : 'bg-white dark:bg-[#121D16] border-[#D5E0D7] dark:border-[#1E3125]'
 }`}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex items-start space-x-3 min-w-0">
 {/* Checkmark Button */}
 <button
 type="button"
 onClick={() => handleToggleComplete(task)}
 className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 shadow-2xs ${
 isDone
 ? 'bg-emerald-600 text-white'
 : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-600 text-transparent hover:text-emerald-600'
 }`}
 title={isDone ? 'Reabrir tarefa' : 'Marcar como concluída'}
 >
 <Check className="w-3.5 h-3.5 stroke-[3]" />
 </button>

 <div className="min-w-0 space-y-1">
 <div className="flex items-center space-x-2 flex-wrap gap-y-1">
 <span className="font-mono font-bold text-[10px] text-[#1B3026] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-0.5 rounded-md border border-[#D5E0D7] dark:border-[#1E3125]">
 {task.code}
 </span>
 <span
 className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
 isDone
 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
 : isInProgress
 ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
 }`}
 >
 {task.status === 'COMPLETED' ? 'CONCLUÍDA' : task.status === 'IN_PROGRESS' ? 'EM ANDAMENTO' : 'ABERTA'}
 </span>
 <span
 className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
 task.priority === 'HIGH'
 ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/30'
 : 'text-slate-600 bg-slate-100 dark:bg-slate-800'
 }`}
 >
 Prioridade: {task.priority}
 </span>
 </div>

 <h4
 className={`text-xs font-bold text-[#111D15] dark:text-slate-100 ${
 isDone ? 'line-through text-slate-500' : ''
 }`}
 >
 {task.title}
 </h4>
 <p className="text-[11px] text-[#5E7567] dark:text-slate-400 leading-relaxed">
 {task.description}
 </p>
 </div>
 </div>

 <span className="text-[10px] font-mono text-[#5E7567] shrink-0 bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-1 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125]">
 Prazo: {task.due_date}
 </span>
 </div>

 {/* Comments from manager */}
 {task.comments && task.comments.length > 0 && (
 <div className="pt-2 pl-9 space-y-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
 {task.comments.map((cm) => (
 <div key={cm.id} className="bg-[#EEF2EE]/60 dark:bg-[#0B120E] p-2 rounded-lg text-slate-700 dark:text-slate-300">
 <strong className="text-[#111D15] dark:text-slate-100">{cm.user_name}:</strong> {cm.content}
 </div>
 ))}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>

 {/* Coluna 3: Tarefas do Setor & Linha do Tempo */}
 <div className="space-y-5">
 {/* Tarefas do Setor */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow space-y-3.5">
 <div className="flex items-center justify-between pb-2 border-b border-[#D5E0D7] dark:border-[#1E3125]">
 <h3 className="text-xs font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide flex items-center space-x-1.5">
 <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
 <span>Tarefas do Setor (Roadmap)</span>
 </h3>
 <span className="text-[10px] font-mono text-[#5E7567]">{myObligations.length} Tarefas</span>
 </div>

 <div className="space-y-2.5">
 {myObligations.map((ob, idx) => (
 <div
 key={ob.id}
 className="p-3 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] flex items-start space-x-2.5"
 >
 <div
 className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
 idx < 2 ? 'bg-emerald-600 text-white' : 'border-2 border-amber-500 text-amber-500'
 }`}
 >
 {idx < 2 ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between">
 <p className="text-xs font-bold text-[#111D15] dark:text-slate-100 truncate">{ob.title}</p>
 <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
 {ob.due_time}
 </span>
 </div>
 <p className="text-[10px] text-[#5E7567] dark:text-slate-400 line-clamp-1 mt-0.5">
 {ob.description}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Linha do Tempo do Turno */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow space-y-3">
 <h3 className="text-xs font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
 Cronograma do Turno
 </h3>

 <div className="space-y-3 text-xs pl-2 border-l-2 border-emerald-600 dark:border-emerald-500 ml-1">
 <div className="relative pl-3">
 <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-emerald-600 rounded-full" />
 <p className="font-bold text-[#111D15] dark:text-slate-100">08:00 — Início & Vistoria</p>
 <p className="text-[11px] text-[#5E7567]">Check-in de frota e triagem de romaneios concluídos.</p>
 </div>

 <div className="relative pl-3">
 <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-emerald-600 rounded-full" />
 <p className="font-bold text-[#111D15] dark:text-slate-100">11:45 — Liberação Bitrem</p>
 <p className="text-[11px] text-[#5E7567]">Pesagem do lote #4812 aprovada no pátio.</p>
 </div>

 <div className="relative pl-3">
 <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
 <p className="font-bold text-amber-800 dark:text-amber-400">13:30 - 15:30 — Inventário Box 4</p>
 <p className="text-[11px] text-[#5E7567]">Contagem física em andamento.</p>
 </div>

 <div className="relative pl-3">
 <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
 <p className="font-bold text-[#111D15] dark:text-slate-100">16:30 — Emissão MTR Frota MG</p>
 <p className="text-[11px] text-[#5E7567]">Documentação de transporte de resíduos.</p>
 </div>

 <div className="relative pl-3">
 <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
 <p className="font-bold text-[#111D15] dark:text-slate-100">17:00 — Fechamento Operacional</p>
 <p className="text-[11px] text-[#5E7567]">Envio do status diário e encerramento de turno.</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
