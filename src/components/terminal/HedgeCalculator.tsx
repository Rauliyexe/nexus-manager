'use client';

import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, Calculator, RefreshCw, Layers, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { HedgePosition, HedgeStrategy } from '@/lib/types/nexus';

interface HedgeCalculatorProps {
  currentLmeSpotUSD: number;
  currentUsdBrl: number;
  currentScrapBuyBRLPerKg: number;
}

const SEED_HEDGE_POSITIONS: HedgePosition[] = [
  {
    id: 'hdg-101',
    contractCode: 'LME-CU-SET26-9800',
    strategy: 'FORWARD_LOCK',
    commodity: 'COPPER_LME',
    volumeTons: 600,
    strikePriceUSD: 9800,
    exchangeRateBRL: 5.40,
    lockedPriceBRLPerKg: 52.92,
    currentSpotBRLPerKg: 53.33,
    pnlBRL: -246000,
    status: 'ACTIVE',
    maturityDate: '15/09/2026',
  },
  {
    id: 'hdg-102',
    contractCode: 'B3-DOL-OUT26-5.45',
    strategy: 'B3_DOL_FUT',
    commodity: 'USD_BRL',
    volumeTons: 1200,
    strikePriceUSD: 9850,
    exchangeRateBRL: 5.45,
    lockedPriceBRLPerKg: 53.68,
    currentSpotBRLPerKg: 53.33,
    pnlBRL: 420000,
    status: 'ACTIVE',
    maturityDate: '28/10/2026',
  },
  {
    id: 'hdg-103',
    contractCode: 'LME-COLLAR-NOV26',
    strategy: 'COLLAR',
    commodity: 'COPPER_LME',
    volumeTons: 850,
    strikePriceUSD: 9700,
    exchangeRateBRL: 5.42,
    lockedPriceBRLPerKg: 52.57,
    currentSpotBRLPerKg: 53.33,
    pnlBRL: 185000,
    status: 'ACTIVE',
    maturityDate: '20/11/2026',
  },
];

