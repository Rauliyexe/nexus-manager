'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { USER_ROLE_LABELS } from '@/lib/types/nexus';
import { HubOwnerDashboard } from '@/components/hub/HubOwnerDashboard';
import { HubEmployeeDashboard } from '@/components/hub/HubEmployeeDashboard';
import { DelegateTaskModal } from '@/components/modals/DelegateTaskModal';
import { OpenTicketModal } from '@/components/modals/OpenTicketModal';
import { DailyClosingModal } from '@/components/modals/DailyClosingModal';
import { IncomingTaskPopUpBanner } from '@/components/layout/IncomingTaskPopUpBanner';

export default function HubPage() {
  const { hubRoleView, setHubRoleView, currentUser } = useNexus();

  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Synchronize view dynamically based on currentUser.role
  React.useEffect(() => {
    if (currentUser.role === 'DONO') {
      setHubRoleView('OWNER');
    } else {
      setHubRoleView('EMPLOYEE');
    }
  }, [currentUser.id, currentUser.role, setHubRoleView]);

  return (
    <div className="min-h-full flex flex-col font-sans p-4 sm:p-6 pb-8 space-y-5 select-none">
      {/* Floating Pop-up Banner for Incoming Tasks */}
      <IncomingTaskPopUpBanner />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111D15] dark:text-slate-100 tracking-tight">
              Gestão Operacional de Demandas
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase">
              DEMO · OPERAÇÃO
            </span>
          </div>
          <p className="text-sm text-[#5E7567] dark:text-slate-400 mt-0.5">
            Acompanhamento de prazos, distribuição de carga e fechamento •{' '}
            <span className="font-bold text-[#1B3026] dark:text-[#76B38B]">
              {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
            </span>
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs font-semibold text-[#111D15] dark:text-slate-200 hover:border-[#1B3026] transition-colors shadow-2xs cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-[#2C6E49] dark:text-[#76B38B]" />
            <span>Mês Vigente (AGO/2026)</span>
            <ChevronDown className="w-3 h-3 text-[#5E7567]" />
          </button>
        </div>
      </div>

      {/* Render Selected Role Dashboard */}
      {hubRoleView === 'OWNER' ? (
        <HubOwnerDashboard />
      ) : (
        <HubEmployeeDashboard
          onOpenDelegateModal={() => setIsDelegateModalOpen(true)}
          onOpenTicketModal={() => setIsTicketModalOpen(true)}
        />
      )}

      {/* Institutional Demo Footnote */}
      <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#121D16]/40 border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-[11px] text-[#5E7567] dark:text-slate-400 font-medium">
        <span>Ambiente de Demonstração • Painel de comando operacional do Command Center</span>
        <span className="font-mono text-[10px] text-[#3B4F43] dark:text-[#76B38B] font-bold">COPPER GROUP COMMAND CENTER</span>
      </div>

      {/* Modals */}
      <DelegateTaskModal
        isOpen={isDelegateModalOpen}
        onClose={() => setIsDelegateModalOpen(false)}
      />

      <OpenTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      <DailyClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
      />
    </div>
  );
}
