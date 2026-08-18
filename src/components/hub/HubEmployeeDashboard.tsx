'use client';

import React from 'react';
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
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { USER_ROLE_LABELS } from '@/lib/types/nexus';

interface HubEmployeeDashboardProps {
  onOpenDelegateModal: () => void;
  onOpenTicketModal: () => void;
}

export const HubEmployeeDashboard: React.FC<HubEmployeeDashboardProps> = ({
  onOpenDelegateModal,
  onOpenTicketModal,
}) => {
  const { currentUser, obligations, tasks, tickets, areas } = useNexus();

  const myArea = areas.find((a) => a.manager?.id === currentUser.id) || areas[0];
  const myObligations = obligations.filter((o) => o.area_id === myArea?.id);
  const myTasks = tasks.filter((t) => t.assigned_to_id === currentUser.id || t.area_id === myArea?.id);
  const myTickets = tickets.filter((t) => t.created_by_id === currentUser.id || t.area_id === myArea?.id);

  const pendingObligationsCount = myObligations.filter((o) => o.active).length;
  const openTasksCount = myTasks.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const openTicketsCount = myTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-5 font-sans">
      {/* Personal greeting header */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] font-extrabold text-base flex items-center justify-center shrink-0 border border-[#D5E0D7] dark:border-[#1E3125]">
            {currentUser.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-base font-bold text-[#111D15] dark:text-slate-100">
                Olá, {currentUser.name.split(' ')[0]}!
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] text-[10px] font-bold border border-[#D5E0D7] dark:border-[#1E3125]">
                {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
              </span>
            </div>
            <p className="text-xs text-[#3B4F43] dark:text-slate-400 mt-0.5">
              {myArea?.name || currentUser.department} • Matrícula{' '}
              <span className="font-mono font-bold text-[#1B3026] dark:text-[#76B38B]">MAT-0001</span>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenTicketModal}
            className="px-4 py-2 bg-[#EEF2EE] dark:bg-[#17261D] hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] text-[#111D15] dark:text-slate-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-[#D5E0D7] dark:border-[#1E3125] cursor-pointer shadow-2xs"
          >
            <Ticket className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
            <span>Abrir Chamado</span>
          </button>
          <button
            onClick={onOpenDelegateModal}
            className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Delegar Tarefa</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow card-shadow-hover transition-all flex flex-col justify-between min-h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">Rituais do Meu Setor</span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-[#1B3026] dark:text-[#76B38B]" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#111D15] dark:text-slate-100 mt-2 leading-none">
              {pendingObligationsCount} <span className="text-base font-semibold text-[#5E7567]">Rituais</span>
            </h3>
            <p className="text-xs text-[#5E7567] dark:text-slate-500 mt-1 font-medium">Limite diário: 17:00</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow card-shadow-hover transition-all flex flex-col justify-between min-h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">Minhas Tarefas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#111D15] dark:text-slate-100 mt-2 leading-none">
              {openTasksCount} <span className="text-base font-semibold text-[#5E7567]">Pendentes</span>
            </h3>
            <p className="text-xs text-[#5E7567] dark:text-slate-500 mt-1 font-medium">Acompanhamento em tempo real</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow card-shadow-hover transition-all flex flex-col justify-between min-h-[110px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">Chamados de Suporte</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#111D15] dark:text-slate-100 mt-2 leading-none">
              {openTicketsCount} <span className="text-base font-semibold text-[#5E7567]">Em Aberto</span>
            </h3>
            <p className="text-xs text-[#5E7567] dark:text-slate-500 mt-1 font-medium">SLA monitorado</p>
          </div>
        </div>
      </div>

      {/* Core Content: Obligations + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Rituals */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl card-shadow">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
            <div>
              <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                Rituais Diários
              </h3>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">{myArea?.name}</p>
            </div>
            <Link href="/obligations" className="text-xs font-bold text-[#1B3026] dark:text-[#76B38B] flex items-center hover:underline">
              Ver Rituais <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {myObligations.length === 0 ? (
              <p className="py-8 text-center text-[#5E7567] text-xs font-semibold">
                Nenhum ritual cadastrado para esta área.
              </p>
            ) : (
              myObligations.map((ob) => (
                <div key={ob.id} className="flex items-start space-x-3 p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
                  <div className="w-5 h-5 rounded-full border-2 border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#2C6E49] dark:bg-[#76B38B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#111D15] dark:text-slate-100 truncate">{ob.title}</p>
                    <p className="text-[11px] text-[#3B4F43] dark:text-slate-400 mt-0.5 line-clamp-1">{ob.description}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1B3026] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2.5 py-0.5 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125] shrink-0">
                    {ob.due_time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl card-shadow">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
            <div>
              <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                Minhas Tarefas
              </h3>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">Demandas sob sua responsabilidade</p>
            </div>
            <Link href="/tasks" className="text-xs font-bold text-[#1B3026] dark:text-[#76B38B] flex items-center hover:underline">
              Ir para Tarefas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {myTasks.length === 0 ? (
              <p className="py-8 text-center text-[#5E7567] text-xs font-semibold">
                Nenhuma tarefa atribuída no momento.
              </p>
            ) : (
              myTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold text-[#1B3026] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2.5 py-0.5 rounded-md border border-[#D5E0D7] dark:border-[#1E3125]">
                      {task.code || 'TASK-0000'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      task.status === 'OPEN' ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/20 dark:text-amber-400' :
                      task.status === 'IN_PROGRESS' ? 'bg-[#EEF2EE] text-[#2C6E49] border border-[#D5E0D7] dark:bg-[#1C2E24] dark:text-[#76B38B]' :
                      'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#111D15] dark:text-slate-100 truncate">{task.title}</p>
                  <p className="text-[11px] text-[#3B4F43] dark:text-slate-400 line-clamp-1">{task.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
