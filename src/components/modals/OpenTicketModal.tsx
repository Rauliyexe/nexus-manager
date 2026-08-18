'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  Ticket,
  Building2,
  HelpCircle,
  ShieldAlert,
  Wrench,
  Laptop,
  Users,
  PackageCheck,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { TicketCategory, TaskPriority, USER_ROLE_LABELS } from '@/lib/types/nexus';

interface OpenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAreaId?: string;
}

export const OpenTicketModal: React.FC<OpenTicketModalProps> = ({
  isOpen,
  onClose,
  defaultAreaId,
}) => {
  const { areas, createTicket, currentUser } = useNexus();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('TI_SUPPORTE');
  const [areaId, setAreaId] = useState(defaultAreaId || areas[0]?.id || 'area-1');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    createTicket({ title: title.trim(), description: description.trim(), category, area_id: areaId, priority });
    setIsSubmitting(false);
    onClose();
    setTitle('');
    setDescription('');
  };

  const CATEGORIES = [
    { id: 'TI_SUPPORTE', label: 'Suporte TI', icon: Laptop },
    { id: 'MANUTENCAO', label: 'Manutenção', icon: Wrench },
    { id: 'SEGURANCA', label: 'Segurança', icon: ShieldAlert },
    { id: 'SUPRIMENTOS', label: 'Suprimentos', icon: PackageCheck },
    { id: 'RH_PESSOAS', label: 'RH & Pessoas', icon: Users },
    { id: 'OUTROS', label: 'Outros', icon: HelpCircle },
  ];

  const PRIORITIES: { id: TaskPriority; label: string; activeClass: string }[] = [
    { id: 'LOW',      label: 'BAIXA',  activeClass: 'bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border-[#D4E8DB] dark:border-[#1E3125]' },
    { id: 'MEDIUM',   label: 'MÉDIA',  activeClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    { id: 'HIGH',     label: 'ALTA',   activeClass: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
    { id: 'CRITICAL', label: 'CRÍTICA', activeClass: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] card-shadow">
        {/* Header */}
        <div className="px-5 py-4 bg-[#F5F7F5] dark:bg-[#0B120E] border-b border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] flex items-center justify-center">
              <Ticket className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">
                Abrir Novo Chamado
              </h2>
              <p className="text-[11px] text-[#5C6E62] dark:text-slate-400 mt-0.5">
                Protocolo #INC — atendimento intersetorial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8FA595] hover:text-[#1A281E] dark:hover:text-slate-200 rounded-lg hover:bg-[#E2E8E3] dark:hover:bg-[#1E3125] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Requester info */}
          <div className="bg-[#F0F4F1] dark:bg-[#0B120E] p-2.5 rounded-xl border border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold text-[#8FA595] dark:text-slate-500 uppercase tracking-wider">Solicitado por:</span>
              <span className="font-bold text-[#1A281E] dark:text-slate-100 text-xs">{currentUser.name}</span>
              <span className="px-2 py-0.5 text-[9px] rounded-full bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] font-semibold">
                {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
              </span>
            </div>
            <span className="text-[10px] text-[#4D7C5D] dark:text-[#76B38B] font-semibold">Protocolo Automático</span>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
              Assunto / Título do Chamado <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Falha no terminal de balança / Acesso ao sistema..."
              className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] text-xs transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
              Categoria do Atendimento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const isSel = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as TicketCategory)}
                    className={`p-2 rounded-xl border flex items-center space-x-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border-[#D4E8DB] dark:border-[#1E3125] font-semibold'
                        : 'bg-[#F5F7F5] dark:bg-[#0B120E] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-[#4D7C5D]/40'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-[#4D7C5D] dark:text-[#76B38B]' : 'text-[#8FA595]'}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
                Departamento Destino
              </label>
              <div className="relative">
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 focus:outline-none focus:border-[#4D7C5D] text-xs appearance-none cursor-pointer transition-colors"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <Building2 className="w-3.5 h-3.5 text-[#8FA595] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
                Prioridade
              </label>
              <div className="grid grid-cols-4 gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      priority === p.id
                        ? p.activeClass
                        : 'bg-[#F5F7F5] dark:bg-[#0B120E] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-[#4D7C5D]/40'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
              Descrição do Incidente / Problema <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o ocorrido, impacto operacional e urgência..."
              className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] text-xs resize-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F0F4F1] dark:bg-[#17261D] hover:bg-[#E2E8E3] dark:hover:bg-[#1C2E24] text-[#5C6E62] dark:text-slate-400 text-xs font-medium cursor-pointer transition-colors border border-[#E2E8E3] dark:border-[#1E3125]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="px-5 py-2 rounded-xl bg-[#1B3026] hover:bg-[#2A4A3C] disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emitir Chamado #INC</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
