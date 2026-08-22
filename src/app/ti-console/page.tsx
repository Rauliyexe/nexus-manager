'use client';

import React, { useState } from 'react';
import {
 Terminal,
 ShieldAlert,
 ShieldCheck,
 UserCheck,
 UserX,
 Clock,
 CheckCircle2,
 XCircle,
 Cpu,
 Database,
 Key,
 Lock,
 Search,
 ArrowRight,
 Activity,
 Layers,
 Building2,
 RefreshCw,
 AlertTriangle,
 UserPlus,
 Trash2,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { USER_ROLE_LABELS, UserRole, ApprovalStatus, SYSTEM_FEATURES, FeatureKey } from '@/lib/types/nexus';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { RegisterEmployeeModal } from '@/components/modals/RegisterEmployeeModal';

export default function TIConsolePage() {
 const {
 currentUser,
 profiles,
 itRequests,
 updateUserProfileRole,
 deleteEmployeeProfile,
 approveITRequest,
 rejectITRequest,
 integrations,
 triggerIntegrationSync,
 rolePermissions,
 toggleRolePermission,
 resetPermissionsToDefault,
 } = useNexus();

 const [activeTab, setActiveTab] = useState<'ROLES' | 'PERMISSIONS' | 'APPROVALS' | 'TELEMETRY'>('PERMISSIONS');
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedTargetRole, setSelectedTargetRole] = useState<Record<string, UserRole>>({});
 const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
 const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

 const availableRoles: UserRole[] = [
 'DONO',
 'DIRETOR',
 'DIRETOR_TI',
 'EQUIPE_TI',
 'GERENTE',
 'GERENTE_DEPARTAMENTO',
 'SUPERVISOR',
 'FUNCIONARIO',
 ];

 const filteredProfiles = profiles.filter(
 (p) =>
 p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (USER_ROLE_LABELS[p.role] && USER_ROLE_LABELS[p.role].toLowerCase().includes(searchQuery.toLowerCase()))
 );

 const pendingRequestsCount = itRequests.filter((r) => r.status === 'PENDING_TI_APPROVAL').length;

 const filteredRequests = itRequests.filter((r) => {
 if (approvalFilter === 'PENDING') return r.status === 'PENDING_TI_APPROVAL';
 if (approvalFilter === 'APPROVED') return r.status === 'APPROVED';
 if (approvalFilter === 'REJECTED') return r.status === 'REJECTED';
 return true;
 });

 const handleRoleSelectionChange = (userId: string, role: UserRole) => {
 setSelectedTargetRole((prev) => ({ ...prev, [userId]: role }));
 };

 const handleApplyRoleChange = (userId: string) => {
 const newRole = selectedTargetRole[userId];
 if (!newRole) return;
 updateUserProfileRole(userId, newRole);
 };

 return (
 <div className="min-h-full flex flex-col bg-white dark:bg-[#0B120E] rounded-2xl border border-slate-200 dark:border-[#1E3125] shadow-xs relative select-none font-sans p-3 sm:p-4 space-y-4 transition-colors duration-200">
 {/* Top Header Banner */}
 <div className="bg-slate-50/80 dark:bg-[#121D16] border border-slate-200 dark:border-[#1E3125] p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 rounded-xl bg-[#C87D53]/15 border border-[#C87D53]/30 text-[#C87D53] flex items-center justify-center font-mono text-sm font-bold shrink-0">
 <Terminal className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center space-x-2">
 <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
 CONSOLE TÉCNICO DE TI & GOVERNANÇA IAM
 </h1>
 <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
 DEMO · GOVERNANÇA
 </span>
 </div>
 <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
 Controle granular de acessos e permissões por cargo, privilégios RLS e integrações de sistema.
 </p>
 </div>
 </div>

        {/* User Context & New Employee Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1B3026] text-white hover:bg-[#284739] dark:bg-[#76B38B] dark:text-[#111D15] dark:hover:bg-[#8fd1a5] font-bold text-xs flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-400 dark:text-[#111D15]" />
            <span>+ Cadastrar Funcionário</span>
          </button>

          <div className="flex items-center space-x-3 bg-white dark:bg-[#0B120E] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E3125] shadow-xs">
            <UserAvatar name={currentUser.name} size="sm" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
              <p className="text-[10px] font-mono text-[#4D7C5D] dark:text-[#76B38B] font-bold">
                {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </div>

 {/* Navigation Tabs */}
 <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-[#1E3125] pb-2">
 <button
 onClick={() => setActiveTab('PERMISSIONS')}
 className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer ${
 activeTab === 'PERMISSIONS'
 ? 'bg-[#1B3026] text-white dark:bg-[#76B38B] dark:text-[#111D15] shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121D16]'
 }`}
 >
 <ShieldCheck className="w-4 h-4" />
 <span> Matriz de Acessos por Cargo (RBAC)</span>
 </button>

 <button
 onClick={() => setActiveTab('ROLES')}
 className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer ${
 activeTab === 'ROLES'
 ? 'bg-[#4D7C5D]/15 text-[#4D7C5D] dark:text-[#76B38B] border border-[#4D7C5D]/30 shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121D16]'
 }`}
 >
 <UserCheck className="w-4 h-4 text-[#4D7C5D] dark:text-[#76B38B]" />
 <span> Colaboradores & Cargos</span>
 </button>

 <button
 onClick={() => setActiveTab('APPROVALS')}
 className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer relative ${
 activeTab === 'APPROVALS'
 ? 'bg-[#C87D53]/15 text-[#C87D53] border border-[#C87D53]/30 shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121D16]'
 }`}
 >
 <ShieldAlert className="w-4 h-4 text-[#C87D53]" />
 <span> Fila de Aprovações TI</span>
 {pendingRequestsCount > 0 && (
 <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold">
 {pendingRequestsCount}
 </span>
 )}
 </button>

 <button
 onClick={() => setActiveTab('TELEMETRY')}
 className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all cursor-pointer ${
 activeTab === 'TELEMETRY'
 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121D16]'
 }`}
 >
 <Cpu className="w-4 h-4 text-emerald-500" />
 <span> Telemetria de Sistemas</span>
 </button>
 </div>

 {/* TAB: MATRIZ DE ACESSOS & PERMISSÕES POR CARGO (RBAC) */}
 {activeTab === 'PERMISSIONS' && (
 <div className="space-y-4 animate-in fade-in duration-200">
 {/* Header & Reset Box */}
 <div className="p-4 bg-slate-50 dark:bg-[#121D16] border border-slate-200 dark:border-[#1E3125] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-start space-x-3">
 <ShieldCheck className="w-5 h-5 text-[#1B3026] dark:text-[#76B38B] shrink-0 mt-0.5" />
 <div>
 <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wide">
 CONTROLE GRANULAR DE VISUALIZAÇÃO & TELAS (RBAC)
 </h2>
 <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
 Marque ou desmarque quais funcionalidades cada cargo da empresa tem autorização para visualizar. Para <strong>Funcionários</strong>, mantenha ativas apenas as telas que ditam a rotina matinal e o turno de trabalho.
 </p>
 </div>
 </div>

 <button
 onClick={resetPermissionsToDefault}
 className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0B120E] border border-slate-200 dark:border-[#1E3125] hover:bg-slate-100 dark:hover:bg-[#1C2E24] text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 <span>Restaurar Padrão de Fábrica</span>
 </button>
 </div>

 {/* RBAC Interactive Matrix Grid */}
 <div className="bg-white dark:bg-[#121D16] rounded-2xl border border-slate-200 dark:border-[#1E3125] overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs font-sans">
 <thead className="bg-slate-50 dark:bg-[#0B120E] text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-[#1E3125]">
 <tr>
 <th className="p-3.5 min-w-[240px]">Módulo / Funcionalidade</th>
 {availableRoles.map((role) => (
 <th key={role} className="p-3 text-center min-w-[100px]">
 <span className={`px-2 py-0.5 rounded text-[9px] font-bold block truncate ${
 role === 'DONO'
 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
 : role === 'DIRETOR' || role === 'DIRETOR_TI'
 ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20'
 : role === 'FUNCIONARIO'
 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-bold'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
 }`}>
 {USER_ROLE_LABELS[role]}
 </span>
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-[#1E3125]">
 {SYSTEM_FEATURES.map((feature) => (
 <tr
 key={feature.key}
 className="hover:bg-slate-50/80 dark:hover:bg-[#17261D] transition-colors"
 >
 <td className="p-3.5">
 <div>
 <div className="flex items-center space-x-2">
 <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
 {feature.label}
 </span>
 <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B]">
 {feature.category}
 </span>
 </div>
 <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
 {feature.description}
 </p>
 </div>
 </td>

 {availableRoles.map((role) => {
 const isGranted = (rolePermissions[role] || []).includes(feature.key);
 const isOwnerRole = role === 'DONO';

 return (
 <td key={role} className="p-3 text-center">
 <label className="inline-flex items-center justify-center cursor-pointer p-1">
 <input
 type="checkbox"
 checked={isGranted || isOwnerRole}
 disabled={isOwnerRole}
 onChange={() => toggleRolePermission(role, feature.key)}
 className={`w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#1B3026] focus:ring-[#1B3026] transition-colors ${
 isOwnerRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
 }`}
 />
 </label>
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* TAB 1: MATRIZ DE CARGOS & IAM (COLOCAR E TIRAR CARGOS) */}
 {activeTab === 'ROLES' && (
 <div className="space-y-4">
 {/* Security Notice */}
 <div className="p-3.5 bg-slate-50 dark:bg-[#121D16] border border-slate-200 dark:border-[#1E3125] rounded-xl flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
 <Lock className="w-5 h-5 text-[#4D7C5D] dark:text-[#76B38B] shrink-0 mt-0.5" />
 <div>
 <strong className="font-mono text-[#4D7C5D] dark:text-[#76B38B] block uppercase">PROTOCOLO DE SEGURANÇA E GOVERNANÇA:</strong>
 <span>
 As alterações de cargos sensíveis (promover a <strong>Dono</strong>, <strong>Diretor</strong> ou <strong>Diretor de TI</strong>) passam por validação em 2 etapas: entram na fila de <strong>Aprovação do Diretor de TI</strong> e disparam um <strong>Pop-up de Alerta Crítico na tela do Dono</strong>.
 </span>
 </div>
 </div>

        {/* Filter & Search Bar + Quick Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121D16] p-3 rounded-xl border border-slate-200 dark:border-[#1E3125]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar colaborador por nome, e-mail ou cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0B120E] border border-slate-200 dark:border-[#1E3125] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#4D7C5D]"
            />
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Total: <strong>{filteredProfiles.length}</strong> colaboradores
            </span>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#1B3026] text-white hover:bg-[#254235] dark:bg-[#76B38B] dark:text-[#111D15] font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400 dark:text-[#111D15]" />
              <span>Novo Cadastro</span>
            </button>
          </div>
        </div>

        {/* Employees Role Matrix Table */}
        <div className="bg-white dark:bg-[#121D16] rounded-xl border border-slate-200 dark:border-[#1E3125] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-[#0B120E] text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-[#1E3125]">
                <tr>
                  <th className="p-3">Colaborador</th>
                  <th className="p-3">Departamento</th>
                  <th className="p-3">Cargo Atual</th>
                  <th className="p-3">Novo Cargo Proposto</th>
                  <th className="p-3 text-right">Ações de IAM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1E3125]">
                {filteredProfiles.map((profile) => {
                  const selectedRole = selectedTargetRole[profile.id] || profile.role;
                  const isRoleChanged = selectedRole !== profile.role;
                  const isCustom = profile.id.startsWith('usr-emp-');

                  return (
                    <tr key={profile.id} className="hover:bg-slate-50 dark:hover:bg-[#17261D] transition-colors">
                      {/* Profile Info */}
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <UserAvatar name={profile.name} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                              <span>{profile.name}</span>
                              {isCustom && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold">
                                  NOVO
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{profile.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-3 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        {profile.department || 'Geral'}
                      </td>

                      {/* Current Role */}
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                            profile.role === 'DONO'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
                              : profile.role === 'DIRETOR' || profile.role === 'DIRETOR_TI'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {USER_ROLE_LABELS[profile.role] || profile.role}
                        </span>
                      </td>

                      {/* Proposed Role Selector */}
                      <td className="p-3">
                        <select
                          value={selectedRole}
                          onChange={(e) =>
                            handleRoleSelectionChange(profile.id, e.target.value as UserRole)
                          }
                          className="bg-slate-50 dark:bg-[#0B120E] border border-slate-200 dark:border-[#1E3125] rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-[#4D7C5D]"
                        >
                          {availableRoles.map((role) => (
                            <option key={role} value={role}>
                              {USER_ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            disabled={!isRoleChanged}
                            onClick={() => handleApplyRoleChange(profile.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                              isRoleChanged
                                ? 'bg-[#4D7C5D] hover:bg-[#3d634a] text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Alterar Cargo</span>
                          </button>

                          {isCustom && (
                            <button
                              onClick={() => {
                                if (confirm(`Deseja realmente remover o colaborador ${profile.name}?`)) {
                                  deleteEmployeeProfile(profile.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Excluir Colaborador"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
 )}

 {/* TAB 2: FILA DE APROVAÇÕES DA DIRETORIA DE TI */}
 {activeTab === 'APPROVALS' && (
 <div className="space-y-4">
 {/* Status Filter */}
 <div className="flex items-center space-x-2 bg-white dark:bg-[#121D16] p-1.5 rounded-xl border border-slate-200 dark:border-[#1E3125] self-start shadow-xs">
 <button
 onClick={() => setApprovalFilter('PENDING')}
 className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
 approvalFilter === 'PENDING'
 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 Pendentes ({itRequests.filter((r) => r.status === 'PENDING_TI_APPROVAL').length})
 </button>

 <button
 onClick={() => setApprovalFilter('APPROVED')}
 className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
 approvalFilter === 'APPROVED'
 ? 'bg-[#4D7C5D]/15 text-[#4D7C5D] dark:text-[#76B38B] border border-[#4D7C5D]/30'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 Aprovadas ({itRequests.filter((r) => r.status === 'APPROVED').length})
 </button>

 <button
 onClick={() => setApprovalFilter('REJECTED')}
 className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
 approvalFilter === 'REJECTED'
 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
 }`}
 >
 Rejeitadas ({itRequests.filter((r) => r.status === 'REJECTED').length})
 </button>
 </div>

 {/* Requests Cards List */}
 <div className="space-y-3">
 {filteredRequests.length === 0 ? (
 <div className="p-8 text-center bg-white dark:bg-[#121D16] rounded-xl border border-slate-200 dark:border-[#1E3125] text-slate-500 font-mono text-xs shadow-xs">
 Nenhuma solicitação encontrada nesta categoria.
 </div>
 ) : (
 filteredRequests.map((req) => {
 const isPending = req.status === 'PENDING_TI_APPROVAL';

 return (
 <div
 key={req.id}
 className="p-4 bg-white dark:bg-[#121D16] border border-slate-200 dark:border-[#1E3125] rounded-xl space-y-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-xs"
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1E3125] pb-2.5">
 <div className="flex items-center space-x-2.5">
 <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold rounded-md border border-slate-200 dark:border-slate-700">
 {req.code}
 </span>
 <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{req.title}</h3>
 </div>

 <div className="flex items-center space-x-2">
 <span
 className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
 req.sensitivity === 'CRITICAL'
 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
 : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
 }`}
 >
 SENSÍVEL: {req.sensitivity}
 </span>

 <span
 className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
 req.status === 'PENDING_TI_APPROVAL'
 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
 : req.status === 'APPROVED'
 ? 'bg-[#4D7C5D]/15 text-[#4D7C5D] dark:text-[#76B38B] border border-[#4D7C5D]/30'
 : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
 }`}
 >
 {req.status === 'PENDING_TI_APPROVAL'
 ? 'PENDENTE DIRETORIA TI'
 : req.status === 'APPROVED'
 ? 'APROVADO'
 : 'REJEITADO'}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
 <div className="p-2.5 bg-slate-50 dark:bg-[#0B120E] rounded-lg border border-slate-200 dark:border-[#1E3125] space-y-1">
 <span className="text-[10px] font-mono text-slate-500 block">ALTERAÇÃO PROPOSTA DE CARGO:</span>
 <div className="flex items-center space-x-2 font-mono font-bold text-slate-800 dark:text-slate-200">
 <span className="text-[#8FA595] dark:text-slate-500">{USER_ROLE_LABELS[req.current_role]}</span>
 <ArrowRight className="w-3.5 h-3.5 text-[#4D7C5D]" />
 <span className="text-[#4D7C5D] dark:text-[#76B38B]">{USER_ROLE_LABELS[req.proposed_role]}</span>
 </div>
 </div>

 <div className="p-2.5 bg-slate-50 dark:bg-[#0B120E] rounded-lg border border-slate-200 dark:border-[#1E3125] space-y-1">
 <span className="text-[10px] font-mono text-slate-500 block">SOLICITANTE & DATA:</span>
 <p className="text-slate-800 dark:text-slate-200 font-semibold">
 {req.requested_by_name} ({req.requested_by_role})
 </p>
 <p className="text-[10px] font-mono text-slate-500">
 {new Date(req.created_at).toLocaleString('pt-BR')}
 </p>
 </div>
 </div>

 <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-[#0B120E]/50 p-2.5 rounded-lg border border-slate-200/80 dark:border-[#1E3125]">
 {req.description}
 </p>

 {/* Action Buttons for TI Approval */}
 {isPending && (
 <div className="flex items-center justify-end space-x-2 pt-1">
 <button
 onClick={() => rejectITRequest(req.id)}
 className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center space-x-1"
 >
 <XCircle className="w-3.5 h-3.5" />
 <span>Rejeitar</span>
 </button>

 <button
 onClick={() => approveITRequest(req.id)}
 className="px-4 py-1.5 rounded-lg bg-[#4D7C5D] hover:bg-[#3d634a] text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
 >
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>Aprovar Alteração (Diretor de TI)</span>
 </button>
 </div>
 )}
 </div>
 );
 })
 )}
 </div>
 </div>
 )}

 {/* TAB 3: TELEMETRIA TÉCNICA DE SISTEMAS */}
 {activeTab === 'TELEMETRY' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div className="p-4 bg-white dark:bg-[#121D16] border border-slate-200 dark:border-[#1E3125] rounded-xl space-y-1 shadow-xs">
 <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-bold">LATÊNCIA BANCO</span>
 <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">14.2 ms</p>
 <p className="text-[10px] text-slate-400 font-mono">Conexão Real-time Ativa</p>
 </div>

 <div className="p-4 bg-white dark:bg-[#121D16] border border-slate-200 dark:border-[#1E3125] rounded-xl space-y-1 shadow-xs">
 <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-bold">POLÍTICAS RLS</span>
 <p className="text-xl font-bold font-mono text-[#4D7C5D] dark:text-[#76B38B]">12 Diretivas</p>
 <p className="text-[10px] text-slate-400 font-mono">10 Departamentos Isolados</p>
 </div>

 <div className="p-4 bg-white dark:bg-[#121D16] border border-slate-200 dark:border-[#1E3125] rounded-xl space-y-1 shadow-xs">
 <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase font-bold">INTEGRAÇÕES DE APIs</span>
 <p className="text-xl font-bold font-mono text-amber-500">
 {integrations.filter((i) => i.status === 'ONLINE').length} / {integrations.length} ONLINE
 </p>
 <p className="text-[10px] text-slate-400 font-mono">AwesomeAPI, BCB PTAX, LME Spot</p>
 </div>
 </div>

 {/* Integrations Table */}
 <div className="bg-white dark:bg-[#121D16] rounded-xl border border-slate-200 dark:border-[#1E3125] p-4 space-y-3 shadow-xs">
 <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono uppercase">
 STATUS DE INTEGRABILIDADE DAS APIs
 </h3>
 <div className="space-y-2">
 {integrations.map((item) => (
 <div
 key={item.id}
 className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-[#0B120E] rounded-xl border border-slate-200/80 dark:border-[#1E3125] text-xs"
 >
 <div>
 <strong className="text-slate-800 dark:text-slate-200">{item.name}</strong>
 <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.description}</p>
 </div>

 <div className="flex items-center space-x-3">
 <span className="font-mono text-[10px] text-slate-400">{item.latencyMs}ms</span>
 <button
 onClick={() => triggerIntegrationSync(item.id)}
 className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[#4D7C5D] dark:text-[#76B38B] font-mono text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
 >
 <RefreshCw className="w-3 h-3" />
 <span>Sincronizar</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Institutional Demo Footnote */}
 <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
 <span>Ambiente de Demonstração • Painel de governança IAM e elevação de privilégios para apresentação à diretoria</span>
 <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP IAM CONTROL</span>
 </div>

 {/* Register Employee Modal */}
 <RegisterEmployeeModal
 isOpen={isRegisterModalOpen}
 onClose={() => setIsRegisterModalOpen(false)}
 />
 </div>
 );
}
