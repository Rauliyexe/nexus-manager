'use client';

import React, { useState } from 'react';
import { Check, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export default function AlertsPage() {
  const { alerts, areas, acknowledgeAlert, resolveAlert } = useNexus();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filteredAlerts = alerts.filter((alt) => {
    const matchesStatus = statusFilter === 'ALL' || alt.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || alt.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans p-4 sm:p-6 pb-8">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Central de Alertas & Incidentes Operacionais
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · MONITORAMENTO
            </span>
          </div>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
            Registro consolidado de ocorrências críticas, atenção e pendências de rituais diários.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 font-mono">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-1.5 text-xs text-[#111D15] dark:text-slate-200 focus:outline-none focus:border-[#1B3026] cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="OPEN">Abertos</option>
            <option value="ACKNOWLEDGED">Em Análise</option>
            <option value="RESOLVED">Resolvidos</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-1.5 text-xs text-[#111D15] dark:text-slate-200 focus:outline-none focus:border-[#1B3026] cursor-pointer"
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow divide-y divide-[#D5E0D7] dark:divide-[#1E3125] overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-[#5E7567] dark:text-slate-500 text-xs font-mono">
            Nenhum alerta encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const area = areas.find((a) => a.id === alt.area_id);
            const isResolved = alt.status === 'RESOLVED';
            const isCritical = alt.type === 'CRITICAL' || alt.priority === 'CRITICAL';

            return (
              <div
                key={alt.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-colors ${
                  isResolved
                    ? 'opacity-60 bg-[#EEF2EE]/30 dark:bg-[#0B120E]/40'
                    : isCritical
                    ? 'bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40 dark:hover:bg-rose-950/20'
                    : 'hover:bg-[#F9FAF9] dark:hover:bg-[#17261D]'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <StatusIndicator
                      status={
                        alt.type === 'CRITICAL'
                          ? 'RED'
                          : alt.type === 'ATTENTION'
                          ? 'YELLOW'
                          : 'NO_RESPONSE'
                      }
                      size="sm"
                    />

                    <h3 className="font-bold text-[#111D15] dark:text-slate-100 text-xs sm:text-sm">
                      {alt.title}
                    </h3>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900'
                          : 'bg-[#EEF2EE] dark:bg-[#0B120E] text-[#3B4F43] dark:text-slate-300 border border-[#D5E0D7] dark:border-[#1E3125]'
                      }`}
                    >
                      Prioridade: {alt.priority}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-[#EEF2EE] dark:bg-[#0B120E] text-[#5E7567] dark:text-slate-400 border border-[#D5E0D7] dark:border-[#1E3125]">
                      Status: {alt.status}
                    </span>
                  </div>

                  <p className="text-[#3B4F43] dark:text-slate-300 leading-relaxed pl-4">
                    {alt.description}
                  </p>

                  <div className="flex items-center space-x-4 text-[10px] text-[#5E7567] dark:text-slate-400 font-mono pl-4 pt-1">
                    <span>
                      Área: <strong className="text-[#111D15] dark:text-slate-300">{area?.name || 'Geral'}</strong>
                    </span>
                    <span>
                      Gestor: <strong className="text-[#111D15] dark:text-slate-300">{area?.manager?.name || 'Não informado'}</strong>
                    </span>
                    <span>
                      {new Date(alt.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {alt.status === 'OPEN' && (
                    <button
                      onClick={() => acknowledgeAlert(alt.id)}
                      className="px-3 py-1.5 bg-[#EEF2EE] hover:bg-[#D5E0D7] dark:bg-[#1C2E24] dark:hover:bg-[#2A4A3C] text-[#1B3026] dark:text-[#76B38B] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reconhecer
                    </button>
                  )}

                  {alt.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveAlert(alt.id)}
                      className="px-3 py-1.5 bg-[#2C6E49] hover:bg-[#1B3026] text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolver</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração • Registro de alertas e simulação de resposta a incidentes operacionais</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP COMMAND CENTER</span>
      </div>
    </div>
  );
}
