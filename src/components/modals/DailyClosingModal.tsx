'use client';

import React, { useState } from 'react';
import { X, Check, ShieldCheck, AlertTriangle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { DailyStatusType } from '@/lib/types/nexus';

interface DailyClosingModalProps {
 isOpen: boolean;
 onClose: () => void;
 defaultAreaId?: string;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
 isOpen,
 onClose,
 defaultAreaId,
}) => {
 const { areas, submitDailyStatus } = useNexus();

 const [selectedAreaId, setSelectedAreaId] = useState<string>(
 defaultAreaId || areas[0]?.id || 'area-1'
 );
 const [selectedStatus, setSelectedStatus] = useState<DailyStatusType>('GREEN');
 const [justification, setJustification] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [successMessage, setSuccessMessage] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isVoiceLoading, setIsVoiceLoading] = useState(false);

 if (!isOpen) return null;

 const handleVoiceQuickFill = async () => {
 setIsVoiceLoading(true);
 try {
 const res = await fetch('/api/ai/audio-report', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ presetId: 'manutencao_forno' }),
 });
 if (res.ok) {
 const data = await res.json();
 if (data.report) {
 setJustification(
 `[Áudio IA]: ${data.report.summary} | Duração: ${data.report.durationTime} | Impacto: ${data.report.resultImpact}`
 );
 setSelectedStatus(data.report.suggestedStatus || 'GREEN');
 }
 }
 } catch (e) {
 console.warn('Erro voice quick fill:', e);
 } finally {
 setIsVoiceLoading(false);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErrorMessage('');

 if ((selectedStatus === 'YELLOW' || selectedStatus === 'RED') && !justification.trim()) {
 setErrorMessage('Para status Atenção ou Crítico, a justificativa é obrigatória.');
 return;
 }

 setIsSubmitting(true);

 try {
 await submitDailyStatus(selectedAreaId, selectedStatus, justification.trim());

 setSuccessMessage(
 'Status registrado com sucesso! Gestores notificados.'
 );

 setTimeout(() => {
 setSuccessMessage('');
 setIsSubmitting(false);
 onClose();
 }, 1200);
 } catch (err) {
 setErrorMessage('Erro ao registrar fechamento.');
 setIsSubmitting(false);
 }
 };

 return (
 <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-sans">
 <div
 className="fixed inset-0"
 onClick={onClose}
 />
 <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-xs z-10 animate-in slide-in-from-bottom duration-250 max-h-[92vh] flex flex-col card-shadow">
 {/* Header */}
 <div className="p-4 border-b border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between bg-[#F5F7F5] dark:bg-[#0B120E]">
 <div>
 <h2 className="font-bold text-[#1A281E] dark:text-slate-100 uppercase text-xs sm:text-sm flex items-center space-x-2">
 <span>Fechamento do Dia</span>
 <span className="w-2 h-2 rounded-full bg-[#4D7C5D] animate-pulse" />
 </h2>
 <p className="text-[11px] text-[#5C6E62] dark:text-slate-400 mt-0.5">
 Atualize o status operacional da sua área hoje.
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-1.5 rounded-lg text-[#8FA595] hover:text-[#1A281E] dark:hover:text-slate-200 hover:bg-[#E2E8E3] dark:hover:bg-[#1E3125] transition-colors cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Highlight Voice AI Action Banner */}
 <div className="px-5 pt-4">
   <div className="p-3 bg-gradient-to-r from-[#1B3026] to-[#274437] dark:from-[#16281F] dark:to-[#1F3A2B] rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs border border-[#3B6650]/40">
     <div className="flex items-center space-x-2.5">
       <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300">
         <Sparkles className="w-4 h-4" />
       </div>
       <div>
         <p className="text-xs font-bold leading-tight flex items-center space-x-1.5">
           <span>Ditar Relato com IA Valkyra</span>
           <span className="px-1.5 py-0.2 rounded bg-emerald-400 text-[#1B3026] text-[9px] font-black uppercase">
             RÁPIDO
           </span>
         </p>
         <p className="text-[10px] text-emerald-100/80 leading-tight mt-0.5">
           Fale o que foi feito hoje e preencha automaticamente
         </p>
       </div>
     </div>

     <div className="flex items-center space-x-1.5 self-end sm:self-auto">
       <button
         type="button"
         onClick={handleVoiceQuickFill}
         disabled={isVoiceLoading}
         className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#111D15] rounded-lg font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50"
       >
         {isVoiceLoading ? (
           <RefreshCw className="w-3.5 h-3.5 animate-spin" />
         ) : (
           <Sparkles className="w-3.5 h-3.5" />
         )}
         <span>{isVoiceLoading ? 'Processando...' : 'Preencher por Voz'}</span>
       </button>

       <a
         href="/reports"
         className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium text-[11px] flex items-center space-x-1 transition-colors"
         title="Abrir Estúdio Completo de Áudio"
       >
         <span>Estúdio</span>
       </a>
     </div>
   </div>
 </div>

 {successMessage ? (
 <div className="p-8 text-center space-y-3">
 <div className="w-12 h-12 bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] rounded-full flex items-center justify-center mx-auto border border-[#D4E8DB] dark:border-[#1E3125]">
 <Check className="w-6 h-6" />
 </div>
 <h3 className="text-sm font-semibold text-[#1A281E] dark:text-slate-100">{successMessage}</h3>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
 {/* Area Selector */}
 <div className="space-y-1.5">
 <label className="block font-semibold text-[#5C6E62] dark:text-slate-400 text-xs">Área Operacional</label>
 <select
 value={selectedAreaId}
 onChange={(e) => setSelectedAreaId(e.target.value)}
 className="w-full bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl px-3 py-2 text-xs text-[#1A281E] dark:text-slate-100 focus:outline-none focus:border-[#4D7C5D] font-sans cursor-pointer transition-colors"
 >
 {areas.map((a) => (
 <option key={a.id} value={a.id}>
 {a.name} ({a.manager?.name || 'Sem gestor'})
 </option>
 ))}
 </select>
 </div>

 {/* Status Select Big Tactile Buttons with Symbols */}
 <div className="space-y-1.5">
 <label className="block font-semibold text-[#5C6E62] dark:text-slate-400 text-xs">Status do Dia</label>
 <div className="grid grid-cols-3 gap-2 font-mono">
 <button
 type="button"
 onClick={() => setSelectedStatus('GREEN')}
 className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
 selectedStatus === 'GREEN'
 ? 'bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border-[#D4E8DB] dark:border-[#1E3125] shadow-xs'
 : 'bg-[#F5F7F5] dark:bg-[#0B120E] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-[#4D7C5D]/40'
 }`}
 >
 <ShieldCheck className="w-5 h-5 text-[#4D7C5D]" />
 <span className="font-bold text-[11px]">Normal (OK)</span>
 </button>

 <button
 type="button"
 onClick={() => setSelectedStatus('YELLOW')}
 className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
 selectedStatus === 'YELLOW'
 ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 shadow-xs'
 : 'bg-[#F5F7F5] dark:bg-[#0B120E] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-amber-400/40'
 }`}
 >
 <AlertTriangle className="w-5 h-5 text-amber-500" />
 <span className="font-bold text-[11px]">Atenção</span>
 </button>

 <button
 type="button"
 onClick={() => setSelectedStatus('RED')}
 className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
 selectedStatus === 'RED'
 ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 shadow-xs'
 : 'bg-[#F5F7F5] dark:bg-[#0B120E] text-[#5C6E62] dark:text-slate-400 border-[#E2E8E3] dark:border-[#1E3125] hover:border-rose-400/40'
 }`}
 >
 <AlertCircle className="w-5 h-5 text-rose-500" />
 <span className="font-bold text-[11px]">Crítico</span>
 </button>
 </div>
 </div>

 {/* Dynamic Department-Specific Custom Fields */}
 {(() => {
 const currentArea = areas.find((a) => a.id === selectedAreaId);
 const areaName = currentArea?.name?.toLowerCase() || '';

 if (areaName.includes('logística')) {
 return (
 <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2.5 animate-in fade-in duration-150">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-blue-700 dark:text-blue-400">
 PARTICULARIDADES DE EXPEDIÇÃO & FROTA
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono">
 LOGÍSTICA
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Frota / Placa</label>
 <input
 type="text"
 placeholder="Ex: Bitrem Volvo ABC-4812"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Rota / Destino</label>
 <input
 type="text"
 placeholder="Ex: Sumaré -> Pinda"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Manifesto MTR</label>
 <input
 type="text"
 placeholder="Ex: MTR-48210"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Volume Pesado (Ton)</label>
 <input
 type="text"
 placeholder="Ex: 32.4 Ton"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-blue-200 dark:border-blue-900 rounded-lg text-xs"
 />
 </div>
 </div>
 </div>
 );
 }

 if (areaName.includes('financeiro') || areaName.includes('comercial compras')) {
 return (
 <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2.5 animate-in fade-in duration-150">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
 PARTICULARIDADES DE TESOURARIA & CÂMBIO
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono">
 FINANCEIRO
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Valor Fechado (R$)</label>
 <input
 type="text"
 placeholder="Ex: R$ 1.450.000,00"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Trava Cambial / Hedge</label>
 <input
 type="text"
 placeholder="Ex: USD/BRL @ 5,4200"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs font-mono"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Banco Liquidante</label>
 <input
 type="text"
 placeholder="Ex: BTG Pactual / Santander"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Conciliação Bancária</label>
 <select className="w-full mt-0.5 px-2 py-1.5 bg-white dark:bg-[#0B120E] border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs">
 <option>100% Conciliado (Sem divergências)</option>
 <option>Pendente extrato D-1</option>
 </select>
 </div>
 </div>
 </div>
 );
 }

 if (areaName.includes('comercial vendas')) {
 return (
 <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 space-y-2.5 animate-in fade-in duration-150">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-purple-700 dark:text-purple-400">
 CARTEIRA DE VENDAS DCOPPER
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-mono">
 COMERCIAL
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Volume Faturado</label>
 <input
 type="text"
 placeholder="Ex: 48 Toneladas"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-purple-200 dark:border-purple-900 rounded-lg text-xs"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Preço Médio (R$/kg)</label>
 <input
 type="text"
 placeholder="Ex: R$ 56,80 / kg"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-purple-200 dark:border-purple-900 rounded-lg text-xs font-mono"
 />
 </div>
 </div>
 </div>
 );
 }

 if (areaName.includes('segurança')) {
 return (
 <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2.5 animate-in fade-in duration-150">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
  MONITORAMENTO & SEGURANÇA PATRIMONIAL
 </span>
 <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-mono">
 SEGURANÇA
 </span>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Câmeras Perimetrais</label>
 <select className="w-full mt-0.5 px-2 py-1.5 bg-white dark:bg-[#0B120E] border border-amber-200 dark:border-amber-900 rounded-lg text-xs">
 <option>100% Online (Sem pontos cegos)</option>
 <option>1 Câmera em calibração</option>
 </select>
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Ronda Noturna</label>
 <input
 type="text"
 placeholder="Ex: Concluída sem violação"
 className="w-full mt-0.5 px-2.5 py-1.5 bg-white dark:bg-[#0B120E] border border-amber-200 dark:border-amber-900 rounded-lg text-xs"
 />
 </div>
 </div>
 </div>
 );
 }

 return null;
 })()}

 {/* Justification Box with AI Voice Assistant Fast Assist */}
 <div className="space-y-1.5">
 <div className="flex items-center justify-between">
 <label className="block font-semibold text-[#5C6E62] dark:text-slate-400 text-xs">
 Relatório & Justificativa do Dia
 </label>
 <button
 type="button"
 onClick={handleVoiceQuickFill}
 disabled={isVoiceLoading}
 className="text-[10px] font-bold text-[#4D7C5D] dark:text-[#76B38B] flex items-center space-x-1 hover:underline cursor-pointer disabled:opacity-50"
 title="Preencher com síntese da IA"
 >
 <Sparkles className="w-3 h-3 text-amber-500" />
 <span>{isVoiceLoading ? 'Carregando...' : 'Preenchimento Rápido IA'}</span>
 </button>
 </div>

 <textarea
 value={justification}
 onChange={(e) => setJustification(e.target.value)}
 placeholder="Descreva o status das atividades, entregas concluídas ou justificativa de eventuais atrasos/ocorrências..."
 rows={3}
 className="w-full bg-[#F5F7F5] dark:bg-[#0B120E] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl p-3 text-xs text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-[#4D7C5D] transition-colors resize-none"
 />
 </div>

 {errorMessage && (
 <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
 {errorMessage}
 </p>
 )}

 {/* Action Buttons */}
 <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E2E8E3] dark:border-[#1E3125]">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 bg-[#F5F7F5] dark:bg-[#0B120E] hover:bg-[#E2E8E3] dark:hover:bg-[#1E3125] text-[#5C6E62] dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
 >
 {isSubmitting ? 'Salvando...' : 'Salvar Fechamento'}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 );
};
