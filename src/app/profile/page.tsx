'use client';

import React, { useState } from 'react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { USER_ROLE_LABELS } from '@/lib/types/nexus';
import {
 User,
 Building2,
 Mail,
 Phone,
 ShieldCheck,
 FolderKanban,
 FileText,
 Calendar,
 Clock,
 CheckCircle2,
 Trash2,
 SendHorizontal,
 Briefcase,
 Layers,
 Sparkles,
 ArrowRight,
 TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
 const {
 currentUser,
 profiles,
 switchUser,
 savedReports,
 deleteSavedReport,
 syncReportToDailyClosing,
 tasks,
 areas,
 } = useNexus();

 const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DRAWER' | 'SWITCH_USER'>('OVERVIEW');

 // Relatórios pessoais do colaborador ativo
 const userSavedReports = savedReports.filter((r) => r.userId === currentUser.id);

 // Tarefas atribuídas ao colaborador ativo
 const userTasks = tasks.filter((t) => t.assigned_to_id === currentUser.id || t.assigned_to_name === currentUser.name);

 // Área vinculada
 const userArea = areas.find(
 (a) => a.name.toLowerCase().includes((currentUser.department || '').toLowerCase()) || a.manager_id === currentUser.id
 );

 return (
 <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
 {/* ── HEADER DO PERFIL ── */}
 <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-3xl p-6 sm:p-8 card-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
 <div className="flex items-center space-x-5">
 <UserAvatar
 name={currentUser.name}
 size="lg"
 className="w-16 h-16 sm:w-20 sm:h-20 text-xl font-bold bg-[#1B3026] text-white shadow-lg ring-4 ring-[#EEF2EE] dark:ring-[#1C2E24]"
 />
 <div className="space-y-1">
 <div className="flex flex-wrap items-center gap-2">
 <h1 className="text-xl sm:text-2xl font-black text-[#111D15] dark:text-slate-100">
 {currentUser.name}
 </h1>
 <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#1B3026] text-white dark:bg-[#76B38B] dark:text-[#111D15]">
 {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
 </span>
 <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
 ● Ativo no Sistema
 </span>
 </div>

 <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E7567] dark:text-slate-400 pt-1 font-medium">
 <span className="flex items-center space-x-1.5">
 <Building2 className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
 <span>Departamento: <strong className="text-[#111D15] dark:text-slate-200">{currentUser.department || 'Operações Gerais'}</strong></span>
 </span>
 <span className="flex items-center space-x-1.5">
 <Mail className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
 <span>{currentUser.email}</span>
 </span>
 {currentUser.phone && (
 <span className="flex items-center space-x-1.5">
 <Phone className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
 <span>{currentUser.phone}</span>
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Atalhos Rápidos */}
 <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
 <Link
 href="/reports"
 className="px-4 py-2 rounded-xl bg-[#1B3026] hover:bg-[#2A4A3C] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
 >
 <Sparkles className="w-4 h-4 text-amber-400" />
 <span> Novo Relato por Voz</span>
 </Link>

 <Link
 href="/hub"
 className="px-4 py-2 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] hover:bg-[#D5E0D7] text-[#1B3026] dark:text-[#76B38B] text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
 >
 <Briefcase className="w-4 h-4" />
 <span>Meu Hub de Trabalho</span>
 </Link>
 </div>
 </div>

 {/* ── NAVEGAÇÃO DE ABAS DO PERFIL ── */}
 <div className="flex items-center space-x-2 border-b border-[#E2E8E3] dark:border-[#1E3125] pb-2">
 <button
 onClick={() => setActiveTab('OVERVIEW')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
 activeTab === 'OVERVIEW'
 ? 'bg-[#1B3026] text-white shadow-xs'
 : 'text-[#5E7567] hover:text-[#111D15] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
 }`}
 >
 <User className="w-4 h-4" />
 <span>Visão Geral & Métricas</span>
 </button>

 <button
 onClick={() => setActiveTab('DRAWER')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
 activeTab === 'DRAWER'
 ? 'bg-[#1B3026] text-white shadow-xs'
 : 'text-[#5E7567] hover:text-[#111D15] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
 }`}
 >
 <FolderKanban className="w-4 h-4" />
 <span>Gaveta de Relatórios ({userSavedReports.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('SWITCH_USER')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
 activeTab === 'SWITCH_USER'
 ? 'bg-[#1B3026] text-white shadow-xs'
 : 'text-[#5E7567] hover:text-[#111D15] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
 }`}
 >
 <Layers className="w-4 h-4" />
 <span>Trocar de Colaborador (Simulação)</span>
 </button>
 </div>

 {/* ── CONTEÚDO DAS ABAS ── */}
 {activeTab === 'OVERVIEW' && (
 <div className="space-y-6 animate-in fade-in duration-200">
 {/* Métricas do Funcionário */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] card-shadow space-y-1">
 <span className="text-[10px] font-mono font-bold uppercase text-[#5E7567] dark:text-slate-400">
 Relatórios Gerados
 </span>
 <p className="text-2xl font-black text-[#111D15] dark:text-slate-100">
 {userSavedReports.length}
 </p>
 <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
 Arquivados na sua gaveta
 </span>
 </div>

 <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] card-shadow space-y-1">
 <span className="text-[10px] font-mono font-bold uppercase text-[#5E7567] dark:text-slate-400">
 Tarefas Concluídas
 </span>
 <p className="text-2xl font-black text-[#111D15] dark:text-slate-100">
 {userTasks.filter((t) => t.status === 'COMPLETED').length} / {userTasks.length}
 </p>
 <span className="text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
 No painel operacional
 </span>
 </div>

 <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] card-shadow space-y-1">
 <span className="text-[10px] font-mono font-bold uppercase text-[#5E7567] dark:text-slate-400">
 Status do Departamento
 </span>
 <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5 mt-1">
 <CheckCircle2 className="w-5 h-5" />
 <span>{userArea?.currentStatus === 'RED' ? 'Crítico' : userArea?.currentStatus === 'YELLOW' ? 'Atenção' : 'Conforme (Verde)'}</span>
 </p>
 <span className="text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
 {userArea?.name || currentUser.department || 'Geral'}
 </span>
 </div>

 <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] card-shadow space-y-1">
 <span className="text-[10px] font-mono font-bold uppercase text-[#5E7567] dark:text-slate-400">
 Nível de Governança
 </span>
 <p className="text-lg font-bold text-[#1B3026] dark:text-[#76B38B] flex items-center space-x-1.5 mt-1">
 <ShieldCheck className="w-5 h-5" />
 <span>Nível Corporativo</span>
 </p>
 <span className="text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
 Criptografia & Auditoria Ativas
 </span>
 </div>
 </div>

 {/* Seção Informativa do Colaborador */}
 <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-3xl p-6 card-shadow space-y-4">
 <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 flex items-center space-x-2">
 <Briefcase className="w-4 h-4 text-[#1B3026] dark:text-[#76B38B]" />
 <span>Atribuições & Responsabilidade Operacional</span>
 </h3>

 <p className="text-xs text-[#5E7567] dark:text-slate-300 leading-relaxed">
 O colaborador <strong className="text-[#111D15] dark:text-slate-200">{currentUser.name}</strong> está alocado no departamento <strong className="text-[#111D15] dark:text-slate-200">{currentUser.department || 'Operações'}</strong> com o cargo de <strong className="text-[#111D15] dark:text-slate-200">{USER_ROLE_LABELS[currentUser.role] || currentUser.role}</strong>. Todos os relatos por voz registrados no estúdio de inteligência artificial são processados pelo Gemini 1.5 Flash e arquivados diretamente na sua gaveta pessoal, permitindo prestação de contas imediata para o Fechamento Diário da área.
 </p>
 </div>
 </div>
 )}

 {/* ── ABA: GAVETA PESSOAL DE RELATÓRIOS ── */}
 {activeTab === 'DRAWER' && (
 <div className="space-y-4 animate-in fade-in duration-200">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 flex items-center space-x-2">
 <FolderKanban className="w-4 h-4 text-[#1B3026] dark:text-[#76B38B]" />
 <span>Gaveta de Relatórios de {currentUser.name}</span>
 </h3>
 <span className="text-xs text-[#5E7567] dark:text-slate-400">
 {userSavedReports.length} registro(s) salvo(s)
 </span>
 </div>

 {userSavedReports.length === 0 ? (
 <div className="p-12 text-center bg-white dark:bg-[#121D16] border border-dashed border-[#D5E0D7] dark:border-[#1E3125] rounded-3xl space-y-3">
 <FolderKanban className="w-10 h-10 mx-auto text-slate-400" />
 <p className="text-sm font-bold text-[#111D15] dark:text-slate-100">
 Nenhum relatório na sua gaveta pessoal ainda.
 </p>
 <p className="text-xs text-[#5E7567] dark:text-slate-400 max-w-md mx-auto">
 Grave um relato na aba de Relatórios IA para arquivá-lo aqui automaticamente com destilação do Gemini 1.5 Flash.
 </p>
 <Link
 href="/reports"
 className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#1B3026] text-white text-xs font-bold hover:bg-[#2A4A3C] transition-colors"
 >
 <Sparkles className="w-3.5 h-3.5 text-amber-400" />
 <span>Gravar Meu Primeiro Relato</span>
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {userSavedReports.map((saved) => (
 <div
 key={saved.id}
 className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] hover:border-[#1B3026] dark:hover:border-[#76B38B] card-shadow transition-all space-y-3"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="space-y-0.5">
 <div className="flex items-center space-x-2">
 <span
 className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
 saved.suggestedStatus === 'GREEN'
 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
 : saved.suggestedStatus === 'YELLOW'
 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
 : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
 }`}
 >
 {saved.suggestedStatus === 'GREEN' ? 'OK' : saved.suggestedStatus === 'YELLOW' ? 'ATENÇÃO' : 'CRÍTICO'}
 </span>
 <span className="text-xs font-bold text-[#111D15] dark:text-slate-100">
 {saved.userDepartment}
 </span>
 </div>
 <span className="text-[10px] text-[#5E7567] dark:text-slate-400 flex items-center space-x-1">
 <Calendar className="w-3 h-3" />
 <span>{new Date(saved.createdAt).toLocaleString('pt-BR')}</span>
 </span>
 </div>

 <button
 onClick={() => deleteSavedReport(saved.id)}
 className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
 title="Excluir da gaveta"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>

 <p className="text-xs text-[#111D15] dark:text-slate-100 font-semibold">
 "{saved.summary}"
 </p>

 <div className="p-3 rounded-xl bg-[#F7F9F7] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] text-xs text-[#5E7567] dark:text-slate-300 space-y-1">
 <span className="font-bold text-[#111D15] dark:text-slate-200 block text-[11px]">
 Atividades Realizadas:
 </span>
 <p className="whitespace-pre-line leading-relaxed">{saved.whatWasDone}</p>
 </div>

 <div className="flex items-center justify-between pt-2 border-t border-[#E2E8E3] dark:border-[#1E3125] text-xs text-[#5E7567] dark:text-slate-400">
 <span>⏱ {saved.durationTime}</span>

 <button
 onClick={() => syncReportToDailyClosing(saved.id)}
 disabled={saved.syncedToDailyClosing}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors ${
 saved.syncedToDailyClosing
 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
 : 'bg-[#1B3026] hover:bg-[#2A4A3C] text-white'
 }`}
 >
 {saved.syncedToDailyClosing ? (
 <>
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
 <span>Fechamento Concluído</span>
 </>
 ) : (
 <>
 <SendHorizontal className="w-3.5 h-3.5" />
 <span>Fechar Dia da Área</span>
 </>
 )}
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ── ABA: TROCA RÁPIDA DE COLABORADOR (SIMULAÇÃO CORPORATIVA) ── */}
 {activeTab === 'SWITCH_USER' && (
 <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-3xl p-6 card-shadow space-y-5 animate-in fade-in duration-200">
 <div>
 <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 flex items-center space-x-2">
 <Layers className="w-4 h-4 text-[#1B3026] dark:text-[#76B38B]" />
 <span>Alternar Usuário Ativo / Colaborador</span>
 </h3>
 <p className="text-xs text-[#5E7567] dark:text-slate-400">
 Selecione outro colaborador para simular sua visão, seu departamento e sua respectiva gaveta de relatórios:
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
 {profiles.map((profile) => (
 <button
 key={profile.id}
 onClick={() => switchUser(profile.id)}
 className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 ${
 currentUser.id === profile.id
 ? 'bg-[#EEF2EE] dark:bg-[#1C2E24] border-[#1B3026] dark:border-[#76B38B] ring-2 ring-[#1B3026] dark:ring-[#76B38B]'
 : 'bg-[#F7F9F7] dark:bg-[#0B120E] border-[#E2E8E3] dark:border-[#1E3125] hover:border-[#1B3026]'
 }`}
 >
 <UserAvatar name={profile.name} size="sm" className="bg-[#1B3026] text-white font-bold" />
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between">
 <p className="text-xs font-bold text-[#111D15] dark:text-slate-100 truncate">
 {profile.name}
 </p>
 {currentUser.id === profile.id && (
 <span className="w-2 h-2 rounded-full bg-emerald-500" />
 )}
 </div>
 <p className="text-[10px] text-[#5E7567] dark:text-slate-400 truncate">
 {profile.department || 'Geral'} • {USER_ROLE_LABELS[profile.role] || profile.role}
 </p>
 </div>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 );
}
