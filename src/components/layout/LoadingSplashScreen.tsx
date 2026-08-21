'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles, Cpu, Layers } from 'lucide-react';

interface LoadingSplashScreenProps {
  onFinish?: () => void;
}

export const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Iniciando subsistemas Yggdron...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const steps = [
      { at: 15, msg: 'Carregando nós operacionais e permissões RBAC...' },
      { at: 40, msg: 'Conectando à IA Valkyra & Telemetria em tempo real...' },
      { at: 70, msg: 'Sincronizando tarefas, cotações LME e fechamentos...' },
      { at: 90, msg: 'Ambiente privado pronto.' },
      { at: 100, msg: 'Acesso concedido.' },
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 14) + 6;
        const currentStep = steps.find((s) => next >= s.at && prev < s.at);
        if (currentStep) {
          setStatusMessage(currentStep.msg);
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              onFinish?.();
            }, 500);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0E1712] text-white flex flex-col items-center justify-center p-6 select-none transition-opacity duration-500 font-sans ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-[#274437]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
        {/* Animated Brand Logo Mark */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Aura Rings */}
          <div className="absolute w-28 h-28 rounded-3xl bg-emerald-500/10 animate-ping opacity-30" />
          <div className="absolute w-32 h-32 rounded-3xl bg-emerald-500/5 animate-pulse" />

          {/* Logo Squircle Badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1B3026] to-[#121F17] border-2 border-[#76B38B]/60 shadow-2xl flex items-center justify-center relative shadow-emerald-950/50">
            {/* Square Bracket with upper right dot */}
            <div className="w-9 h-9 border-3 border-[#76B38B] rounded-xs relative">
              <span className="w-3 h-3 bg-[#0E1712] absolute -top-1 -right-1" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#76B38B] absolute -top-1 -right-1 shadow-sm shadow-emerald-400" />
            </div>
          </div>
        </div>

        {/* Brand Titles */}
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-1.5">
            <span className="text-xl font-black tracking-widest text-white">YGGDRON</span>
            <span className="text-xl font-light tracking-wider text-[#76B38B]">MANAGER</span>
          </div>
          <p className="text-[11px] font-mono text-[#6F9580] tracking-wider uppercase">
            Centro Operacional & Governança IAM
          </p>
        </div>

        {/* Tactical Progress Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full bg-[#16251D] border border-[#274437]/80 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#4D7C5D] via-[#76B38B] to-emerald-400 rounded-full transition-all duration-150 relative shadow-sm"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {/* Status Text and Percentage */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8FA595]">
            <span className="truncate max-w-[240px] text-left">{statusMessage}</span>
            <span className="font-bold text-[#76B38B]">{progress}%</span>
          </div>
        </div>

        {/* Institutional Micro-Badges */}
        <div className="flex items-center space-x-3 pt-4 border-t border-[#1E3125]/80 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-[#76B38B]" />
            <span>RLS Ativo</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>IA Valkyra</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
};
