'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Command,
  LayoutDashboard,
  CheckSquare,
  Ticket,
  Building2,
  DollarSign,
  MessageSquare,
  Bell,
  Settings,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  LogOut,
  ArrowRight,
  ChevronRight,
  Laptop,
  Wrench,
  ShieldAlert,
  PackageCheck,
  Flame,
  Truck,
  Users,
  Terminal,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAgentDrawer?: () => void;
  onOpenClosingModal?: () => void;
  onOpenTaskModal?: () => void;
}

interface SpotlightItem {
  id: string;
  category: 'Navegação' | 'Áreas & Setores' | 'Ações Rápidas' | 'Tarefas & Chamados';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  shortcut?: string;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  onOpenAgentDrawer,
  onOpenClosingModal,
  onOpenTaskModal,
}) => {
  const router = useRouter();
  const {
    tasks,
    tickets,
    areas,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    logout,
    playSound,
  } = useNexus();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Foco automático ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Lista de Itens do Spotlight
  const buildItems = (): SpotlightItem[] => {
    const items: SpotlightItem[] = [
      // ── Ações Rápidas de Destaque ──
      {
        id: 'action-valkyra',
        category: 'Ações Rápidas',
        title: 'Abrir Valkyra AI Copilot',
        subtitle: 'Comandos operacionais por voz, raciocínio e execução',
        icon: Sparkles,
        shortcut: 'Ctrl + I',
        badge: 'IA 2.0',
        badgeColor: 'bg-emerald-600 text-white',
        action: () => {
          onClose();
          onOpenAgentDrawer?.();
        },
      },
      {
        id: 'action-closing',
        category: 'Ações Rápidas',
        title: 'Registrar Fechamento Diário da Área',
        subtitle: 'Enviar status OK, Atenção ou Crítico com relato por voz',
        icon: CheckSquare,
        shortcut: 'F',
        badge: 'Ritual',
        badgeColor: 'bg-amber-600 text-white',
        action: () => {
          onClose();
          onOpenClosingModal?.();
        },
      },
      {
        id: 'action-new-task',
        category: 'Ações Rápidas',
        title: 'Criar e Delegar Nova Demanda',
        subtitle: 'Adicionar tarefa com prazo e responsável no Hub',
        icon: CheckSquare,
        shortcut: 'N',
        action: () => {
          onClose();
          if (onOpenTaskModal) {
            onOpenTaskModal();
          } else {
            router.push('/hub');
          }
        },
      },
      {
        id: 'action-toggle-theme',
        category: 'Ações Rápidas',
        title: `Alternar para Modo ${theme === 'dark' ? 'Claro' : 'Escuro'}`,
        subtitle: 'Mudar aparência visual do sistema',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => {
          toggleTheme();
          onClose();
        },
      },
      {
        id: 'action-toggle-sound',
        category: 'Ações Rápidas',
        title: soundEnabled ? 'Desativar Sons do Sistema' : 'Ativar Sons do Sistema',
        subtitle: 'Efeitos sonoros e alertas corporativos',
        icon: soundEnabled ? VolumeX : Volume2,
        action: () => {
          toggleSound();
          onClose();
        },
      },

      // ── Páginas & Navegação Principal ──
      {
        id: 'nav-dashboard',
        category: 'Navegação',
        title: 'Dashboard & Indicadores',
        subtitle: 'Visão executiva, matriz de risco e compliance',
        icon: LayoutDashboard,
        action: () => {
          router.push('/dashboard');
          onClose();
        },
      },
      {
        id: 'nav-hub',
        category: 'Navegação',
        title: 'Hub de Demandas & Tarefas',
        subtitle: 'Quadro operacional de tarefas delegadas e rotinas',
        icon: CheckSquare,
        action: () => {
          router.push('/hub');
          onClose();
        },
      },
      {
        id: 'nav-tasks',
        category: 'Navegação',
        title: 'Central de Chamados & Suporte',
        subtitle: 'Tickets de TI, manutenção industrial e infraestrutura',
        icon: Ticket,
        action: () => {
          router.push('/tasks');
          onClose();
        },
      },
      {
        id: 'nav-areas',
        category: 'Navegação',
        title: 'Projetos & Setores Operacionais',
        subtitle: 'Acompanhamento detalhado de todas as 5 áreas',
        icon: Building2,
        action: () => {
          router.push('/areas');
          onClose();
        },
      },
      {
        id: 'nav-financial',
        category: 'Navegação',
        title: 'Financeiro & Cotação LME Cobre',
        subtitle: 'Telemetria em tempo real, saldo de caixa e margens',
        icon: DollarSign,
        action: () => {
          router.push('/financial');
          onClose();
        },
      },
      {
        id: 'nav-chat',
        category: 'Navegação',
        title: 'Chat & Canais Corporativos',
        subtitle: 'Comunicação criptografada interna e threads',
        icon: MessageSquare,
        action: () => {
          router.push('/chat');
          onClose();
        },
      },
      {
        id: 'nav-alerts',
        category: 'Navegação',
        title: 'Central de Alertas & Incidentes',
        subtitle: 'Notificações urgentes e pendências críticas',
        icon: Bell,
        action: () => {
          router.push('/alerts');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        category: 'Navegação',
        title: 'Configurações & Perfil',
        subtitle: 'Gestão de acessos, chaves de IA e credenciais',
        icon: Settings,
        action: () => {
          router.push('/settings');
          onClose();
        },
      },
    ];

    // ── Áreas e Setores da Fábrica ──
    areas.forEach((area) => {
      let areaIcon = Building2;
      if (area.name.toLowerCase().includes('compras')) areaIcon = PackageCheck;
      if (area.name.toLowerCase().includes('fundição')) areaIcon = Flame;
      if (area.name.toLowerCase().includes('logística')) areaIcon = Truck;
      if (area.name.toLowerCase().includes('ti')) areaIcon = Laptop;
      if (area.name.toLowerCase().includes('rh')) areaIcon = Users;

      items.push({
        id: `area-${area.id}`,
        category: 'Áreas & Setores',
        title: area.name,
        subtitle: `Gestor: ${area.manager?.name || 'Não atribuído'} · Status: ${area.currentStatus}`,
        icon: areaIcon,
        badge: area.currentStatus === 'GREEN' ? 'OK' : area.currentStatus === 'YELLOW' ? 'Atenção' : 'Crítico',
        badgeColor:
          area.currentStatus === 'GREEN'
            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            : area.currentStatus === 'YELLOW'
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
        action: () => {
          router.push(`/areas/${area.id}`);
          onClose();
        },
      });
    });

    // ── Chamados Recentes ──
    tickets.slice(0, 5).forEach((tck) => {
      items.push({
        id: `tck-${tck.id}`,
        category: 'Tarefas & Chamados',
        title: `[${tck.code}] ${tck.title}`,
        subtitle: `Área: ${tck.area_name} · Prioridade: ${tck.priority}`,
        icon: Ticket,
        badge: tck.status,
        badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
        action: () => {
          router.push('/tasks');
          onClose();
        },
      });
    });

    // ── Tarefas Recentes ──
    tasks.slice(0, 6).forEach((task) => {
      items.push({
        id: `task-${task.id}`,
        category: 'Tarefas & Chamados',
        title: `[${task.code}] ${task.title}`,
        subtitle: `Prazo: ${task.due_date} · Status: ${task.status}`,
        icon: CheckSquare,
        badge: task.priority,
        badgeColor:
          task.priority === 'CRITICAL' || task.priority === 'HIGH'
            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
            : 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
        action: () => {
          router.push('/hub');
          onClose();
        },
      });
    });

    return items;
  };

  const allItems = buildItems();

  // Filtragem dinâmica pela busca
  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Agrupamento por categoria
  const groupedCategories = ['Ações Rápidas', 'Navegação', 'Áreas & Setores', 'Tarefas & Chamados'] as const;

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        playSound('BUTTON_CLICK');
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll automático do item selecionado
  useEffect(() => {
    const selectedEl = document.getElementById(`spotlight-item-${selectedIndex}`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:pt-20 font-sans animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-3xl shadow-2xl overflow-hidden card-shadow animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* ── Search Input Header ── */}
        <div className="p-4 sm:p-5 border-b border-[#D5E0D7] dark:border-[#1E3125] flex items-center space-x-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E]/80">
          <div className="w-9 h-9 rounded-2xl bg-[#1B3026] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Search className="w-4 h-4 text-emerald-400" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="O que você deseja acessar ou executar? (Ex: 'TI', 'Valkyra', 'Fechamento', 'Compras')..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#111D15] dark:text-slate-100 placeholder-[#5E7567] focus:outline-none font-medium"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1 font-mono text-[10px] text-[#5E7567] bg-[#EEF2EE] dark:bg-[#1C2E24] px-2 py-1 rounded-lg border border-[#D5E0D7] dark:border-[#1E3125]">
            <span>ESC</span>
          </div>
        </div>

        {/* ── Results Stream ── */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[60vh]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#5E7567] mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#111D15] dark:text-slate-200">Nenhum resultado encontrado</p>
              <p className="text-xs text-[#5E7567] dark:text-slate-400">
                Tente buscar por termos como <em>"Valkyra"</em>, <em>"Chamado"</em>, <em>"Fechamento"</em> ou <em>"TI"</em>.
              </p>
            </div>
          ) : (
            groupedCategories.map((cat) => {
              const catItems = filteredItems.filter((it) => it.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5E7567] dark:text-slate-400">
                    {cat}
                  </div>

                  <div className="space-y-1">
                    {catItems.map((item) => {
                      const itemIndex = filteredItems.indexOf(item);
                      const isSelected = itemIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          id={`spotlight-item-${itemIndex}`}
                          key={item.id}
                          onClick={() => {
                            playSound('BUTTON_CLICK');
                            item.action();
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1B3026] text-white shadow-xs'
                              : 'hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] text-[#111D15] dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#EEF2EE] dark:bg-[#0B120E] text-[#1B3026] dark:text-[#76B38B]'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-xs truncate">{item.title}</span>
                                {item.badge && (
                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
                                      item.badgeColor || 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p
                                  className={`text-[11px] truncate mt-0.5 ${
                                    isSelected ? 'text-emerald-200' : 'text-[#5E7567] dark:text-slate-400'
                                  }`}
                                >
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {item.shortcut && (
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                  isSelected
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-[#EEF2EE] dark:bg-[#121D16] border-[#D5E0D7] dark:border-[#1E3125] text-[#5E7567]'
                                }`}
                              >
                                {item.shortcut}
                              </span>
                            )}
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                isSelected ? 'text-white translate-x-0.5' : 'text-transparent'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer Navigation Tips ── */}
        <div className="p-3 bg-[#EEF2EE]/60 dark:bg-[#0B120E] border-t border-[#D5E0D7] dark:border-[#1E3125] px-4 flex items-center justify-between text-[11px] text-[#5E7567] font-medium">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px]">↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1C2E24] border border-[#D5E0D7] dark:border-[#1E3125] font-mono text-[9px] flex items-center">
                <CornerDownLeft className="w-2.5 h-2.5 mr-0.5" /> Enter
              </kbd>
              <span>Selecionar</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 font-mono text-[10px]">
            <span>Yggdron Spotlight</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
