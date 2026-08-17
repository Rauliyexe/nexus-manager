'use client';

import React, { useState } from 'react';
import { PlayCircle, Clock } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export default function AdminSimulacaoPage() {
  const { runSimulationEvent } = useNexus();
  const [log, setLog] = useState<string[]>([
    'Sistema de Simulação Nexus operacional.',
    'Aguardando disparo manual dos eventos...',
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
      msg = `[${now}] Evento 17:00 disparado — Verificação de ausência de fechamento concluída. Alertas de Sem Resposta (NO_RESPONSE) gerados.`;
    }

    setLog((prev) => [msg, ...prev]);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-xs">
      {/* Header Bar */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800/90 p-4 rounded-lg shadow-sm">
        <div className="p-2 bg-slate-800 border border-slate-700 text-slate-100 rounded">
          <PlayCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 font-sans tracking-tight">
            Simulador de Automações Operacionais Nexus
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ambiente de teste para disparar manualmente as automações das 07:00, 16:30 e 17:00.
          </p>
        </div>
      </div>

      {/* Simulator Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 07:00 */}
        <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-lg shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              07:00
            </span>
            <h3 className="font-bold text-slate-100 mt-2">Início do Dia (07:00)</h3>
            <p className="text-slate-400 mt-1">
              Ativa obrigações diárias e publica aviso de rotina nos chats das 10 áreas.
            </p>
          </div>
          <button
            onClick={() => handleRun('07:00')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 rounded border border-slate-700 transition-colors"
          >
            Simular 07:00
          </button>
        </div>

        {/* 16:30 */}
        <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-lg shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              16:30
            </span>
            <h3 className="font-bold text-slate-100 mt-2">Cobrança de Fechamento (16:30)</h3>
            <p className="text-slate-400 mt-1">
              Envia solicitação de fechamento operacional no chat de cada área.
            </p>
          </div>
          <button
            onClick={() => handleRun('16:30')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 rounded border border-slate-700 transition-colors"
          >
            Simular 16:30
          </button>
        </div>

        {/* 17:00 */}
        <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-lg shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-rose-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              17:00
            </span>
            <h3 className="font-bold text-slate-100 mt-2">Prazo Limite / Cutoff (17:00)</h3>
            <p className="text-slate-400 mt-1">
              Identifica áreas sem resposta, aplica status `NO_RESPONSE` e aciona alerta.
            </p>
          </div>
          <button
            onClick={() => handleRun('17:00')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 rounded border border-slate-700 transition-colors"
          >
            Simular 17:00
          </button>
        </div>
      </div>

      {/* Audit Log Box */}
      <div className="bg-slate-900 border border-slate-800/90 p-4 rounded-lg shadow-sm space-y-2">
        <h3 className="font-bold text-slate-100 font-mono uppercase tracking-wider text-[11px]">
          Log de Execução do Simulador
        </h3>
        <div className="bg-slate-950 rounded p-3 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto border border-slate-800">
          {log.map((item, idx) => (
            <div key={idx} className="border-b border-slate-900 pb-0.5 last:border-none">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
