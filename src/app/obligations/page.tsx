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

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans p-4 sm:p-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Documentos & Rituais Operacionais
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · RITUAIS
            </span>
          </div>
          <p className="text-sm text-[#5E7567] dark:text-slate-400 mt-0.5">
            Rotinas diárias, semanais e mensais por área responsável com controle de compliance
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Obrigação</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-4 rounded-2xl text-xs card-shadow">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#5E7567] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar obrigação por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl pl-9 pr-3 py-2 text-xs text-[#111D15] dark:text-slate-200 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] font-medium transition-colors"
          />
        </div>

        <select
          value={selectedAreaFilter}
          onChange={(e) => setSelectedAreaFilter(e.target.value)}
          className="bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-2 text-xs font-semibold text-[#111D15] dark:text-slate-200 focus:outline-none cursor-pointer transition-colors"
        >
          <option value="ALL">Todas as Áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={selectedFrequencyFilter}
          onChange={(e) => setSelectedFrequencyFilter(e.target.value)}
          className="bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-2 text-xs font-semibold text-[#111D15] dark:text-slate-200 focus:outline-none cursor-pointer transition-colors"
        >
          <option value="ALL">Todas as Frequências</option>
          <option value="DIARIA">Diária</option>
          <option value="SEMANAL">Semanal</option>
          <option value="MENSAL">Mensal</option>
        </select>
      </div>

      {/* Obligations Table */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] text-[10px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
              <th className="py-3.5 px-4 text-center w-14">Ativa</th>
              <th className="py-3.5 px-4">Título da Obrigação</th>
              <th className="py-3.5 px-4">Área Responsável</th>
              <th className="py-3.5 px-4 text-center">Frequência</th>
              <th className="py-3.5 px-4 font-mono">Horário Limite</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
            {filteredObligations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#5E7567] text-xs font-medium">
                  Nenhuma obrigação encontrada com os filtros selecionados.
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125]">
                        {ob.frequency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#111D15] dark:text-slate-200">{ob.due_time}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => deleteObligation(ob.id)}
                        className="p-1.5 rounded-lg text-[#5E7567] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                        title="Excluir Obrigação"
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs card-shadow">
            <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
              Criar Nova Obrigação
            </h2>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Conciliação bancária diária"
                  className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-100 focus:outline-none focus:border-[#1B3026]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Descrição</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhamento operacional da rotina..."
                  className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl p-2.5 text-[#111D15] dark:text-slate-100 focus:outline-none focus:border-[#1B3026] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Área</label>
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
                    <option value="DIARIA">Diária</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSAL">Mensal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#3B4F43] dark:text-slate-300">Horário Limite</label>
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
                  Salvar Obrigação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração • Obrigações e rituais operacionais simulados para apresentação à diretoria</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP COMPLIANCE</span>
      </div>
    </div>
  );
}
