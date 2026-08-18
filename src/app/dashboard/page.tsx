'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export default function DashboardPage() {
  const { areas } = useNexus();

  const greenCount = areas.filter((a) => a.currentStatus === 'GREEN').length;
  const yellowCount = areas.filter((a) => a.currentStatus === 'YELLOW').length;
  const redCount = areas.filter((a) => a.currentStatus === 'RED').length;
  const noResponseCount = areas.filter((a) => a.currentStatus === 'NO_RESPONSE').length;
  const attentionAreas = areas.filter((a) => a.currentStatus !== 'GREEN');

  const todayDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="space-y-5 font-sans p-4 sm:p-6 pb-8">
      {/* Executive Summary Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#5E7567] uppercase tracking-widest font-mono">
            Operational Status — {todayDateFormatted}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight mt-0.5">
            Indicadores & Visão Geral das {areas.length} Áreas
          </h1>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#EEF2EE] dark:bg-[#1C2E24] rounded-full border border-[#D5E0D7] dark:border-[#1E3125]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2C6E49]" />
            <span className="text-xs font-bold text-[#111D15] dark:text-[#76B38B]">{greenCount}</span>
            <span className="text-[11px] font-semibold text-[#3B4F43] dark:text-slate-400">OK</span>
          </div>
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-full border border-amber-200 dark:border-amber-900">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400">{yellowCount}</span>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-500">ATENÇÃO</span>
          </div>
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 rounded-full border border-rose-200 dark:border-rose-900">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-xs font-bold text-rose-800 dark:text-rose-400">{redCount}</span>
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-500">CRÍTICAS</span>
          </div>
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#EEF2EE] dark:bg-[#17261D] rounded-full border border-[#D5E0D7] dark:border-[#1E3125]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5E7567]" />
            <span className="text-xs font-bold text-[#111D15] dark:text-slate-400">{noResponseCount}</span>
            <span className="text-[11px] font-semibold text-[#5E7567] dark:text-slate-500">PENDENTE</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Attention Required */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-5 space-y-3.5 card-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
            <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100">
              Atenção Necessária <span className="text-[#5E7567] dark:text-slate-500">({attentionAreas.length})</span>
            </h2>
            <span className="text-[10px] font-bold text-[#5E7567] dark:text-slate-500 uppercase tracking-wider">Requer Ação</span>
          </div>

          <div className="space-y-2.5">
            {attentionAreas.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#2C6E49] mx-auto mb-2 opacity-50" />
                <p className="text-[#3B4F43] dark:text-slate-400 text-xs font-semibold">Todas as áreas com operação normal.</p>
              </div>
            ) : (
              attentionAreas.map((area) => (
                <div
                  key={area.id}
                  className="p-3.5 rounded-xl bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111D15] dark:text-slate-100">{area.name}</span>
                    <StatusIndicator status={area.currentStatus!} size="sm" />
                  </div>
                  <p className="text-xs text-[#3B4F43] dark:text-slate-300 leading-relaxed">
                    {area.currentJustification || (
                      <span className="italic text-[#5E7567]">Fechamento não realizado até o horário limite.</span>
                    )}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D5E0D7] dark:border-[#1E3125]">
                    <span className="text-[#3B4F43] dark:text-slate-400">
                      Gestor: <strong className="text-[#111D15] dark:text-slate-200 font-bold">{area.manager?.name || 'Pendente'}</strong>
                    </span>
                    <Link
                      href={`/areas/${area.id}`}
                      className="text-[#1B3026] dark:text-[#76B38B] font-bold flex items-center space-x-0.5 hover:underline"
                    >
                      <span>Ver área</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Full 10 Areas Table */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-5 space-y-3.5 lg:col-span-2 card-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
            <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100">
              Painel Consolidado das {areas.length} Áreas
            </h2>
            <Link href="/areas" className="text-xs font-bold text-[#1B3026] dark:text-[#76B38B] hover:underline">
              Ver tabela completa →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] text-[10px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
                  <th className="py-3 px-3">Área</th>
                  <th className="py-3 px-3">Gestor Responsável</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Obrigações</th>
                  <th className="py-3 px-3 text-right">Atualização</th>
                  <th className="py-3 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#111D15] dark:text-slate-100 text-xs">{area.name}</td>
                    <td className="py-3 px-3 text-[#3B4F43] dark:text-slate-300 font-medium">{area.manager?.name || 'N/A'}</td>
                    <td className="py-3 px-3">
                      <StatusIndicator status={area.currentStatus!} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#111D15] dark:text-slate-300">
                      {area.obligationsCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#5E7567] dark:text-slate-400 font-medium">
                      {area.lastUpdated}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/chat?convId=conv-area-${area.id.replace('area-', '')}`}
                          className="p-1.5 rounded-lg text-[#5E7567] hover:text-[#1B3026] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] transition-colors"
                          title="Chat da Área"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/areas/${area.id}`}
                          className="text-xs font-bold text-[#1B3026] dark:text-[#76B38B] hover:underline"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
