'use client';

import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

export const IncomingTaskPopUpBanner: React.FC = () => {
  const {
    incomingTaskNotification,
    dismissIncomingTaskNotification,
    setActivePopUpTask,
  } = useNexus();

  if (!incomingTaskNotification) return null;

  const { task } = incomingTaskNotification;

  const handleOpenTask = () => {
    setActivePopUpTask(task);
    dismissIncomingTaskNotification();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300 font-sans">
      <div className="bg-white/95 dark:bg-[#121D16]/95 border border-[#4D7C5D]/60 rounded-2xl shadow-2xl p-4 backdrop-blur-lg space-y-3 ring-1 ring-[#4D7C5D]/20 card-shadow">
        {/* Banner Top */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D7C5D] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4D7C5D]" />
            </span>
            <span className="text-[10px] font-bold text-[#4D7C5D] dark:text-[#76B38B] uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nova Tarefa Delegada!</span>
            </span>
          </div>

          <button
            onClick={dismissIncomingTaskNotification}
            className="text-[#8FA595] hover:text-[#1A281E] dark:hover:text-slate-200 p-1 rounded-lg hover:bg-[#E2E8E3] dark:hover:bg-[#1E3125] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Task Summary Body */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#1A281E] dark:text-slate-100 line-clamp-1">
            {task.title}
          </h4>
          <p className="text-[11px] text-[#5C6E62] dark:text-slate-300 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Info badges */}
        <div className="flex items-center justify-between text-[10px] text-[#5C6E62] dark:text-slate-400 pt-2 border-t border-[#E2E8E3] dark:border-[#1E3125]">
          <span className="truncate pr-2">
            De: <strong className="text-[#1A281E] dark:text-slate-200">{task.delegated_by_name}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold shrink-0">
            {task.priority === 'CRITICAL' ? 'CRÍTICA' : task.priority === 'HIGH' ? 'ALTA' : 'MÉDIA'}
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-1 flex items-center space-x-2">
          <button
            onClick={handleOpenTask}
            className="w-full py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <span>Abrir Ficha da Tarefa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
