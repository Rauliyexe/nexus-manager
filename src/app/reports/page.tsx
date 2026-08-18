'use client';

import React, { useState } from 'react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

export default function ReportsPage() {
  const { areas, weeklyReports, financialMetrics } = useNexus();
  const [reportPeriod, setReportPeriod] = useState<'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY'>('DAILY');

  const green = areas.filter((a) => a.currentStatus === 'GREEN').length;
  const yellow = areas.filter((a) => a.currentStatus === 'YELLOW').length;
  const red = areas.filter((a) => a.currentStatus === 'RED').length;
  const noResponse = areas.filter((a) => a.currentStatus === 'NO_RESPONSE').length;

  const sortedWeekly = [...weeklyReports].sort(
    (a, b) => a.compliance_score - b.compliance_score
  );

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="space-y-5 max-w-7xl mx-auto p-4 sm:p-6 pb-8 font-sans">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Relatórios & Auditoria Operacional
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · CONSOLIDADO
            </span>
          </div>
          <p className="text-sm text-[#5E7567] dark:text-slate-400 mt-0.5">
            Consolidado diário, semanal, quinzenal e mensal com auditoria de conformidade
          </p>
        </div>

        {/* Action Export Button */}
        <button
          onClick={() => alert('Relatório exportado em formato CSV / Excel com sucesso!')}
          className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório (CSV)</span>
        </button>
      </div>

      {/* Periodicity Selector Tabs */}
      <div className="flex items-center space-x-1.5 bg-white dark:bg-[#121D16] p-1.5 rounded-2xl border border-[#E2E8E3] dark:border-[#1E3125] text-xs font-medium overflow-x-auto no-scrollbar w-fit card-shadow">
        <button
          onClick={() => setReportPeriod('DAILY')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            reportPeriod === 'DAILY'
              ? 'bg-[#1B3026] text-white shadow-sm'
              : 'text-[#5C6E62] dark:text-slate-400 hover:text-[#1A281E] dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Relatório Diário</span>
        </button>

        <button
          onClick={() => setReportPeriod('WEEKLY')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            reportPeriod === 'WEEKLY'
              ? 'bg-[#1B3026] text-white shadow-sm'
              : 'text-[#5C6E62] dark:text-slate-400 hover:text-[#1A281E] dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Relatório Semanal</span>
        </button>

        <button
          onClick={() => setReportPeriod('FORTNIGHTLY')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            reportPeriod === 'FORTNIGHTLY'
              ? 'bg-[#1B3026] text-white shadow-sm'
              : 'text-[#5C6E62] dark:text-slate-400 hover:text-[#1A281E] dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Relatório Quinzenal</span>
        </button>

        <button
          onClick={() => setReportPeriod('MONTHLY')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
            reportPeriod === 'MONTHLY'
              ? 'bg-[#1B3026] text-white shadow-sm'
              : 'text-[#5C6E62] dark:text-slate-400 hover:text-[#1A281E] dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>DRE & Mensal</span>
        </button>
      </div>

      {/* 1. RELATÓRIO DIÁRIO */}
      {reportPeriod === 'DAILY' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs card-shadow">
            <span className="font-bold text-[#1A281E] dark:text-slate-100">Fechamento Operacional Diário — {todayFormatted}</span>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1"><strong className="text-[#4D7C5D] dark:text-[#76B38B] font-bold">{green}</strong> <span className="text-[#5C6E62] dark:text-slate-400">OK</span></span>
              <span className="flex items-center space-x-1"><strong className="text-amber-500 font-bold">{yellow}</strong> <span className="text-[#5C6E62] dark:text-slate-400">ATENÇÃO</span></span>
              <span className="flex items-center space-x-1"><strong className="text-rose-500 font-bold">{red}</strong> <span className="text-[#5C6E62] dark:text-slate-400">CRÍTICO</span></span>
              <span className="flex items-center space-x-1"><strong className="text-[#8FA595] font-bold">{noResponse}</strong> <span className="text-[#5C6E62] dark:text-slate-400">PENDENTE</span></span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E3] dark:border-[#1E3125] bg-[#F5F7F5] dark:bg-[#0B120E] text-[10px] font-semibold uppercase text-[#5C6E62] dark:text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Departamento</th>
                  <th className="py-3 px-4">Gestor Responsável</th>
                  <th className="py-3 px-4">Status Diário</th>
                  <th className="py-3 px-4">Justificativa Operacional</th>
                  <th className="py-3 px-4 text-right">Horário Envio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E3] dark:divide-[#1E3125]">
                {areas.map((area) => (
                  <tr key={area.id} className="hover:bg-[#F5F7F5] dark:hover:bg-[#17261D] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1A281E] dark:text-slate-100">{area.name}</td>
                    <td className="py-3 px-4 text-[#5C6E62] dark:text-slate-300">{area.manager?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <StatusIndicator status={area.currentStatus!} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-[#5C6E62] dark:text-slate-300 max-w-xs truncate">
                      {area.currentJustification || <span className="text-[#8FA595] italic">Sem justificativa enviada</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8FA595] dark:text-slate-400">
                      {area.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. RELATÓRIO SEMANAL */}
      {reportPeriod === 'WEEKLY' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] p-4 rounded-2xl card-shadow">
            <h2 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">
              Conformidade Semanal dos 10 Departamentos
            </h2>
            <p className="text-xs text-[#5C6E62] dark:text-slate-400 mt-0.5">
              Score consolidado da semana (ordenado da menor para a maior conformidade)
            </p>
          </div>

          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E3] dark:border-[#1E3125] bg-[#F5F7F5] dark:bg-[#0B120E] text-[10px] font-semibold uppercase text-[#5C6E62] dark:text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Departamento</th>
                  <th className="py-3 px-4">Gestor</th>
                  <th className="py-3 px-4 text-center">Dias OK</th>
                  <th className="py-3 px-4 text-center">Atenção</th>
                  <th className="py-3 px-4 text-center">Críticas</th>
                  <th className="py-3 px-4 text-center">Pendentes</th>
                  <th className="py-3 px-4 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E3] dark:divide-[#1E3125]">
                {sortedWeekly.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F7F5] dark:hover:bg-[#17261D] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1A281E] dark:text-slate-100">{item.area_name}</td>
                    <td className="py-3 px-4 text-[#5C6E62] dark:text-slate-300">{item.manager_name}</td>
                    <td className="py-3 px-4 text-center font-mono text-[#4D7C5D] dark:text-[#76B38B] font-bold">{item.green_days}</td>
                    <td className="py-3 px-4 text-center font-mono text-amber-600 dark:text-amber-400 font-bold">{item.yellow_days}</td>
                    <td className="py-3 px-4 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">{item.red_days}</td>
                    <td className="py-3 px-4 text-center font-mono text-[#8FA595] dark:text-slate-400 font-bold">{item.no_response_days}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#1A281E] dark:text-slate-100">
                      <span className="px-2 py-0.5 rounded-lg bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border border-[#D4E8DB] dark:border-[#1E3125]">
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

      {/* 3. RELATÓRIO QUINZENAL */}
      {reportPeriod === 'FORTNIGHTLY' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] p-4 rounded-2xl card-shadow">
            <h2 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">
              Relatório Quinzenal de Operações & Volume Industrial
            </h2>
            <p className="text-xs text-[#5C6E62] dark:text-slate-400 mt-0.5">
              Balanço das 2 primeiras semanas do mês: volume faturado vs comprado e margem operacional
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-white dark:bg-[#121D16] rounded-2xl border border-[#E2E8E3] dark:border-[#1E3125] space-y-1.5 card-shadow">
              <span className="text-[10px] text-[#8FA595] dark:text-slate-500 uppercase font-semibold">Volume Processado (1ª Quinzena)</span>
              <h3 className="text-xl font-bold text-[#1A281E] dark:text-slate-100">5.670 Toneladas</h3>
              <span className="text-[11px] text-[#4D7C5D] dark:text-[#76B38B] font-semibold">+4.2% vs quinzena anterior</span>
            </div>

            <div className="p-5 bg-white dark:bg-[#121D16] rounded-2xl border border-[#E2E8E3] dark:border-[#1E3125] space-y-1.5 card-shadow">
              <span className="text-[10px] text-[#8FA595] dark:text-slate-500 uppercase font-semibold">Margem Média por Tonelada</span>
              <h3 className="text-xl font-bold text-[#1A281E] dark:text-slate-100">R$ 4.250 / ton</h3>
              <span className="text-[11px] text-[#4D7C5D] dark:text-[#76B38B] font-semibold">Dentro da meta estipulada</span>
            </div>

            <div className="p-5 bg-white dark:bg-[#121D16] rounded-2xl border border-[#E2E8E3] dark:border-[#1E3125] space-y-1.5 card-shadow">
              <span className="text-[10px] text-[#8FA595] dark:text-slate-500 uppercase font-semibold">SLA Médio de Atendimento</span>
              <h3 className="text-xl font-bold text-[#1A281E] dark:text-slate-100">38 minutos</h3>
              <span className="text-[11px] text-[#4D7C5D] dark:text-[#76B38B] font-semibold">Redução de 12% em atrasos</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. RELATÓRIO MENSAL & DRE */}
      {reportPeriod === 'MONTHLY' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] p-4 rounded-2xl card-shadow">
            <h2 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">
              Relatório Mensal & DRE Gerencial Consolidado
            </h2>
            <p className="text-xs text-[#5C6E62] dark:text-slate-400 mt-0.5">
              Demonstrativo de resultado do exercício acumulado do mês corrente
            </p>
          </div>

          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8E3] dark:border-[#1E3125] bg-[#F5F7F5] dark:bg-[#0B120E] text-[10px] font-semibold uppercase text-[#5C6E62] dark:text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Categoria DRE</th>
                  <th className="py-3 px-4 text-right">Valor Acumulado (R$)</th>
                  <th className="py-3 px-4 text-right">% sobre Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E3] dark:divide-[#1E3125]">
                {financialMetrics.dre.map((row) => (
                  <tr key={row.code} className="hover:bg-[#F5F7F5] dark:hover:bg-[#17261D] transition-colors font-mono">
                    <td className="py-3 px-4 text-[#8FA595] dark:text-slate-500 font-bold">{row.code}</td>
                    <td className="py-3 px-4 font-bold text-[#1A281E] dark:text-slate-100 font-sans">{row.category}</td>
                    <td className={`py-3 px-4 text-right font-bold ${row.type === 'COST' || row.type === 'EXPENSE' || row.type === 'DEDUCTION' ? 'text-rose-600 dark:text-rose-400' : 'text-[#4D7C5D] dark:text-[#76B38B]'}`}>
                      R$ {row.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right text-[#5C6E62] dark:text-slate-300 font-bold">
                      {row.percentageOfRevenue}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração • Consolidação e auditoria operacional geradas para fins de apresentação à diretoria</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP REPORTING</span>
      </div>
    </div>
  );
}
