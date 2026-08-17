'use client';

import React, { useState } from 'react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export default function ReportsPage() {
  const { areas, weeklyReports } = useNexus();
  const [reportType, setReportType] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const green = areas.filter((a) => a.currentStatus === 'GREEN').length;
  const yellow = areas.filter((a) => a.currentStatus === 'YELLOW').length;
  const red = areas.filter((a) => a.currentStatus === 'RED').length;
  const noResponse = areas.filter((a) => a.currentStatus === 'NO_RESPONSE').length;

  const sortedWeekly = [...weeklyReports].sort(
    (a, b) => a.compliance_score - b.compliance_score
  );

  return (
    <div className="space-y-3 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded shadow-xs">
        <div>
          <h1 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            Relatórios Operacionais da Nexus
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Consolidado diário de fechamento e índice semanal de conformidade executiva.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs font-mono font-medium">
          <button
            onClick={() => setReportType('DAILY')}
            className={`px-3 py-1 rounded transition-colors ${
              reportType === 'DAILY'
                ? 'bg-slate-800 text-slate-100 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Relatório Diário
          </button>
          <button
            onClick={() => setReportType('WEEKLY')}
            className={`px-3 py-1 rounded transition-colors ${
              reportType === 'WEEKLY'
                ? 'bg-slate-800 text-slate-100 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Conformidade Semanal
          </button>
        </div>
      </div>

      {reportType === 'DAILY' && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded shadow-xs flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-200">FECHAMENTO OPERACIONAL — 12 AGO 2026</span>
            <div className="flex items-center space-x-4">
              <span><strong className="text-emerald-400 font-bold">{green}</strong> OK</span>
              <span><strong className="text-amber-400 font-bold">{yellow}</strong> ATENÇÃO</span>
              <span><strong className="text-rose-400 font-bold">{red}</strong> CRÍTICAS</span>
              <span><strong className="text-slate-400 font-bold">{noResponse}</strong> SEM RESPOSTA</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded shadow-xs overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono uppercase text-slate-500">
                  <th className="py-2.5 px-3">Área</th>
                  <th className="py-2.5 px-3">Gestor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Justificativa</th>
                  <th className="py-2.5 px-3 text-right font-mono">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-100">{area.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{area.manager?.name || 'N/A'}</td>
                    <td className="py-2.5 px-3">
                      <StatusIndicator status={area.currentStatus!} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                      {area.currentJustification || <span className="text-slate-500 italic">Sem justificativa</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {area.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'WEEKLY' && (
        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded shadow-xs">
            <h2 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
              Conformidade Semanal (Ordenado por Desempenho)
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Áreas ordenadas da menor para a maior conformidade para acompanhamento da diretoria.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded shadow-xs overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono uppercase text-slate-500">
                  <th className="py-2.5 px-3">Área</th>
                  <th className="py-2.5 px-3">Gestor</th>
                  <th className="py-2.5 px-3 text-center">Dias OK</th>
                  <th className="py-2.5 px-3 text-center">Atenção</th>
                  <th className="py-2.5 px-3 text-center">Críticas</th>
                  <th className="py-2.5 px-3 text-center">Sem Resposta</th>
                  <th className="py-2.5 px-3 text-right font-mono">Conformidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {sortedWeekly.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-100">{item.area_name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{item.manager_name}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">{item.green_days}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-400 font-bold">{item.yellow_days}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-400 font-bold">{item.red_days}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">{item.no_response_days}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {item.compliance_score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
