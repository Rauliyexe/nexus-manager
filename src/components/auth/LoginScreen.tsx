'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Building2,
  KeyRound,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { USER_ROLE_LABELS } from '@/lib/types/nexus';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { profiles, login } = useNexus();

  const [identifier, setIdentifier] = useState('admin@yggdron.com.br');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [showQuickSelect, setShowQuickSelect] = useState(true);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Por favor, informe seu e-mail corporativo ou ID de colaborador.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(identifier.trim(), password);

      if (result.success) {
        setSuccessAnimation(true);
        setTimeout(() => {
          setIsLoading(false);
          onSuccess?.();
        }, 650);
      } else {
        setIsLoading(false);
        setErrorMessage(result.error || 'Credenciais inválidas. Verifique os dados e tente novamente.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Falha ao conectar com o serviço de autenticação.');
    }
  };

  const handleQuickLogin = async (userIdOrEmail: string) => {
    setErrorMessage('');
    setIsLoading(true);

    const result = await login(userIdOrEmail);
    if (result.success) {
      setSuccessAnimation(true);
      setTimeout(() => {
        setIsLoading(false);
        onSuccess?.();
      }, 500);
    } else {
      setIsLoading(false);
      setErrorMessage(result.error || 'Erro ao autenticar com o perfil selecionado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B120E] text-white flex flex-col justify-between overflow-y-auto p-4 sm:p-6 select-none font-sans antialiased">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-28 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-28 w-96 h-96 bg-[#274437]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Corporate Brand Header */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center space-x-3">
          {/* Logo Squircle Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B3026] to-[#121F17] border border-[#76B38B]/60 shadow-lg flex items-center justify-center relative">
            <div className="w-5 h-5 border-2 border-[#76B38B] rounded-xs relative">
              <span className="w-1.5 h-1.5 bg-[#0E1712] absolute -top-0.5 -right-0.5" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#76B38B] absolute -top-0.5 -right-0.5 shadow-sm shadow-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="text-base font-black tracking-widest text-white">YGGDRON</span>
              <span className="text-base font-light tracking-wider text-[#76B38B]">MANAGER</span>
            </div>
            <span className="text-[9px] font-mono text-[#6F9580] tracking-widest uppercase block mt-0.5">
              Command Center
            </span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#142119] border border-[#1E3125] text-[11px] font-mono text-[#76B38B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ACESSO RESTRITO & CRIPTOGRAFADO</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div
          className={`bg-[#121D16]/95 backdrop-blur-xl border border-[#1E3125] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 space-y-6 transition-all duration-300 ${
            successAnimation ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
          }`}
        >
          {/* Header Inside Card */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#1B3026] border border-[#2A4738] text-[#76B38B] shadow-inner mb-1">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Entrar na sua Conta
            </h1>
            <p className="text-xs text-[#8FA595] max-w-xs mx-auto">
              Acesse seu painel operacional, relatórios por voz e telemetria industrial em tempo real.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successAnimation && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-center space-x-2 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Acesso Concedido! Inicializando workspace...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Input E-mail */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#8FA595] block">
                E-mail Corporativo ou ID
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3.5 text-[#5E7567] pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ex: admin@yggdron.com.br"
                  required
                  className="w-full bg-[#0B120E] border border-[#1E3125] focus:border-[#76B38B] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#455A4D] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#8FA595] block">
                  Senha de Acesso
                </label>
                <span className="text-[10px] text-[#5E7567] font-mono">Padrão demo: 123456</span>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#5E7567] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B120E] border border-[#1E3125] focus:border-[#76B38B] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#455A4D] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#5E7567] hover:text-[#76B38B] transition-colors p-1"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Lembrar neste dispositivo */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-[#8FA595] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#0B120E] border-[#1E3125] text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Lembrar neste dispositivo</span>
              </label>

              <span className="text-[11px] text-[#76B38B] hover:underline cursor-pointer">
                Suporte IAM
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || successAnimation}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#1B3026] via-[#2A4738] to-[#1B3026] hover:from-[#233F31] hover:to-[#233F31] text-white border border-[#76B38B]/40 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{isLoading ? 'Autenticando...' : 'Acessar Command Center'}</span>
              <ArrowRight className="w-4 h-4 text-[#76B38B]" />
            </button>
          </form>

          {/* ── 1-CLICK RAPID PROFILE SELECTOR FOR DEMO / RBAC ── */}
          <div className="pt-2 border-t border-[#1E3125] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8FA595] flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Acesso Rápido por Cargo (1-Click Demo)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowQuickSelect(!showQuickSelect)}
                className="text-[10px] text-[#76B38B] hover:underline font-semibold"
              >
                {showQuickSelect ? 'Ocultar' : 'Exibir'}
              </button>
            </div>

            {showQuickSelect && (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {profiles.slice(1, 9).map((p) => {
                  const roleLabel = USER_ROLE_LABELS[p.role] || p.role;
                  const isOwner = p.role === 'DONO';
                  const isDirector = p.role.includes('DIRETOR');
                  const isManager = p.role.includes('GERENTE');

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickLogin(p.id)}
                      disabled={isLoading || successAnimation}
                      className="p-2.5 rounded-xl bg-[#0B120E] border border-[#1E3125] hover:border-[#76B38B]/60 hover:bg-[#142119] text-left transition-all group cursor-pointer flex flex-col justify-between space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 truncate group-hover:text-[#76B38B] transition-colors">
                          {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                        </span>
                        <span
                          className={`text-[8px] font-mono px-1 py-0.2 rounded border ${
                            isOwner
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isDirector
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : isManager
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}
                        >
                          {p.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#5E7567] truncate">
                        {p.department || roleLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Credentials Info */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center space-y-2 pb-2">
        <div className="flex items-center justify-center space-x-3 text-[10px] text-[#5E7567] font-mono">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-[#76B38B]" />
            <span>RLS Supabase</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>RBAC Multi-Tenant</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Building2 className="w-3 h-3 text-amber-400" />
            <span>Yggdron Corp</span>
          </div>
        </div>
        <p className="text-[10px] text-[#455A4D]">
          Yggdron Manager © 2026. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
