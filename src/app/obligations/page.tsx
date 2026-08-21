'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2, CheckCircle2, Circle, FolderOpen } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export default function ObligationsPage() {
  const { obligations, areas, profiles, createObligation, toggleObligationActive, deleteObligation } = useNexus();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('ALL');
  const [selectedFrequencyFilter, setSelectedFrequencyFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState(areas[0]?.id || 'area-1');
  const [frequency, setFrequency] = useState<'DIARIA' | 'SEMANAL' | 'MENSAL'>('DIARIA');
  const [dueTime, setDueTime] = useState('17:00');
  const [responsibleUserId, setResponsibleUserId] = useState(profiles[0]?.id || '');

  const filteredObligations = obligations.filter((ob) => {
    const matchesSearch = ob.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedAreaFilter === 'ALL' || ob.area_id === selectedAreaFilter;
    const matchesFreq = selectedFrequencyFilter === 'ALL' || ob.frequency === selectedFrequencyFilter;
    return matchesSearch && matchesArea && matchesFreq;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createObligation({
      title: title.trim(),
      description: description.trim(),
      area_id: areaId,
      frequency,
      due_time: dueTime,
      responsible_user_id: responsibleUserId,
      active: true,
    });

    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const [viewMode, setViewMode] = useState<'KANBAN_SECTOR' | 'TABLE'>('KANBAN_SECTOR');

  const totalActive = obligations.filter((o) => o.active).length;
  const dailyCount = obligations.filter((o) => o.frequency === 'DIARIA').length;
  const weeklyCount = obligations.filter((o) => o.frequency === 'SEMANAL').length;
  const biweeklyCount = obligations.filter((o) => o.frequency === 'QUINZENAL').length;
  const monthlyCount = obligations.filter((o) => o.frequency === 'MENSAL').length;

  // Agrupamento por Setor
  const obligationsByArea = areas
    .map((area) => {
      const areaObs = filteredObligations.filter((o) => o.area_id === area.id);
      return {
        area,
        obligations: areaObs,
      };
    })
    .filter((g) => selectedAreaFilter === 'ALL' || g.area.id === selectedAreaFilter);

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans p-4 sm:p-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Gestão de Tarefas & Rotinas Periódicas
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              YGGDRON ROADMAP
            </span>
          </div>
          <p className="text-sm text-[#5E7567] dark:text-slate-400 mt-0.5">
            Organização central de tarefas delegadas, rotinas matinais e entregas recorrentes por setor
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="bg-[#EEF2EE] dark:bg-[#121D16] p-1 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] flex items-center space-x-1 text-xs">
            <button
              onClick={() => setViewMode('KANBAN_SECTOR')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'KANBAN_SECTOR'
                  ? 'bg-white dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] shadow-2xs'
                  : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-white'
              }`}
            >
              Visão por Setor
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] shadow-2xs'
                  : 'text-[#5E7567] hover:text-[#111D15] dark:hover:text-white'
              }`}
            >
              Lista Geral
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl space-y-1 card-shadow">
          <span className="text-[10px] font-mono text-[#5E7567] dark:text-slate-400 block font-bold uppercase">TOTAL ATIVAS</span>
          <p className="text-xl font-black font-mono text-[#1B3026] dark:text-[#76B38B]">{totalActive} / {obligations.length}</p>
          <p className="text-[10px] text-slate-400">Em monitoramento</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl space-y-1 card-shadow">
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold uppercase">DIÁRIAS (MANHÃ)</span>
          <p className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">{dailyCount}</p>
          <p className="text-[10px] text-slate-400">Rotinas matinais</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl space-y-1 card-shadow">
          <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 block font-bold uppercase">SEMANAIS</span>
          <p className="text-xl font-black font-mono text-blue-700 dark:text-blue-400">{weeklyCount}</p>
          <p className="text-[10px] text-slate-400">Entregas de sexta</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl space-y-1 card-shadow">
          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block font-bold uppercase">QUINZENAIS</span>
          <p className="text-xl font-black font-mono text-purple-700 dark:text-purple-400">{biweeklyCount}</p>
          <p className="text-[10px] text-slate-400">Vistorias de lote</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl space-y-1 card-shadow col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 block font-bold uppercase">MENSAIS</span>
          <p className="text-xl font-black font-mono text-amber-700 dark:text-amber-400">{monthlyCount}</p>
          <p className="text-[10px] text-slate-400">Fechamentos fiscais</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-3.5 rounded-2xl text-xs card-shadow">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#5E7567] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#111D15] dark:text-slate-200 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] font-medium transition-colors"
          />
        </div>

        <select
          value={selectedAreaFilter}
          onChange={(e) => setSelectedAreaFilter(e.target.value)}
          className="bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#111D15] dark:text-slate-200 focus:outline-none cursor-pointer transition-colors"
        >
          <option value="ALL">Todos os Setores ({areas.length})</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={selectedFrequencyFilter}
          onChange={(e) => setSelectedFrequencyFilter(e.target.value)}
          className="bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#111D15] dark:text-slate-200 focus:outline-none cursor-pointer transition-colors"
        >
          <option value="ALL">Todas as Frequências</option>
          <option value="DIARIA">Diárias (Manhã)</option>
          <option value="SEMANAL">Semanais</option>
          <option value="QUINZENAL">Quinzenais</option>
          <option value="MENSAL">Mensais</option>
        </select>
      </div>

      {/* VIEW 1: ORGANIZADA POR SETOR (CARDS AGRUPADOS) */}
      {viewMode === 'KANBAN_SECTOR' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {obligationsByArea.map(({ area, obligations: areaObs }) => (
            <div
              key={area.id}
              className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl overflow-hidden card-shadow"
            >
              {/* Sector Header Strip */}
              <div className="p-3.5 bg-[#EEF2EE] dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1B3026] dark:bg-[#76B38B]/20 text-white dark:text-[#76B38B] flex items-center justify-center font-bold text-xs">
                    {area.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#111D15] dark:text-slate-100">{area.name}</h3>
                    <p className="text-[10px] text-[#5E7567] dark:text-slate-400">
                      Gestor: {area.manager?.name || 'Não atribuído'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] font-mono text-[10px] font-bold border border-[#D5E0D7] dark:border-[#1E3125]">
                    {areaObs.filter((o) => o.active).length} / {areaObs.length} tarefas ativas
                  </span>
                </div>
              </div>

              {/* Tasks in Sector */}
              {areaObs.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-[#5E7567]">
                  Nenhuma tarefa periódica cadastrada para este setor.
                </div>
              ) : (
                <div className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
                  {areaObs.map((ob) => (
                    <div
                      key={ob.id}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors text-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleObligationActive(ob.id)}
                          className="mt-0.5 cursor-pointer text-[#2C6E49] shrink-0"
                          title="Alternar Ativo/Inativo"
                        >
                          {ob.active ? (
                            <CheckCircle2 className="w-4 h-4 text-[#2C6E49]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#8FA595]" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-bold text-xs text-[#111D15] dark:text-slate-100">{ob.title}</p>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${
                                ob.frequency === 'DIARIA'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : ob.frequency === 'SEMANAL'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                  : ob.frequency === 'QUINZENAL'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {ob.frequency === 'DIARIA'
                                ? 'Diária (Manhã)'
                                : ob.frequency === 'SEMANAL'
                                ? 'Semanal'
                                : ob.frequency === 'QUINZENAL'
                                ? 'Quinzenal'
                                : 'Mensal'}
                            </span>
                          </div>
                          {ob.description && (
                            <p className="text-[11px] text-[#5E7567] dark:text-slate-400 mt-0.5">
                              {ob.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-3 self-end sm:self-auto shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-[#8FA595] block">Horário Limite</span>
                          <span className="font-mono font-bold text-xs text-[#111D15] dark:text-slate-200">
                            {ob.due_time}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteObligation(ob.id)}
                          className="p-1.5 rounded-lg text-[#8FA595] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Excluir Tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: TABELA GERAL EXECUTIVA */}
      {viewMode === 'TABLE' && (
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden animate-in fade-in duration-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] text-[10px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
                <th className="py-3.5 px-4 text-center w-14">Ativa</th>
                <th className="py-3.5 px-4">Título da Tarefa</th>
                <th className="py-3.5 px-4">Setor Responsável</th>
                <th className="py-3.5 px-4 text-center">Frequência</th>
                <th className="py-3.5 px-4 font-mono">Horário Matinal / Limite</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
              {filteredObligations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5E7567] text-xs font-medium">
                    Nenhuma tarefa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredObligations.map((ob) => {
                  const obArea = areas.find((a) => a.id === ob.area_id);
                  return (
                    <tr key={ob.id} className="hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleObligationActive(ob.id)}
                          title="Alternar Ativo/Inativo"
                          className="cursor-pointer"
                        >
                          {ob.active ? (
                            <CheckCircle2 className="w-4 h-4 text-[#2C6E49] inline-block" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#8FA595] inline-block" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-sm text-[#111D15] dark:text-slate-100">{ob.title}</p>
                          {ob.description && (
                            <p className="text-xs text-[#3B4F43] dark:text-slate-400 mt-0.5">{ob.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#111D15] dark:text-slate-200 font-semibold">{obArea?.name || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          ob.frequency === 'DIARIA'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : ob.frequency === 'SEMANAL'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            : ob.frequency === 'QUINZENAL'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {ob.frequency === 'DIARIA' ? 'Diária (Manhã)' : ob.frequency === 'SEMANAL' ? 'Semanal' : ob.frequency === 'QUINZENAL' ? 'Quinzenal' : 'Mensal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#111D15] dark:text-slate-200">{ob.due_time}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteObligation(ob.id)}
                          className="p-1.5 rounded-lg text-[#5E7567] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Excluir Tarefa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs card-shadow">
            <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
              Delegar Nova Tarefa Periódica
            </h2>
            <p className="text-[11px] text-[#5E7567] dark:text-slate-400">
              Gerentes e Donos podem cadastrar tarefas recorrentes que aparecerão no início do dia no roadmap do setor.
            </p>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Vistoria matinal do forno e pressão dos cilindros"
                  className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-100 focus:outline-none focus:border-[#1B3026]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Instruções Operacionais</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhamento operacional da rotina que deve ser executada..."
                  className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-100 focus:outline-none focus:border-[#1B3026] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Setor Alocado</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-100 focus:outline-none font-semibold cursor-pointer"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Frequência</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-100 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="DIARIA">Diária (Todo dia de manhã)</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINZENAL">Quinzenal</option>
                    <option value="MENSAL">Mensal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Horário Previsto / Limite</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-100 focus:outline-none font-mono font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#D5E0D7] dark:border-[#1E3125]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-[#5E7567] hover:text-[#111D15] cursor-pointer font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Salvar Tarefa do Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Gestão de Tarefas • Tarefas operacionais sincronizadas com o roadmap do colaborador</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP OPERATIONAL TASKS</span>
      </div>
    </div>
  );
}
