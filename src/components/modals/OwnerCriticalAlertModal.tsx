'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export const OwnerCriticalAlertModal: React.FC = () => {
  const { activeOwnerCriticalAlert, dismissOwnerCriticalAlert, currentUser } = useNexus();

  if (!activeOwnerCriticalAlert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#121D16] border-2 border-rose-500/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 p-4 border-b border-rose-500/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/60 text-rose-400 flex items-center justify-center shadow-lg animate-pulse shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold border border-rose-500/40 uppercase">
                ALERTA DE SEGURANÇA CRÍTICA DA DIRETORIA
              </span>
              <h2 className="text-sm font-extrabold text-white font-mono uppercase tracking-wide mt-0.5">
                {activeOwnerCriticalAlert.protocol} — AÇÃO SENSÍVEL DETECTADA
              </h2>
            </div>
          </div>

          <button
            onClick={dismissOwnerCriticalAlert}
            className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-rose-900/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Main Context Card */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#5C6E62] dark:text-slate-400">AUTOR DA SOLICITAÇÃO:</span>
              <strong className="text-[#1A281E] dark:text-slate-100">{activeOwnerCriticalAlert.author_name} ({activeOwnerCriticalAlert.author_role})</strong>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#5C6E62] dark:text-slate-400">ALVO DA AÇÃO:</span>
              <strong className="text-[#4D7C5D] dark:text-[#76B38B]">{activeOwnerCriticalAlert.target_name}</strong>
            </div>

            <div className="p-2.5 bg-rose-950/20 rounded-lg border border-rose-500/30 text-rose-200 font-mono text-[11px] font-bold">
              {activeOwnerCriticalAlert.action_summary}
            </div>

            <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1">
              {activeOwnerCriticalAlert.description}
            </p>
          </div>

          {/* Workflow Status Note */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-300 flex items-start space-x-2.5 text-[11px]">
            <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="font-mono block uppercase text-[10px]">REQUISITO DE GOVERNANÇA:</strong>
              <span>Esta alteração está no status <strong>PENDENTE DE APROVAÇÃO DO DIRETOR DE TI</strong> para garantir integridade e auditoria de privilégios RLS.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500">
              Notificação enviada em tempo real para o Proprietário
            </span>

            <button
              onClick={dismissOwnerCriticalAlert}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ciente do Alerta Crítico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
