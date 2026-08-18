'use client';

import React, { useState } from 'react';
import { X, Check, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
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

  if (!isOpen) return null;

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

            {/* Justification Textarea */}
            {(selectedStatus === 'YELLOW' || selectedStatus === 'RED') && (
              <div className="space-y-1.5 animate-in fade-in duration-150">
                <label className="block font-semibold text-rose-600 dark:text-rose-400 text-xs">
                  Justificativa Obrigatória *
                </label>
                <textarea
                  required
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explique o motivo do desvio operacional e as medidas em curso..."
                  className="w-full bg-[#F5F7F5] dark:bg-[#0B120E] border border-rose-300 dark:border-rose-900 rounded-xl p-3 text-xs text-[#1A281E] dark:text-slate-100 placeholder-[#8FA595] focus:outline-none focus:border-rose-500 resize-none transition-colors"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F0F4F1] dark:bg-[#17261D] hover:bg-[#E2E8E3] dark:hover:bg-[#1C2E24] text-[#5C6E62] dark:text-slate-400 text-xs font-medium cursor-pointer transition-colors border border-[#E2E8E3] dark:border-[#1E3125]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#1B3026] hover:bg-[#2A4A3C] disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Fechamento</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
