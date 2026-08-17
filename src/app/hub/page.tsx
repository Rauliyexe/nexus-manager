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
  Clock,
  ShieldCheck,
  BarChart3,
  Layers,
  ChevronRight,
  TrendingUp,
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
    year: 'numeric',
  }).toUpperCase();

  // Compliance calculations
  const totalReported = greenCount + yellowCount + redCount;
  const complianceRate = areas.length > 0 ? Math.round((totalReported / areas.length) * 100) : 100;

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col bg-slate-950 rounded border border-slate-800 shadow-sm relative overflow-hidden select-none font-sans">
      {/* Top Telemetry Header Strip */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center font-mono text-xs font-bold shadow-xs">
            NX
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                CENTRAL DE COMANDO OPERACIONAL (HUB)
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Monitoramento Contínuo dos 10 Nós Operacionais • Governança & Rituais Diários
            </p>
          </div>
        </div>

        {/* Global Operational Counters Bar */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`font-bold transition-colors cursor-pointer ${filterStatus === 'ALL' ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {areas.length} ÁREAS
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setFilterStatus('GREEN')}
              className={`font-bold transition-colors cursor-pointer ${filterStatus === 'GREEN' ? 'text-emerald-300' : 'text-emerald-500/70 hover:text-emerald-400'}`}
            >
              {greenCount} OK
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setFilterStatus('YELLOW')}
              className={`font-bold transition-colors cursor-pointer ${filterStatus === 'YELLOW' ? 'text-amber-300' : 'text-amber-500/70 hover:text-amber-400'}`}
            >
              {yellowCount} ATENÇÃO
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setFilterStatus('RED')}
              className={`font-bold transition-colors cursor-pointer ${filterStatus === 'RED' ? 'text-rose-300' : 'text-rose-500/70 hover:text-rose-400'}`}
            >
              {redCount} CRÍTICAS
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => setFilterStatus('NO_RESPONSE')}
              className={`font-bold transition-colors cursor-pointer ${filterStatus === 'NO_RESPONSE' ? 'text-slate-300' : 'text-slate-500 hover:text-slate-400'}`}
            >
              {noResponseCount} PENDENTE
            </button>
          </div>

          <button
            onClick={() => setIsClosingModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1 rounded transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Registrar Fechamento</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Split Layout (Operations Grid + Focused Node Deep Dive) */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* Left 62% Column: Operational Nodes Interactive Grid */}
        <div className="w-full lg:w-[62%] p-3.5 z-10 overflow-y-auto space-y-3.5 bg-slate-950 border-r border-slate-800/80">
          {/* Executive Header Banner */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                PAINEL OPERACIONAL CONSOLIDADO — {todayDateFormatted}
              </div>
              <h2 className="text-xs font-bold text-slate-100 mt-0.5">
                Saúde dos Rituais e Status de Fechamento por Área
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{complianceRate}% RITUAIS ENTREGUES</span>
              </span>
            </div>
          </div>

          {/* Interactive 10-Area Operational Nodes Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-mono text-[10px] uppercase text-slate-400 font-bold">
              <span>NÓS OPERACIONAIS ({filteredAreas.length} exibidos)</span>
              <span>Selecione para inspecionar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredAreas.map((area) => {
                const isSelected = area.id === selectedArea?.id;
                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`p-3 rounded border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-slate-500 shadow-md ring-1 ring-sky-500'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${
                          area.currentStatus === 'GREEN'
                            ? 'bg-emerald-400'
                            : area.currentStatus === 'YELLOW'
                            ? 'bg-amber-400'
                            : area.currentStatus === 'RED'
                            ? 'bg-rose-400'
                            : 'bg-slate-500'
                        }`} />
                        <span className="font-bold text-xs text-slate-100 truncate">{area.name}</span>
                      </div>
                      <StatusIndicator status={area.currentStatus!} size="sm" />
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                      {area.currentJustification || area.description || 'Nenhum detalhe impeditivo registrado.'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-800/80">
                      <span className="truncate pr-1">
                        Gestor: <strong className="text-slate-300 font-sans">{area.manager?.name || 'N/A'}</strong>
                      </span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-slate-400">{area.obligationsCount} obrigações</span>
                        <Link
                          href={`/areas/${area.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-0.5"
                        >
                          <span>Workspace</span>
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
          <div className="bg-slate-900 border border-slate-800 p-3 rounded space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-mono text-[10px] uppercase font-bold text-slate-400">
              <span>TELEMETRIA DE INCIDENTES AO VIVO ({openAlerts.length})</span>
              <Link href="/alerts" className="text-sky-400 hover:underline">Ver todos →</Link>
            </div>

            <div className="divide-y divide-slate-800/80">
              {openAlerts.length === 0 ? (
                <p className="py-2.5 text-center text-slate-500 font-mono text-[11px]">Nenhum incidente crítico ativo no momento.</p>
              ) : (
                openAlerts.slice(0, 3).map((alt) => {
                  const area = areas.find((a) => a.id === alt.area_id);
                  return (
                    <div key={alt.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 font-mono text-[10px]">
                          <span className="font-bold text-slate-200">{area?.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-950 text-rose-400 border border-rose-500/20 font-bold">
                            {alt.priority}
                          </span>
                        </div>
                        <p className="text-slate-300 truncate mt-0.5 text-[11px]">{alt.title}</p>
                      </div>
                      <button
                        onClick={() => resolveAlert(alt.id)}
                        className="px-2.5 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 shrink-0 font-mono cursor-pointer"
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

        {/* Right 38% Column: Deep Node Inspector & Governance SLA Stream */}
        <div className="w-full lg:w-[38%] p-3.5 z-10 overflow-y-auto space-y-3.5 bg-slate-900/50">
          {/* Selected Node Details Card */}
          {selectedArea && (
            <div className="bg-slate-900 border border-slate-700 p-3.5 rounded space-y-3 text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    INSPEÇÃO DO NÓ OPERACIONAL
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase mt-0.5">
                    {selectedArea.name}
                  </h3>
                </div>
                <StatusIndicator status={selectedArea.currentStatus!} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">GESTOR DA ÁREA</span>
                  <strong className="text-slate-200 font-sans text-xs">{selectedArea.manager?.name || 'N/A'}</strong>
                </div>

                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">OBRIGAÇÕES / RITUAIS</span>
                  <strong className="text-slate-200 text-xs">{selectedAreaObligations.length} ativas</strong>
                </div>
              </div>

              {/* Justification Box */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  JUSTIFICATIVA DO STATUS DIÁRIO:
                </span>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs font-sans leading-relaxed">
                  {selectedArea.currentJustification || 'Operações ocorrendo dentro dos padrões normais sem impedimentos reportados.'}
                </div>
              </div>

              {/* Active Obligations List for this Area */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                  <span>Rituais Ativos da Área ({selectedAreaObligations.length})</span>
                  <Link href="/obligations" className="text-sky-400 hover:underline">Ver todas →</Link>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {selectedAreaObligations.length === 0 ? (
                    <p className="text-[11px] text-slate-500 font-mono py-2 text-center">Nenhuma obrigação ativa cadastrada.</p>
                  ) : (
                    selectedAreaObligations.map((ob) => (
                      <div key={ob.id} className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-2 min-w-0">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 truncate">{ob.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">{ob.due_time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/chat?convId=conv-area-${selectedArea.id.replace('area-', '')}`}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded border border-slate-800 text-xs font-mono flex items-center space-x-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat da Área</span>
                </Link>

                <Link
                  href={`/areas/${selectedArea.id}`}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded font-mono font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <span>Abrir Workspace Completo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Quick Compliance Summary Card */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-mono font-bold text-slate-300 uppercase text-[10px]">
                GOVERNANÇA & CUMPRIMENTO SEMANAL
              </span>
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            </div>

            <div className="space-y-2 pt-1 text-[11px] font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Total de Obrigações na Empresa:</span>
                <strong className="text-slate-100">{obligations.length} rituais</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxa de Resposta Diária:</span>
                <strong className="text-emerald-400">{complianceRate}%</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Incidentes Resolvidos Hoje:</span>
                <strong className="text-sky-300">{alerts.filter(a => a.status === 'RESOLVED').length}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <Link
                href="/reports"
                className="text-xs text-sky-400 hover:text-sky-300 font-mono font-bold flex items-center justify-between"
              >
                <span>Acessar Relatório Executivo Completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Footer */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between z-20 text-xs font-mono">
        <div className="flex items-center space-x-3 text-[10px] text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>NEXUS OPERATIONS COMMAND HUB • STATUS CONSOLIDADO</span>
          </span>
        </div>

        <div className="text-[10px] text-slate-500">
          10 ÁREAS ATIVAS • RITUAIS SINCRONIZADOS
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
