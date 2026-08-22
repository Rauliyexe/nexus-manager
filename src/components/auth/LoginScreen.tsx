'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Building2,
  KeyRound,
  Fingerprint,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { login } = useNexus();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Sistema de Proteção Anti-Brute Force / Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutSeconds]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Por favor, informe seu e-mail corporativo ou ID de acesso.');
      return;
    }

    if (!password) {
      setErrorMessage('Por favor, digite a sua senha de segurança.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(identifier.trim(), password);

      if (result.success) {
        setFailedAttempts(0);
        setSuccessAnimation(true);
        setTimeout(() => {
          setIsLoading(false);
          onSuccess?.();
        }, 650);
      } else {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        setIsLoading(false);

        if (nextFails >= 5) {
          setLockoutSeconds(30);
          setErrorMessage('Múltiplas tentativas incorretas. Formulário bloqueado temporariamente por 30 segundos.');
        } else {
          setErrorMessage(result.error || 'Credenciais inválidas. Verifique seu login e senha.');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Falha na comunicação com o servidor de autenticação.');
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
              Command Center & Governança Privada
            </span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#142119] border border-[#1E3125] text-[11px] font-mono text-[#76B38B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PORTAL AUDITADO & CRIPTOGRAFADO</span>
        </div>
      </div>

      {/* Main Login Card */}
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
              Autenticação de Acesso
            </h1>
            <p className="text-xs text-[#8FA595] max-w-xs mx-auto">
              Digite seu e-mail corporativo e senha de segurança para acessar o sistema.
            </p>
          </div>

          {/* Lockout Warning */}
          {lockoutSeconds > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center space-x-2.5 animate-in fade-in duration-200">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Acesso bloqueado por segurança. Aguarde <strong>{lockoutSeconds}s</strong> para tentar novamente.
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && lockoutSeconds === 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successAnimation && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-center space-x-2 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Acesso Concedido! Carregando workspace...</span>
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
                  placeholder="seu.email@yggdron.com.br"
                  required
                  disabled={isLoading || lockoutSeconds > 0 || successAnimation}
                  autoComplete="username"
                  className="w-full bg-[#0B120E] border border-[#1E3125] focus:border-[#76B38B] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#455A4D] focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#8FA595] block">
                  Senha de Segurança
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute left-3.5 text-[#5E7567] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading || lockoutSeconds > 0 || successAnimation}
                  autoComplete="current-password"
                  className="w-full bg-[#0B120E] border border-[#1E3125] focus:border-[#76B38B] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#455A4D] focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#5E7567] hover:text-[#76B38B] transition-colors p-1"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  tabIndex={-1}
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
                <span>Manter conectado</span>
              </label>

              <div className="flex items-center space-x-1 text-[11px] text-[#5E7567] font-mono">
                <Fingerprint className="w-3 h-3 text-[#76B38B]" />
                <span>IAM Auth</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0 || successAnimation}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#1B3026] via-[#2A4738] to-[#1B3026] hover:from-[#233F31] hover:to-[#233F31] text-white border border-[#76B38B]/40 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{isLoading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4 text-[#76B38B]" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Security Badges */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center space-y-2 pb-2">
        <div className="flex items-center justify-center space-x-3 text-[10px] text-[#5E7567] font-mono">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-[#76B38B]" />
            <span>Criptografia AES-256</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Proteção Anti-Brute Force</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Building2 className="w-3 h-3 text-amber-400" />
            <span>Yggdron Corp</span>
          </div>
        </div>
        <p className="text-[10px] text-[#455A4D]">
          Yggdron Manager © 2026. Acesso estritamente restrito a colaboradores autorizados.
        </p>
      </div>
    </div>
  );
};
