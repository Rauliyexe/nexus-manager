'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Send } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { DailyClosingModal } from '@/components/modals/DailyClosingModal';

export default function AreaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaId = params.id as string;

  const {
    areas,
    obligations,
    dailyStatuses,
    alerts,
    messages,
    sendMessage,
    currentUser,
    toggleObligationActive,
  } = useNexus();

  const area = areas.find((a) => a.id === areaId);
  const initialTab = searchParams.get('tab') || 'obligations';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  if (!area) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4 font-mono text-xs">
        <p>Área não encontrada.</p>
        <Link href="/areas" className="text-slate-200 font-semibold hover:underline">
          ← Voltar para lista de áreas
        </Link>
      </div>
    );
  }

  const areaObligations = obligations.filter((o) => o.area_id === area.id);
  const completedObligationsCount = areaObligations.filter((o) => o.active).length;
  const areaHistory = dailyStatuses.filter((st) => st.area_id === area.id);
  const areaAlerts = alerts.filter((a) => a.area_id === area.id);

  const areaConvId = `conv-area-${area.id.replace('area-', '')}`;
  const areaMessages = messages[areaConvId] || [];

  const handleSendAreaMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await sendMessage(areaConvId, chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="space-y-3 max-w-7xl mx-auto font-sans">
      {/* Workspace Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <button
              onClick={() => router.push('/areas')}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-mono"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Voltar para Áreas</span>
            </button>

            <div className="flex items-center space-x-3 pt-0.5">
              <h1 className="text-base font-bold text-slate-100 tracking-tight font-sans">
                {area.name}
              </h1>
              <StatusIndicator status={area.currentStatus!} size="md" />
            </div>

            <p className="text-xs text-slate-400">
              Gestor responsável:{' '}
              <span className="text-slate-200 font-semibold">
                {area.manager?.name || 'Não atribuído'}
              </span>{' '}
              • Atualizado às <span className="font-mono text-slate-300">{area.lastUpdated}</span>
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsClosingModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs px-3 py-1.5 rounded border border-slate-700 transition-colors"
            >
              Registrar Fechamento da Área
            </button>
          </div>
        </div>

        {/* Obligations Summary Bar */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-slate-300">Obrigações Operacionais</span>
          <span className="text-slate-400">
            <strong className="text-slate-200">{completedObligationsCount}</strong> / {areaObligations.length} ativas
          </span>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center space-x-1 border-t border-slate-800 pt-2.5 overflow-x-auto text-xs font-medium">
          {[
            { id: 'obligations', label: 'Obrigações', count: areaObligations.length },
            { id: 'status', label: 'Status & Fechamento' },
            { id: 'history', label: 'Histórico', count: areaHistory.length },
            { id: 'alerts', label: 'Alertas', count: areaAlerts.length },
            { id: 'chat', label: 'Conversa da Área', count: areaMessages.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 font-bold border-b-2 border-slate-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-950 text-slate-400 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panes */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded shadow-xs">
        {/* Tab 1: Obrigações */}
        {activeTab === 'obligations' && (
          <div className="space-y-2 text-xs">
            <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider border-b border-slate-800 pb-2">
              Obrigações da Área ({areaObligations.length})
            </h3>

            <div className="divide-y divide-slate-800">
              {areaObligations.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center font-mono">Nenhuma obrigação cadastrada.</p>
              ) : (
                areaObligations.map((ob) => (
                  <div key={ob.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={ob.active}
                        onChange={() => toggleObligationActive(ob.id)}
                        className="mt-0.5 accent-slate-400 rounded cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-slate-200">{ob.title}</p>
                        {ob.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{ob.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 font-mono text-[11px]">
                      <span className="px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {ob.frequency}
                      </span>
                      <span className="text-slate-400">Até {ob.due_time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Status */}
        {activeTab === 'status' && (
          <div className="space-y-2 text-xs">
            <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider border-b border-slate-800 pb-2">
              Fechamento do Dia
            </h3>

            <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono">Status Registrado Hoje:</span>
                <StatusIndicator status={area.currentStatus!} size="md" />
              </div>

              {area.currentJustification && (
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1 font-mono text-[10px] uppercase">
                    Justificativa Operacional:
                  </span>
                  {area.currentJustification}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Histórico */}
        {activeTab === 'history' && (
          <div className="space-y-2 text-xs">
            <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider border-b border-slate-800 pb-2">
              Histórico de Fechamentos Recentes
            </h3>

            <div className="divide-y divide-slate-800">
              {areaHistory.map((st) => (
                <div key={st.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-slate-400">{st.date}</span>
                    <StatusIndicator status={st.status} size="sm" />
                    {st.justification && (
                      <span className="text-slate-400 italic">— "{st.justification}"</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(st.created_at || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Alertas */}
        {activeTab === 'alerts' && (
          <div className="space-y-2 text-xs">
            <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider border-b border-slate-800 pb-2">
              Alertas Ativos ({areaAlerts.length})
            </h3>
            {areaAlerts.length === 0 ? (
              <p className="py-6 text-center text-slate-500 font-mono">Nenhum alerta pendente.</p>
            ) : (
              areaAlerts.map((alt) => (
                <div key={alt.id} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{alt.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400">
                      {alt.status}
                    </span>
                  </div>
                  <p className="text-slate-400">{alt.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Conversa */}
        {activeTab === 'chat' && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                Conversa Interna da Área
              </h3>
              <Link
                href={`/chat?convId=${areaConvId}`}
                className="text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1 font-mono"
              >
                <span>Abrir no Chat Principal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-slate-950 rounded border border-slate-800 h-80 flex flex-col justify-between p-3">
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-sans">
                {areaMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs ${
                      msg.message_type === 'SYSTEM'
                        ? 'p-3 bg-slate-900 border border-slate-800 rounded text-center text-slate-300 whitespace-pre-line font-mono text-[11px]'
                        : msg.sender_id === currentUser.id
                        ? 'ml-auto max-w-xs bg-slate-800 border border-slate-700 p-2.5 rounded text-slate-100'
                        : 'mr-auto max-w-xs bg-slate-900 border border-slate-800 p-2.5 rounded text-slate-300'
                    }`}
                  >
                    {msg.sender && (
                      <p className="text-[10px] font-bold text-slate-400 mb-1">
                        {msg.sender.name} ({msg.sender.role})
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <span className="text-[9px] text-slate-500 block mt-1 text-right font-mono">
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAreaMessage} className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 font-sans"
                />
                <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-100 p-1.5 rounded">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <DailyClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
        defaultAreaId={area.id}
      />
    </div>
  );
}
