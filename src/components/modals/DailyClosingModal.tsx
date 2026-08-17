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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-xs font-sans z-10 animate-in slide-in-from-bottom duration-250 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="font-bold text-slate-100 font-mono uppercase text-xs sm:text-sm flex items-center space-x-2">
              <span>Fechamento do Dia</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-400">
              Atualize o status operacional da sua área hoje.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono">{successMessage}</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
            {/* Area Selector */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1 text-xs">Área Operacional</label>
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-sans"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.manager?.name || 'Sem gestor'})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select Big Tactile Buttons with Symbols */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5 text-xs">Status do Dia</label>
              <div className="grid grid-cols-3 gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('GREEN')}
                  className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    selectedStatus === 'GREEN'
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-md ring-2 ring-emerald-500/50 font-bold scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs">OK (Normal)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('YELLOW')}
                  className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    selectedStatus === 'YELLOW'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md ring-2 ring-amber-500/50 font-bold scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-xs">ATENÇÃO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus('RED')}
                  className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    selectedStatus === 'RED'
                      ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-md ring-2 ring-rose-500/50 font-bold scale-102'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-xs">CRÍTICO</span>
                </button>
              </div>
            </div>

            {/* Justification Field */}
            {(selectedStatus === 'YELLOW' || selectedStatus === 'RED') && (
              <div className="animate-in fade-in duration-150">
                <label className="block font-semibold text-slate-300 mb-1 text-xs">
                  Justificativa / Ocorrência <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explique o motivo do alerta ou parada operacional..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800 safe-area-pb">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Registrando...' : 'Confirmar Fechamento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
