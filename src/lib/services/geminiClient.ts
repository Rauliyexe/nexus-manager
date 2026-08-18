/**
 * Helper para armazenamento no cliente da Chave de Demonstração do Google Gemini.
 * Permite que qualquer usuário teste a aplicação sem precisar configurar o arquivo .env.local no servidor.
 */

const LOCAL_STORAGE_GEMINI_KEY = 'nexus_gemini_api_key';
const LOCAL_STORAGE_GEMINI_MODEL = 'nexus_gemini_model';

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
  if (typeof window === 'undefined') return 'gemini-1.5-flash';
  return localStorage.getItem(LOCAL_STORAGE_GEMINI_MODEL) || 'gemini-1.5-flash';
}

export function setStoredGeminiModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_GEMINI_MODEL, model);
}

export function removeStoredGeminiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
}
