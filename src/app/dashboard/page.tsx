'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  ShieldCheck,
  Building2,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export default function DashboardPage() {
  const { areas, obligations, alerts, tickets } = useNexus();

  const greenCount = areas.filter((a) => a.currentStatus === 'GREEN').length;
  const yellowCount = areas.filter((a) => a.currentStatus === 'YELLOW').length;
  const redCount = areas.filter((a) => a.currentStatus === 'RED').length;
  const noResponseCount = areas.filter((a) => a.currentStatus === 'NO_RESPONSE').length;

  const totalReported = greenCount + yellowCount + redCount;
  const complianceRate = areas.length > 0 ? Math.round((greenCount / areas.length) * 100) : 100;
  const attentionAreas = areas.filter((a) => a.currentStatus !== 'GREEN');
  const totalObligations = obligations.length;
  const activeObligations = obligations.filter((o) => o.active).length;

  const todayDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 font-sans p-4 sm:p-6 pb-8">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
            Painel de Indicadores Operacionais
          </h1>
          <p className="text-sm text-[#3B4F43] dark:text-slate-400 mt-0.5">
            Monitoramento de conformidade, SLA de rotinas diárias e saúde dos projetos • {todayDateFormatted}
          </p>
        </div>

        <Link
          href="/areas"
          className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <span>Gerenciar Projetos</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Conformidade Global */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>Índice de Conformidade</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#2C6E49] dark:text-[#76B38B] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {complianceRate}%
          </p>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125]">
            <div className="bg-[#2C6E49] dark:bg-[#76B38B] h-full rounded-full" style={{ width: `${complianceRate}%` }} />
          </div>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 font-medium pt-0.5">Meta operacional: 95%</p>
        </div>

        {/* KPI 2: Áreas Regulares */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>Áreas em Operação Normal</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {greenCount} <span className="text-base font-bold text-[#5E7567]">/ {areas.length}</span>
          </p>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125]">
            <div className="bg-[#1B3026] dark:bg-[#76B38B] h-full rounded-full" style={{ width: `${(greenCount / areas.length) * 100}%` }} />
          </div>
          <p className="text-xs text-[#2C6E49] dark:text-[#76B38B] font-semibold pt-0.5">Sem ocorrências impeditivas</p>
        </div>

        {/* KPI 3: Ocorrências de Risco / Alertas */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>Áreas sob Atenção / Alerta</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {yellowCount + redCount} <span className="text-base font-bold text-[#5E7567]">Setores</span>
          </p>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125] flex">
            <div className="bg-amber-500 h-full" style={{ width: `${(yellowCount / areas.length) * 100}%` }} />
            <div className="bg-rose-600 h-full" style={{ width: `${(redCount / areas.length) * 100}%` }} />
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold pt-0.5">{yellowCount} Atenção • {redCount} Crítica</p>
        </div>

        {/* KPI 4: Rituais Diários Executados */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>Rituais & Obrigações</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {activeObligations} <span className="text-base font-bold text-[#5E7567]">/ {totalObligations}</span>
          </p>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125]">
            <div className="bg-[#2C6E49] dark:bg-[#76B38B] h-full rounded-full" style={{ width: `${(activeObligations / totalObligations) * 100}%` }} />
          </div>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 font-medium pt-0.5">Rotinas ativas mapeadas</p>
        </div>
      </div>

      {/* Main Grid: Attention Required + 10 Areas Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Attention Required */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-5 sm:p-6 space-y-4 card-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
            <div>
              <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                Atenção Imediata ({attentionAreas.length})
              </h2>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">Setores com alertas ou pendências</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-900 text-[10px] font-bold uppercase">
              Ação
            </span>
          </div>

          <div className="space-y-3">
            {attentionAreas.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#2C6E49] mx-auto mb-2 opacity-50" />
                <p className="text-[#3B4F43] dark:text-slate-400 text-xs font-semibold">Todas as 10 áreas com operação normal.</p>
              </div>
            ) : (
              attentionAreas.map((area) => (
                <div
                  key={area.id}
                  className="p-4 rounded-xl bg-[#EEF2EE]/50 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2.5"
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
                      className="text-[#1B3026] dark:text-[#76B38B] font-bold flex items-center space-x-1 hover:underline text-xs"
                    >
                      <span>Ver Área</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Full 10 Areas Table */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-5 sm:p-6 space-y-4 lg:col-span-2 card-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
            <div>
              <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                Matriz Consolidada de Projetos
              </h2>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">Status operacional e rituais em tempo real</p>
            </div>
            <Link href="/areas" className="text-xs font-bold text-[#1B3026] dark:text-[#76B38B] hover:underline">
              Ver Tabela Completa →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] text-[10px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Área</th>
                  <th className="py-3 px-4">Gestor Responsável</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Obrigações</th>
                  <th className="py-3 px-4 text-right font-mono">Última Atualização</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111D15] dark:text-slate-100 text-xs">
                      <Link href={`/areas/${area.id}`} className="hover:text-[#1B3026] dark:hover:text-[#76B38B] transition-colors">
                        {area.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-[#3B4F43] dark:text-slate-300 font-semibold">{area.manager?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <StatusIndicator status={area.currentStatus!} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#111D15] dark:text-slate-300">
                      {area.obligationsCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5E7567] dark:text-slate-400 font-medium">
                      {area.lastUpdated}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/chat?convId=conv-area-${area.id.replace('area-', '')}`}
                          className="p-1.5 rounded-lg text-[#5E7567] hover:text-[#1B3026] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] transition-colors"
                          title="Chat da Área"
                        >
                          <MessageSquare className="w-4 h-4" />
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

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração Executiva • Indicadores operacionais sintetizados para apresentação</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP COMMAND CENTER</span>
      </div>
    </div>
  );
}
