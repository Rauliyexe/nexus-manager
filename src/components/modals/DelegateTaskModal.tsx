'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  UserCheck,
  Building2,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { TaskPriority, USER_ROLE_LABELS } from '@/lib/types/nexus';

interface DelegateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAreaId?: string;
}

export const DelegateTaskModal: React.FC<DelegateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultAreaId,
}) => {
  const { areas, profiles, currentUser, delegateTask } = useNexus();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaId, setAreaId] = useState(defaultAreaId || areas[0]?.id || 'area-1');
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [initialComment, setInitialComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedArea = areas.find((a) => a.id === areaId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    delegateTask({
      title: title.trim(),
      description: description.trim(),
      area_id: areaId,
      assigned_to_id: assignedToId || undefined,
      priority,
      due_date: dueDate,
      initial_comment: initialComment.trim() || undefined,
    });

    setIsSubmitting(false);
    onClose();

    // Reset form
    setTitle('');
    setDescription('');
    setInitialComment('');
  };

  const PRIORITIES: { id: TaskPriority; label: string; activeClass: string }[] = [
    { id: 'LOW',      label: 'BAIXA',  activeClass: 'bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border-[#D4E8DB] dark:border-[#1E3125]' },
    { id: 'MEDIUM',   label: 'MÉDIA',  activeClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    { id: 'HIGH',     label: 'ALTA',   activeClass: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
    { id: 'CRITICAL', label: 'CRÍTICA', activeClass: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-sm font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] card-shadow">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#F5F7F5] dark:bg-[#0B120E] border-b border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] flex items-center justify-center">
              <UserCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A281E] dark:text-slate-100 uppercase tracking-wide">
                Delegar Nova Tarefa Operacional
              </h2>
              <p className="text-[11px] text-[#5C6E62] dark:text-slate-400 mt-0.5">
                Atribua metas, demandas e tarefas com acompanhamento em tempo real
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Delegated By Info Strip */}
          <div className="bg-[#F0F4F1] dark:bg-[#0B120E] p-2.5 rounded-xl border border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold text-[#8FA595] dark:text-slate-500 uppercase tracking-wider">Delegado por:</span>
              <span className="font-bold text-[#1A281E] dark:text-slate-100">{currentUser.name}</span>
              <span className="px-2 py-0.5 text-[9px] rounded-full bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] font-semibold">
                {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
              </span>
            </div>
            <span className="text-[10px] text-[#4D7C5D] dark:text-[#76B38B] font-semibold">Emissão Imediata</span>
          </div>

          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
              Título da Tarefa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Auditoria de estoque de sucata / Conciliação de frete..."
              className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] text-xs transition-colors"
            />
          </div>

          {/* Area Sector & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
                Setor Destino <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={areaId}
                  onChange={(e) => {
                    setAreaId(e.target.value);
                    setAssignedToId('');
                  }}
                  className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 focus:outline-none focus:border-[#4D7C5D] text-xs appearance-none font-sans cursor-pointer transition-colors"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <Building2 className="w-3.5 h-3.5 text-[#8FA595] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
                Responsável Direto
              </label>
              <div className="relative">
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 focus:outline-none focus:border-[#4D7C5D] text-xs appearance-none font-sans cursor-pointer transition-colors"
                >
                  <option value="">
                    Setor Inteiro ({selectedArea?.manager?.name || 'Gestor do Setor'})
                  </option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({USER_ROLE_LABELS[p.role] || p.role})
                    </option>
                  ))}
                </select>
                <UserCheck className="w-3.5 h-3.5 text-[#8FA595] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
                Prazo Limite (Due Date)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 focus:outline-none focus:border-[#4D7C5D] text-xs font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider">
              Instruções & Detalhes da Demanda <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhadamente o que precisa ser realizado, parâmetros de validação e prazos..."
              className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] text-xs resize-none transition-colors"
            />
          </div>

          {/* Initial Comment */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#4D7C5D]" />
              <span>Observação Inicial (Opcional)</span>
            </label>
            <input
              type="text"
              value={initialComment}
              onChange={(e) => setInitialComment(e.target.value)}
              placeholder="Primeira diretriz ou nota para o responsável..."
              className="w-full px-3 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] text-xs transition-colors"
            />
          </div>

          {/* Submit Footer */}
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
              <span>Delegar Tarefa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
