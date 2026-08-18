'use client';

import React, { useState } from 'react';
import { PlayCircle, Clock, Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export default function AdminSimulacaoPage() {
  const { runSimulationEvent } = useNexus();
  const [log, setLog] = useState<string[]>([
    'Sistema de Simulação Copper Group operacional.',
    'Aguardando disparo manual dos eventos de demonstração...',
  ]);

  const handleRun = (event: '07:00' | '16:30' | '17:00') => {
    runSimulationEvent(event);
    const now = new Date().toLocaleTimeString('pt-BR');

    let msg = '';
    if (event === '07:00') {
      msg = `[${now}] Evento 07:00 disparado — Notificação de início de rotina enviada a todas as 10 áreas.`;
    } else if (event === '16:30') {
      msg = `[${now}] Evento 16:30 disparado — Solicitação de fechamento enviada aos chats corporativos.`;
    } else if (event === '17:00') {
      msg = `[${now}] Evento 17:00 disparado — Verificação de fechamento concluída. Alertas de Sem Resposta (NO_RESPONSE) gerados.`;
    }

    setLog((prev) => [msg, ...prev]);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans p-4 sm:p-6 pb-8 text-xs">
      {/* Header Bar */}
      <div className="flex items-center space-x-3 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow">
        <div className="p-2.5 bg-[#1B3026] text-white rounded-xl shadow-xs shrink-0">
          <PlayCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Simulador de Rotinas & Automações
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · SIMULADOR
            </span>
          </div>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
            Dispare manualmente os rituais das 07:00, 16:30 e 17:00 para demonstrar os fluxos automatizados.
          </p>
        </div>
      </div>

      {/* Simulator Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 07:00 */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#1B3026] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2.5 py-1 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125] inline-block">
              07:00 · ABERTURA
            </span>
            <h3 className="font-bold text-[#111D15] dark:text-slate-100 text-sm">Início da Operação (07:00)</h3>
            <p className="text-[#5E7567] dark:text-slate-400 leading-relaxed text-xs">
              Ativa obrigações diárias e publica aviso de início de rotina nos canais das 10 áreas da empresa.
            </p>
          </div>
          <button
            onClick={() => handleRun('07:00')}
            className="w-full py-2.5 px-4 bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center justify-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Simular 07:00</span>
          </button>
        </div>

        {/* 16:30 */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-900/60 inline-block">
              16:30 · COBRANÇA
            </span>
            <h3 className="font-bold text-[#111D15] dark:text-slate-100 text-sm">Aviso de Fechamento (16:30)</h3>
            <p className="text-[#5E7567] dark:text-slate-400 leading-relaxed text-xs">
              Dispara lembrete preventivo de envio de status aos gestores antes do horário limite das 17:00.
            </p>
          </div>
          <button
            onClick={() => handleRun('16:30')}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center justify-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simular 16:30</span>
          </button>
        </div>

        {/* 17:00 */}
        <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 rounded-2xl card-shadow space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-900/60 inline-block">
              17:00 · LIMITE
            </span>
            <h3 className="font-bold text-[#111D15] dark:text-slate-100 text-sm">Horário Limite (17:00)</h3>
            <p className="text-[#5E7567] dark:text-slate-400 leading-relaxed text-xs">
              Verifica áreas sem fechamento, gerando alertas de alta severidade e publicando nos canais corporativos.
            </p>
          </div>
          <button
            onClick={() => handleRun('17:00')}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center justify-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simular 17:00</span>
          </button>
        </div>
      </div>

      {/* Console Logs Terminal */}
      <div className="bg-[#111D15] text-[#EEF2EE] p-5 rounded-2xl border border-[#1E3125] font-mono text-xs space-y-3 card-shadow">
        <div className="flex items-center justify-between border-b border-[#1E3125] pb-2 text-[10px] text-[#76B38B]">
          <span className="font-bold flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>LOG DE DISPARO DE AUTOMAÇÕES EM TEMPO REAL</span>
          </span>
          <span>Buffer: {log.length} registros</span>
        </div>

        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2">
          {log.map((entry, idx) => (
            <div key={idx} className="leading-relaxed flex items-start space-x-2">
              <span className="text-[#2C6E49] dark:text-[#76B38B] font-bold">❯</span>
              <span className="text-slate-300">{entry}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração • Disparo e teste de rotinas corporativas automatizadas para a diretoria</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP AUTOMATIONS</span>
      </div>
    </div>
  );
}
