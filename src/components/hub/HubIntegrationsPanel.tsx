'use client';

import React from 'react';
import {
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export const HubIntegrationsPanel: React.FC = () => {
  const { integrations, triggerIntegrationSync } = useNexus();

  return (
    <div className="space-y-4 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-shadow">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-[#1A281E] dark:text-slate-100 uppercase tracking-wide">
              Central de Integrações & Telemetria de APIs
            </h2>
            <span className="w-2 h-2 rounded-full bg-[#4D7C5D] animate-pulse" />
          </div>
          <p className="text-xs text-[#5C6E62] dark:text-slate-400 mt-0.5">
            Monitoramento em tempo real dos conectores de mercado, Banco Central, Supabase e ERP Dcopper
          </p>
        </div>

        <div className="px-3 py-1.5 bg-[#EBF2EE] dark:bg-[#1C2E24] border border-[#D4E8DB] dark:border-[#1E3125] rounded-xl text-xs font-bold text-[#2C523D] dark:text-[#76B38B] flex items-center space-x-1.5 self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5" />
          <span>{integrations.filter((i) => i.status === 'ONLINE').length} / {integrations.length} ONLINE</span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl space-y-3.5 flex flex-col justify-between card-shadow card-shadow-hover transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1 ${
                    item.type === 'DATABASE'
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40'
                      : item.type === 'ERP'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                      : item.type === 'WEBHOOK'
                      ? 'bg-[#EBF2EE] text-[#2C523D] dark:bg-[#1C2E24] dark:text-[#76B38B] border border-[#D4E8DB] dark:border-[#1E3125]'
                      : 'bg-[#EBF2EE] text-[#2C523D] dark:bg-[#1C2E24] dark:text-[#76B38B] border border-[#D4E8DB] dark:border-[#1E3125]'
                  }`}
                >
                  {item.type}
                </span>

                <span
                  className={`flex items-center space-x-1.5 text-[10px] font-semibold ${
                    item.status === 'ONLINE'
                      ? 'text-[#4D7C5D] dark:text-[#76B38B]'
                      : item.status === 'SYNCING'
                      ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'ONLINE'
                        ? 'bg-[#4D7C5D]'
                        : item.status === 'SYNCING'
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span>{item.status}</span>
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#1A281E] dark:text-slate-100">
                  {item.name}
                </h3>
                <p className="text-[11px] text-[#5C6E62] dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8E3] dark:border-[#1E3125] space-y-2.5">
              <div className="flex items-center justify-between text-[10px] text-[#5C6E62] dark:text-slate-400">
                <span>Latência: <strong className="text-[#1A281E] dark:text-slate-200">{item.latencyMs}ms</strong></span>
                <span>Último Sync: <strong className="text-[#1A281E] dark:text-slate-300">{item.lastSync}</strong></span>
              </div>

              <button
                onClick={() => triggerIntegrationSync(item.id)}
                disabled={item.status === 'SYNCING'}
                className="w-full py-2 bg-[#F5F7F5] dark:bg-[#0B120E] hover:bg-[#E2E8E3] dark:hover:bg-[#17261D] disabled:opacity-50 text-[#1A281E] dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border border-[#E2E8E3] dark:border-[#1E3125] transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${item.status === 'SYNCING' ? 'animate-spin text-[#4D7C5D]' : 'text-[#4D7C5D]'}`}
                />
                <span>Sincronizar Agora</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
