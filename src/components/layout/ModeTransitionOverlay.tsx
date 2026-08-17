'use client';

import React from 'react';
import { useNexus } from '@/lib/store/nexusContext';
import { Terminal, Globe } from 'lucide-react';

export const ModeTransitionOverlay: React.FC = () => {
  const { appMode } = useNexus();

  // CSS CRT Scanline overlay effect
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center select-none font-mono pointer-events-none animate-in fade-in duration-300">
      {/* CRT Scanlines visual effect overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-80" />

      <div className="relative z-10 text-center space-y-4 max-w-md p-6 bg-slate-950/90 border border-amber-500/40 rounded shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-300 animate-pulse">
          {appMode === 'FINANCIAL_TERMINAL' ? (
            <Terminal className="w-6 h-6" />
          ) : (
            <Globe className="w-6 h-6 text-sky-400" />
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-xs font-bold text-amber-300 uppercase tracking-widest">
            [NEXUS OS v1.0] ALTERNANDO MODO DE INTERFACE
          </h2>
          <p className="text-[11px] text-slate-400">
            {appMode === 'FINANCIAL_TERMINAL'
              ? 'Carregando Terminal Financeiro Bloomberg & Cotações LME...'
              : 'Carregando Central Holográfica 3D & Painéis Operacionais...'}
          </p>
        </div>

        {/* Animated Loading Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden border border-amber-500/30">
          <div className="bg-amber-400 h-full w-full animate-pulse" />
        </div>

        <div className="text-[9px] text-amber-500/70 uppercase">
          SECURE PROTOCOL • RLS VERIFIED
        </div>
      </div>
    </div>
  );
};
