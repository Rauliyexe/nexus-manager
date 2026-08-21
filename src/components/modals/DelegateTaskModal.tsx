'use client';

import React, { useState, useRef } from 'react';
import {
 X,
 Send,
 UserCheck,
 Building2,
 Calendar,
 MessageSquare,
 Paperclip,
 File,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { TaskPriority, USER_ROLE_LABELS, MessageAttachment } from '@/lib/types/nexus';

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
 const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const fileInputRef = useRef<HTMLInputElement | null>(null);

 if (!isOpen) return null;

 const selectedArea = areas.find((a) => a.id === areaId);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files || files.length === 0) return;

 const newAttachments: MessageAttachment[] = Array.from(files).map((file) => {
 const ext = file.name.split('.').pop()?.toLowerCase();
 let type: 'PDF' | 'IMAGE' | 'DOC' | 'SHEET' | 'FILE' = 'FILE';
 if (ext === 'pdf') type = 'PDF';
 else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) type = 'IMAGE';
 else if (['xlsx', 'xls', 'csv'].includes(ext || '')) type = 'SHEET';
 else if (['doc', 'docx'].includes(ext || '')) type = 'DOC';

 const sizeFormatted =
 file.size > 1024 * 1024
 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
 : `${Math.round(file.size / 1024)} KB`;

 return {
 name: file.name,
 size: sizeFormatted,
 type,
 url: URL.createObjectURL(file),
 };
 });

 setAttachments((prev) => [...prev, ...newAttachments]);
 };

 const removeAttachment = (index: number) => {
 setAttachments((prev) => prev.filter((_, i) => i !== index));
 };

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
 attachments: attachments.length > 0 ? attachments : undefined,
 });

 setIsSubmitting(false);
 onClose();

 // Reset form
 setTitle('');
 setDescription('');
 setInitialComment('');
 setAttachments([]);
 };

 const PRIORITIES: { id: TaskPriority; label: string; activeClass: string }[] = [
 { id: 'LOW', label: 'BAIXA', activeClass: 'bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border-[#D4E8DB] dark:border-[#1E3125]' },
 { id: 'MEDIUM', label: 'MÉDIA', activeClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
 { id: 'HIGH', label: 'ALTA', activeClass: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
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

 {/* Dynamic Department-Specific Task Directives */}
 {(() => {
 const selectedAreaObj = areas.find((a) => a.id === areaId);
 const areaName = selectedAreaObj?.name?.toLowerCase() || '';

 if (areaName.includes('logística')) {
 return (
 <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2 animate-in fade-in">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-blue-700 dark:text-blue-400">
 PARTICULARIDADES DE EXPEDIÇÃO & LOGÍSTICA
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono">
 FROTA & ROTA
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Frota / Veículo</label>
 <input
 type="text"
 placeholder="Ex: Bitrem Scania R500"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Rota / Trajeto</label>
 <input
 type="text"
 placeholder="Ex: CD Sumaré -> Pinda"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Nº MTR / Manifesto</label>
 <input
 type="text"
 placeholder="Ex: MTR-9941"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
 />
 </div>
 </div>
 </div>
 );
 }

 if (areaName.includes('financeiro') || areaName.includes('comercial compras')) {
 return (
 <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2 animate-in fade-in">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
 DIRETRIZES FINANCEIRAS & TRAVA LME
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono">
 TESOURARIA
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Valor da Operação (R$)</label>
 <input
 type="text"
 placeholder="Ex: R$ 380.000,00"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Trava USD / Câmbio</label>
 <input
 type="text"
 placeholder="Ex: USD @ 5,4200"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Banco / Conta</label>
 <input
 type="text"
 placeholder="Ex: BTG Pactual"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs"
 />
 </div>
 </div>
 </div>
 );
 }

 if (areaName.includes('comercial vendas')) {
 return (
 <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2 animate-in fade-in">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-purple-700 dark:text-purple-400">
 PARÂMETROS COMERCIAIS DCOPPER
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-mono">
 VENDAS
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Volume Alocado (Ton)</label>
 <input
 type="text"
 placeholder="Ex: 24 Toneladas Vergalhão"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-purple-200 dark:border-purple-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Cliente B2B / Pedido</label>
 <input
 type="text"
 placeholder="Ex: Pedido #8410 - Prysmian"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-purple-200 dark:border-purple-900 rounded-lg text-xs"
 />
 </div>
 </div>
 </div>
 );
 }

 if (areaName.includes('segurança')) {
 return (
 <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2 animate-in fade-in">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
  DIRETRIZES DE SEGURANÇA & PORTARIA
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono">
 PORTARIA & VISTORIA
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Posto / Portão</label>
 <input
 type="text"
 placeholder="Ex: Portaria Principal 01"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-amber-200 dark:border-amber-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Nível de Vistoria</label>
 <select className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-amber-200 dark:border-amber-900 rounded-lg text-xs">
 <option>Inspeção Padrão de Carga</option>
 <option>Inspeção Rigorosa com Balança e Câmera</option>
 </select>
 </div>
 </div>
 </div>
 );
 }

 return null;
 })()}

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

 {/* Attachments Section */}
 <div className="space-y-2">
 <label className="block text-[11px] font-semibold text-[#5C6E62] dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
 <span className="flex items-center space-x-1">
 <Paperclip className="w-3.5 h-3.5 text-[#4D7C5D]" />
 <span>Anexar Documentos / Fotos ({attachments.length})</span>
 </span>
 <span className="text-[10px] font-normal text-[#8FA595]">PDF, Imagens, Excel</span>
 </label>

 {/* Hidden File Input */}
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileChange}
 multiple
 className="hidden"
 accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
 />

 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="px-3 py-1.5 rounded-xl bg-[#F5F7F5] dark:bg-[#0B120E] border border-dashed border-[#D4E8DB] dark:border-[#1E3125] text-xs font-semibold text-[#2C523D] dark:text-[#76B38B] hover:bg-[#EBF2EE] transition-colors cursor-pointer flex items-center space-x-1.5"
 >
 <Paperclip className="w-3.5 h-3.5" />
 <span>Adicionar Arquivo</span>
 </button>

 {attachments.map((att, index) => (
 <div
 key={index}
 className="px-2.5 py-1 rounded-xl bg-[#EBF2EE] dark:bg-[#1C2E24] border border-[#D4E8DB] dark:border-[#1E3125] text-xs font-medium text-[#1A281E] dark:text-slate-200 flex items-center space-x-1.5 animate-in fade-in"
 >
 <File className="w-3.5 h-3.5 text-[#2C523D] dark:text-[#76B38B]" />
 <span className="max-w-[150px] truncate">{att.name}</span>
 <span className="text-[10px] text-[#8FA595]">({att.size})</span>
 <button
 type="button"
 onClick={() => removeAttachment(index)}
 className="p-0.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ))}
 </div>
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
