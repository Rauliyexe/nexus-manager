'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShieldAlert,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Building,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { USER_ROLE_LABELS } from '@/lib/types/nexus';

export default function FinancialDashboardPage() {
  const { currentUser, hasFinancialAccess, financialMetrics, profiles, switchUser } = useNexus();
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTH' | 'SEMESTER' | 'YEAR'>('MONTH');

  const isAuthorized = hasFinancialAccess(currentUser);

  // Formatter for BRL Currency
  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Unauthorized Access Guard Component
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-6 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl shadow-xl text-xs font-sans space-y-4 card-shadow">
        <div className="flex items-center space-x-3 text-rose-600 pb-3 border-b border-[#D5E0D7] dark:border-[#1E3125]">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-[#111D15] dark:text-slate-100">
              ACESSO RESTRITO — DASHBOARD FINANCEIRO & DRE
            </h1>
            <p className="text-xs text-[#5E7567] dark:text-slate-400">
              Segurança Operacional • Acesso exclusivo para Diretoria e Administração Financeira.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#EEF2EE] dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] space-y-2">
          <p className="text-[#3B4F43] dark:text-slate-300">
            Seu perfil atual (<strong className="text-[#111D15] dark:text-slate-100">{currentUser.name}</strong> — {USER_ROLE_LABELS[currentUser.role] || currentUser.role}) não possui credenciais suficientes para visualizar os dados financeiros consolidados da empresa Nexus.
          </p>
          <p className="text-xs text-[#5E7567] dark:text-slate-400">
            Cargos com permissão financeira: <strong className="text-[#111D15] dark:text-slate-200">Dono</strong>, <strong className="text-[#111D15] dark:text-slate-200">Diretor</strong>, <strong className="text-[#111D15] dark:text-slate-200">Diretor de TI</strong>, ou Gerentes das áreas de <strong className="text-[#111D15] dark:text-slate-200">Financeiro</strong>, <strong className="text-[#111D15] dark:text-slate-200">Contabilidade</strong> e <strong className="text-[#111D15] dark:text-slate-200">Auditoria</strong>.
          </p>
        </div>

        {/* Profile Switcher for Testing */}
        <div className="pt-2 space-y-2">
          <p className="text-[10px] font-bold text-[#5E7567] uppercase tracking-wider">
            Simular Acesso de Perfil Administrativo (RLS Demo):
          </p>
          <div className="flex flex-wrap gap-2">
            {profiles
              .filter((p) => hasFinancialAccess(p))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchUser(p.id)}
                  className="flex items-center space-x-2 bg-[#EEF2EE] hover:bg-[#D5E0D7] dark:bg-[#1C2E24] dark:hover:bg-[#233A2D] text-[#111D15] dark:text-slate-100 px-3.5 py-2 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <UserAvatar name={p.name} size="sm" />
                  <span>Entrar como {p.name} ({USER_ROLE_LABELS[p.role] || p.role})</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans p-4 sm:p-6 pb-8">
      {/* Top Header & Period Selector */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Dashboard Financeiro Executivo & DRE Gerencial
            </h1>
            <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
              Consolidado de caixa, faturamento, margem EBITDA e conciliação bancária corporativa.
            </p>
          </div>
        </div>

        {/* Period Selector Tabs & Terminal Shortcut */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#EEF2EE] dark:bg-[#0B120E] p-1 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] text-xs font-semibold">
            {[
              { id: 'MONTH', label: 'AGO/2026 (Mês Atual)' },
              { id: 'SEMESTER', label: '1º Semestre 2026' },
              { id: 'YEAR', label: 'Ano 2026 (Acumulado)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPeriod(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedPeriod === tab.id
                    ? 'bg-[#1B3026] text-white shadow-xs font-bold'
                    : 'text-[#3B4F43] dark:text-slate-400 hover:text-[#111D15] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href="/terminal"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors shadow-xs"
          >
            <Terminal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Terminal Bloomberg</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Consolidado em Caixa */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase">
            <span>Caixa Consolidado</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {formatBRL(financialMetrics.consolidatedCash)}
          </p>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 font-medium">4 Contas Bancárias Ativas</p>
        </div>

        {/* Card 2: Faturamento Bruto */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase">
            <span>Faturamento Bruto (Mês)</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#2C6E49] dark:text-[#76B38B] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {formatBRL(financialMetrics.monthlyRevenue)}
          </p>
          <p className="text-xs text-[#2C6E49] dark:text-[#76B38B] font-semibold">
            +14.2% vs Meta (R$ 45.0M)
          </p>
        </div>

        {/* Card 3: EBITDA & Margem */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase">
            <span>EBITDA Consolidado</span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {formatBRL(financialMetrics.ebitda)}
          </p>
          <p className="text-xs text-[#2C6E49] dark:text-[#76B38B] font-semibold">
            Margem EBITDA: {financialMetrics.ebitdaMargin}%
          </p>
        </div>

        {/* Card 4: Unit Economics & Inadimplência */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] space-y-2 card-shadow card-shadow-hover transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#3B4F43] dark:text-slate-400 uppercase">
            <span>Margem Sucata / Ton</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold font-mono text-[#111D15] dark:text-slate-100 tracking-tight">
            {formatBRL(financialMetrics.copperMarginPerTon)}
          </p>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 font-medium">Inadimplência: {financialMetrics.defaultRate}%</p>
        </div>
      </div>

      {/* Main Grid: DRE Gerencial & Bank Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: DRE Gerencial Consolidada Table */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-6 space-y-4 lg:col-span-2 card-shadow">
          <div className="flex items-center justify-between border-b border-[#D5E0D7] dark:border-[#1E3125] pb-3">
            <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
              DRE Gerencial Consolidada — Exercício AGO/2026
            </h2>
            <span className="text-xs text-[#5E7567] dark:text-slate-400 font-medium">Valores em BRL (R$)</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] text-[11px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Categoria DRE</th>
                  <th className="py-3 px-4 text-right font-mono">Valor Total (R$)</th>
                  <th className="py-3 px-4 text-right font-mono">% Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
                {financialMetrics.dre.map((item) => {
                  const isHighlight =
                    item.type === 'EBITDA' || item.type === 'NET_INCOME' || item.code === '1.0';
                  return (
                    <tr
                      key={item.code}
                      className={`hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors ${
                        isHighlight
                          ? 'bg-[#EEF2EE]/60 dark:bg-[#1C2E24]/60 font-bold text-[#111D15] dark:text-white'
                          : 'text-[#3B4F43] dark:text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[#5E7567] dark:text-slate-400 text-xs font-semibold">{item.code}</td>
                      <td className="py-3 px-4 font-semibold text-[#111D15] dark:text-slate-200">{item.category}</td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                          item.amount < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : isHighlight
                            ? 'text-[#1B3026] dark:text-[#76B38B]'
                            : 'text-[#111D15] dark:text-slate-100'
                        }`}
                      >
                        {formatBRL(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-[#5E7567] dark:text-slate-400">
                        {item.percentageOfRevenue > 0 ? `+${item.percentageOfRevenue}%` : `${item.percentageOfRevenue}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Contas Bancárias & Matrix de Fluxo de Caixa */}
        <div className="space-y-5 lg:col-span-1">
          {/* Corporate Bank Accounts */}
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-5 space-y-3.5 card-shadow">
            <div className="flex items-center justify-between border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5">
              <h2 className="text-xs font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                Saldos Bancários em Tempo Real
              </h2>
              <CheckCircle2 className="w-4 h-4 text-[#2C6E49] dark:text-[#76B38B]" />
            </div>

            <div className="space-y-2.5">
              {financialMetrics.accounts.map((acc) => (
                <div key={acc.id} className="p-3 rounded-xl bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#111D15] dark:text-slate-100 text-xs">{acc.bankName}</p>
                    <p className="text-[10px] font-mono text-[#5E7567] dark:text-slate-400 mt-0.5">{acc.accountNumber}</p>
                  </div>
                  <p className="font-bold font-mono text-[#111D15] dark:text-slate-100 text-sm">{formatBRL(acc.balance)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Aging Schedule Matrix (Contas a Pagar vs Receber) */}
          <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl p-5 space-y-3.5 card-shadow">
            <div className="flex items-center justify-between border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5">
              <h2 className="text-xs font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                Vencimentos de Fluxo de Caixa
              </h2>
              <span className="text-[10px] font-bold text-[#5E7567] uppercase">Aging</span>
            </div>

            <div className="overflow-x-auto text-xs rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] text-[10px] uppercase font-bold text-[#3B4F43] dark:text-slate-400">
                    <th className="py-2.5 px-3">Período</th>
                    <th className="py-2.5 px-3 text-right text-[#2C6E49] dark:text-[#76B38B]">A Receber</th>
                    <th className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">A Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
                  {financialMetrics.agingSchedule.map((ag, idx) => (
                    <tr key={idx} className="hover:bg-[#F9FAF9] dark:hover:bg-[#17261D]">
                      <td className="py-2.5 px-3 font-bold text-[#111D15] dark:text-slate-200 text-xs">{ag.period}</td>
                      <td className="py-2.5 px-3 text-right text-[#2C6E49] dark:text-[#76B38B] font-bold text-xs">
                        {formatBRL(ag.receivables)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-bold text-xs">
                        {formatBRL(ag.payables)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
