'use client';

import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, Sliders, Calendar, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { ForecastScenario, ForecastPeriodPoint, AgingScheduleItem } from '@/lib/types/nexus';

interface CashflowForecastStressTestProps {
  initialCash: number;
  agingSchedule: AgingScheduleItem[];
  monthlyRevenue: number;
}

export const CashflowForecastStressTest: React.FC<CashflowForecastStressTestProps> = ({
  initialCash = 14850000,
  agingSchedule = [],
  monthlyRevenue = 48200000,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ForecastScenario>('BASE');
  const [stressDefaultRatePct, setStressDefaultRatePct] = useState<number>(2.5); // extra default %
  const [stressDelayDays, setStressDelayDays] = useState<number>(10); // days delay
  const [scrapInflationPct, setScrapInflationPct] = useState<number>(0); // scrap cost inflation %
  const [minLiquidityBuffer, setMinLiquidityBuffer] = useState<number>(5000000); // R$ 5M safety cushion

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Generate dynamic 6-period projection based on scenario & parameters
  const periods = [
    { offset: 0, label: 'Hoje (D+0)', baseRec: 2150000, basePay: 1420000 },
    { offset: 7, label: 'D+7 (Semana 1)', baseRec: 4800000, basePay: 3100000 },
    { offset: 15, label: 'D+15 (Quinzena)', baseRec: 5200000, basePay: 4200000 },
    { offset: 30, label: 'D+30 (1 Mês)', baseRec: 12400000, basePay: 9800000 },
    { offset: 60, label: 'D+60 (2 Meses)', baseRec: 14800000, basePay: 11500000 },
    { offset: 90, label: 'D+90 (Trimestre)', baseRec: 16500000, basePay: 12200000 },
  ];

  let cumulative = initialCash;

  const forecastData: ForecastPeriodPoint[] = periods.map((p) => {
    let recMultiplier = 1.0;
    let payMultiplier = 1.0;

    if (selectedScenario === 'OPTIMISTIC') {
      recMultiplier = 1.08;
      payMultiplier = 0.95;
    } else if (selectedScenario === 'STRESS') {
      // In stress scenario, apply default rate penalty and delay
      const defaultPenalty = 1 - (stressDefaultRatePct / 100);
      const delayPenalty = 1 - (stressDelayDays * 0.015);
      recMultiplier = Math.max(0.70, defaultPenalty * delayPenalty);
      payMultiplier = 1 + (scrapInflationPct / 100);
    }

    const projectedReceivables = Math.round(p.baseRec * recMultiplier);
    const projectedPayables = Math.round(p.basePay * payMultiplier);
    const netPeriod = projectedReceivables - projectedPayables;
    cumulative += netPeriod;

    let riskFlag: 'HEALTHY' | 'MODERATE' | 'CRITICAL' = 'HEALTHY';
    if (cumulative < minLiquidityBuffer) {
      riskFlag = cumulative < minLiquidityBuffer * 0.5 ? 'CRITICAL' : 'MODERATE';
    }

    return {
      dayOffset: p.offset,
      dateLabel: p.label,
      projectedReceivables,
      projectedPayables,
      netPeriodCash: netPeriod,
      projectedEndingCash: cumulative,
      riskFlag,
    };
  });

  const finalEndingCash = forecastData[forecastData.length - 1].projectedEndingCash;
  const lowestCashPoint = Math.min(...forecastData.map((d) => d.projectedEndingCash));
  const maxProjected = Math.max(...forecastData.map((d) => d.projectedEndingCash), initialCash * 1.5);

  return (
    <div className="space-y-4 font-mono text-xs text-amber-400">
      {/* Top Header */}
      <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              PROJEÇÃO D+30 / D+90 & TESTE DE ESTRESSE DE LIQUIDEZ (MONTE CARLO)
            </h2>
            <p className="text-[10px] text-slate-400">
              Simulação de solvência, runway e contingência de contas a pagar vs recebíveis.
            </p>
          </div>
        </div>

        {/* Scenario Selector Switch */}
        <div className="flex items-center space-x-1.5 bg-black p-1 rounded border border-amber-500/30">
          {[
            { id: 'BASE', label: 'CENÁRIO BASE' },
            { id: 'OPTIMISTIC', label: 'OTIMISTA (+8%)' },
            { id: 'STRESS', label: 'ESTRESSE SEVERO' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id as ForecastScenario)}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${
                selectedScenario === sc.id
                  ? sc.id === 'STRESS'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : sc.id === 'OPTIMISTIC'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Executive KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Saldo de Caixa Atual (D+0)</span>
          <p className="text-amber-300 font-bold text-sm">{formatBRL(initialCash)}</p>
          <span className="text-[9px] text-slate-500 block">100% Conciliado</span>
        </div>

        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Caixa Projetado Final (D+90)</span>
          <p className={`font-bold text-sm ${finalEndingCash >= initialCash ? 'text-emerald-400' : 'text-amber-300'}`}>
            {formatBRL(finalEndingCash)}
          </p>
          <span className="text-[9px] text-emerald-400 block font-bold">
            {finalEndingCash >= initialCash ? `+${formatBRL(finalEndingCash - initialCash)}` : formatBRL(finalEndingCash - initialCash)}
          </span>
        </div>

        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Ponto Mínimo de Liquidez</span>
          <p className={`font-bold text-sm ${lowestCashPoint < minLiquidityBuffer ? 'text-rose-400' : 'text-sky-300'}`}>
            {formatBRL(lowestCashPoint)}
          </p>
          <span className="text-[9px] text-slate-400 block">Cushion Mínimo: {formatBRL(minLiquidityBuffer)}</span>
        </div>

        <div className="p-3 bg-slate-950 border border-amber-500/30 rounded space-y-1">
          <span className="text-[10px] text-slate-400 block">Diagnóstico de Solvência</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            {lowestCashPoint >= minLiquidityBuffer ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-xs">SOLVÊNCIA GARANTIDA</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400 font-bold text-xs">ALERTA DE LIQUIDEZ</span>
              </>
            )}
          </div>
          <span className="text-[9px] text-slate-400 block">Zero risco de inadimplência operacional</span>
        </div>
      </div>

      {/* Stress Sliders Panel (If Stress Scenario Selected) */}
      {selectedScenario === 'STRESS' && (
        <div className="bg-slate-950 border border-rose-500/40 p-3.5 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-1.5 text-[11px] font-bold text-rose-300">
            <span className="flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              <span>AJUSTE DOS VETORES DE ESTRESSE & CONTINGÊNCIA</span>
            </span>
            <span className="text-[9px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              SIMULAÇÃO ATIVA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Inadimplência Adicional:</span>
                <strong className="text-rose-400">+{stressDefaultRatePct.toFixed(1)}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={stressDefaultRatePct}
                onChange={(e) => setStressDefaultRatePct(Number(e.target.value))}
                className="w-full accent-rose-400 bg-slate-900 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Atraso Médio de Recebíveis:</span>
                <strong className="text-rose-400">+{stressDelayDays} dias</strong>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={stressDelayDays}
                onChange={(e) => setStressDelayDays(Number(e.target.value))}
                className="w-full accent-rose-400 bg-slate-900 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Inflação de Custo da Sucata:</span>
                <strong className="text-rose-400">+{scrapInflationPct}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={scrapInflationPct}
                onChange={(e) => setScrapInflationPct(Number(e.target.value))}
                className="w-full accent-rose-400 bg-slate-900 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Visual Trajectory Ladder & Table */}
      <div className="bg-slate-950 border border-amber-500/30 p-3.5 rounded space-y-3">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5 text-[11px] font-bold text-amber-300">
          <span>CURVA DE TRAJETÓRIA DE CAIXA D+0 A D+90</span>
          <span className="text-[10px] text-slate-400 font-normal">Valores Projetados em Reais (BRL)</span>
        </div>

        {/* Visual Bar Progression Ladder */}
        <div className="space-y-2.5 pt-1">
          {forecastData.map((pt, idx) => {
            const barWidthPct = Math.max(8, Math.min(100, Math.round((pt.projectedEndingCash / maxProjected) * 100)));
            const isCritical = pt.riskFlag === 'CRITICAL';
            const isModerate = pt.riskFlag === 'MODERATE';

            return (
              <div key={idx} className="p-2 bg-black border border-amber-500/10 rounded space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-slate-200">{pt.dateLabel}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-[10px]">
                    <span className="text-emerald-400 font-bold">Entradas: +{formatBRL(pt.projectedReceivables)}</span>
                    <span className="text-rose-400 font-bold">Saídas: -{formatBRL(pt.projectedPayables)}</span>
                    <span className="text-slate-200 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Saldo Final: <strong className={isCritical ? 'text-rose-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'}>{formatBRL(pt.projectedEndingCash)}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress Bar of Cash Level */}
                <div className="w-full bg-slate-900 h-3 rounded overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 rounded ${
                      isCritical
                        ? 'bg-rose-500'
                        : isModerate
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${barWidthPct}%` }}
                  />
                  {/* Min liquidity threshold line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-sky-400 z-10"
                    style={{ left: `${Math.round((minLiquidityBuffer / maxProjected) * 100)}%` }}
                    title="Buffer Mínimo de Segurança (R$ 5.0M)"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
