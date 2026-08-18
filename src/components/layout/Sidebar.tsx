'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  Ticket,
  MessageSquare,
  FolderOpen,
  Settings,
  DollarSign,
  Terminal,
  PlayCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { USER_ROLE_LABELS } from '@/lib/types/nexus';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, hasFinancialAccess } = useNexus();

  const isFinAuthorized = hasFinancialAccess(currentUser);
  const isTIAuthorized =
    currentUser.role === 'DONO' ||
    currentUser.role === 'DIRETOR_TI' ||
    currentUser.role === 'EQUIPE_TI';

  const navGroups = [
    {
      group: 'EXECUTIVO',
      items: [
        { label: 'Indicadores', href: '/dashboard', icon: BarChart3 },
        { label: 'Gestão Operacional', href: '/hub', icon: LayoutDashboard },
        { label: 'Relatórios', href: '/reports', icon: FileText },
      ],
    },
    {
      group: 'OPERAÇÕES',
      items: [
        { label: 'Projetos & Setores', href: '/areas', icon: Building2 },
        { label: 'Documentos & Rituais', href: '/obligations', icon: FolderOpen },
        { label: 'Chamados & Suporte', href: '/tasks', icon: Ticket },
        { label: 'Alertas & Riscos', href: '/alerts', icon: AlertTriangle },
      ],
    },
    {
      group: 'COMUNICAÇÃO',
      items: [
        { label: 'Chat Corporativo', href: '/chat', icon: MessageSquare },
      ],
    },
    ...(isFinAuthorized
      ? [
          {
            group: 'INTELIGÊNCIA & MERCADO',
            items: [
              { label: 'Telemetria Financeira', href: '/financial', icon: DollarSign },
              { label: 'Terminal Bloomberg', href: '/terminal', icon: Terminal },
            ],
          },
        ]
      : []),
    {
      group: 'GOVERNANÇA & TI',
      items: [
        ...(isTIAuthorized ? [{ label: 'Painel de TI', href: '/ti-console', icon: ShieldCheck }] : []),
        { label: 'Simulador Admin', href: '/admin/simulacao', icon: PlayCircle },
        { label: 'Configurações', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex w-60 bg-[#1B3026] text-white flex-col justify-between select-none shrink-0 h-full overflow-y-auto transition-all duration-200 border-r border-[#274437]">
      {/* Brand Header */}
      <div>
        <div className="px-5 pt-6 pb-4 flex items-center space-x-3 border-b border-[#274437]/60">
          {/* Copper Group Logo Mark */}
          <div className="w-8 h-8 rounded-xl border-2 border-[#76B38B]/60 flex items-center justify-center relative shrink-0 bg-[#16281F]">
            <span className="w-3.5 h-3.5 border-2 border-[#76B38B] rounded-sm block" />
            <span className="w-2 h-2 rounded-full bg-[#76B38B] absolute -top-1 -right-1 border-2 border-[#1B3026]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline space-x-1">
              <span className="text-sm font-black tracking-widest text-white leading-none">COPPER</span>
              <span className="text-sm font-light tracking-wider text-[#76B38B] leading-none">GROUP</span>
            </div>
            <p className="text-[9px] text-[#6F9580] tracking-tight mt-1 font-medium truncate">
              Command Center Executivo
            </p>
          </div>
        </div>

        {/* Semantic Navigation Groups */}
        <nav className="px-3 py-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <span className="text-[9px] font-bold tracking-wider text-[#6F9580] uppercase px-3 block font-mono">
                {group.group}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/hub' && item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-[#2A4A3C] text-white font-semibold shadow-2xs'
                          : 'text-[#A5C9B3] hover:text-white hover:bg-[#233A2D]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#76B38B]' : 'text-[#6F9580] group-hover:text-[#A5C9B3]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Card at Bottom */}
      <div className="p-3 border-t border-[#274437] bg-[#16281F]">
        <Link
          href="/settings"
          className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
            pathname === '/settings'
              ? 'bg-[#2A4A3C] text-white'
              : 'text-[#B3C5BA] hover:text-white hover:bg-[#233A2D]'
          }`}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <UserAvatar name={currentUser.name} size="sm" className="bg-[#1B3026] text-white font-bold" />
            <div className="truncate min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-[#6F9580] truncate leading-tight font-mono">
                {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
              </p>
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-[#6F9580] shrink-0 ml-1" />
        </Link>
      </div>
    </aside>
  );
}

export { Sidebar };
