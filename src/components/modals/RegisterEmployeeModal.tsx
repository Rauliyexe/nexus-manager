'use client';

import React, { useState } from 'react';
import { UserPlus, X, Check, Key, ShieldCheck, Mail, User, Building2, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { USER_ROLE_LABELS, UserRole } from '@/lib/types/nexus';

interface RegisterEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterEmployeeModal: React.FC<RegisterEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { createEmployeeProfile, areas, playSound } = useNexus();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('FUNCIONARIO');
  const [department, setDepartment] = useState('Fundição & Produção');
  const [password, setPassword] = useState('nexus@2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'ygg@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    playSound('BUTTON_CLICK');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg('Por favor, informe o nome completo do funcionário (mínimo 3 caracteres).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail corporativo válido.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMsg('A senha inicial deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = createEmployeeProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        department,
        initialPassword: password,
      });

      playSound('TASK_COMPLETED');
      setSuccessMsg(`Colaborador ${created.name} cadastrado com sucesso! As credenciais já estão ativas para login.`);

      setTimeout(() => {
        setIsSubmitting(false);
        setName('');
        setEmail('');
        setPassword('nexus@2026');
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao registrar colaborador.');
      setIsSubmitting(false);
    }
  };

  const availableRoles: UserRole[] = [
    'FUNCIONARIO',
    'SUPERVISOR',
    'GERENTE_DEPARTAMENTO',
    'GERENTE',
    'EQUIPE_TI',
    'DIRETOR_TI',
    'DIRETOR',
    'DONO',
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-3xl shadow-2xl overflow-hidden card-shadow animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header ── */}
        <div className="p-5 border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between bg-slate-50/70 dark:bg-[#0B120E]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B3026] text-white flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111D15] dark:text-slate-100 uppercase tracking-tight">
                Cadastrar Novo Funcionário
              </h2>
              <p className="text-xs text-[#5E7567] dark:text-slate-400">
                Criar credencial de acesso IAM e perfil corporativo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Nome Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3B4F43] dark:text-slate-300 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Nome Completo do Colaborador *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lucas Ferreira de Souza"
              className="w-full px-3.5 py-2.5 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] dark:focus:border-emerald-500 font-medium"
            />
          </div>

          {/* E-mail Corporativo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3B4F43] dark:text-slate-300 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>E-mail Corporativo / Login *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lucas.ferreira@yggdron.com.br"
              className="w-full px-3.5 py-2.5 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] dark:focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Grid: Cargo & Departamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Cargo / Role IAM */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3B4F43] dark:text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Cargo / Permissão IAM *</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs text-[#111D15] dark:text-slate-100 focus:outline-none focus:border-[#1B3026] font-medium cursor-pointer"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {USER_ROLE_LABELS[r] || r}
                  </option>
                ))}
              </select>
            </div>

            {/* Departamento / Setor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3B4F43] dark:text-slate-300 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Departamento / Setor *</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs text-[#111D15] dark:text-slate-100 focus:outline-none focus:border-[#1B3026] font-medium cursor-pointer"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
                <option value="Financeiro & Controladoria">Financeiro & Controladoria</option>
                <option value="Diretoria Geral">Diretoria Geral</option>
                <option value="Auditoria & Compliance">Auditoria & Compliance</option>
              </select>
            </div>
          </div>

          {/* Senha de Acesso Inicial */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3B4F43] dark:text-slate-300 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Senha de Acesso Inicial *</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Gerar Senha Aleatória</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#EEF2EE] dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs text-[#111D15] dark:text-slate-100 font-mono focus:outline-none focus:border-[#1B3026] dark:focus:border-emerald-500"
              />
            </div>
            <p className="text-[10px] text-[#5E7567] dark:text-slate-400">
              O colaborador poderá alterar essa senha nas configurações de perfil após o primeiro login.
            </p>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#D5E0D7] dark:border-[#1E3125]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-slate-300 hover:bg-[#D5E0D7] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1B3026] text-white hover:bg-[#254235] text-xs font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? 'Salvando...' : 'Cadastrar Colaborador'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
