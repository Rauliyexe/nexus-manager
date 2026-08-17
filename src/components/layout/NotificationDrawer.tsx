'use client';

import React from 'react';
import Link from 'next/link';
import { X, Bell, AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Notificações Operacionais
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhuma notificação recente.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-3 rounded-lg border transition-all text-xs ${
                  item.read
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 font-medium">
                    {item.type === 'CRITICAL' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : item.type === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  )}
                </div>
                <p className="mt-1.5 text-slate-400 leading-relaxed">
                  {item.message}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={onClose}
                      className="text-sky-400 hover:underline font-medium"
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
