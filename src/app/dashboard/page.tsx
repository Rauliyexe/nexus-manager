'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';
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
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Executive Summary Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            OPERATIONAL STATUS — {todayDateFormatted}
          </div>
          <h1 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            Visão Geral das 10 Áreas Nexus
          </h1>
        </div>

        {/* Compact Counters */}
        <div className="flex items-center space-x-3 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-bold text-slate-200">{greenCount}</span>
            <span className="text-slate-500">OK</span>
          </div>

          <span className="text-slate-800">|</span>

          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-bold text-amber-400">{yellowCount}</span>
            <span className="text-slate-500">ATENÇÃO</span>
          </div>

          <span className="text-slate-800">|</span>

          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="font-bold text-rose-400">{redCount}</span>
            <span className="text-slate-500">CRÍTICAS</span>
          </div>

          <span className="text-slate-800">|</span>

          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="font-bold text-slate-400">{noResponseCount}</span>
            <span className="text-slate-500">PENDENTE</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Atenção Necessária */}
        <div className="bg-slate-900 border border-slate-800 rounded p-3.5 space-y-2.5 lg:col-span-1 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Atenção Necessária ({attentionAreas.length})
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Requer Ação</span>
          </div>

          <div className="space-y-2">
            {attentionAreas.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                Todas as 10 áreas com operação normal.
              </div>
            ) : (
              attentionAreas.map((area) => (
                <div
                  key={area.id}
                  className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{area.name}</span>
                    <StatusIndicator status={area.currentStatus!} size="sm" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {area.currentJustification || (
                      <span className="italic text-slate-500">Fechamento não realizado até o horário limite.</span>
                    )}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                    <span>Gestor: {area.manager?.name || 'Pendente'}</span>
                    <Link
                      href={`/areas/${area.id}`}
                      className="text-slate-300 hover:text-white font-semibold flex items-center space-x-1"
                    >
                      <span>Ver área</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Complete 10 Areas Table */}
        <div className="bg-slate-900 border border-slate-800 rounded p-3.5 space-y-2.5 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Painel Consolidado das 10 Áreas
            </h2>
            <Link href="/areas" className="text-xs text-slate-400 hover:text-slate-200 font-medium">
              Ver tabela completa →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-500">
                  <th className="py-2 px-2.5">Área</th>
                  <th className="py-2 px-2.5">Gestor Responsável</th>
                  <th className="py-2 px-2.5">Status</th>
                  <th className="py-2 px-2.5 text-center">Obrigações</th>
                  <th className="py-2 px-2.5 text-right font-mono">Atualização</th>
                  <th className="py-2 px-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-2.5 font-bold text-slate-200">{area.name}</td>
                    <td className="py-2 px-2.5 text-slate-400">{area.manager?.name || 'N/A'}</td>
                    <td className="py-2 px-2.5">
                      <StatusIndicator status={area.currentStatus!} size="sm" />
                    </td>
                    <td className="py-2 px-2.5 text-center font-mono text-slate-400">
                      {area.obligationsCount}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-400">
                      {area.lastUpdated}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/areas/${area.id}?tab=chat`}
                          className="text-slate-400 hover:text-slate-200 p-1 rounded"
                          title="Abrir Chat da Área"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/areas/${area.id}`}
                          className="text-slate-300 hover:text-slate-100 font-semibold text-xs"
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
