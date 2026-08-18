'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  MessageSquare,
  Calendar,
  BadgeCheck,
  ChevronRight,
  List,
  LayoutGrid,
  ArrowUpDown,
  User,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { TaskStatus } from '@/lib/types/nexus';

interface TaskRegistryBoardProps {
  onOpenDelegateModal: () => void;
}

export const TaskRegistryBoard: React.FC<TaskRegistryBoardProps> = ({
  onOpenDelegateModal,
}) => {
  const { tasks, areas, setActivePopUpTask } = useNexus();

  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'COMPACT' | 'CARDS'>('COMPACT');

  const totalCount = tasks.length;
  const openCount = tasks.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const blockedCount = tasks.filter((t) => t.status === 'BLOCKED').length;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (areaFilter !== 'ALL' && t.area_id !== areaFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchBy = t.delegated_by_name.toLowerCase().includes(q);
      const matchTo = (t.assigned_to_name || '').toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchBy && !matchTo && !matchCode) return false;
    }
    return true;
  });

  const formatShortDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }) + ' ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatExactDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-900 whitespace-nowrap">
            ⚡ Crítica
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-900 whitespace-nowrap">
            ▲ Alta
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EEF2EE] text-[#2C6E49] dark:bg-[#1C2E24] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] whitespace-nowrap">
            ◼ Média
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#EEF2EE] text-[#5E7567] dark:bg-[#0B120E] dark:text-slate-400 border border-[#D5E0D7] dark:border-[#1E3125] whitespace-nowrap">
            ▼ Baixa
          </span>
        );
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E5EDE6] text-[#143D24] dark:bg-[#1C2E24] dark:text-[#76B38B] border border-[#C5DBCB] dark:border-[#1E3125] flex items-center space-x-1 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>Concluída</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EEF2EE] text-[#1B3026] dark:bg-[#1C2E24] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] flex items-center space-x-1 shrink-0">
            <PlayCircle className="w-3 h-3 text-[#2C6E49]" />
            <span>Em Andamento</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center space-x-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            <span>Impedida</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 flex items-center space-x-1 shrink-0">
            <Clock className="w-3 h-3" />
            <span>Em Aberto</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Action & Status Filter Header */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-4 card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E0D7] dark:border-[#1E3125] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base font-bold text-[#111D15] dark:text-slate-100">
                Cadastro Central de Tarefas Delegadas
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[10px] font-bold">
                {totalCount} REGISTROS
              </span>
            </div>
            <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-1">
              Rastreamento operacional com IDs sequenciais, status auditável e responsáveis vinculados
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Mode Toggle: Lista Compacta vs Cards */}
            <div className="flex items-center bg-[#EEF2EE] dark:bg-[#0B120E] p-1 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
              <button
                onClick={() => setViewMode('COMPACT')}
                title="Visualização em Lista Compacta"
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold ${
                  viewMode === 'COMPACT'
                    ? 'bg-white dark:bg-[#1C2E24] text-[#111D15] dark:text-slate-100 shadow-2xs'
                    : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-slate-200'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Lista</span>
              </button>

              <button
                onClick={() => setViewMode('CARDS')}
                title="Visualização em Cards Detalhados"
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold ${
                  viewMode === 'CARDS'
                    ? 'bg-white dark:bg-[#1C2E24] text-[#111D15] dark:text-slate-100 shadow-2xs'
                    : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <button
              onClick={onOpenDelegateModal}
              className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Delegar Nova Tarefa</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-[#1B3026] text-white border-[#1B3026] shadow-xs'
                  : 'bg-[#EEF2EE] dark:bg-[#0B120E] text-[#3B4F43] dark:text-slate-300 border-[#D5E0D7] dark:border-[#1E3125] hover:border-[#1B3026]'
              }`}
            >
              Todas ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'OPEN'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/40 hover:border-amber-500'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Abertas ({openCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-[#2C6E49] text-white border-[#2C6E49] shadow-xs'
                  : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border-[#D5E0D7] dark:border-[#1E3125] hover:border-[#2C6E49]'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Em Andamento ({inProgressCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'COMPLETED'
                  ? 'bg-[#143D24] text-white border-[#143D24] shadow-xs'
                  : 'bg-[#E5EDE6] dark:bg-[#14261B] text-[#143D24] dark:text-[#76B38B] border-[#D5E0D7] dark:border-[#1E3125] hover:border-[#143D24]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluídas ({completedCount})</span>
            </button>
            {blockedCount > 0 && (
              <button
                onClick={() => setStatusFilter('BLOCKED')}
                className={`px-3 py-1.5 rounded-xl border font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'BLOCKED'
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:border-rose-500'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Impedidas ({blockedCount})</span>
              </button>
            )}
          </div>

          {/* Search & Area Select */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID, título, responsável..."
                className="w-full pl-8 pr-3 py-2 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] text-xs focus:outline-none focus:border-[#1B3026] transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-[#5E7567] absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-3 py-2 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-[#111D15] dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#1B3026] cursor-pointer transition-colors"
            >
              <option value="ALL">Todos os Setores</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-2 card-shadow">
          <CheckSquare className="w-10 h-10 text-[#5E7567] mx-auto opacity-40" />
          <p className="text-[#3B4F43] dark:text-slate-400 text-sm font-semibold">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </p>
        </div>
      ) : viewMode === 'COMPACT' ? (
        /* COMPACT LIST VIEW (Organizada e Compacta) */
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden">
          {/* Header Strip for Desktop */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-[#EEF2EE] dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] text-[10px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
            <div className="col-span-2">Código / Status</div>
            <div className="col-span-4">Título & Setor</div>
            <div className="col-span-2">Prioridade</div>
            <div className="col-span-2">Responsável</div>
            <div className="col-span-2 text-right">Data / Ações</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
            {filteredTasks.map((task) => {
              const taskCodeFormatted = task.code || `TASK-${task.id.replace('task-', '').padStart(4, '0')}`;
              return (
                <div
                  key={task.id}
                  onClick={() => setActivePopUpTask(task)}
                  className="px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors cursor-pointer group flex flex-col md:grid md:grid-cols-12 gap-2.5 md:gap-3 items-start md:items-center"
                >
                  {/* Col 1: ID & Status (Mobile: Header bar) */}
                  <div className="col-span-2 flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
                    <span className="px-2 py-0.5 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] font-mono font-extrabold text-xs shrink-0">
                      {taskCodeFormatted}
                    </span>
                    {getStatusBadge(task.status)}
                  </div>

                  {/* Col 2: Title & Area */}
                  <div className="col-span-4 min-w-0 w-full">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#111D15] dark:text-slate-100 group-hover:text-[#1B3026] dark:group-hover:text-[#76B38B] transition-colors truncate">
                        {task.title}
                      </h4>
                      <span className="text-[9px] font-bold text-[#3B4F43] dark:text-slate-300 px-1.5 py-0.5 bg-[#EEF2EE] dark:bg-[#0B120E] rounded border border-[#D5E0D7] dark:border-[#1E3125] shrink-0 hidden sm:inline-block">
                        {task.area_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5E7567] dark:text-slate-400 truncate mt-0.5 hidden md:block">
                      {task.description}
                    </p>
                  </div>

                  {/* Col 3: Priority */}
                  <div className="col-span-2 flex items-center space-x-2">
                    {getPriorityBadge(task.priority)}
                    <span className="text-[10px] font-semibold text-[#5E7567] md:hidden">
                      {task.area_name}
                    </span>
                  </div>

                  {/* Col 4: Responsible Person */}
                  <div className="col-span-2 flex items-center space-x-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] font-bold text-[10px] flex items-center justify-center border border-[#D5E0D7] dark:border-[#1E3125] shrink-0">
                      {getInitials(task.assigned_to_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111D15] dark:text-slate-200 truncate">
                        {task.assigned_to_name || 'Setor Completo'}
                      </p>
                      <p className="text-[9px] text-[#5E7567] dark:text-slate-400 truncate">
                        Por: {task.delegated_by_name.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  {/* Col 5: Date & Quick Action */}
                  <div className="col-span-2 flex items-center justify-between md:justify-end space-x-3 w-full md:w-auto pt-1 md:pt-0 border-t md:border-t-0 border-[#D5E0D7]/60 dark:border-[#1E3125]">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#5E7567] dark:text-slate-400 block font-medium">
                        {formatShortDate(task.created_at)}
                      </span>
                      {task.comments.length > 0 && (
                        <span className="text-[9px] text-[#2C6E49] dark:text-[#76B38B] font-bold flex items-center md:justify-end space-x-0.5">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>{task.comments.length}</span>
                        </span>
                      )}
                    </div>

                    <div className="p-1 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] group-hover:bg-[#1B3026] group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DETAILED CARDS VIEW (Visual em Grade) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const taskCodeFormatted = task.code || `TASK-${task.id.replace('task-', '').padStart(4, '0')}`;
            return (
              <div
                key={task.id}
                onClick={() => setActivePopUpTask(task)}
                className="p-5 bg-white dark:bg-[#121D16] hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] border border-[#D5E0D7] dark:border-[#1E3125] hover:border-[#1B3026]/40 rounded-2xl space-y-3.5 cursor-pointer transition-all card-shadow card-shadow-hover group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Row: Sequential ID + Status + Priority */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#D5E0D7] dark:border-[#1E3125] pb-3">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="px-2.5 py-1 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] font-mono font-extrabold text-xs tracking-wider shrink-0">
                        {taskCodeFormatted}
                      </span>
                      {getStatusBadge(task.status)}
                      <span className="text-[10px] font-bold text-[#3B4F43] dark:text-slate-300 px-2 py-0.5 bg-[#EEF2EE] dark:bg-[#0B120E] rounded-lg border border-[#D5E0D7] dark:border-[#1E3125] truncate">
                        {task.area_name}
                      </span>
                    </div>
                    {getPriorityBadge(task.priority)}
                  </div>

                  {/* Title & Exact Timestamp */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 group-hover:text-[#1B3026] dark:group-hover:text-[#76B38B] transition-colors line-clamp-1">
                      {task.title}
                    </h3>
                    <p className="text-xs text-[#3B4F43] dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                    <div className="text-[11px] text-[#5E7567] dark:text-slate-400 flex items-center space-x-1.5 pt-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#5E7567]" />
                      <span>Criação / Registro:</span>
                      <strong className="text-[#111D15] dark:text-slate-200 font-bold">{formatExactDateTime(task.created_at)}</strong>
                    </div>
                  </div>

                  {/* Employee Badges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1">
                    {/* Initiator Staff Card */}
                    <div className="p-3 bg-[#EEF2EE] dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] space-y-1.5">
                      <div className="text-[9px] text-[#5E7567] dark:text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>CRIADO / DELEGADO POR</span>
                        <span className="text-[#1B3026] dark:text-[#76B38B] font-mono font-bold">{task.delegated_by_code || 'MAT-0001'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-[#E5EDE6] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] font-bold text-xs flex items-center justify-center border border-[#D5E0D7] dark:border-[#1E3125] shrink-0">
                          {getInitials(task.delegated_by_name)}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-[#111D15] dark:text-slate-100 text-xs truncate block">
                            {task.delegated_by_name}
                          </strong>
                          <span className="text-[#3B4F43] dark:text-slate-400 text-[10px] truncate block font-medium">
                            {task.delegated_by_role || 'Direção / Gestão'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Executor Staff Card */}
                    <div className="p-3 bg-[#EEF2EE] dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] space-y-1.5">
                      <div className="text-[9px] text-[#5E7567] dark:text-slate-400 uppercase font-bold flex items-center justify-between">
                        <span>ATRIBUÍDO A / EXECUTANDO</span>
                        <span className="text-[#1B3026] dark:text-[#76B38B] font-mono font-bold">{task.assigned_to_code || 'MAT-0104'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-[#E5EDE6] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] font-bold text-xs flex items-center justify-center border border-[#D5E0D7] dark:border-[#1E3125] shrink-0">
                          {getInitials(task.assigned_to_name)}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-[#111D15] dark:text-slate-100 text-xs truncate block">
                            {task.assigned_to_name || 'Setor Completo'}
                          </strong>
                          <span className="text-[#3B4F43] dark:text-slate-400 text-[10px] truncate block font-medium">
                            {task.assigned_to_role || 'Responsável Operacional'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* If Completed: Finalizer Card */}
                  {task.status === 'COMPLETED' && (
                    <div className="p-3 bg-[#E5EDE6] dark:bg-[#1C2E24] rounded-xl border border-[#C5DBCB] dark:border-[#1E3125] text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-[#143D24] dark:text-[#76B38B] font-bold">
                        <span className="flex items-center space-x-1">
                          <BadgeCheck className="w-4 h-4" />
                          <span>FINALIZADO E AUDITADO</span>
                        </span>
                        <span className="text-[10px] font-mono">
                          {formatExactDateTime(task.completed_at || task.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#3B4F43] dark:text-slate-300 pt-0.5">
                        <span>Finalizado por: <strong className="text-[#111D15] dark:text-white">{task.completed_by_name || task.assigned_to_name || 'Analista Nexus'}</strong></span>
                        <span className="text-[#5E7567] dark:text-slate-400 font-medium">({task.completed_by_role || 'Gestor Responsável'})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Footer Info */}
                <div className="pt-3 border-t border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between text-xs text-[#3B4F43] dark:text-slate-400 mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1.5 text-[#3B4F43] dark:text-slate-300 bg-[#EEF2EE] dark:bg-[#0B120E] px-2.5 py-1 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125] font-semibold text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
                      <span>{task.comments.length} observações</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-[#1B3026] dark:text-[#76B38B] font-bold group-hover:underline text-xs">
                    <span>Abrir Ficha</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
