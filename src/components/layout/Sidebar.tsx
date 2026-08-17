'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  Building2,
  CheckSquare,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  PlayCircle,
  Settings,
  DollarSign,
  Terminal,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

export default function Sidebar() {
  const pathname = usePathname();
  const { alerts, conversations, currentUser } = useNexus();

  const openAlertsCount = alerts.filter((a) => a.status === 'OPEN').length;

  const sections = [
    {
      title: 'OPERACIONAL',
      items: [
        {
          label: 'Central de Comando',
          href: '/hub',
          icon: Activity,
          badge: 'HUB',
          badgeStyle: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
        },
        { label: 'Painel Executivo', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Áreas Operacionais', href: '/areas', icon: Building2 },
        { label: 'Obrigações', href: '/obligations', icon: CheckSquare },
        {
          label: 'Alertas',
          href: '/alerts',
          icon: AlertTriangle,
          badge: openAlertsCount > 0 ? openAlertsCount : null,
          badgeStyle: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        },
        {
          label: 'Conversas',
          href: '/chat',
          icon: MessageSquare,
          badge: conversations.length,
          badgeStyle: 'bg-slate-800 text-slate-400 border border-slate-700',
        },
      ],
    },
    {
      title: 'ANALÍTICO & FINANÇAS',
      items: [
        {
          label: 'Dashboard Financeiro',
          href: '/financial',
          icon: DollarSign,
          badge: 'ADM',
          badgeStyle: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        },
        {
          label: 'Terminal Bloomberg',
          href: '/terminal',
          icon: Terminal,
          badge: 'PRO',
          badgeStyle: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        },
        { label: 'Relatórios Executivos', href: '/reports', icon: BarChart3 },
        {
          label: 'Simulador Admin',
          href: '/admin/simulacao',
          icon: PlayCircle,
          badge: 'SIM',
          badgeStyle: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex w-56 bg-slate-900 border-r border-slate-800 flex-col justify-between select-none font-sans shrink-0">
      <div>
        {/* Brand Header */}
        <div className="px-4 py-3.5 border-b border-slate-800 flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px] font-bold flex items-center justify-center tracking-tighter">
            NX
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono">
              NEXUS
            </h1>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
              OPERATIONS V1
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-2 space-y-4">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-slate-100 border-l-2 border-slate-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive ? 'text-slate-100' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-mono rounded font-medium ${item.badgeStyle}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer User Profile & Settings */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/40">
        <Link
          href="/settings"
          className={`flex items-center justify-between p-2 rounded transition-colors ${
            pathname === '/settings'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <UserAvatar name={currentUser.name} size="sm" />
            <div className="truncate">
              <p className="text-[11px] font-semibold text-slate-200 truncate">
                {currentUser.name}
              </p>
              <p className="text-[9px] font-mono text-slate-500 truncate uppercase">
                {currentUser.role}
              </p>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
        </Link>
      </div>
    </aside>
  );
}
export { Sidebar };
