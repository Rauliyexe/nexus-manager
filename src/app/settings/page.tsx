'use client';

import React from 'react';
import { Settings, ShieldCheck } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function SettingsPage() {
  const { currentUser } = useNexus();

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] p-6 rounded-2xl card-shadow">
        <h1 className="text-xl font-bold text-[#1A281E] dark:text-slate-100 flex items-center space-x-2.5">
          <Settings className="w-5 h-5 text-[#4D7C5D]" />
          <span>Configurações & Perfil Corporativo</span>
        </h1>
        <p className="text-xs text-[#5C6E62] dark:text-slate-400 mt-1">
          Dados do usuário ativo, permissões de acesso, status da criptografia e integrações.
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] p-6 rounded-2xl card-shadow flex items-center space-x-4">
        <UserAvatar name={currentUser.name} size="lg" className="w-12 h-12 text-sm font-bold bg-[#EBF2EE] text-[#2C523D] dark:bg-[#1C2E24] dark:text-[#76B38B]" />
        <div>
          <h2 className="text-base font-bold text-[#1A281E] dark:text-slate-100">{currentUser.name}</h2>
          <p className="text-xs text-[#5C6E62] dark:text-slate-400">{currentUser.email} • {currentUser.phone}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border border-[#D4E8DB] dark:border-[#1E3125]">
              Role: {currentUser.role}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0F4F1] dark:bg-[#17261D] text-[#5C6E62] dark:text-slate-300 border border-[#E2E8E3] dark:border-[#1E3125]">
              {currentUser.department || 'Nexus Corporativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Cryptography Roadmap Section */}
      <div className="bg-white dark:bg-[#121D16] border border-[#4D7C5D]/30 p-6 rounded-2xl card-shadow space-y-4">
        <div className="flex items-center space-x-2 text-[#4D7C5D] dark:text-[#76B38B] font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Arquitetura de Criptografia e Segurança</span>
        </div>

        <p className="text-xs text-[#5C6E62] dark:text-slate-300 leading-relaxed">
          O protótipo utilza uma camada de abstração em <code className="font-mono bg-[#F0F4F1] dark:bg-[#0B120E] px-1.5 py-0.5 rounded text-[#2C523D] dark:text-[#76B38B] border border-[#E2E8E3] dark:border-[#1E3125]">lib/crypto</code> com a API nativa WebCrypto (AES-GCM 256 bits) para cifrar as mensagens transportadas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
            <span className="font-semibold text-[#1A281E] dark:text-slate-200 block mb-1">Status Atual (Protótipo):</span>
            <ul className="space-y-1 text-[#5C6E62] dark:text-slate-400 text-[11px] list-disc list-inside">
              <li>Transporte seguro HTTPS/TLS</li>
              <li>Autenticação por Supabase Auth</li>
              <li>Row Level Security (RLS) por perfil</li>
              <li>Payloads cifrados via WebCrypto API</li>
            </ul>
          </div>

          <div className="p-3.5 bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
            <span className="font-semibold text-[#4D7C5D] dark:text-[#76B38B] block mb-1">E2EE Definitiva (Produção):</span>
            <ul className="space-y-1 text-[#5C6E62] dark:text-slate-400 text-[11px] list-disc list-inside">
              <li>Pares de chaves pública/privada por usuário</li>
              <li>Tabelas <code className="font-mono text-[#1A281E] dark:text-slate-300">user_devices</code> e <code className="font-mono text-[#1A281E] dark:text-slate-300">conversation_keys</code></li>
              <li>Chaves privadas guardadas exclusivamente no dispositivo</li>
              <li>Integração futura com Evolution API & Push Notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
