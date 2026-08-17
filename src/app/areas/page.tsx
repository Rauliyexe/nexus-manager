'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, ArrowRight } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export default function AreasPage() {
  const { areas } = useNexus();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredAreas = areas.filter((area) => {
    const matchesSearch =
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.manager?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || area.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3 max-w-7xl mx-auto font-sans">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded shadow-xs">
        <div>
          <h1 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
            Áreas Operacionais da Nexus
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tabela de inventário operacional com gestores, status de fechamento e alertas.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar área ou gestor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded pl-7 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 w-48 font-sans"
            />
          </div>

          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs font-mono font-medium">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'GREEN', label: 'OK' },
              { id: 'YELLOW', label: 'Atenção' },
              { id: 'RED', label: 'Críticas' },
              { id: 'NO_RESPONSE', label: 'Sem Resposta' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-slate-800 text-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Area Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-mono uppercase text-slate-500">
              <th className="py-2.5 px-3">Área</th>
              <th className="py-2.5 px-3">Gestor Responsável</th>
              <th className="py-2.5 px-3">Status Atual</th>
              <th className="py-2.5 px-3 text-center">Obrigações</th>
              <th className="py-2.5 px-3 text-center">Alertas Abertos</th>
              <th className="py-2.5 px-3 text-right font-mono">Última Atualização</th>
              <th className="py-2.5 px-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredAreas.map((area) => (
              <tr key={area.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-100">
                  <Link href={`/areas/${area.id}`} className="hover:underline">
                    {area.name}
                  </Link>
                  <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                    {area.description}
                  </p>
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-medium">
                  {area.manager?.name || 'Não atribuído'}
                </td>
                <td className="py-2.5 px-3">
                  <StatusIndicator status={area.currentStatus!} size="sm" />
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                  {area.obligationsCount}
                </td>
                <td className="py-2.5 px-3 text-center font-mono">
                  <span
                    className={
                      area.openAlertsCount! > 0
                        ? 'text-amber-400 font-bold'
                        : 'text-slate-500'
                    }
                  >
                    {area.openAlertsCount}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                  {area.lastUpdated}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/areas/${area.id}?tab=chat`}
                      className="text-slate-400 hover:text-slate-200 p-1 rounded"
                      title="Conversa da Área"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/areas/${area.id}`}
                      className="text-slate-200 hover:text-white font-semibold text-xs inline-flex items-center space-x-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                    >
                      <span>Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
