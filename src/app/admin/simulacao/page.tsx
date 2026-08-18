'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  Clock,
  Terminal,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Flame,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export default function AdminSimulacaoPage() {
  const { runSimulationEvent, switchUser, currentUser, profiles } = useNexus();
  const [log, setLog] = useState<string[]>([
    'Sistema de Simulação Copper Group operacional.',
    'Aguardando disparo manual dos eventos de demonstração ou alternância de cenários de cargo...',
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

  const handleSwitchScenario = (userId: string, scenarioName: string) => {
    switchUser(userId);
    const now = new Date().toLocaleTimeString('pt-BR');
    const msg = `[${now}] 🎭 Cenário ativado: ${scenarioName}. Usuário ativo agora é ${
      profiles.find((p) => p.id === userId)?.name || userId
    }.`;
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
              Simulador de Cenários & Automações
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · SIMULADOR
            </span>
          </div>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
            Alterne entre cenários pré-configurados (Modo Funcionário com Dia Moderado/Cheio, Modo Dono, Diretoria) e teste as rotinas horárias.
          </p>
        </div>
      </div>

      {/* ── Cenários de Perfis & Modos de Trabalho ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-[#111D15] dark:text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cenários Rápidos de Demonstração</span>
          </h2>
          <span className="text-[11px] text-[#5E7567]">
            Perfil atual:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400">{currentUser.name}</strong> ({currentUser.role})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Modo Funcionário (Dia Moderado/Cheio) */}
          <div
            className={`p-5 rounded-2xl border transition-all card-shadow flex flex-col justify-between space-y-3 ${
              currentUser.id === 'usr-emp-1'
                ? 'bg-emerald-50/70 dark:bg-[#152B1E] border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-[#121D16] border-[#D5E0D7] dark:border-[#1E3125]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800 flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-amber-600" />
                  <span>DIA MODERADO / CHEIO</span>
                </span>
                {currentUser.id === 'usr-emp-1' && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    ATIVO
                  </span>
                )}
              </div>

              <h3 className="font-bold text-[#111D15] dark:text-slate-100 text-sm">
                Juliana Mendes (Funcionária • Logística)
              </h3>
              <p className="text-[#5E7567] dark:text-slate-400 leading-relaxed text-xs">
                Cenário com <strong>5 tarefas operacionais</strong> (2 concluídas de manhã, 1 em andamento com prazo às 15:30, 1 pendente para a tarde e 1 preventiva), <strong>3 rituais do setor</strong> e 1 chamado em atendimento pela TI.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSwitchScenario('usr-emp-1', 'Modo Funcionário (Dia Moderado/Cheio)')}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center justify-center space-x-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Ativar Modo Funcionário</span>
              </button>

              {currentUser.id === 'usr-emp-1' && (
                <Link
                  href="/hub"
                  className="w-full py-2 px-3 bg-white dark:bg-[#1C2E24] hover:bg-[#EEF2EE] text-emerald-800 dark:text-emerald-300 font-bold rounded-xl text-[11px] border border-emerald-300 dark:border-emerald-800 flex items-center justify-center space-x-1"
                >
                  <span>Abrir Dashboard da Juliana</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Modo Dono (Admin Nexus) */}
          <div
            className={`p-5 rounded-2xl border transition-all card-shadow flex flex-col justify-between space-y-3 ${
              currentUser.id === 'usr-admin'
                ? 'bg-emerald-50/70 dark:bg-[#152B1E] border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-[#121D16] border-[#D5E0D7] dark:border-[#1E3125]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#1B3026] dark:text-[#76B38B] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2.5 py-0.5 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125]">
                  CONTROLE GERAL · DONO
                </span>
                {currentUser.id === 'usr-admin' && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    ATIVO
                  </span>
                )}
              </div>

              <h3 className="font-bold text-[#111D15] dark:text-slate-100 text-sm">
                Admin Nexus (Dono • Diretoria Geral)
              </h3>
              <p className="text-[#5E7567] dark:text-slate-400 leading-relaxed text-xs">
                Acesso irrestrito a todos os dados consolidados: Terminal Financeiro, indicadores operacionais das 10 áreas, incidentes e aprovações de privilégio de TI.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSwitchScenario('usr-admin', 'Modo Dono (Admin Nexus)')}
                className="w-full py-2.5 px-4 bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center justify-center space-x-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Ativar Modo Dono</span>
              </button>

              {currentUser.id === 'usr-admin' && (
                <Link
                  href="/hub"
                  className="w-full py-2 px-3 bg-white dark:bg-[#1C2E24] hover:bg-[#EEF2EE] text-[#1B3026] dark:text-[#76B38B] font-bold rounded-xl text-[11px] border border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-center space-x-1"
                >
                  <span>Abrir Dashboard Executivo</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Modo Diretoria Executiva */}
          <div
            className={`p-5 rounded-2xl border transition-all card-shadow flex flex-col justify-between space-y-3 ${
              currentUser.id === 'usr-dir'
                ? 'bg-emerald-50/70 dark:bg-[#152B1E] border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-[#121D16] border-[#D5E0D7] dark:border-[#1E3125]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-300 dark:border-sky-800">
                  DIRETORIA EXECUTIVA
                </span>
                {currentUser.id === 'usr-dir' && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    ATIVO
                  </span>
                )}
              </div>

              <h3 className="font-bold text-[#111D15] dark:text-slate-100 text-sm">
                Carlos Santos (Diretor Executivo)
              </h3>
              <p className="text-[#5E7567] dark:text-slate-400 leading-relaxed text-xs">
                Visão de delegação executiva, monitoramento de metas comerciais e aprovações estratégicas com relatórios semanais.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSwitchScenario('usr-dir', 'Modo Diretoria Executiva')}
                className="w-full py-2.5 px-4 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center justify-center space-x-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Ativar Modo Diretoria</span>
              </button>

              {currentUser.id === 'usr-dir' && (
                <Link
                  href="/hub"
                  className="w-full py-2 px-3 bg-white dark:bg-[#1C2E24] hover:bg-[#EEF2EE] text-sky-800 dark:text-sky-300 font-bold rounded-xl text-[11px] border border-sky-300 dark:border-sky-800 flex items-center justify-center space-x-1"
                >
                  <span>Abrir Dashboard Executivo</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Simulador de Eventos Horários ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold text-[#111D15] dark:text-slate-200 uppercase tracking-wide flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Disparo de Eventos Automatizados</span>
        </h2>

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
