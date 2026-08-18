'use client';

import React from 'react';
import Link from 'next/link';
import { X, Bell, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationRead } = useNexus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 dark:bg-black/60 backdrop-blur-sm flex justify-end font-sans">
      <div className="w-full max-w-sm bg-white dark:bg-[#121D16] border-l border-[#E2E8E3] dark:border-[#1E3125] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-[#F5F7F5] dark:bg-[#0B120E] border-b border-[#E2E8E3] dark:border-[#1E3125] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1A281E] dark:text-slate-100">
              Notificações Operacionais
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8FA595] hover:text-[#1A281E] dark:hover:text-slate-200 hover:bg-[#E2E8E3] dark:hover:bg-[#1E3125] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-[#8FA595] text-xs font-medium">
              Nenhuma notificação recente.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3.5 rounded-xl border transition-all text-xs cursor-pointer ${
                  item.read
                    ? 'bg-[#F5F7F5] dark:bg-[#0B120E] border-[#E2E8E3] dark:border-[#1E3125] text-[#5C6E62] dark:text-slate-400 opacity-75'
                    : 'bg-white dark:bg-[#17261D] border-[#E2E8E3] dark:border-[#1E3125] text-[#1A281E] dark:text-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 font-semibold">
                    {item.type === 'CRITICAL' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : item.type === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-[#4D7C5D] dark:text-[#76B38B] shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#4D7C5D] dark:bg-[#76B38B] shrink-0 mt-1" />
                  )}
                </div>
                <p className="mt-1.5 text-xs text-[#5C6E62] dark:text-slate-400 leading-relaxed">
                  {item.message}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#8FA595] dark:text-slate-500">
                  <span>{new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={onClose}
                      className="text-[#4D7C5D] dark:text-[#76B38B] hover:underline font-semibold"
                    >
                      Ver detalhes →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
