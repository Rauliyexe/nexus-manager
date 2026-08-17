'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
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
    <div className="space-y-3 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded shadow-xs">
        <div>
          <h1 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            Central de Alertas Operacionais
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Registro de ocorrências críticas, atenção e pendências de fechamento.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="OPEN">Abertos</option>
            <option value="ACKNOWLEDGED">Em Análise</option>
            <option value="RESOLVED">Resolvidos</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Todas as Prioridades</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded shadow-xs divide-y divide-slate-800">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono">
            Nenhum alerta encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const area = areas.find((a) => a.id === alt.area_id);

            return (
              <div key={alt.id} className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
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

                    <h3 className="font-bold text-slate-100">{alt.title}</h3>

                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
                      Prioridade: {alt.priority}
                    </span>
                  </div>

                  <p className="text-slate-300 font-sans leading-relaxed pl-3.5">
                    {alt.description}
                  </p>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono pl-3.5 pt-0.5">
                    <span>Área: <strong className="text-slate-400">{area?.name}</strong></span>
                    <span>Gestor: <strong className="text-slate-400">{area?.manager?.name}</strong></span>
                    <span>
                      {new Date(alt.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {alt.status === 'OPEN' && (
                    <button
                      onClick={() => acknowledgeAlert(alt.id)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                    >
                      Ciente
                    </button>
                  )}

                  {alt.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => resolveAlert(alt.id)}
                      className="px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 rounded border border-slate-700"
                    >
                      Marcar Resolvido
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-slate-950 text-emerald-400 border border-slate-800 font-mono">
                      <Check className="w-3 h-3 mr-1" />
                      Resolvido
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
