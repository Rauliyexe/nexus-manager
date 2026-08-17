'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { AgingScheduleItem } from '@/lib/types/nexus';

interface LiveCashflowChartProps {
  agingSchedule: AgingScheduleItem[];
  todayInflows: number;
  todayOutflows: number;
}

export const LiveCashflowChart: React.FC<LiveCashflowChartProps> = ({
  agingSchedule,
  todayInflows,
  todayOutflows,
}) => {
  const [liveInflows, setLiveInflows] = useState(todayInflows);
  const [liveOutflows, setLiveOutflows] = useState(todayOutflows);
  const [pulseKey, setPulseKey] = useState(0);

  // Real-time live fluctuation in cash flows
  useEffect(() => {
    const interval = setInterval(() => {
      const deltaIn = Math.random() > 0.6 ? Math.floor(Math.random() * 45000) : 0;
      const deltaOut = Math.random() > 0.7 ? Math.floor(Math.random() * 30000) : 0;

      if (deltaIn > 0 || deltaOut > 0) {
        setLiveInflows((prev) => prev + deltaIn);
        setLiveOutflows((prev) => prev + deltaOut);
        setPulseKey((k) => k + 1);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const netBalance = liveInflows - liveOutflows;
  const maxBarValue = Math.max(...agingSchedule.map((a) => Math.max(a.receivables, a.payables))) || 5000000;

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="bg-black border border-amber-500/30 rounded p-3 text-mono text-xs space-y-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
        <div className="flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-amber-300 uppercase">MATRIZ DE FLUXO & LIQUIDEZ REAL-TIME</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>STREAMING LIQUIDEZ</span>
        </div>
      </div>

      {/* Live Inflow/Outflow Big Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-slate-950 border border-emerald-500/30 rounded">
          <span className="text-[10px] text-slate-400 block">Entradas do Dia (Ao Vivo)</span>
          <p className="text-emerald-400 text-xs font-bold mt-0.5">+{formatBRL(liveInflows)}</p>
        </div>
        <div className="p-2 bg-slate-950 border border-rose-500/30 rounded">
          <span className="text-[10px] text-slate-400 block">Saídas do Dia (Ao Vivo)</span>
          <p className="text-rose-400 text-xs font-bold mt-0.5">-{formatBRL(liveOutflows)}</p>
        </div>
        <div className="p-2 bg-slate-950 border border-sky-500/30 rounded">
          <span className="text-[10px] text-slate-400 block">Saldo Líquido</span>
          <p className="text-sky-300 text-xs font-bold mt-0.5">+{formatBRL(netBalance)}</p>
        </div>
      </div>

      {/* Live Real-time Aging Horizon Bar Graph */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-[10px] text-amber-500 font-bold uppercase">
          <span>HORIZONTE DE VENCIMENTO</span>
          <div className="flex space-x-3">
            <span className="text-emerald-400">■ A RECEBER</span>
            <span className="text-rose-400">■ A PAGAR</span>
          </div>
        </div>

        <div className="space-y-2">
          {agingSchedule.map((item, idx) => {
            const recWidth = Math.min(100, Math.round((item.receivables / maxBarValue) * 100));
            const payWidth = Math.min(100, Math.round((item.payables / maxBarValue) * 100));

            return (
              <div key={idx} className="space-y-0.5 p-1.5 bg-slate-950 rounded border border-amber-500/10 text-[10px]">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-300 font-bold">{item.period}</span>
                  <div className="flex space-x-3 text-[9px]">
                    <span className="text-emerald-400">{formatBRL(item.receivables)}</span>
                    <span className="text-rose-400">{formatBRL(item.payables)}</span>
                  </div>
                </div>

                {/* Comparative Dual Progress Bars */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  {/* Receivables Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-500 rounded"
                      style={{ width: `${recWidth}%` }}
                    />
                  </div>
                  {/* Payables Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div
                      className="bg-rose-400 h-full transition-all duration-500 rounded"
                      style={{ width: `${payWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
