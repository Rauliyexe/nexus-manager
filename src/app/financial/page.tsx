'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, ShieldAlert, TrendingUp, Wallet, ArrowUpRight, Building, CheckCircle2, Terminal } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

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
      <div className="max-w-3xl mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded shadow-xl text-xs font-sans space-y-4">
        <div className="flex items-center space-x-3 text-rose-400 pb-3 border-b border-slate-800">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <h1 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-100">
              ACESSO RESTRITO — DASHBOARD FINANCEIRO & DRE
            </h1>
            <p className="text-xs text-slate-400">
              Segurança Operacional • Acesso exclusivo para Diretoria e Administração Financeira.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded border border-slate-800 space-y-2">
          <p className="text-slate-300">
            Seu perfil atual (<strong className="text-slate-100">{currentUser.name}</strong> — {currentUser.role}) não possui credenciais suficientes para visualizar os dados financeiros consolidados da empresa Nexus.
          </p>
          <p className="text-[11px] text-slate-400">
            Cargos com permissão financeira: <strong className="text-slate-200">ADMIN</strong>, <strong className="text-slate-200">DIRECTOR</strong>, ou Gestor das áreas de <strong className="text-slate-200">Financeiro</strong> e <strong className="text-slate-200">Controladoria</strong>.
          </p>
        </div>

        {/* Profile Switcher for Testing */}
        <div className="pt-2 space-y-2">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Simular Acesso de Perfil Administrativo (RLS Demo):
          </p>
          <div className="flex flex-wrap gap-2">
            {profiles
              .filter((p) => hasFinancialAccess(p))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchUser(p.id)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded border border-slate-700 font-mono text-xs transition-colors"
                >
                  <UserAvatar name={p.name} size="sm" />
                  <span>Entrar como {p.name} ({p.role})</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans">
      {/* Top Header & Period Selector */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center font-mono font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
              Dashboard Financeiro Executivo & DRE Gerencial
            </h1>
            <p className="text-[11px] text-slate-400">
              Consolidado de caixa, faturamento, margem EBITDA e conciliação bancária corporativa.
            </p>
          </div>
        </div>

        {/* Period Selector Tabs & Terminal Shortcut */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs font-mono font-medium">
            {[
              { id: 'MONTH', label: 'AGO/2026 (Mês Atual)' },
              { id: 'SEMESTER', label: '1º Semestre 2026' },
              { id: 'YEAR', label: 'Ano 2026 (Acumulado)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPeriod(tab.id as any)}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedPeriod === tab.id
                    ? 'bg-slate-800 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href="/terminal"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold transition-colors shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Bloomberg</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Saldo Consolidado em Caixa */}
        <div className="p-3.5 rounded bg-slate-900 border border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase">
            <span>Caixa Consolidado</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-bold font-mono text-slate-100">
            {formatBRL(financialMetrics.consolidatedCash)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">4 Contas Bancárias Ativas</p>
        </div>

        {/* Card 2: Faturamento Bruto */}
        <div className="p-3.5 rounded bg-slate-900 border border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase">
            <span>Faturamento Bruto (Mês)</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-bold font-mono text-slate-100">
            {formatBRL(financialMetrics.monthlyRevenue)}
          </p>
          <p className="text-[10px] text-emerald-400 font-mono font-semibold">
            +14.2% vs Meta (R$ 45.0M)
          </p>
        </div>

        {/* Card 3: EBITDA & Margem */}
        <div className="p-3.5 rounded bg-slate-900 border border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase">
            <span>EBITDA Consolidado</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-base font-bold font-mono text-slate-100">
            {formatBRL(financialMetrics.ebitda)}
          </p>
          <p className="text-[10px] text-sky-400 font-mono font-semibold">
            Margem EBITDA: {financialMetrics.ebitdaMargin}%
          </p>
        </div>

        {/* Card 4: Unit Economics & Inadimplência */}
        <div className="p-3.5 rounded bg-slate-900 border border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase">
            <span>Margem Sucata / Ton</span>
            <Building className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-base font-bold font-mono text-slate-100">
            {formatBRL(financialMetrics.copperMarginPerTon)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Inadimplência: {financialMetrics.defaultRate}%</p>
        </div>
      </div>

      {/* Main Grid: DRE Gerencial & Bank Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: DRE Gerencial Consolidada Table */}
        <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              DRE Gerencial Consolidada — Exercício AGO/2026
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Valores em BRL (R$)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono uppercase text-slate-500">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Categoria DRE</th>
                  <th className="py-2.5 px-3 text-right font-mono">Valor Total (R$)</th>
                  <th className="py-2.5 px-3 text-right font-mono">% Receita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {financialMetrics.dre.map((item) => {
                  const isHighlight =
                    item.type === 'EBITDA' || item.type === 'NET_INCOME' || item.code === '1.0';
                  return (
                    <tr
                      key={item.code}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isHighlight ? 'bg-slate-950/60 font-bold text-slate-100' : 'text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{item.code}</td>
                      <td className="py-2.5 px-3">{item.category}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          item.amount < 0 ? 'text-rose-400' : 'text-slate-100'
                        }`}
                      >
                        {formatBRL(item.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
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
        <div className="space-y-4 lg:col-span-1">
          {/* Corporate Bank Accounts */}
          <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Saldos Bancários em Tempo Real
              </h2>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="space-y-2">
              {financialMetrics.accounts.map((acc) => (
                <div key={acc.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{acc.bankName}</p>
                    <p className="text-[10px] font-mono text-slate-500">{acc.accountNumber}</p>
                  </div>
                  <p className="font-bold font-mono text-slate-100">{formatBRL(acc.balance)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Aging Schedule Matrix (Contas a Pagar vs Receber) */}
          <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Vencimentos de Fluxo de Caixa
              </h2>
              <span className="text-[10px] font-mono text-slate-500">Aging</span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[9px] uppercase text-slate-500">
                    <th className="py-2 px-2">Período</th>
                    <th className="py-2 px-2 text-right text-emerald-400">A Receber</th>
                    <th className="py-2 px-2 text-right text-rose-400">A Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {financialMetrics.agingSchedule.map((ag, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2 px-2 font-bold text-slate-300 text-[11px]">{ag.period}</td>
                      <td className="py-2 px-2 text-right text-emerald-400 font-bold">
                        {formatBRL(ag.receivables)}
                      </td>
                      <td className="py-2 px-2 text-right text-rose-400 font-bold">
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
