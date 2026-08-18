'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone;

    if (isIOSDevice && !isStandalone) {
      const dismissed = localStorage.getItem('nexus_pwa_dismissed');
      if (!dismissed) {
        setIsIOS(true);
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    // Android/Chrome beforeinstallprompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      const dismissed = localStorage.getItem('nexus_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('nexus_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Floating PWA Install Prompt Banner */}
      <aside
        aria-label="Instalação do Aplicativo"
        className="fixed bottom-20 md:bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-white/95 dark:bg-[#121D16]/95 backdrop-blur-md border border-[#E2E8E3] dark:border-[#1E3125] p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans select-none card-shadow"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border border-[#D4E8DB] dark:border-[#1E3125] flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#1A281E] dark:text-slate-100 flex items-center space-x-1.5">
                <span>Instalar Nexus App</span>
                <span className="px-2 py-0.5 rounded-full bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] border border-[#D4E8DB] dark:border-[#1E3125] text-[9px] font-mono font-bold">
                  PWA
                </span>
              </h2>
              <p className="text-[11px] text-[#5C6E62] dark:text-slate-400 mt-0.5 leading-snug">
                Acesse o fechamento diário e alertas na tela inicial, mesmo sem sinal.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-[#8FA595] hover:text-[#1A281E] dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 flex items-center justify-end space-x-2 pt-2.5 border-t border-[#E2E8E3] dark:border-[#1E3125]">
          <button
            onClick={handleDismiss}
            className="text-xs text-[#5C6E62] dark:text-slate-400 hover:text-[#1A281E] dark:hover:text-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Depois
          </button>

          <button
            onClick={handleInstallClick}
            className="bg-[#1B3026] hover:bg-[#2A4A3C] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar Aplicativo</span>
          </button>
        </div>
      </aside>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121D16] border border-[#E2E8E3] dark:border-[#1E3125] w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl card-shadow">
            <div className="flex items-center justify-between border-b border-[#E2E8E3] dark:border-[#1E3125] pb-3">
              <h2 className="text-sm font-bold text-[#1A281E] dark:text-slate-100 flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#4D7C5D] dark:text-[#76B38B]" />
                <span>Instalar no iPhone / iPad</span>
              </h2>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-[#8FA595] hover:text-[#1A281E] dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#5C6E62] dark:text-slate-300">
              <div className="flex items-start space-x-3 p-3 bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
                <span className="w-6 h-6 rounded-full bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <p>
                  No Safari, toque no botão <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline text-[#4D7C5D]" />) na barra inferior.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
                <span className="w-6 h-6 rounded-full bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <p>
                  Role para baixo e selecione a opção <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[#F5F7F5] dark:bg-[#0B120E] rounded-xl border border-[#E2E8E3] dark:border-[#1E3125]">
                <span className="w-6 h-6 rounded-full bg-[#EBF2EE] dark:bg-[#1C2E24] text-[#2C523D] dark:text-[#76B38B] flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <p>
                  Toque em <strong>"Adicionar"</strong> no canto superior direito para concluir.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-[#1B3026] hover:bg-[#2A4A3C] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
