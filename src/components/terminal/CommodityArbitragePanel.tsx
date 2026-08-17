'use client';

import React, { useState } from 'react';
import { Scale, TrendingUp, DollarSign, Layers, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2, ShieldCheck } from 'lucide-react';
import { CommodityArbitrageMetrics } from '@/lib/types/nexus';

interface CommodityArbitragePanelProps {
  currentLmeUSD: number;
  currentUsdBrl: number;
  currentScrapBuyBRLPerKg: number;
  monthlyTonsProcessed: number;
}

export const CommodityArbitragePanel: React.FC<CommodityArbitragePanelProps> = ({
  currentLmeUSD = 9840,
  currentUsdBrl = 5.42,
  currentScrapBuyBRLPerKg = 49.08,
  monthlyTonsProcessed = 11340,
}) => {
  // Input parameters for Smelting & Arbitrage calculation
  const [importTaxAndFreightPct, setImportTaxAndFreightPct] = useState<number>(8.5); // % import overhead
  const [smeltingCostBRLPerKg, setSmeltingCostBRLPerKg] = useState<number>(4.25); // R$/kg operational cost
  const [recoveryRatePct, setRecoveryRatePct] = useState<number>(97.2); // scrap metal yield %
  const [simulatedLmeUSD, setSimulatedLmeUSD] = useState<number>(currentLmeUSD);
  const [simulatedUsdBrl, setSimulatedUsdBrl] = useState<number>(currentUsdBrl);
  const [simulatedScrapBRLPerKg, setSimulatedScrapBRLPerKg] = useState<number>(currentScrapBuyBRLPerKg);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Mathematical Arbitrage Derivation
  // 1. Raw LME Price converted to BRL/kg
  const rawLmeBRLPerKg = (simulatedLmeUSD * simulatedUsdBrl) / 1000;
  // 2. Import Parity (with freight, import duty, maritime insurance)
  const importParityBRLPerKg = rawLmeBRLPerKg * (1 + importTaxAndFreightPct / 100);
  // 3. Effective raw material cost taking into account scrap recovery rate
  const effectiveScrapCostBRLPerKg = simulatedScrapBRLPerKg / (recoveryRatePct / 100);
  // 4. Total industrial cost = effective scrap + smelting
  const totalProductionCostBRLPerKg = effectiveScrapCostBRLPerKg + smeltingCostBRLPerKg;
  // 5. Net Arbitrage Margin per kg vs Import Parity
  const netArbitrageMarginBRLPerKg = importParityBRLPerKg - totalProductionCostBRLPerKg;
  const netMarginPerTon = netArbitrageMarginBRLPerKg * 1000;
  const monthlyTotalMarginBRL = netMarginPerTon * monthlyTonsProcessed;

  // Sensitivity Matrix Calculations
  // Delta EBITDA per $100 move in LME
  const deltaEbitdaPer100USD = (100 * simulatedUsdBrl / 1000) * 1000 * monthlyTonsProcessed;
  // Delta EBITDA per R$ 0.10 move in USD/BRL
  const deltaEbitdaPer10Cents = (simulatedLmeUSD * 0.10 / 1000) * 1000 * monthlyTonsProcessed;

  return (
    <div className="space-y-4 font-mono text-xs text-amber-400">
      {/* Header */}
      <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              ARBITRAGEM & SPREAD DE COMMODITIES — LME vs SUCATA NACIONAL
            </h2>
            <p className="text-[10px] text-slate-400">
              Paridade de importação de vergalhão de cobre vs custo de fundição e aquisição local.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            PARIDADE IMPORTAÇÃO: R$ {importParityBRLPerKg.toFixed(2)}/kg
          </span>
        </div>
      </div>

      {/* 4 Summary Executive KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Spread Bruto vs Paridade</span>
          <p className="text-amber-300 font-bold text-sm">
            R$ {(importParityBRLPerKg - simulatedScrapBRLPerKg).toFixed(2)}/kg
          </p>
          <span className="text-[9px] text-slate-500 block">Preço Importação - Preço Sucata</span>
        </div>

        <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Margem Líquida Fundição/Ton</span>
          <p className="text-emerald-400 font-bold text-sm">
            {formatBRL(netMarginPerTon)}
          </p>
          <span className="text-[9px] text-emerald-400 block font-bold">
            R$ {netArbitrageMarginBRLPerKg.toFixed(2)} / kg líquido
          </span>
        </div>

        <div className="p-3 bg-slate-950 border border-sky-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Margem Mensal Consolidada</span>
          <p className="text-sky-300 font-bold text-sm">
            {formatBRL(monthlyTotalMarginBRL)}
          </p>
          <span className="text-[9px] text-slate-400 block">Volume: {monthlyTonsProcessed.toLocaleString()} tons/mês</span>
        </div>

        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Rendimento Metalúrgico</span>
          <p className="text-amber-300 font-bold text-sm">
            {recoveryRatePct.toFixed(1)}% Yield
          </p>
          <span className="text-[9px] text-slate-500 block">Perda em escória: {(100 - recoveryRatePct).toFixed(1)}%</span>
        </div>
      </div>

      {/* Main Grid: Interactive Parameters & Waterfall Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column (5 Cols): Sliders & Simulation Inputs */}
        <div className="lg:col-span-5 bg-slate-950 border border-amber-500/30 p-3.5 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 text-[11px] font-bold text-amber-300">
            <span>PARÂMETROS DE PRODUÇÃO & MERCADO</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="space-y-3 text-[11px]">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Cotação LME Spot (USD/t):</span>
                <strong className="text-amber-300">${simulatedLmeUSD.toLocaleString()}</strong>
              </div>
              <input
                type="range"
                min="8000"
                max="12000"
                step="50"
                value={simulatedLmeUSD}
                onChange={(e) => setSimulatedLmeUSD(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-900 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Câmbio USD/BRL:</span>
                <strong className="text-amber-300">R$ {simulatedUsdBrl.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="4.50"
                max="6.50"
                step="0.02"
                value={simulatedUsdBrl}
                onChange={(e) => setSimulatedUsdBrl(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-900 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Preço Compra Sucata (R$/kg):</span>
                <strong className="text-emerald-400">R$ {simulatedScrapBRLPerKg.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="35.00"
                max="60.00"
                step="0.25"
                value={simulatedScrapBRLPerKg}
                onChange={(e) => setSimulatedScrapBRLPerKg(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-900 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-500/10">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Frete & Impostos Importação (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={importTaxAndFreightPct}
                  onChange={(e) => setImportTaxAndFreightPct(Number(e.target.value))}
                  className="w-full bg-black border border-amber-500/30 rounded px-2 py-1 text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Custo Fundição (R$/kg):</label>
                <input
                  type="number"
                  step="0.10"
                  value={smeltingCostBRLPerKg}
                  onChange={(e) => setSmeltingCostBRLPerKg(Number(e.target.value))}
                  className="w-full bg-black border border-amber-500/30 rounded px-2 py-1 text-amber-300 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Step-by-step Waterfall & EBITDA Sensitivity */}
        <div className="lg:col-span-7 space-y-3">
          {/* Waterfall Breakdown Table */}
          <div className="bg-slate-950 border border-amber-500/30 p-3 rounded space-y-2">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-1 text-[10px] font-bold text-amber-300">
              <span>FORMAÇÃO DE PREÇO & MARGEM DE ARBITRAGEM (R$/KG)</span>
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <table className="w-full text-left border-collapse text-[10px]">
              <tbody className="divide-y divide-amber-500/10">
                <tr>
                  <td className="py-1 px-1.5 text-slate-300">1. Preço Paridade LME Spot Cobre</td>
                  <td className="py-1 px-1.5 text-right text-slate-300 font-mono">R$ {rawLmeBRLPerKg.toFixed(2)}/kg</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 text-slate-300">2. (+) Frete Marítimo, II & Desembaraço ({importTaxAndFreightPct}%)</td>
                  <td className="py-1 px-1.5 text-right text-amber-300 font-mono">+R$ {(importParityBRLPerKg - rawLmeBRLPerKg).toFixed(2)}/kg</td>
                </tr>
                <tr className="bg-amber-500/10 font-bold">
                  <td className="py-1 px-1.5 text-amber-300">(=) PREÇO PARIDADE DE IMPORTAÇÃO BRASIL</td>
                  <td className="py-1 px-1.5 text-right text-amber-300 font-mono font-bold">R$ {importParityBRLPerKg.toFixed(2)}/kg</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 text-slate-300">3. (-) Custo Efetivo Sucata (com {recoveryRatePct}% rendimento)</td>
                  <td className="py-1 px-1.5 text-right text-rose-400 font-mono">-R$ {effectiveScrapCostBRLPerKg.toFixed(2)}/kg</td>
                </tr>
                <tr>
                  <td className="py-1 px-1.5 text-slate-300">4. (-) Custo Industrial de Fundição & Trefilação</td>
                  <td className="py-1 px-1.5 text-right text-rose-400 font-mono">-R$ {smeltingCostBRLPerKg.toFixed(2)}/kg</td>
                </tr>
                <tr className="bg-emerald-500/10 font-bold">
                  <td className="py-1 px-1.5 text-emerald-400">(=) MARGEM LÍQUIDA DE ARBITRAGEM NEXUS</td>
                  <td className="py-1 px-1.5 text-right text-emerald-400 font-mono font-bold">R$ {netArbitrageMarginBRLPerKg.toFixed(2)}/kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sensitivity Telemetry Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-950 border border-emerald-500/30 rounded">
              <span className="text-[10px] text-slate-400 block">Sensibilidade por +$100 LME</span>
              <p className="text-emerald-400 font-bold text-xs mt-0.5">+{formatBRL(deltaEbitdaPer100USD)}/mês</p>
              <span className="text-[9px] text-slate-500 block">Impacto direto no EBITDA</span>
            </div>

            <div className="p-2.5 bg-slate-950 border border-amber-500/30 rounded">
              <span className="text-[10px] text-slate-400 block">Sensibilidade por +R$ 0,10 Dólar</span>
              <p className="text-amber-300 font-bold text-xs mt-0.5">+{formatBRL(deltaEbitdaPer10Cents)}/mês</p>
              <span className="text-[9px] text-slate-500 block">Alavancagem cambial positiva</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
