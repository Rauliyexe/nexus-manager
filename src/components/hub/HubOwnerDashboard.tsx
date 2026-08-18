'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export const HubOwnerDashboard: React.FC = () => {
  const { areas, alerts, financialMetrics, obligations, tasks, tickets } = useNexus();

  const greenCount = areas.filter((a) => a.currentStatus === 'GREEN').length;
  const yellowCount = areas.filter((a) => a.currentStatus === 'YELLOW').length;
  const redCount = areas.filter((a) => a.currentStatus === 'RED').length;

  const totalReported = greenCount + yellowCount + redCount;
  const complianceRate = areas.length > 0 ? Math.round((totalReported / areas.length) * 100) : 100;
  const openAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED');

  return (
    <div className="space-y-4 font-sans">
      {/* Top Executive KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Ebitda & Margem */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-2.5 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>EBITDA CONSOLIDADO</span>
            <span className="text-[#2C6E49] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-0.5 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125] flex items-center space-x-1 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{financialMetrics.ebitdaMargin}%</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-mono font-extrabold text-[#111D15] dark:text-slate-100 tracking-tight">
              R$ {(financialMetrics.ebitda / 1000000).toFixed(2)}M
            </h3>
            <span className="text-xs font-mono font-semibold text-[#5E7567] dark:text-slate-400">Meta: 18.0%</span>
          </div>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125]">
            <div className="bg-[#2C6E49] dark:bg-[#76B38B] h-full rounded-full" style={{ width: `${financialMetrics.ebitdaMargin * 4}%` }} />
          </div>
        </div>

        {/* KPI 2: Receita Operacional Acumulada */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-2.5 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>RECEITA BRUTA (MÊS)</span>
            <span className="text-[#1B3026] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-0.5 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125] font-bold text-[10px]">
              107.1% DA META
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-mono font-extrabold text-[#111D15] dark:text-slate-100 tracking-tight">
              R$ {(financialMetrics.monthlyRevenue / 1000000).toFixed(1)}M
            </h3>
            <span className="text-xs font-mono font-semibold text-[#5E7567] dark:text-slate-400">Meta: R$ 45.0M</span>
          </div>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125]">
            <div className="bg-[#1B3026] dark:bg-[#76B38B] h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        {/* KPI 3: Compliance Global dos 10 Departamentos */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-2.5 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>GOVERNANÇA DE ÁREAS</span>
            <span className="text-[#2C6E49] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-0.5 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125] font-bold">
              {complianceRate}% OK
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-mono font-extrabold text-[#111D15] dark:text-slate-100 tracking-tight">
              {greenCount} / {areas.length} Setores
            </h3>
            <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">{yellowCount} Alertas</span>
          </div>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125] flex">
            <div className="bg-[#2C6E49] dark:bg-[#76B38B] h-full" style={{ width: `${(greenCount / areas.length) * 100}%` }} />
            <div className="bg-amber-500 dark:bg-amber-400 h-full" style={{ width: `${(yellowCount / areas.length) * 100}%` }} />
            <div className="bg-rose-600 dark:bg-rose-500 h-full" style={{ width: `${(redCount / areas.length) * 100}%` }} />
          </div>
        </div>

        {/* KPI 4: Chamados & Riscos Críticos */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-2.5 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
            <span>CHAMADOS & INCIDENTES</span>
            <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900 font-bold">
              {openAlerts.length} CRÍTICOS
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-mono font-extrabold text-[#111D15] dark:text-slate-100 tracking-tight">
              {openTickets.length} Chamados
            </h3>
            <span className="text-xs font-mono font-semibold text-[#5E7567] dark:text-slate-400">SLA: 42min</span>
          </div>
          <div className="w-full bg-[#EEF2EE] dark:bg-[#0B120E] h-2 rounded-full overflow-hidden border border-[#D5E0D7] dark:border-[#1E3125]">
            <div className="bg-rose-600 dark:bg-rose-500 h-full rounded-full" style={{ width: `${(openAlerts.length / 5) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid: 10 Department Executive Health Matrix + DRE Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: 10 Department Visual Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl space-y-4 card-shadow">
          <div className="flex items-center justify-between border-b border-[#D5E0D7] dark:border-[#1E3125] pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                  Painel Executivo dos {areas.length} Departamentos Oficiais
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-[#2C6E49] dark:bg-[#76B38B] animate-pulse" />
              </div>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 font-sans mt-0.5">
                Visão consolidada do status de fechamento diário e governança intersetorial
              </p>
            </div>

            <Link href="/areas" className="text-[#1B3026] dark:text-[#76B38B] hover:underline text-xs font-bold flex items-center space-x-1">
              <span>Gerenciar Áreas →</span>
            </Link>
          </div>

          {/* 10 Departments Mini Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {areas.map((area) => (
              <div
                key={area.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  area.currentStatus === 'GREEN'
                    ? 'bg-[#EEF2EE]/40 dark:bg-[#0B120E] border-[#D5E0D7] dark:border-[#1E3125] hover:border-[#1B3026]'
                    : area.currentStatus === 'YELLOW'
                    ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-300 dark:border-amber-900 hover:border-amber-500'
                    : area.currentStatus === 'RED'
                    ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-300 dark:border-rose-900 hover:border-rose-500'
                    : 'bg-[#EEF2EE]/40 dark:bg-[#0B120E] border-[#D5E0D7] dark:border-[#1E3125]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        area.currentStatus === 'GREEN'
                          ? 'bg-[#2C6E49] dark:bg-[#76B38B]'
                          : area.currentStatus === 'YELLOW'
                          ? 'bg-amber-500 dark:bg-amber-400'
                          : area.currentStatus === 'RED'
                          ? 'bg-rose-600 dark:bg-rose-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-bold text-xs text-[#111D15] dark:text-slate-100 truncate">{area.name}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                      area.currentStatus === 'GREEN'
                        ? 'bg-[#EEF2EE] text-[#2C6E49] border border-[#D5E0D7] dark:bg-[#1C2E24] dark:text-[#76B38B] dark:border-[#1E3125]'
                        : area.currentStatus === 'YELLOW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                        : area.currentStatus === 'RED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {area.currentStatus === 'GREEN' ? 'NORMAL' : area.currentStatus === 'YELLOW' ? 'ALERTA' : area.currentStatus === 'RED' ? 'CRÍTICO' : 'PENDENTE'}
                  </span>
                </div>

                <p className="text-xs text-[#3B4F43] dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {area.currentJustification || area.description || 'Operações regulares sem pendências.'}
                </p>

                <div className="flex items-center justify-between text-xs text-[#5E7567] dark:text-slate-400 font-mono pt-2 border-t border-[#D5E0D7] dark:border-[#1E3125]">
                  <span className="truncate pr-1 font-sans">Gestor: <strong className="text-[#111D15] dark:text-slate-200 font-bold">{area.manager?.name || 'N/A'}</strong></span>
                  <span className="text-[#3B4F43] dark:text-slate-400 shrink-0 font-bold">{area.obligationsCount} rituais</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: High-level DRE & Strategic Risks */}
        <div className="space-y-4">
          {/* DRE Summary Box */}
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-3.5 text-xs card-shadow">
            <div className="flex items-center justify-between border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5 text-[11px] font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
              <span className="flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-[#2C6E49] dark:text-[#76B38B]" />
                <span className="text-[#111D15] dark:text-slate-100 font-bold">DRE GERENCIAL EXECUTIVO</span>
              </span>
              <Link href="/financial" className="text-[#1B3026] dark:text-[#76B38B] hover:underline font-bold">Ver DRE →</Link>
            </div>

            <div className="space-y-2 pt-1">
              {financialMetrics.dre.slice(0, 5).map((row) => (
                <div key={row.code} className="flex items-center justify-between text-xs font-mono p-2 rounded-xl bg-[#EEF2EE]/50 dark:bg-[#0B120E] border border-[#D5E0D7]/60 dark:border-[#1E3125]">
                  <span className="text-[#3B4F43] dark:text-slate-400 truncate pr-2 font-medium">{row.category}</span>
                  <strong className={`shrink-0 font-bold ${row.type === 'COST' || row.type === 'EXPENSE' || row.type === 'DEDUCTION' ? 'text-rose-600 dark:text-rose-400' : 'text-[#111D15] dark:text-slate-200'}`}>
                    R$ {(Math.abs(row.amount) / 1000000).toFixed(2)}M
                  </strong>
                </div>
              ))}
            </div>

            <div className="pt-2.5 border-t border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-[#3B4F43] dark:text-slate-300">LUCRO LÍQUIDO</span>
              <span className="text-[#2C6E49] dark:text-[#76B38B] text-base font-extrabold">R$ {(financialMetrics.dre[9]?.amount / 1000000).toFixed(2)}M</span>
            </div>
          </div>

          {/* Critical Incident Feed */}
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl space-y-3.5 text-xs card-shadow">
            <div className="flex items-center justify-between border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5 text-[11px] font-bold text-[#3B4F43] dark:text-slate-400 uppercase tracking-wide">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-[#111D15] dark:text-slate-100 font-bold">RISCOS & ALERTAS</span>
              </span>
              <Link href="/alerts" className="text-[#1B3026] dark:text-[#76B38B] hover:underline font-bold">Ver Todos →</Link>
            </div>

            <div className="space-y-2.5">
              {openAlerts.slice(0, 3).map((alt) => (
                <div key={alt.id} className="p-3 bg-[#EEF2EE] dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-rose-600 dark:text-rose-400 uppercase">{alt.priority}</span>
                    <span className="text-[#5E7567] dark:text-slate-500 font-semibold">{new Date(alt.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[#111D15] dark:text-slate-200 text-xs font-bold leading-snug line-clamp-2">{alt.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
