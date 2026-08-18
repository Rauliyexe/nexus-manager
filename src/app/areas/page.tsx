'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, ArrowRight, ChevronRight } from 'lucide-react';
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
    <div className="space-y-5 font-sans p-4 sm:p-6 pb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Projetos & Setores Operacionais
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · PROJETOS
            </span>
          </div>
          <p className="text-sm text-[#5E7567] dark:text-slate-400 mt-0.5">
            {areas.length} áreas operacionais • Gestores, rituais e status em tempo real
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5E7567] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar área ou gestor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 bg-[#EEF2EE] dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl pl-8 pr-3 py-2 text-xs text-[#111D15] dark:text-slate-200 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] transition-colors font-medium"
            />
          </div>

          <div className="flex items-center bg-white dark:bg-[#121D16] p-1 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] text-xs font-semibold card-shadow">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'GREEN', label: 'OK' },
              { id: 'YELLOW', label: 'Atenção' },
              { id: 'RED', label: 'Críticas' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-[#1B3026] text-white font-bold shadow-xs'
                    : 'text-[#3B4F43] dark:text-slate-400 hover:text-[#111D15] dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredAreas.map((area) => (
          <div
            key={area.id}
            className="p-5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-3 card-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  area.currentStatus === 'GREEN' ? 'bg-[#2C6E49]' :
                  area.currentStatus === 'YELLOW' ? 'bg-amber-500' :
                  area.currentStatus === 'RED' ? 'bg-rose-600' : 'bg-[#5E7567]'
                }`} />
                <h3 className="font-bold text-[#111D15] dark:text-slate-100 truncate text-sm">{area.name}</h3>
              </div>
              <StatusIndicator status={area.currentStatus!} size="sm" />
            </div>

            <p className="text-xs text-[#3B4F43] dark:text-slate-300 line-clamp-2">
              {area.currentJustification || area.description || 'Sem ocorrências impeditivas.'}
            </p>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#D5E0D7] dark:border-[#1E3125] text-xs">
              <span className="text-[#3B4F43] dark:text-slate-400">
                Gestor: <strong className="text-[#111D15] dark:text-slate-100 font-bold">{area.manager?.name || 'N/A'}</strong>
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-[#5E7567] text-[11px] font-medium">{area.obligationsCount} rituais</span>
                <Link
                  href={`/areas/${area.id}`}
                  className="bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-colors shadow-xs"
                >
                  <span>Abrir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl card-shadow overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE] dark:bg-[#0B120E] text-[10px] font-bold uppercase text-[#3B4F43] dark:text-slate-400 tracking-wider">
              <th className="py-3.5 px-5">Área / Descrição</th>
              <th className="py-3.5 px-5">Gestor Responsável</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-center">Obrigações</th>
              <th className="py-3.5 px-5 text-center">Alertas</th>
              <th className="py-3.5 px-5 text-right">Atualização</th>
              <th className="py-3.5 px-5 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
            {filteredAreas.map((area) => (
              <tr key={area.id} className="hover:bg-[#F9FAF9] dark:hover:bg-[#17261D] transition-colors">
                <td className="py-3.5 px-5">
                  <Link href={`/areas/${area.id}`} className="font-bold text-sm text-[#111D15] dark:text-slate-100 hover:text-[#1B3026] dark:hover:text-[#76B38B] transition-colors">
                    {area.name}
                  </Link>
                  <p className="text-xs text-[#3B4F43] dark:text-slate-400 font-normal line-clamp-1 mt-0.5">
                    {area.description}
                  </p>
                </td>
                <td className="py-3.5 px-5 text-[#111D15] dark:text-slate-200 font-semibold text-xs">
                  {area.manager?.name || 'Não atribuído'}
                </td>
                <td className="py-3.5 px-5">
                  <StatusIndicator status={area.currentStatus!} size="sm" />
                </td>
                <td className="py-3.5 px-5 text-center font-mono font-bold text-[#111D15] dark:text-slate-300">
                  {area.obligationsCount}
                </td>
                <td className="py-3.5 px-5 text-center font-mono">
                  <span className={
                    area.openAlertsCount! > 0
                      ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                      : 'text-[#5E7567] dark:text-slate-500 font-medium'
                  }>
                    {area.openAlertsCount}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right font-mono text-[#5E7567] dark:text-slate-400 font-medium">
                  {area.lastUpdated}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href={`/chat?convId=conv-area-${area.id.replace('area-', '')}`}
                      className="p-2 rounded-xl text-[#3B4F43] dark:text-slate-400 hover:text-[#1B3026] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] transition-colors"
                      title="Conversa da Área"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/areas/${area.id}`}
                      className="text-[#111D15] dark:text-slate-100 hover:text-[#1B3026] font-bold text-xs inline-flex items-center space-x-1.5 bg-[#EEF2EE] dark:bg-[#17261D] hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] px-3 py-1.5 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] transition-colors shadow-2xs"
                    >
                      <span>Abrir</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração • Workspaces e status setoriais demonstrativos para apresentação à diretoria</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP PROJECTS</span>
      </div>
    </div>
  );
}
