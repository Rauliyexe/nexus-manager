'use client';

import React from 'react';
import {
  Settings,
  ShieldCheck,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Bell,
  Sliders,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SoundType } from '@/lib/services/soundService';

const SOUND_PREVIEWS: { label: string; type: SoundType; description: string; icon: React.FC<any> }[] = [
  { label: 'Envio de Mensagem', type: 'MESSAGE_SENT', description: 'Swoosh/pop suave e discreto (70ms)', icon: Send },
  { label: 'Mensagem Recebida', type: 'MESSAGE_RECEIVED', description: 'Chime duplo elegante de notificação', icon: Bell },
  { label: 'Tarefa Criada / Chamado', type: 'TASK_CREATED', description: 'Acorde harmônico em Dó Maior (C5-E5-G5)', icon: Sparkles },
  { label: 'Tarefa Concluída / Ritual', type: 'TASK_COMPLETED', description: 'Checkmark harmônico metálico de dever cumprido', icon: CheckCircle2 },
  { label: 'Alerta Crítico / Incidente', type: 'CRITICAL_ALERT', description: 'Pulso duplo de atenção executiva discreto', icon: AlertTriangle },
  { label: 'Resposta Copiloto IA', type: 'AI_READY', description: 'Sparkle chime tecnológico com harmônicos', icon: Sparkles },
  { label: 'Alternância de Modo', type: 'MODE_SWITCH', description: 'Clique eletromecânico retrô Bloomberg CRT', icon: Sliders },
];

export default function SettingsPage() {
  const { currentUser, soundEnabled, toggleSound, playSound } = useNexus();

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow">
        <h1 className="text-xl font-bold text-[#111D15] dark:text-slate-100 flex items-center space-x-2.5">
          <Settings className="w-5 h-5 text-[#2C6E49] dark:text-[#76B38B]" />
          <span>Configurações & Preferências do Sistema</span>
        </h1>
        <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-1">
          Dados do usuário ativo, perfil corporativo, preferências de áudio e segurança.
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow flex items-center space-x-4">
        <UserAvatar name={currentUser.name} size="lg" className="w-12 h-12 text-sm font-bold bg-[#EEF2EE] text-[#1B3026] dark:bg-[#1C2E24] dark:text-[#76B38B]" />
        <div>
          <h2 className="text-base font-bold text-[#111D15] dark:text-slate-100">{currentUser.name}</h2>
          <p className="text-xs text-[#5E7567] dark:text-slate-400">{currentUser.email} • {currentUser.phone}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125]">
              Cargo: {currentUser.role}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2EE] dark:bg-[#17261D] text-[#5E7567] dark:text-slate-300 border border-[#D5E0D7] dark:border-[#1E3125]">
              {currentUser.department || 'Copper Group'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Audio & Sound Feedback Section ── */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 text-[#111D15] dark:text-slate-100 font-bold text-sm">
            <Volume2 className="w-5 h-5 text-[#2C6E49] dark:text-[#76B38B]" />
            <span>Feedback Sonoro & Áudio Corporativo (Web Audio API)</span>
          </div>

          <button
            onClick={toggleSound}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer card-shadow ${
              soundEnabled
                ? 'bg-[#1B3026] text-white hover:bg-[#2A4A3C]'
                : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#5E7567] hover:bg-[#D5E0D7]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Sons Ativados' : 'Sons Silenciados'}</span>
          </button>
        </div>

        <p className="text-xs text-[#5E7567] dark:text-slate-300 leading-relaxed">
          O sistema utiliza síntese harmônica nativa via Web Audio API, com latência zero e sem dependência de download de arquivos externos. Clique nos botões abaixo para testar cada assinatura sonora:
        </p>

        {/* Sound Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SOUND_PREVIEWS.map((sound) => {
            const Icon = sound.icon;
            return (
              <div
                key={sound.type}
                className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between space-x-3 card-shadow"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#2C6E49] dark:text-[#76B38B] shrink-0" />
                    <span className="font-bold text-xs text-[#111D15] dark:text-slate-200 truncate">
                      {sound.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5E7567] dark:text-slate-400 truncate">
                    {sound.description}
                  </p>
                </div>

                <button
                  onClick={() => playSound(sound.type)}
                  className="p-2 rounded-xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] hover:bg-[#1B3026] hover:text-white dark:hover:bg-[#1C2E24] dark:hover:text-emerald-400 transition-all cursor-pointer shrink-0 shadow-2xs group"
                  title={`Testar som: ${sound.label}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cryptography Roadmap Section */}
      <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow space-y-4">
        <div className="flex items-center space-x-2 text-[#2C6E49] dark:text-[#76B38B] font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Arquitetura de Criptografia e Segurança</span>
        </div>

        <p className="text-xs text-[#5E7567] dark:text-slate-300 leading-relaxed">
          O sistema utiliza uma camada de abstração em <code className="font-mono bg-[#EEF2EE] dark:bg-[#0B120E] px-1.5 py-0.5 rounded text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125]">lib/crypto</code> com a API nativa WebCrypto (AES-GCM 256 bits) para cifrar as mensagens transportadas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
            <span className="font-semibold text-[#111D15] dark:text-slate-200 block mb-1">Status Atual:</span>
            <ul className="space-y-1 text-[#5E7567] dark:text-slate-400 text-[11px] list-disc list-inside">
              <li>Transporte seguro HTTPS/TLS</li>
              <li>Row Level Security (RLS) por perfil</li>
              <li>Payloads cifrados via WebCrypto API</li>
              <li>Feedback sonoro corporativo com Web Audio API</li>
            </ul>
          </div>

          <div className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
            <span className="font-semibold text-[#2C6E49] dark:text-[#76B38B] block mb-1">E2EE Definitiva (Produção):</span>
            <ul className="space-y-1 text-[#5E7567] dark:text-slate-400 text-[11px] list-disc list-inside">
              <li>Pares de chaves pública/privada por usuário</li>
              <li>Chaves privadas guardadas exclusivamente no dispositivo</li>
              <li>Integração futura com Evolution API & Push Notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
