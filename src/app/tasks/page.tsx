'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Ticket,
  Plus,
  Search,
  Laptop,
  Wrench,
  ShieldAlert,
  Users,
  PackageCheck,
  HelpCircle,
  List,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { TaskRegistryBoard } from '@/components/hub/TaskRegistryBoard';
import { DelegateTaskModal } from '@/components/modals/DelegateTaskModal';
import { OpenTicketModal } from '@/components/modals/OpenTicketModal';
import { TaskDetailsPopUpModal } from '@/components/modals/TaskDetailsPopUpModal';
import { TicketStatus, SupportTicket } from '@/lib/types/nexus';

export default function TasksPage() {
  const { tickets, updateTicketStatus, activePopUpTask, setActivePopUpTask } = useNexus();

  const [activeSection, setActiveSection] = useState<'TASKS' | 'TICKETS'>('TASKS');
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketFilterStatus, setTicketFilterStatus] = useState<'ALL' | TicketStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketViewMode, setTicketViewMode] = useState<'COMPACT' | 'CARDS'>('COMPACT');

  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilterStatus !== 'ALL' && t.status !== ticketFilterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      const matchBy = t.created_by_name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCode && !matchBy) return false;
    }
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'TI_SUPPORTE':
        return <Laptop className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />;
      case 'MANUTENCAO':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      case 'SEGURANCA':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      case 'SUPRIMENTOS':
        return <PackageCheck className="w-3.5 h-3.5 text-[#2C6E49]" />;
      case 'RH_PESSOAS':
        return <Users className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-[#5E7567]" />;
    }
  };

  return (
    <div className="space-y-5 font-sans p-4 sm:p-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Tarefas & Chamados Operacionais
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · OPERAÇÃO
            </span>
          </div>
          <p className="text-sm text-[#3B4F43] dark:text-slate-400 mt-0.5">
            Gestão permanente de tarefas delegadas e chamados de suporte #INC
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-2 bg-white dark:bg-[#121D16] hover:bg-[#EEF2EE] dark:hover:bg-[#17261D] text-[#111D15] dark:text-slate-100 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-[#D5E0D7] dark:border-[#1E3125] cursor-pointer shadow-xs"
          >
            <Ticket className="w-4 h-4 text-[#1B3026] dark:text-[#76B38B]" />
            <span>Abrir Chamado #INC</span>
          </button>

          <button
            onClick={() => setIsDelegateModalOpen(true)}
            className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Delegar Tarefa</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-[#121D16] p-1.5 rounded-2xl border border-[#D5E0D7] dark:border-[#1E3125] text-xs font-semibold w-fit card-shadow">
        <button
          onClick={() => setActiveSection('TASKS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeSection === 'TASKS'
              ? 'bg-[#1B3026] text-white shadow-xs'
              : 'text-[#3B4F43] dark:text-slate-400 hover:text-[#111D15] dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className={`w-4 h-4 ${activeSection === 'TASKS' ? 'text-[#76B38B]' : 'text-[#1B3026]'}`} />
          <span>Tarefas Delegadas</span>
        </button>

        <button
          onClick={() => setActiveSection('TICKETS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-2 relative ${
            activeSection === 'TICKETS'
              ? 'bg-[#1B3026] text-white shadow-xs'
              : 'text-[#3B4F43] dark:text-slate-400 hover:text-[#111D15] dark:hover:text-slate-200'
          }`}
        >
          <Ticket className={`w-4 h-4 ${activeSection === 'TICKETS' ? 'text-[#76B38B]' : 'text-[#1B3026]'}`} />
          <span>Chamados (#INC)</span>
          {openTicketsCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] rounded-full bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-bold">
              {openTicketsCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Section Content */}
      {activeSection === 'TASKS' ? (
        <TaskRegistryBoard onOpenDelegateModal={() => setIsDelegateModalOpen(true)} />
      ) : (
        /* Central de Chamados */
        <div className="space-y-4">
          {/* Ticket Filter Bar */}
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-3.5 card-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs">
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketFilterStatus(st)}
                    className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer whitespace-nowrap ${
                      ticketFilterStatus === st
                        ? 'bg-[#1B3026] text-white border-[#1B3026] shadow-xs'
                        : 'bg-[#EEF2EE] dark:bg-[#0B120E] text-[#3B4F43] dark:text-slate-400 border-[#D5E0D7] dark:border-[#1E3125] hover:border-[#1B3026]'
                    }`}
                  >
                    {st === 'ALL' ? `Todos (${tickets.length})` : st === 'OPEN' ? 'Abertos' : st === 'IN_PROGRESS' ? 'Em Atendimento' : 'Resolvidos'}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-[#EEF2EE] dark:bg-[#0B120E] p-1 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
                  <button
                    onClick={() => setTicketViewMode('COMPACT')}
                    title="Lista Compacta"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold ${
                      ticketViewMode === 'COMPACT'
                        ? 'bg-white dark:bg-[#1C2E24] text-[#111D15] dark:text-slate-100 shadow-2xs'
                        : 'text-[#5E7567] hover:text-[#111D15]'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </button>

                  <button
                    onClick={() => setTicketViewMode('CARDS')}
                    title="Cards Detalhados"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1 text-xs font-bold ${
                      ticketViewMode === 'CARDS'
                        ? 'bg-white dark:bg-[#1C2E24] text-[#111D15] dark:text-slate-100 shadow-2xs'
                        : 'text-[#5E7567] hover:text-[#111D15]'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>

                <div className="relative md:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar chamado por #INC ou título..."
                    className="w-full pl-8 pr-3 py-2 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] text-xs focus:outline-none focus:border-[#1B3026] transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-[#5E7567] absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List View */}
          {ticketViewMode === 'COMPACT' ? (
            <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-[#EEF2EE] dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] text-[10px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
                <div className="col-span-2">Código / Categoria</div>
                <div className="col-span-5">Título & Descrição</div>
                <div className="col-span-2">Prioridade</div>
                <div className="col-span-3 text-right">Solicitante / Ação</div>
              </div>

              <div className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
                {filteredTickets.map((ticket: SupportTicket) => (
                  <div
                    key={ticket.id}
                    className="px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors flex flex-col md:grid md:grid-cols-12 gap-2.5 md:gap-3 items-start md:items-center"
                  >
                    {/* Code & Category */}
                    <div className="col-span-2 flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] font-mono font-extrabold text-xs shrink-0">
                        {ticket.code || '#INC-0001'}
                      </span>
                      <span className="flex items-center space-x-1 text-xs font-semibold text-[#3B4F43] dark:text-slate-300">
                        {getCategoryIcon(ticket.category)}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div className="col-span-5 min-w-0 w-full">
                      <h4 className="text-xs sm:text-sm font-bold text-[#111D15] dark:text-slate-100 truncate">
                        {ticket.title}
                      </h4>
                      <p className="text-[11px] text-[#5E7567] dark:text-slate-400 truncate mt-0.5">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          ticket.priority === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                            : ticket.priority === 'HIGH'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                            : ticket.priority === 'MEDIUM'
                            ? 'bg-[#EEF2EE] text-[#2C6E49] border-[#D5E0D7] dark:bg-[#1C2E24] dark:text-[#76B38B] dark:border-[#1E3125]'
                            : 'bg-[#EEF2EE] text-[#3B4F43] border-[#D5E0D7] dark:bg-[#0B120E] dark:text-slate-400 dark:border-[#1E3125]'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>

                    {/* Requester & Action */}
                    <div className="col-span-3 flex items-center justify-between md:justify-end space-x-3 w-full md:w-auto">
                      <span className="text-xs text-[#5E7567] dark:text-slate-400 truncate">
                        Por: <strong className="text-[#111D15] dark:text-slate-200">{ticket.created_by_name}</strong>
                      </span>
                      <button
                        onClick={() => updateTicketStatus(ticket.id, ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : 'RESOLVED')}
                        className="px-3 py-1 bg-[#EEF2EE] dark:bg-[#0B120E] hover:bg-[#D5E0D7] dark:hover:bg-[#1E3125] text-[#111D15] dark:text-slate-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border border-[#D5E0D7] dark:border-[#1E3125] shrink-0"
                      >
                        {ticket.status === 'RESOLVED' ? 'Reabrir' : 'Concluir'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map((ticket: SupportTicket) => (
                <div
                  key={ticket.id}
                  className="p-5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-3.5 card-shadow flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] font-mono font-extrabold text-xs">
                          {ticket.code || '#INC-0001'}
                        </span>
                        <span className="flex items-center space-x-1 text-xs font-semibold text-[#3B4F43] dark:text-slate-300">
                          {getCategoryIcon(ticket.category)}
                          <span>{ticket.category}</span>
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold ${
                          ticket.priority === 'CRITICAL'
                            ? 'text-rose-700 dark:text-rose-400'
                            : ticket.priority === 'HIGH'
                            ? 'text-amber-700 dark:text-amber-400'
                            : ticket.priority === 'MEDIUM'
                            ? 'text-[#2C6E49] dark:text-[#76B38B]'
                            : 'text-[#3B4F43] dark:text-slate-400'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100">
                      {ticket.title}
                    </h3>
                    <p className="text-xs text-[#3B4F43] dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between text-xs text-[#5E7567] dark:text-slate-400">
                    <span>Por: <strong className="text-[#111D15] dark:text-slate-200">{ticket.created_by_name}</strong></span>
                    <button
                      onClick={() => updateTicketStatus(ticket.id, ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : 'RESOLVED')}
                      className="px-3 py-1 bg-[#EEF2EE] dark:bg-[#0B120E] hover:bg-[#D5E0D7] dark:hover:bg-[#1E3125] text-[#111D15] dark:text-slate-200 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border border-[#D5E0D7] dark:border-[#1E3125]"
                    >
                      {ticket.status === 'RESOLVED' ? 'Reabrir' : 'Concluir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração • Registro e delegação de tarefas operacionais para apresentação à diretoria</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP OPERATIONS</span>
      </div>

      {/* Modals */}
      <DelegateTaskModal
        isOpen={isDelegateModalOpen}
        onClose={() => setIsDelegateModalOpen(false)}
      />

      <OpenTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      <TaskDetailsPopUpModal
        task={activePopUpTask}
        onClose={() => setActivePopUpTask(null)}
      />
    </div>
  );
}
