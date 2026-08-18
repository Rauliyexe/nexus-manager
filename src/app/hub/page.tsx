'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
} from 'lucide-react';
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
    <div className="min-h-full flex flex-col font-sans p-4 sm:p-6 space-y-5 select-none">
      {/* Floating Pop-up Banner for Incoming Tasks */}
      <IncomingTaskPopUpBanner />

      {/* Page Header — matches reference image exactly */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A281E] dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#5C6E62] dark:text-slate-400 mt-0.5">
            Visão geral do desempenho e indicadores •{' '}
            <span className="font-semibold text-[#2C4A36] dark:text-[#76B38B]">
              {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
            </span>
          </p>
        </div>

        {/* Este mês filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] rounded-xl text-xs font-medium text-[#1A281E] dark:text-slate-200 hover:border-[#4D7C5D] transition-colors shadow-sm cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-[#4D7C5D]" />
            <span>Este mês</span>
            <ChevronDown className="w-3 h-3 text-[#5C6E62]" />
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
