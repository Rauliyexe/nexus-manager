/**
 * Helper para armazenamento no cliente da Chave de Demonstração do Google Gemini.
 * Permite que qualquer usuário teste a aplicação sem precisar configurar o arquivo .env.local no servidor.
 */

const LOCAL_STORAGE_GEMINI_KEY = 'nexus_gemini_api_key';
const LOCAL_STORAGE_GEMINI_MODEL = 'nexus_gemini_model';
const LOCAL_STORAGE_GEMINI_THINKING = 'nexus_gemini_thinking_enabled';

export const GEMINI_AVAILABLE_MODELS = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Padrão · Rápido com Raciocínio)',
    description: 'Nova geração do Google com suporte nativo a Function Calling e alta velocidade.',
    badge: 'Recomendado',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking (Raciocínio Explícito)',
    description: 'Modelo experimental otimizado para expor a cadeia de pensamentos detalhada.',
    badge: 'Deep Thinking',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Modelo consolidado de alta velocidade e baixo consumo de tokens.',
    badge: 'Estável',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Capacidade cognitiva ampliada para raciocínios e auditorias complexas.',
    badge: 'Pro Reasoning',
  },
];

export function getStoredGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY) || '';
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, key.trim());
  } else {
    localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
  }
}

export function getStoredGeminiModel(): string {
  if (typeof window === 'undefined') return 'gemini-2.0-flash';
  return localStorage.getItem(LOCAL_STORAGE_GEMINI_MODEL) || 'gemini-2.0-flash';
}

export function setStoredGeminiModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_GEMINI_MODEL, model);
}

export function getStoredGeminiThinkingEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(LOCAL_STORAGE_GEMINI_THINKING);
  return stored === null ? true : stored === 'true';
}

export function setStoredGeminiThinkingEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_GEMINI_THINKING, enabled ? 'true' : 'false');
}

export function removeStoredGeminiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
}

