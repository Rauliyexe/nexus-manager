'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  MessageSquare,
  Terminal,
  DollarSign,
  BarChart3,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

interface MobileBottomNavProps {
  onOpenClosingModal: () => void;
}

export function MobileBottomNav({ onOpenClosingModal }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { alerts, conversations } = useNexus();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  const navItems = [
    { label: 'Hub', href: '/hub', icon: Activity },
    { label: 'Áreas', href: '/areas', icon: Building2 },
    // Center Action Button (Handled separately)
    {
      label: 'Alertas',
      href: '/alerts',
      icon: AlertTriangle,
      badge: openAlertsCount > 0 ? openAlertsCount : null,
    },
    {
      label: 'Mais',
      isMenu: true,
      icon: Menu,
    },
  ];

  const moreMenuItems = [
    { label: 'Terminal Bloomberg', href: '/terminal', icon: Terminal, color: 'text-amber-400', badge: 'PRO' },
    { label: 'Dashboard Financeiro', href: '/financial', icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Conversas Internas', href: '/chat', icon: MessageSquare, color: 'text-sky-400', badge: conversations.length },
    { label: 'Relatórios Executivos', href: '/reports', icon: BarChart3, color: 'text-slate-300' },
    { label: 'Configurações', href: '/settings', icon: Settings, color: 'text-slate-400' },
  ];

  return (
    <>
      {/* Slide-up "Mais" Sheet on Mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 space-y-3 z-10 shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                  Módulos & Ferramentas Nexus
                </h3>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={`p-3 rounded-xl border flex flex-col items-start justify-between space-y-2 transition-colors ${
                      isActive
                        ? 'bg-slate-800 border-slate-600 font-bold'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-200">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar */}
      <nav
        aria-label="Navegação Principal Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden px-2 py-1.5 flex items-center justify-around select-none safe-area-pb"
      >
        {/* Hub Tab */}
        <Link
          href="/hub"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            pathname === '/hub' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>Hub</span>
        </Link>

        {/* Áreas Tab */}
        <Link
          href="/areas"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            pathname.startsWith('/areas') ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 mb-0.5" />
          <span>Áreas</span>
        </Link>

        {/* Center Prominent Daily Closing Fast-Action Button */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-4">
          <button
            onClick={onOpenClosingModal}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/80 ring-4 ring-slate-950 transition-transform active:scale-95 cursor-pointer"
            title="Registrar Fechamento Diário"
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>
          <span className="text-[9px] font-mono text-emerald-400 font-bold mt-1 tracking-tight">
            Fechamento
          </span>
        </div>

        {/* Alertas Tab */}
        <Link
          href="/alerts"
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors relative ${
            pathname === '/alerts' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <AlertTriangle className="w-4 h-4 mb-0.5" />
            {openAlertsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-rose-500 text-white text-[8px] font-mono rounded-full font-bold">
                {openAlertsCount}
              </span>
            )}
          </div>
          <span>Alertas</span>
        </Link>

        {/* Mais Menu Tab */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            showMoreMenu ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
}
