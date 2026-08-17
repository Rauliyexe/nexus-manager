'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CheckSquare,
  ShieldCheck,
  BarChart3,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { DailyClosingModal } from '@/components/modals/DailyClosingModal';

export default function HubPage() {
  const { areas, alerts, resolveAlert, obligations } = useNexus();

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(areas[0]?.id || 'area-1');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED' | 'NO_RESPONSE'>('ALL');

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0];

  const greenCount = areas.filter((a) => a.currentStatus === 'GREEN').length;
  const yellowCount = areas.filter((a) => a.currentStatus === 'YELLOW').length;
  const redCount = areas.filter((a) => a.currentStatus === 'RED').length;
  const noResponseCount = areas.filter((a) => a.currentStatus === 'NO_RESPONSE').length;

  const openAlerts = alerts.filter((a) => a.status !== 'RESOLVED');

  const filteredAreas = areas.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.currentStatus === filterStatus;
  });

  const selectedAreaObligations = obligations.filter((o) => o.area_id === selectedArea?.id && o.active);

  const todayDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).toUpperCase();

  // Compliance calculations
  const totalReported = greenCount + yellowCount + redCount;
  const complianceRate = areas.length > 0 ? Math.round((totalReported / areas.length) * 100) : 100;

  return (
    <div className="min-h-full md:h-[calc(100vh-4.5rem)] flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-sm relative md:overflow-hidden select-none font-sans">
      {/* Top Telemetry Header Strip */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 z-20">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold shadow-xs shrink-0">
            NX
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h1 className="text-xs sm:text-xs font-bold text-slate-100 font-mono uppercase tracking-wider truncate">
                COMANDO OPERACIONAL
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              10 Nós Monitorados • Governança Diária
            </p>
          </div>
        </div>

        {/* Global Operational Counters Bar (Icons + Numbers on Mobile) */}
        <div className="flex items-center space-x-1.5 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-950 px-2 py-0.5 sm:py-1 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`font-bold px-1 py-0.5 rounded transition-colors cursor-pointer ${filterStatus === 'ALL' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}
              title="Todas as Áreas"
            >
              {areas.length} <span className="hidden sm:inline">ÁREAS</span>
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setFilterStatus('GREEN')}
              className={`font-bold px-1 py-0.5 rounded transition-colors cursor-pointer flex items-center space-x-1 ${filterStatus === 'GREEN' ? 'bg-emerald-500/20 text-emerald-300' : 'text-emerald-400'}`}
              title="Status Verde"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{greenCount}</span>
              <span className="hidden sm:inline">OK</span>
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setFilterStatus('YELLOW')}
              className={`font-bold px-1 py-0.5 rounded transition-colors cursor-pointer flex items-center space-x-1 ${filterStatus === 'YELLOW' ? 'bg-amber-500/20 text-amber-300' : 'text-amber-400'}`}
              title="Status Amarelo"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{yellowCount}</span>
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setFilterStatus('RED')}
              className={`font-bold px-1 py-0.5 rounded transition-colors cursor-pointer flex items-center space-x-1 ${filterStatus === 'RED' ? 'bg-rose-500/20 text-rose-300' : 'text-rose-400'}`}
              title="Status Vermelho"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>{redCount}</span>
            </button>
            {noResponseCount > 0 && (
              <>
                <span className="text-slate-800">|</span>
                <button
                  onClick={() => setFilterStatus('NO_RESPONSE')}
                  className={`font-bold px-1 py-0.5 rounded transition-colors cursor-pointer flex items-center space-x-1 ${filterStatus === 'NO_RESPONSE' ? 'bg-slate-800 text-slate-200' : 'text-slate-400'}`}
                  title="Pendente"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <span>{noResponseCount}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Viewport Layout (Responsive 2-Col on Desktop, Smooth Vertical Scroll on Mobile) */}
      <div className="flex-1 relative flex flex-col lg:flex-row md:overflow-hidden">
        {/* Left Column: Operational Nodes Interactive Grid */}
        <div className="w-full lg:w-[60%] p-2.5 sm:p-3.5 md:overflow-y-auto space-y-3 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80">
          {/* Executive Sub-Header Banner */}
          <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {todayDateFormatted} • STATUS OPERACIONAL
              </div>
              <h2 className="text-xs font-bold text-slate-100 mt-0.5 truncate">
                Rituais & Fechamentos de Hoje
              </h2>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{complianceRate}%</span>
              </span>
            </div>
          </div>

          {/* 10-Area Operational Nodes Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredAreas.map((area) => {
                const isSelected = area.id === selectedArea?.id;
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-800/95 border-sky-500/80 shadow-md ring-1 ring-sky-500/40'
                        : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          area.currentStatus === 'GREEN'
                            ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                            : area.currentStatus === 'YELLOW'
                            ? 'bg-amber-400 shadow-xs shadow-amber-400/50'
                            : area.currentStatus === 'RED'
                            ? 'bg-rose-400 shadow-xs shadow-rose-400/50'
                            : 'bg-slate-500'
                        }`} />
                        <span className="font-bold text-xs text-slate-100 truncate">{area.name}</span>
                      </div>
                      <StatusIndicator status={area.currentStatus!} size="sm" />
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 font-sans">
                      {area.currentJustification || area.description || 'Sem impedimentos.'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                      <span className="truncate pr-1">
                        {area.manager?.name || 'N/A'}
                      </span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-slate-400">{area.obligationsCount} rituais</span>
                        <Link
                          href={`/areas/${area.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-0.5"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Incident & Alert Stream */}
          <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-mono text-[10px] uppercase font-bold text-slate-400">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>INCIDENTES ATIVOS ({openAlerts.length})</span>
              </span>
              <Link href="/alerts" className="text-sky-400 hover:underline">Ver todos →</Link>
            </div>

            <div className="divide-y divide-slate-800/60">
              {openAlerts.length === 0 ? (
                <p className="py-2 text-center text-slate-500 font-mono text-[11px]">Nenhum incidente crítico ativo.</p>
              ) : (
                openAlerts.slice(0, 2).map((alt) => {
                  const area = areas.find((a) => a.id === alt.area_id);
                  return (
                    <div key={alt.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                          <span className="font-bold text-slate-200 truncate">{area?.name}</span>
                          <span className="px-1 py-0.2 rounded bg-slate-950 text-rose-400 border border-rose-500/20 font-bold text-[9px]">
                            {alt.priority}
                          </span>
                        </div>
                        <p className="text-slate-300 truncate mt-0.5 text-[11px]">{alt.title}</p>
                      </div>
                      <button
                        onClick={() => resolveAlert(alt.id)}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 shrink-0 font-mono cursor-pointer"
                      >
                        Resolver
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Node Inspector & Governance Summary */}
        <div className="w-full lg:w-[40%] p-2.5 sm:p-3.5 md:overflow-y-auto space-y-3 bg-slate-900/40">
          {/* Selected Node Details Card */}
          {selectedArea && (
            <div className="bg-slate-900 border border-slate-700/80 p-3 sm:p-3.5 rounded-xl space-y-2.5 text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                    INSPEÇÃO DE ÁREA
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-mono uppercase mt-0.5">
                    {selectedArea.name}
                  </h3>
                </div>
                <StatusIndicator status={selectedArea.currentStatus!} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">GESTOR</span>
                  <strong className="text-slate-200 font-sans text-xs truncate block">{selectedArea.manager?.name || 'N/A'}</strong>
                </div>

                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">RITUAIS</span>
                  <strong className="text-slate-200 text-xs block">{selectedAreaObligations.length} ativas</strong>
                </div>
              </div>

              {/* Justification Box */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  JUSTIFICATIVA DO FECHAMENTO:
                </span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-sans leading-relaxed">
                  {selectedArea.currentJustification || 'Operações ocorrendo normalmente dentro dos parâmetros de qualidade.'}
                </div>
              </div>

              {/* Obligations list */}
              {selectedAreaObligations.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase font-bold">
                    <span>Rituais da Área</span>
                    <Link href="/obligations" className="text-sky-400 hover:underline">Ver todas</Link>
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {selectedAreaObligations.map((ob) => (
                      <div key={ob.id} className="p-1.5 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-200 truncate pr-2">{ob.title}</span>
                        <span className="text-[9px] font-mono text-slate-400 shrink-0">{ob.due_time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/chat?convId=conv-area-${selectedArea.id.replace('area-', '')}`}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center space-x-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </Link>

                <Link
                  href={`/areas/${selectedArea.id}`}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg font-mono font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <span>Abrir Área</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Mobile Quick Governance Card */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-mono font-bold text-slate-300 uppercase text-[9px]">
                RESUMO DE GOVERNANÇA
              </span>
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">RITUAIS TOTAIS</span>
                <span className="text-slate-100 font-bold text-xs">{obligations.length}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">TAXA RESPOSTA</span>
                <span className="text-emerald-400 font-bold text-xs">{complianceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DailyClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        defaultAreaId={selectedArea?.id}
      />
    </div>
  );
}
