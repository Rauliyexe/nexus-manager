'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Send, CheckCircle2, Circle } from 'lucide-react';
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
      <div className="p-12 text-center text-[#5E7567] space-y-4 font-mono text-xs">
        <p>Área não encontrada.</p>
        <Link href="/areas" className="text-[#1B3026] dark:text-[#76B38B] font-bold hover:underline">
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
    <div className="space-y-5 max-w-7xl mx-auto font-sans p-4 sm:p-6 pb-8">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl card-shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <button
              onClick={() => router.push('/areas')}
              className="text-xs font-bold text-[#5E7567] hover:text-[#111D15] dark:hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Projetos</span>
            </button>

            <div className="flex items-center space-x-3 pt-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
                {area.name}
              </h1>
              <StatusIndicator status={area.currentStatus!} size="md" />
            </div>

            <p className="text-xs text-[#3B4F43] dark:text-slate-400">
              Gestor responsável:{' '}
              <strong className="text-[#111D15] dark:text-slate-200 font-bold">
                {area.manager?.name || 'Não atribuído'}
              </strong>{' '}
              • Atualizado às <span className="font-mono font-semibold text-[#111D15] dark:text-slate-300">{area.lastUpdated}</span>
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsClosingModalOpen(true)}
              className="bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Registrar Fechamento da Área
            </button>
          </div>
        </div>

        {/* Obligations Summary Bar */}
        <div className="bg-[#EEF2EE] dark:bg-[#0B120E] p-3 rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between text-xs">
          <span className="font-bold text-[#111D15] dark:text-slate-200">Obrigações Operacionais</span>
          <span className="text-[#3B4F43] dark:text-slate-400">
            <strong className="text-[#111D15] dark:text-slate-100 font-bold">{completedObligationsCount}</strong> / {areaObligations.length} ativas
          </span>
        </div>

        {/* Department-Specific Live Indicators Banner */}
        {(() => {
          const name = area.name.toLowerCase();
          if (name.includes('logística')) {
            return (
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase block font-mono">FROTA OPERANTE</span>
                  <strong className="text-slate-800 dark:text-slate-100">12 Bitrens em rota</strong>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase block font-mono">PESAGEM TOTAL</span>
                  <strong className="text-slate-800 dark:text-slate-100">284.5 Ton / dia</strong>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase block font-mono">MTRs EMITIDOS</span>
                  <strong className="text-slate-800 dark:text-slate-100">18 Manifestos</strong>
                </div>
                <div>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase block font-mono">PONTUALIDADE</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">98.5% no prazo</strong>
                </div>
              </div>
            );
          }
          if (name.includes('financeiro') || name.includes('comercial compras')) {
            return (
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block font-mono">COTAÇÃO LME SPOT</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">R$ 51,40 / kg</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block font-mono">TRAVA CAMBIAL</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">USD @ 5,4200</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block font-mono">CONCILIAÇÃO</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">100% OK</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block font-mono">LIQUIDEZ D+0</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">R$ 4.2M Disponível</strong>
                </div>
              </div>
            );
          }
          if (name.includes('comercial vendas')) {
            return (
              <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase block font-mono">FATURAMENTO MÊS</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">104% da Meta</strong>
                </div>
                <div>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase block font-mono">PREÇO MÉDIO</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">R$ 56,80 / kg</strong>
                </div>
                <div>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase block font-mono">VOLUME DCOPPER</span>
                  <strong className="text-slate-800 dark:text-slate-100">142 Toneladas</strong>
                </div>
                <div>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase block font-mono">CARTEIRA ATIVA</span>
                  <strong className="text-slate-800 dark:text-slate-100">38 Clientes B2B</strong>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Tab Navigation Bar */}
        <div className="flex items-center space-x-1.5 border-t border-[#D5E0D7] dark:border-[#1E3125] pt-3 overflow-x-auto text-xs font-semibold no-scrollbar">
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
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#1B3026] text-white font-bold shadow-xs'
                    : 'text-[#3B4F43] dark:text-slate-400 hover:text-[#111D15] hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isActive ? 'bg-[#2C6E49] text-white' : 'bg-[#EEF2EE] dark:bg-[#0B120E] text-[#1B3026] dark:text-[#76B38B]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panes */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-5 sm:p-6 rounded-2xl card-shadow">
        {/* Tab 1: Obrigações */}
        {activeTab === 'obligations' && (
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5">
              Obrigações da Área ({areaObligations.length})
            </h3>

            <div className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
              {areaObligations.length === 0 ? (
                <p className="text-xs text-[#5E7567] py-8 text-center font-medium">Nenhuma obrigação cadastrada.</p>
              ) : (
                areaObligations.map((ob) => (
                  <div key={ob.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleObligationActive(ob.id)}
                        className="mt-0.5 cursor-pointer text-[#2C6E49]"
                      >
                        {ob.active ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2C6E49]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#8FA595]" />
                        )}
                      </button>
                      <div>
                        <p className="font-bold text-sm text-[#111D15] dark:text-slate-100">{ob.title}</p>
                        {ob.description && (
                          <p className="text-xs text-[#3B4F43] dark:text-slate-400 mt-0.5">{ob.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 font-mono text-xs font-semibold">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125]">
                        {ob.frequency}
                      </span>
                      <span className="text-[#5E7567] dark:text-slate-400">Até {ob.due_time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Status */}
        {activeTab === 'status' && (
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5">
              Fechamento do Dia
            </h3>

            <div className="p-4 rounded-xl bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-[#3B4F43] dark:text-slate-400 font-bold">Status Registrado Hoje:</span>
                <StatusIndicator status={area.currentStatus!} size="md" />
              </div>

              {area.currentJustification && (
                <div className="p-3.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-[#111D15] dark:text-slate-300">
                  <span className="font-bold text-[#5E7567] block mb-1 text-[11px] uppercase tracking-wider">
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
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5">
              Histórico de Fechamentos Recentes
            </h3>

            <div className="divide-y divide-[#D5E0D7] dark:divide-[#1E3125]">
              {areaHistory.length === 0 ? (
                <p className="text-xs text-[#5E7567] py-6 text-center">Nenhum histórico registrado.</p>
              ) : (
                areaHistory.map((st) => (
                  <div key={st.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-[#111D15] dark:text-slate-300">{st.date}</span>
                      <StatusIndicator status={st.status} size="sm" />
                      {st.justification && (
                        <span className="text-[#3B4F43] dark:text-slate-400 italic">— "{st.justification}"</span>
                      )}
                    </div>
                    <span className="text-xs text-[#5E7567] dark:text-slate-500 font-mono">
                      {new Date(st.created_at || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Alertas */}
        {activeTab === 'alerts' && (
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5">
              Alertas Ativos ({areaAlerts.length})
            </h3>
            {areaAlerts.length === 0 ? (
              <p className="py-8 text-center text-[#5E7567] font-semibold">Nenhum alerta pendente para este projeto.</p>
            ) : (
              areaAlerts.map((alt) => (
                <div key={alt.id} className="p-3.5 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111D15] dark:text-slate-100">{alt.title}</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-lg bg-rose-50 text-rose-800 border border-rose-300">
                      {alt.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#3B4F43] dark:text-slate-300">{alt.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Conversa */}
        {activeTab === 'chat' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#D5E0D7] dark:border-[#1E3125] pb-2.5">
              <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-wide">
                Conversa Interna da Área
              </h3>
              <Link
                href={`/chat?convId=${areaConvId}`}
                className="text-xs font-bold text-[#1B3026] dark:text-[#76B38B] hover:underline flex items-center space-x-1"
              >
                <span>Abrir no Chat Principal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#EEF2EE] dark:bg-[#0B120E] rounded-2xl border border-[#D5E0D7] dark:border-[#1E3125] h-80 flex flex-col justify-between p-3.5">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 font-sans">
                {areaMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs ${
                      msg.message_type === 'SYSTEM'
                        ? 'p-3 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-center text-[#3B4F43] dark:text-slate-300 font-mono text-[11px]'
                        : msg.sender_id === currentUser.id
                        ? 'ml-auto max-w-xs bg-[#1B3026] text-white p-3 rounded-2xl shadow-xs'
                        : 'mr-auto max-w-xs bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-3 rounded-2xl text-[#111D15] dark:text-slate-100'
                    }`}
                  >
                    {msg.sender && msg.message_type !== 'SYSTEM' && (
                      <p className={`text-[10px] font-bold mb-1 ${msg.sender_id === currentUser.id ? 'text-[#76B38B]' : 'text-[#5E7567]'}`}>
                        {msg.sender.name} ({msg.sender.role})
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <span className={`text-[9px] block mt-1 text-right font-mono ${msg.sender_id === currentUser.id ? 'text-white/60' : 'text-[#5E7567]'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAreaMessage} className="pt-3 border-t border-[#D5E0D7] dark:border-[#1E3125] flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl px-3 py-2 text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] font-medium"
                />
                <button type="submit" className="bg-[#1B3026] hover:bg-[#2A4A3C] text-white p-2 rounded-xl cursor-pointer">
                  <Send className="w-4 h-4" />
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
