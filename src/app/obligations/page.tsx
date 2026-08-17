'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2, CheckCircle2, Circle } from 'lucide-react';
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
    <div className="space-y-3 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded shadow-xs">
        <div>
          <h1 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            Obrigações Operacionais da Nexus
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rotinas diárias, semanais e mensais por área responsável.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Obrigação</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Buscar obrigação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        <select
          value={selectedAreaFilter}
          onChange={(e) => setSelectedAreaFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none font-mono"
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
          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none font-mono"
        >
          <option value="ALL">Todas as Frequências</option>
          <option value="DIARIA">Diária</option>
          <option value="SEMANAL">Semanal</option>
          <option value="MENSAL">Mensal</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono uppercase text-slate-500">
              <th className="py-2.5 px-3 text-center">Ativa</th>
              <th className="py-2.5 px-3">Título da Obrigação</th>
              <th className="py-2.5 px-3">Área Responsável</th>
              <th className="py-2.5 px-3 text-center">Frequência</th>
              <th className="py-2.5 px-3 font-mono">Horário Limite</th>
              <th className="py-2.5 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredObligations.map((ob) => {
              const obArea = areas.find((a) => a.id === ob.area_id);
              return (
                <tr key={ob.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => toggleObligationActive(ob.id)}
                      title="Alternar Ativo/Inativo"
                    >
                      {ob.active ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline-block" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600 inline-block" />
                      )}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    <div>
                      <p>{ob.title}</p>
                      {ob.description && (
                        <p className="text-[11px] text-slate-400 font-normal">{ob.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-medium">{obArea?.name || 'N/A'}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
                      {ob.frequency}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{ob.due_time}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => deleteObligation(ob.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Excluir Obrigação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded w-full max-w-md p-4 space-y-3 shadow-xl text-xs">
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
              Criar Nova Obrigação
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Conciliação bancária diária"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhamento operacional da rotina..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Área</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Frequência</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none font-mono"
                  >
                    <option value="DIARIA">Diária</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSAL">Mensal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Horário Limite</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded border border-slate-700"
                >
                  Salvar Obrigação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