export const HedgeCalculator: React.FC<HedgeCalculatorProps> = ({
  currentLmeSpotUSD = 9840,
  currentUsdBrl = 5.42,
  currentScrapBuyBRLPerKg = 49.08,
}) => {
  // Calculator inputs state
  const [volumeTons, setVolumeTons] = useState<number>(500);
  const [targetLmeUSD, setTargetLmeUSD] = useState<number>(currentLmeSpotUSD);
  const [targetUsdBrl, setTargetUsdBrl] = useState<number>(currentUsdBrl);
  const [scrapCostBRLPerKg, setScrapCostBRLPerKg] = useState<number>(currentScrapBuyBRLPerKg);
  const [strategy, setStrategy] = useState<HedgeStrategy>('FORWARD_LOCK');
  const [positions, setPositions] = useState<HedgePosition[]>(SEED_HEDGE_POSITIONS);
  const [notification, setNotification] = useState<string | null>(null);

  // Formatting helpers
  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Calculations
  const currentSpotPriceBRLPerKg = (currentLmeSpotUSD * currentUsdBrl) / 1000;
  const lockedPriceBRLPerKg = (targetLmeUSD * targetUsdBrl) / 1000;
  const grossMarginPerKg = lockedPriceBRLPerKg - scrapCostBRLPerKg;
  const grossMarginPerTon = grossMarginPerKg * 1000;
  const totalVolumeKg = volumeTons * 1000;
  const totalHedgedRevenue = lockedPriceBRLPerKg * totalVolumeKg;
  const totalUnhedgedRevenue = currentSpotPriceBRLPerKg * totalVolumeKg;
  const totalCost = scrapCostBRLPerKg * totalVolumeKg;
  const hedgedGrossProfit = totalHedgedRevenue - totalCost;
  const pnlDifference = totalHedgedRevenue - totalUnhedgedRevenue;

  // Handler to register simulated hedge in active book
  const handleAddHedgeToBook = () => {
    const newPos: HedgePosition = {
      id: `hdg-${Date.now().toString().slice(-4)}`,
      contractCode: `NEXUS-${strategy}-${volumeTons}T-${targetLmeUSD}`,
      strategy,
      commodity: 'COPPER_LME',
      volumeTons,
      strikePriceUSD: targetLmeUSD,
      exchangeRateBRL: targetUsdBrl,
      lockedPriceBRLPerKg: Math.round(lockedPriceBRLPerKg * 100) / 100,
      currentSpotBRLPerKg: Math.round(currentSpotPriceBRLPerKg * 100) / 100,
      pnlBRL: Math.round(pnlDifference),
      status: 'ACTIVE',
      maturityDate: '30/12/2026',
    };

    setPositions([newPos, ...positions]);
    setNotification(`Trava de ${volumeTons}t de Cobre registrada no livro com sucesso!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Sensitivity Ladder Simulation (-10% to +10% LME price shift)
  const sensitivityShifts = [-10, -5, 0, +5, +10];

  return (
    <div className="space-y-4 font-mono text-xs text-amber-400">
      {/* Top Header */}
      <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              MOTOR DE HEDGE & DERIVATIVOS — COBRE LME & DÓLAR FUTURO B3
            </h2>
            <p className="text-[10px] text-slate-400">
              Trava de spreads de aquisição de sucata vs venda de vergalhões e arames de cobre.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            SPOT LME: ${currentLmeSpotUSD.toLocaleString()}/t
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
            USD/BRL: R$ {currentUsdBrl.toFixed(2)}
          </span>
        </div>
      </div>

      {notification && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300 flex items-center space-x-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column (5 Cols): Parameter Controls */}
        <div className="lg:col-span-5 bg-slate-950 border border-amber-500/30 p-3.5 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 text-[11px] font-bold text-amber-300">
            <span>PARÂMETROS DA OPERAÇÃO DE HEDGE</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Strategy Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase">Estratégia de Proteção:</label>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {[
                { id: 'FORWARD_LOCK', label: 'FORWARD NDF (Trava 100%)' },
                { id: 'COLLAR', label: 'ZERO-COST COLLAR' },
                { id: 'B3_DOL_FUT', label: 'DÓLAR FUTURO B3 (DOL)' },
                { id: 'PUT_OPTION', label: 'PUT OPTION (Seguro)' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStrategy(st.id as HedgeStrategy)}
                  className={`p-1.5 rounded text-left transition-colors border ${
                    strategy === st.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-black text-slate-400 border-amber-500/10 hover:border-amber-500/30'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Controls */}
          <div className="space-y-2 text-[11px]">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Volume de Cobre a Travar:</span>
                <strong className="text-amber-300">{volumeTons} toneladas ({volumeTons * 1000} kg)</strong>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={volumeTons}
                onChange={(e) => setVolumeTons(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-900 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Strike LME Alvo (USD/t):</label>
                <input
                  type="number"
                  step="20"
                  value={targetLmeUSD}
                  onChange={(e) => setTargetLmeUSD(Number(e.target.value))}
                  className="w-full bg-black border border-amber-500/30 rounded px-2 py-1 text-amber-300 focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Câmbio Travado (USD/BRL):</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetUsdBrl}
                  onChange={(e) => setTargetUsdBrl(Number(e.target.value))}
                  className="w-full bg-black border border-amber-500/30 rounded px-2 py-1 text-amber-300 focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Custo Médio Compra Sucata (R$/kg):</label>
              <input
                type="number"
                step="0.10"
                value={scrapCostBRLPerKg}
                onChange={(e) => setScrapCostBRLPerKg(Number(e.target.value))}
                className="w-full bg-black border border-amber-500/30 rounded px-2 py-1 text-emerald-400 focus:outline-none focus:border-emerald-400 font-bold"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleAddHedgeToBook}
              className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded font-bold transition-colors flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>TRAVAR CONTRATO NO LIVRO DE HEDGE</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Output Simulation & Sensitivity Ladder */}
        <div className="lg:col-span-7 space-y-3">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-slate-950 border border-amber-500/30 rounded">
              <span className="text-[10px] text-slate-400 block">Preço Travado (BRL/kg)</span>
              <p className="text-amber-300 font-bold text-sm mt-0.5">R$ {lockedPriceBRLPerKg.toFixed(2)}/kg</p>
            </div>

            <div className="p-2.5 bg-slate-950 border border-emerald-500/30 rounded">
              <span className="text-[10px] text-slate-400 block">Margem Bruta Travada</span>
              <p className="text-emerald-400 font-bold text-sm mt-0.5">{formatBRL(grossMarginPerTon)}/t</p>
            </div>

            <div className="p-2.5 bg-slate-950 border border-amber-500/30 rounded">
              <span className="text-[10px] text-slate-400 block">Receita Travada Lote</span>
              <p className="text-amber-300 font-bold text-sm mt-0.5">{formatBRL(totalHedgedRevenue)}</p>
            </div>

            <div className="p-2.5 bg-slate-950 border border-sky-500/30 rounded">
              <span className="text-[10px] text-slate-400 block">Lucro Bruto Protegido</span>
              <p className="text-sky-300 font-bold text-sm mt-0.5">{formatBRL(hedgedGrossProfit)}</p>
            </div>
          </div>

          {/* Sensitivity Table: Stress testing LME market movements */}
          <div className="bg-slate-950 border border-amber-500/30 p-3 rounded space-y-2">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-1 text-[10px] font-bold text-amber-300">
              <span>MATRIZ DE SENSIBILIDADE DE RESULTADO (DESLOCAMENTO LME)</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-amber-500/20 text-amber-500/80 uppercase">
                  <th className="py-1 px-1.5">Cenário LME</th>
                  <th className="py-1 px-1.5">Preço Spot (USD/t)</th>
                  <th className="py-1 px-1.5">Receita sem Hedge</th>
                  <th className="py-1 px-1.5">Receita c/ Hedge</th>
                  <th className="py-1 px-1.5 text-right">Efeito do Hedge (PnL)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {sensitivityShifts.map((pct) => {
                  const simPriceUSD = currentLmeSpotUSD * (1 + pct / 100);
                  const simSpotBRLPerKg = (simPriceUSD * currentUsdBrl) / 1000;
                  const simUnhedgedRev = simSpotBRLPerKg * totalVolumeKg;
                  const pnl = totalHedgedRevenue - simUnhedgedRev;

                  return (
                    <tr key={pct} className={`hover:bg-amber-500/5 ${pct === 0 ? 'bg-amber-500/10 font-bold' : ''}`}>
                      <td className="py-1.5 px-1.5 font-bold text-slate-200">
                        {pct > 0 ? `+${pct}% (Alta)` : pct < 0 ? `${pct}% (Queda)` : '0% (Spot Atual)'}
                      </td>
                      <td className="py-1.5 px-1.5 text-slate-300">${Math.round(simPriceUSD).toLocaleString()}</td>
                      <td className="py-1.5 px-1.5 text-slate-400">{formatBRL(simUnhedgedRev)}</td>
                      <td className="py-1.5 px-1.5 text-amber-300 font-bold">{formatBRL(totalHedgedRevenue)}</td>
                      <td className={`py-1.5 px-1.5 text-right font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pnl >= 0 ? `+${formatBRL(pnl)}` : formatBRL(pnl)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Active Hedge Book Table */}
      <div className="bg-slate-950 border border-amber-500/30 p-3 rounded space-y-2">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-1 text-[11px] font-bold text-amber-300">
          <span>LIVRO DE CONTRATOS ATIVOS DE HEDGE & DERIVATIVOS ({positions.length})</span>
          <span className="text-[10px] text-slate-500">Maturidade Q3/Q4 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-amber-500/20 text-amber-500 uppercase">
                <th className="py-1 px-1.5">Código Contrato</th>
                <th className="py-1 px-1.5">Estratégia</th>
                <th className="py-1 px-1.5">Volume (t)</th>
                <th className="py-1 px-1.5">Strike (USD/t)</th>
                <th className="py-1 px-1.5">Câmbio</th>
                <th className="py-1 px-1.5">Travado (R$/kg)</th>
                <th className="py-1 px-1.5">Spot Atual</th>
                <th className="py-1 px-1.5 text-right">PnL BRL</th>
                <th className="py-1 px-1.5 text-center">Vencimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-amber-500/5 transition-colors">
                  <td className="py-1.5 px-1.5 font-bold text-amber-300">{pos.contractCode}</td>
                  <td className="py-1.5 px-1.5 text-slate-300">{pos.strategy}</td>
                  <td className="py-1.5 px-1.5 text-slate-200 font-bold">{pos.volumeTons}t</td>
                  <td className="py-1.5 px-1.5 text-slate-300">${pos.strikePriceUSD.toLocaleString()}</td>
                  <td className="py-1.5 px-1.5 text-slate-300">R$ {pos.exchangeRateBRL.toFixed(2)}</td>
                  <td className="py-1.5 px-1.5 text-amber-300 font-bold">R$ {pos.lockedPriceBRLPerKg.toFixed(2)}</td>
                  <td className="py-1.5 px-1.5 text-slate-400">R$ {pos.currentSpotBRLPerKg.toFixed(2)}</td>
                  <td className={`py-1.5 px-1.5 text-right font-bold ${pos.pnlBRL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pos.pnlBRL >= 0 ? `+${formatBRL(pos.pnlBRL)}` : formatBRL(pos.pnlBRL)}
                  </td>
                  <td className="py-1.5 px-1.5 text-center text-slate-400">{pos.maturityDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
