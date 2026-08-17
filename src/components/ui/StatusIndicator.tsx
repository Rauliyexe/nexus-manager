'use client';

import React from 'react';
import { DailyStatusType } from '@/lib/types/nexus';

interface StatusIndicatorProps {
  status: DailyStatusType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showLabel = true,
  size = 'md',
}) => {
  switch (status) {
    case 'GREEN':
      return (
        <span className="inline-flex items-center space-x-1.5 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          {showLabel && <span>OK</span>}
        </span>
      );

    case 'YELLOW':
      return (
        <span className="inline-flex items-center space-x-1.5 font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          {showLabel && <span>ATENÇÃO</span>}
        </span>
      );

    case 'RED':
      return (
        <span className="inline-flex items-center space-x-1.5 font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          {showLabel && <span>CRÍTICO</span>}
        </span>
      );

    case 'NO_RESPONSE':
    default:
      return (
        <span className="inline-flex items-center space-x-1.5 font-mono text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
          {showLabel && <span>SEM RESPOSTA</span>}
        </span>
      );
  }
};
