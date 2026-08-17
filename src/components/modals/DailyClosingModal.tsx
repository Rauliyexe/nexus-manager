'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
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
        'Status registrado. Seu gestor e os responsáveis foram notificados.'
      );

      setTimeout(() => {
        setSuccessMessage('');
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage('Erro ao registrar fechamento.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded w-full max-w-md shadow-xl overflow-hidden text-xs font-sans">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="font-bold text-slate-100 font-mono uppercase text-xs">
              Fechamento do Dia
            </h2>
            <p className="text-[11px] text-slate-400">
              Registre o status operacional da sua área hoje.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-9 h-9 bg-slate-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-slate-700">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-slate-100 font-mono">{successMessage}</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Area Selector */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Área Operacional</label>
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Gestor: {a.manager?.name || 'Sem gestor'})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select Buttons */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Status Operacional</label>
              <div className="grid grid-cols-3 gap-2 font-mono">
                {[
                  { id: 'GREEN', label: 'OK', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                  { id: 'YELLOW', label: 'ATENÇÃO', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
                  { id: 'RED', label: 'CRÍTICO', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedStatus(item.id as DailyStatusType)}
                    className={`py-2 px-2 rounded border text-xs font-bold transition-all ${
                      selectedStatus === item.id
                        ? `${item.color} ring-1 ring-slate-400`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Justification Field */}
            {(selectedStatus === 'YELLOW' || selectedStatus === 'RED') && (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Descreva brevemente a situação <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Informe o motivo da atenção ou ocorrência crítica..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-sans"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-2 bg-slate-950 border border-rose-500/40 rounded text-rose-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded border border-slate-700 text-xs"
              >
                {isSubmitting ? 'Registrando...' : 'Enviar fechamento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
