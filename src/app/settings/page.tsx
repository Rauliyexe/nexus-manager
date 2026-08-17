'use client';

import React from 'react';
import { Settings, ShieldCheck, Key, User, Database, Smartphone } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function SettingsPage() {
  const { currentUser } = useNexus();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-sky-400" />
          <span>Configurações & Perfil Corporativo</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dados do usuário ativo, permissões de acesso, status da criptografia e integrações.
        </p>
      </div>

      {/* User Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4">
        <UserAvatar name={currentUser.name} size="lg" className="w-12 h-12 text-sm font-bold" />
        <div>
          <h2 className="text-base font-bold text-slate-100">{currentUser.name}</h2>
          <p className="text-xs text-slate-400">{currentUser.email} • {currentUser.phone}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Role: {currentUser.role}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              {currentUser.department || 'Nexus Corporativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Cryptography Roadmap Section */}
      <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Arquitetura de Criptografia e Segurança</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          O protótipo utilza uma camada de abstração em <code className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-sky-300">lib/crypto</code> com a API nativa WebCrypto (AES-GCM 256 bits) para cifrar as mensagens transportadas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">Status Atual (Protótipo):</span>
            <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
              <li>Transporte seguro HTTPS/TLS</li>
              <li>Autenticação por Supabase Auth</li>
              <li>Row Level Security (RLS) por perfil</li>
              <li>Payloads cifrados via WebCrypto API</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-semibold text-emerald-400 block mb-1">E2EE Definitiva (Produção):</span>
            <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
              <li>Pares de chaves pública/privada por usuário</li>
              <li>Tabelas <code className="font-mono text-slate-300">user_devices</code> e <code className="font-mono text-slate-300">conversation_keys</code></li>
              <li>Chaves privadas guardadas exclusivamente no dispositivo</li>
              <li>Integração futura com Evolution API & Push Notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
