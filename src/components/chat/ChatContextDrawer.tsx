'use client';

import React from 'react';
import {
  X,
  Building2,
  CheckSquare,
  FileText,
  Users,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Conversation, Message } from '@/lib/types/nexus';
import { useNexus } from '@/lib/store/nexusContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface ChatContextDrawerProps {
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
  onOpenDelegateTask: () => void;
}

export const ChatContextDrawer: React.FC<ChatContextDrawerProps> = ({
  conversation,
  messages,
  onClose,
  onOpenDelegateTask,
}) => {
  const { areas, tasks, profiles } = useNexus();

  const area = conversation.area_id
    ? areas.find((a) => a.id === conversation.area_id)
    : undefined;

  // Filter tasks belonging to this area
  const areaTasks = area
    ? tasks.filter((t) => t.area_id === area.id)
    : [];

  // Extract all attachments from messages
  const allAttachments = messages
    .flatMap((m) => m.attachments || [])
    .filter(Boolean);

  return (
    <div className="w-80 sm:w-96 border-l border-[#D5E0D7] dark:border-[#1E3125] bg-white dark:bg-[#121D16] flex flex-col h-full z-30 card-shadow select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-[#D5E0D7] dark:border-[#1E3125] bg-[#EEF2EE]/60 dark:bg-[#0B120E] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#1B3026] text-white">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#111D15] dark:text-slate-100">
              Contexto Empresarial
            </h3>
            <p className="text-[10px] text-[#5E7567] dark:text-slate-400 font-medium">
              Dados vinculados em tempo real
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white rounded-lg hover:bg-[#D5E0D7] dark:hover:bg-[#1C2E24] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Project / Area Overview */}
        {area ? (
          <div className="p-4 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl space-y-3 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5E7567] dark:text-slate-400">
                Área / Projeto Nexus
              </span>
              <StatusIndicator status={area.currentStatus!} size="sm" />
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#111D15] dark:text-slate-100">
                {area.name}
              </h4>
              <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
                {area.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between text-xs">
              <span className="text-[#5E7567]">Gestor:</span>
              <strong className="text-[#111D15] dark:text-slate-200 font-bold">
                {area.manager?.name || 'Não atribuído'}
              </strong>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[#5E7567]">Rituais Ativos:</span>
              <span className="font-mono font-bold text-[#111D15] dark:text-slate-300">
                {area.obligationsCount} obrigações
              </span>
            </div>

            <Link
              href={`/areas/${area.id}`}
              className="mt-2 w-full py-2 bg-white dark:bg-[#121D16] hover:bg-[#EEF2EE] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors card-shadow"
            >
              <span>Abrir Workspace do Projeto</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-3.5 bg-[#EEF2EE]/40 dark:bg-[#0B120E] border border-[#D5E0D7] dark:border-[#1E3125] rounded-2xl text-center text-xs text-[#5E7567]">
            Conversa corporativa direta / Comitê
          </div>
        )}

        {/* Tasks Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-[#111D15] dark:text-slate-100 uppercase tracking-wide flex items-center space-x-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
              <span>Tarefas Vinculadas ({areaTasks.length})</span>
            </h4>

            <button
              onClick={onOpenDelegateTask}
              className="text-[11px] font-bold text-[#1B3026] dark:text-[#76B38B] hover:underline cursor-pointer"
            >
              + Nova Tarefa
            </button>
          </div>

          {areaTasks.length === 0 ? (
            <p className="text-xs text-[#5E7567] italic p-3 bg-[#EEF2EE]/30 rounded-xl border border-dashed border-[#D5E0D7]">
              Nenhuma tarefa aberta para este contexto.
            </p>
          ) : (
            <div className="space-y-2">
              {areaTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl card-shadow space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#5E7567] font-bold">{t.code}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      t.status === 'COMPLETED' ? 'bg-[#EEF2EE] text-[#2C6E49]' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[#111D15] dark:text-slate-100 truncate">{t.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attachments Section */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-xs text-[#111D15] dark:text-slate-100 uppercase tracking-wide flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
            <span>Arquivos Trocados ({allAttachments.length})</span>
          </h4>

          {allAttachments.length === 0 ? (
            <p className="text-xs text-[#5E7567] italic p-3 bg-[#EEF2EE]/30 rounded-xl border border-dashed border-[#D5E0D7]">
              Nenhum documento compartilhado ainda.
            </p>
          ) : (
            <div className="space-y-1.5">
              {allAttachments.map((att, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl flex items-center justify-between text-xs card-shadow"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs text-[#111D15] dark:text-slate-100 truncate">{att.name}</p>
                    <p className="text-[10px] text-[#5E7567] font-mono">{att.size}</p>
                  </div>
                  <button
                    onClick={() => alert(`Baixando ${att.name}`)}
                    className="text-xs font-bold text-[#1B3026] dark:text-[#76B38B] hover:underline"
                  >
                    Baixar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-xs text-[#111D15] dark:text-slate-100 uppercase tracking-wide flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-[#1B3026] dark:text-[#76B38B]" />
            <span>Participantes ({profiles.length})</span>
          </h4>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {profiles.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-[#EEF2EE] dark:hover:bg-[#1C2E24] transition-colors"
              >
                <div className="relative">
                  <UserAvatar name={p.name} size="sm" />
                  <span className="w-2 h-2 rounded-full bg-[#2C6E49] border border-white dark:border-[#121D16] absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[#111D15] dark:text-slate-100 truncate">{p.name}</p>
                  <p className="text-[10px] text-[#5E7567] font-mono">{p.department || p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
