'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed prompt recently (in the last 24h)
    const dismissedAt = localStorage.getItem('nexus_pwa_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice && !isStandalone) {
      // Show prompt for iOS after 3 seconds
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for Chromium beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('[Nexus PWA] App installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[Nexus PWA] User accepted the installation');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('nexus_pwa_dismissed', Date.now().toString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <>
      {/* Floating PWA Install Prompt Banner */}
      <aside
        aria-label="Instalação do Aplicativo"
        className="fixed bottom-20 md:bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-slate-900/95 backdrop-blur-md border border-sky-500/40 p-3.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans select-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                <span>Instalar Nexus App</span>
                <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[9px] font-mono font-bold">
                  PWA
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Acesse o fechamento diário e alertas na tela inicial, mesmo sem sinal.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleDismiss}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded transition-colors font-mono cursor-pointer"
          >
            Depois
          </button>

          <button
            onClick={handleInstallClick}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar Aplicativo</span>
          </button>
        </div>
      </aside>

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Instalar no iPhone / iPad</span>
              </h2>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start space-x-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </span>
                <p>
                  No Safari, toque no botão <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline text-sky-400" />) na barra inferior.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </span>
                <p>
                  Role para baixo e selecione a opção <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </span>
                <p>
                  Toque em <strong>"Adicionar"</strong> no canto superior direito para concluir.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
