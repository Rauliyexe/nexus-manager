'use client';

import React, { useState } from 'react';
import { DollarSign, ShieldAlert, ArrowUpRight, TrendingUp, Wallet, ArrowDownRight, LayoutDashboard, Calculator, Activity, Scale } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { LiveTerminalChart } from './LiveTerminalChart';
import { LiveCashflowChart } from './LiveCashflowChart';
import { HedgeCalculator } from './HedgeCalculator';
import { CashflowForecastStressTest } from './CashflowForecastStressTest';
import { CommodityArbitragePanel } from './CommodityArbitragePanel';

export const BloombergTerminal: React.FC = () => {
  const { currentUser, hasFinancialAccess, financialMetrics, profiles, switchUser, setAppMode } = useNexus();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COMMODITIES' | 'CASHFLOW' | 'DRE' | 'HEDGE' | 'FORECAST' | 'ARBITRAGE'>('OVERVIEW');

  const isAuthorized = hasFinancialAccess(currentUser);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-6 bg-black border border-amber-500/40 rounded text-xs font-mono space-y-4 shadow-2xl">
        <div className="flex items-center space-x-3 text-amber-400 pb-3 border-b border-amber-500/30">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              NEXUS TERMINAL — RESTRICTED FINANCIAL ACCESS
            </h1>
            <p className="text-xs text-amber-500/80">
              Authorization Guard • Exclusive to Executive Board & Financial Administration.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 rounded border border-amber-500/20 space-y-2 text-slate-300">
          <p>
            User <strong className="text-amber-400">{currentUser.name}</strong> ({currentUser.role}) does not hold security clearance for live Bloomberg Financial Telemetry.
          </p>
          <p className="text-[11px] text-slate-400">
            Authorized roles: <strong className="text-amber-300">ADMIN</strong>, <strong className="text-amber-300">DIRECTOR</strong>, or Managers of <strong className="text-amber-300">Financeiro</strong> and <strong className="text-amber-300">Controladoria</strong>.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
            Simulate Executive Profile (RLS Security Test):
          </p>
          <div className="flex flex-wrap gap-2">
            {profiles
              .filter((p) => hasFinancialAccess(p))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchUser(p.id)}
                  className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-amber-300 px-3 py-1.5 rounded border border-amber-500/30 text-xs transition-colors cursor-pointer"
                >
                  <UserAvatar name={p.name} size="sm" />
                  <span>Login as {p.name} ({p.role})</span>
                </button>
              ))}
          </div>
        </div>

        <div className="pt-4 border-t border-amber-500/30 flex justify-end">
          <button
            onClick={() => setAppMode('OPERATIONS')}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded border border-sky-500/40 text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Voltar ao Modo Operacional</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-black text-amber-400 font-mono text-xs select-none p-3 space-y-3 border border-amber-500/30 rounded shadow-2xl">
      {/* Top Running Bloomberg Financial Ticker Header */}
      <div className="bg-slate-950 border border-amber-500/40 p-2.5 rounded flex items-center justify-between overflow-x-auto whitespace-nowrap text-[11px] font-bold tracking-tight">
        <div className="flex items-center space-x-4">
          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px]">
            NEXUS TERMINAL
          </span>
          <span className="text-emerald-400">LME COPPER: ${financialMetrics.copperSpotUSD.toLocaleString()}/t (+1.8%)</span>
          <span className="text-amber-300">USD/BRL: R$ {financialMetrics.usdBrlRate}</span>
          <span className="text-sky-400">COPPER BRL: R$ {financialMetrics.copperSpotBRLPerKg}/kg</span>
          <span className="text-emerald-400">SUCATA BUY: R$ {financialMetrics.scrapBuyPriceBRLPerKg}/kg</span>
          <span className="text-amber-300">CAIXA: R$ {(financialMetrics.consolidatedCash / 1000000).toFixed(2)}M</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 text-[10px]">
          <span>LIVE TELEMETRY</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Terminal Mode Selector Toolbar */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 overflow-x-auto gap-2">
        <div className="flex items-center space-x-1 whitespace-nowrap">
          {[
            { id: 'OVERVIEW', label: '[F1] VISÃO GERAL' },
            { id: 'COMMODITIES', label: '[F2] LME COPPER' },
            { id: 'CASHFLOW', label: '[F3] FLUXO DE CAIXA' },
            { id: 'DRE', label: '[F4] DRE STREAM' },
            { id: 'HEDGE', label: '[F5] HEDGE & DERIVATIVOS' },
            { id: 'FORECAST', label: '[F6] PROJEÇÃO D+90 / STRESS' },
            { id: 'ARBITRAGE', label: '[F7] ARBITRAGEM & SPREADS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded text-xs transition-colors font-bold cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-500/70 hover:text-amber-300 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 text-[10px] whitespace-nowrap shrink-0">
          <span className="text-amber-500/70">
            USER: <strong className="text-amber-300">{currentUser.name}</strong> ({currentUser.role})
          </span>
          <button
            onClick={() => setAppMode('OPERATIONS')}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded border border-sky-500/40 font-bold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>MODO OPERACIONAL</span>
          </button>
        </div>
      </div>

      {/* Main Command Grid Layout */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-3">
          {/* Top Real-time Live Candlestick & Tick Chart Stream */}
          <LiveTerminalChart
            initialPrice={financialMetrics.copperSpotUSD}
            title="LME SPOT COPPER REAL-TIME TICK STREAM"
            assetSymbol="LME-CU"
            unit="USD/t"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Panel A: Economia do Cobre LME & Sucata */}
            <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 text-[11px] font-bold">
                <span className="text-amber-300">PANEL A — ECONOMIA DO COBRE (LME) & SUCATA</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-black border border-amber-500/20 rounded">
                  <span className="text-slate-400 text-[10px] block">LME Spot Copper (USD/t)</span>
                  <span className="text-emerald-400 text-sm font-bold">${financialMetrics.copperSpotUSD.toLocaleString()}</span>
                </div>

                <div className="p-2 bg-black border border-amber-500/20 rounded">
                  <span className="text-slate-400 text-[10px] block">Câmbio Comercial PTAX</span>
                  <span className="text-amber-300 text-sm font-bold">R$ {financialMetrics.usdBrlRate}</span>
                </div>

                <div className="p-2 bg-black border border-amber-500/20 rounded">
                  <span className="text-slate-400 text-[10px] block">Preço Compra Sucata (BRL/kg)</span>
                  <span className="text-emerald-400 text-sm font-bold">R$ {financialMetrics.scrapBuyPriceBRLPerKg}</span>
                </div>

                <div className="p-2 bg-black border border-amber-500/20 rounded">
                  <span className="text-slate-400 text-[10px] block">Margem Fundição / Ton</span>
                  <span className="text-amber-300 text-sm font-bold">{formatBRL(financialMetrics.copperMarginPerTon)}</span>
                </div>
              </div>

              <div className="p-2 bg-black border border-amber-500/20 rounded text-[10px] text-slate-300 space-y-1">
                <p>Volume Processado Fundição Dcopper no Mês: <strong className="text-emerald-400 font-mono text-xs">{financialMetrics.monthlyTonsProcessed.toLocaleString()} toneladas</strong></p>
                <p>Spread Médio de Aquisição vs LME: <strong className="text-amber-300 font-mono">+7.97% Margem Bruta</strong></p>
              </div>
            </div>

            {/* Panel B: Live Real-time Cash Flow Stream */}
            <LiveCashflowChart
              agingSchedule={financialMetrics.agingSchedule}
              todayInflows={financialMetrics.todayInflows}
              todayOutflows={financialMetrics.todayOutflows}
            />
          </div>

          {/* Panel C: DRE Gerencial Stream */}
          <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded space-y-2">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 text-[11px] font-bold">
              <span className="text-amber-300">PANEL C — DRE GERENCIAL CONSOLIDADA TELEMETRY (AGO/2026)</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-amber-500/30 text-[9px] uppercase text-amber-500">
                    <th className="py-1.5 px-2">CÓDIGO</th>
                    <th className="py-1.5 px-2">CATEGORIA DRE</th>
                    <th className="py-1.5 px-2 text-right">VALOR TOTAL (R$)</th>
                    <th className="py-1.5 px-2 text-right">% RECEITA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/20">
                  {financialMetrics.dre.map((item) => {
                    const isEbitda = item.type === 'EBITDA' || item.type === 'NET_INCOME';
                    return (
                      <tr
                        key={item.code}
                        className={`hover:bg-amber-500/10 transition-colors ${
                          isEbitda ? 'bg-amber-500/15 text-amber-300 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <td className="py-1.5 px-2 font-mono text-amber-500">{item.code}</td>
                        <td className="py-1.5 px-2">{item.category}</td>
                        <td className={`py-1.5 px-2 text-right font-bold ${item.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatBRL(item.amount)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-amber-400">
                          {item.percentageOfRevenue > 0 ? `+${item.percentageOfRevenue}%` : `${item.percentageOfRevenue}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'COMMODITIES' && (
        <div className="space-y-3">
          <LiveTerminalChart
            initialPrice={financialMetrics.copperSpotUSD}
            title="LME COPPER SPOT INTRADAY HIGH FREQUENCY CANDLESTICKS"
            assetSymbol="LME-COPPER"
            unit="USD/t"
          />

          <div className="bg-slate-950 border border-amber-500/30 p-4 rounded space-y-4">
            <h2 className="text-xs font-bold text-amber-300 border-b border-amber-500/30 pb-2">
              DETALHAMENTO DE COMMODITIES — LME COPPER SPOT & SUCATA
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-black border border-amber-500/20 rounded">
                <span className="text-slate-400 text-[10px] block">London Metal Exchange Spot (USD)</span>
                <p className="text-emerald-400 text-lg font-bold mt-1">${financialMetrics.copperSpotUSD.toLocaleString()} / ton</p>
                <p className="text-slate-400 text-[10px] mt-1">Variação diária: +1.8% | Fechamento LME</p>
              </div>
              <div className="p-3 bg-black border border-amber-500/20 rounded">
                <span className="text-slate-400 text-[10px] block">Preço Convertido Brasil (BRL/kg)</span>
                <p className="text-amber-300 text-lg font-bold mt-1">R$ {financialMetrics.copperSpotBRLPerKg} / kg</p>
                <p className="text-slate-400 text-[10px] mt-1">Taxa de câmbio USD/BRL: R$ {financialMetrics.usdBrlRate}</p>
              </div>
              <div className="p-3 bg-black border border-amber-500/20 rounded">
                <span className="text-slate-400 text-[10px] block">Tabela de Compra Sucata Nexus</span>
                <p className="text-emerald-400 text-lg font-bold mt-1">R$ {financialMetrics.scrapBuyPriceBRLPerKg} / kg</p>
                <p className="text-slate-400 text-[10px] mt-1">Margem industrial: R$ {financialMetrics.copperMarginPerTon.toLocaleString('pt-BR')} / ton</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CASHFLOW' && (
        <div className="space-y-3">
          <LiveCashflowChart
            agingSchedule={financialMetrics.agingSchedule}
            todayInflows={financialMetrics.todayInflows}
            todayOutflows={financialMetrics.todayOutflows}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-amber-400 font-bold block text-xs">Contas Bancárias Corporativas:</span>
              {financialMetrics.accounts.map((acc) => (
                <div key={acc.id} className="p-2 bg-black border border-amber-500/20 rounded flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-200">{acc.bankName}</p>
                    <p className="text-[10px] text-slate-500">{acc.accountNumber}</p>
                  </div>
                  <p className="font-bold text-emerald-400">{formatBRL(acc.balance)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <span className="text-amber-400 font-bold block text-xs">Vencimentos de Fluxo de Caixa (Aging):</span>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-amber-500/30 text-[9px] uppercase text-amber-500">
                    <th className="py-1 px-2">PERÍODO</th>
                    <th className="py-1 px-2 text-right text-emerald-400">A RECEBER</th>
                    <th className="py-1 px-2 text-right text-rose-400">A PAGAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/20">
                  {financialMetrics.agingSchedule.map((ag, idx) => (
                    <tr key={idx} className="hover:bg-amber-500/10">
                      <td className="py-1.5 px-2 font-bold text-slate-300">{ag.period}</td>
                      <td className="py-1.5 px-2 text-right text-emerald-400 font-bold">{formatBRL(ag.receivables)}</td>
                      <td className="py-1.5 px-2 text-right text-rose-400 font-bold">{formatBRL(ag.payables)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DRE' && (
        <div className="bg-slate-950 border border-amber-500/30 p-4 rounded space-y-3">
          <h2 className="text-xs font-bold text-amber-300 border-b border-amber-500/30 pb-2">
            DEMONSTRAÇÃO DE RESULTADO DO EXERCÍCIO (DRE GERENCIAL FULL STREAM)
          </h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-amber-500/30 text-[9px] uppercase text-amber-500">
                <th className="py-2 px-2">CÓDIGO</th>
                <th className="py-2 px-2">CATEGORIA DRE</th>
                <th className="py-2 px-2 text-right">VALOR TOTAL (R$)</th>
                <th className="py-2 px-2 text-right">% RECEITA BRUTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/20">
              {financialMetrics.dre.map((item) => (
                <tr key={item.code} className="hover:bg-amber-500/10">
                  <td className="py-2 px-2 font-bold text-amber-500">{item.code}</td>
                  <td className="py-2 px-2 font-bold text-slate-200">{item.category}</td>
                  <td className={`py-2 px-2 text-right font-bold ${item.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatBRL(item.amount)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-amber-300">{item.percentageOfRevenue}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Tabs from Item 2 Implementation */}
      {activeTab === 'HEDGE' && (
        <HedgeCalculator
          currentLmeSpotUSD={financialMetrics.copperSpotUSD}
          currentUsdBrl={financialMetrics.usdBrlRate}
          currentScrapBuyBRLPerKg={financialMetrics.scrapBuyPriceBRLPerKg}
        />
      )}

      {activeTab === 'FORECAST' && (
        <CashflowForecastStressTest
          initialCash={financialMetrics.consolidatedCash}
          agingSchedule={financialMetrics.agingSchedule}
          monthlyRevenue={financialMetrics.monthlyRevenue}
        />
      )}

      {activeTab === 'ARBITRAGE' && (
        <CommodityArbitragePanel
          currentLmeUSD={financialMetrics.copperSpotUSD}
          currentUsdBrl={financialMetrics.usdBrlRate}
          currentScrapBuyBRLPerKg={financialMetrics.scrapBuyPriceBRLPerKg}
          monthlyTonsProcessed={financialMetrics.monthlyTonsProcessed}
        />
      )}
    </div>
  );
};
