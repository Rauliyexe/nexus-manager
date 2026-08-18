'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Sun, Moon, ChevronRight, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { USER_ROLE_LABELS } from '@/lib/types/nexus';

interface TopbarProps {
  onOpenClosingModal: () => void;
  onToggleNotificationDrawer: () => void;
  onToggleAgentDrawer?: () => void;
}

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Indicadores', sub: 'Visão Geral & Matriz de Risco' },
  '/hub': { title: 'Tarefas', sub: 'Gestão Operacional de Demandas' },
  '/areas': { title: 'Projetos', sub: 'Workspaces & Acompanhamento de Setores' },
  '/obligations': { title: 'Documentos', sub: 'Controle de Obrigações & Rituais' },
  '/alerts': { title: 'Alertas', sub: 'Central de Notificações & Incidentes' },
  '/financial': { title: 'Financeiro', sub: 'Telemetria de Mercado & Margens' },
  '/chat': { title: 'Chat', sub: 'Comunicação Corporativa Criptografada' },
  '/tasks': { title: 'Chamados', sub: 'Central de Suporte & Incidentes' },
  '/ti-console': { title: 'Painel de TI', sub: 'Governança & Aprovações de Acesso' },
  '/admin/simulacao': { title: 'Simulador', sub: 'Eventos de Demonstração' },
  '/settings': { title: 'Configurações', sub: 'Preferências do Sistema & Perfil' },
};

export const Topbar: React.FC<TopbarProps> = ({
  onOpenClosingModal,
  onToggleNotificationDrawer,
  onToggleAgentDrawer,
}) => {
  const pathname = usePathname();
  const { currentUser, profiles, switchUser, notifications, theme, toggleTheme, soundEnabled, toggleSound } = useNexus();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const areaMatch = pathname?.match(/^\/areas\/(.+)$/);
  let pageMeta = PAGE_TITLES[pathname ?? ''] ?? { title: 'Dashboard', sub: 'Copper Group' };
  if (areaMatch) pageMeta = { title: 'Projetos', sub: `Área: ${areaMatch[1]}` };

  return (
    <header className="h-16 bg-white dark:bg-[#0B120E] border-b border-[#D5E0D7] dark:border-[#1E3125] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none font-sans transition-colors duration-150 shadow-xs">
      {/* Left: Page title + breadcrumb */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Mobile: Copper Group brand mark */}
        <div className="md:hidden flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1B3026] flex items-center justify-center shrink-0">
            <span className="w-3 h-3 border-2 border-[#76B38B] rounded-sm block" />
          </div>
          <span className="text-sm font-bold text-[#111D15] dark:text-white tracking-tight">
            {pageMeta.title}
          </span>
        </div>

        {/* Desktop: page title + breadcrumb + demo badge */}
        <div className="hidden md:block min-w-0">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-[#1B3026] dark:text-[#76B38B]">Copper Group</span>
            <ChevronRight className="w-3 h-3 text-[#5E7567]" />
            <span className="font-bold text-[#111D15] dark:text-slate-100">{pageMeta.title}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#3B4F43] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] font-bold tracking-wider uppercase ml-1">
              DEMO · AMBIENTE DE DEMONSTRAÇÃO
            </span>
          </div>
          <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5 hidden lg:block truncate max-w-sm">
            {pageMeta.sub}
          </p>
        </div>
      </div>

      {/* Right: Search + Theme + Notifications + User */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Personal AI Copilot Button */}
        {onToggleAgentDrawer && (
          <button
            onClick={onToggleAgentDrawer}
            className="px-3 py-1.5 rounded-xl bg-[#EEF2EE] dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] hover:border-[#1B3026] dark:hover:border-[#4D7C5D] transition-all cursor-pointer flex items-center space-x-1.5 font-bold text-xs shadow-2xs group"
            title="Abrir Personal AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2C6E49] dark:text-[#76B38B] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">AI Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2C6E49] dark:bg-[#76B38B] animate-pulse" />
          </button>
        )}

        {/* Search */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-36 lg:w-48 pl-8 pr-3 py-1.5 bg-[#EEF2EE] dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs text-[#111D15] dark:text-slate-200 placeholder-[#5E7567] focus:outline-none focus:border-[#1B3026] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-[#5E7567] absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Sound Toggle (Mute/Unmute) */}
        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-[#EEF2EE] dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] text-[#3B4F43] dark:text-slate-300 hover:border-[#1B3026] dark:hover:border-[#4D7C5D] transition-all cursor-pointer"
          title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Sons do Sistema'}
          aria-label="Controle de Áudio"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[#1B3026] dark:text-[#76B38B]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[#5E7567]" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[#EEF2EE] dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] text-[#3B4F43] dark:text-slate-300 hover:border-[#1B3026] dark:hover:border-[#4D7C5D] transition-all cursor-pointer"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          aria-label="Alternar Tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#1B3026]" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={onToggleNotificationDrawer}
          className="relative p-2 rounded-xl bg-[#EEF2EE] dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] text-[#3B4F43] dark:text-slate-300 hover:border-[#1B3026] dark:hover:border-[#4D7C5D] transition-colors cursor-pointer"
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4 text-[#1B3026] dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2C6E49] dark:bg-[#76B38B] rounded-full border-2 border-white dark:border-[#0B120E]" />
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 bg-[#EEF2EE] dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs hover:border-[#1B3026] dark:hover:border-[#4D7C5D] transition-colors cursor-pointer"
          >
            <UserAvatar name={currentUser.name} size="sm" className="bg-[#1B3026] text-white font-bold" />
            <div className="text-left hidden sm:block">
              <p className="font-bold text-[#111D15] dark:text-slate-100 text-xs leading-none">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-[#5E7567] dark:text-slate-400 font-medium mt-0.5">
                {USER_ROLE_LABELS[currentUser.role] || currentUser.role}
              </p>
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 card-shadow">
              <div className="p-2 border-b border-[#D5E0D7] dark:border-[#1E3125] mb-1">
                <p className="font-bold text-xs text-[#111D15] dark:text-white">{currentUser.name}</p>
                <p className="text-[10px] text-[#5E7567] dark:text-slate-400">{currentUser.email}</p>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5">
                <span className="text-[9px] font-bold text-[#5E7567] uppercase px-2 py-1 block">
                  Simular outro perfil:
                </span>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchUser(p.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      p.id === currentUser.id
                        ? 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] font-bold'
                        : 'text-[#3B4F43] dark:text-slate-300 hover:bg-[#EEF2EE] dark:hover:bg-[#17261D]'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[9px] text-[#5E7567] dark:text-slate-400 font-mono shrink-0 ml-1">
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
