'use client';

import React, { useState, useEffect } from 'react';
import {
 Settings,
 ShieldCheck,
 Volume2,
 VolumeX,
 Play,
 Sparkles,
 CheckCircle2,
 AlertTriangle,
 Send,
 Bell,
 Sliders,
 Key,
 Eye,
 EyeOff,
 Save,
 Trash2,
 ExternalLink,
 Loader2,
 Bot,
} from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SoundType } from '@/lib/services/soundService';
import {
 getStoredGeminiKey,
 setStoredGeminiKey,
 removeStoredGeminiKey,
 getStoredGeminiModel,
 setStoredGeminiModel,
 getStoredGeminiThinkingEnabled,
 setStoredGeminiThinkingEnabled,
 GEMINI_AVAILABLE_MODELS,
} from '@/lib/services/geminiClient';

const SOUND_PREVIEWS: { label: string; type: SoundType; description: string; icon: React.FC<any> }[] = [
 { label: 'Envio de Mensagem', type: 'MESSAGE_SENT', description: 'Swoosh/pop suave e discreto (70ms)', icon: Send },
 { label: 'Mensagem Recebida', type: 'MESSAGE_RECEIVED', description: 'Chime duplo elegante de notificação', icon: Bell },
 { label: 'Tarefa Criada / Chamado', type: 'TASK_CREATED', description: 'Acorde harmônico em Dó Maior (C5-E5-G5)', icon: Sparkles },
 { label: 'Tarefa Concluída / Ritual', type: 'TASK_COMPLETED', description: 'Checkmark harmônico metálico de dever cumprido', icon: CheckCircle2 },
 { label: 'Alerta Crítico / Incidente', type: 'CRITICAL_ALERT', description: 'Pulso duplo de atenção executiva discreto', icon: AlertTriangle },
 { label: 'Resposta Copiloto IA', type: 'AI_READY', description: 'Sparkle chime tecnológico com harmônicos', icon: Sparkles },
 { label: 'Alternância de Modo', type: 'MODE_SWITCH', description: 'Clique eletromecânico retrô Bloomberg CRT', icon: Sliders },
];

export default function SettingsPage() {
 const { currentUser, soundEnabled, toggleSound, playSound } = useNexus();

 // Estado da chave Gemini para demonstrações no navegador
 const [apiKeyInput, setApiKeyInput] = useState('');
 const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
 const [thinkingEnabled, setThinkingEnabled] = useState(true);
 const [showKey, setShowKey] = useState(false);
 const [savedSuccess, setSavedSuccess] = useState(false);
 const [testingConnection, setTestingConnection] = useState(false);
 const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

 useEffect(() => {
 setApiKeyInput(getStoredGeminiKey());
 setSelectedModel(getStoredGeminiModel());
 setThinkingEnabled(getStoredGeminiThinkingEnabled());
 }, []);

 const handleSaveKey = () => {
 setStoredGeminiKey(apiKeyInput);
 setStoredGeminiModel(selectedModel);
 setStoredGeminiThinkingEnabled(thinkingEnabled);
 setSavedSuccess(true);
 setTestResult(null);
 playSound('TASK_COMPLETED');
 setTimeout(() => setSavedSuccess(false), 2500);
 };

 const handleRemoveKey = () => {
 removeStoredGeminiKey();
 setApiKeyInput('');
 setTestResult(null);
 setSavedSuccess(false);
 playSound('MESSAGE_SENT');
 };

 const handleTestKey = async () => {
 if (!apiKeyInput.trim()) {
 setTestResult({ success: false, message: 'Digite ou cole uma chave antes de testar.' });
 return;
 }

 setTestingConnection(true);
 setTestResult(null);

 try {
 const res = await fetch('/api/ai/agent', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'x-gemini-api-key': apiKeyInput.trim(),
 'x-gemini-model': selectedModel,
 'x-gemini-thinking': String(thinkingEnabled),
 },
 body: JSON.stringify({
 message: 'Olá, teste executivo com Gemini Thinking e raciocínio ativo.',
 history: [],
 context: {
 currentUser,
 tasks: [],
 areas: [],
 notifications: [],
 conversations: [],
 messages: {},
 },
 }),
 });

 if (res.ok) {
 setTestResult({
 success: true,
 message: `Conexão com Google Gemini (${selectedModel}) estabelecida com sucesso! Raciocínio operacional.`,
 });
 playSound('AI_READY');
 } else {
 const data = await res.json().catch(() => ({}));
 setTestResult({
 success: false,
 message: data.error || 'A API retornou erro. Verifique se a chave está ativa no Google AI Studio.',
 });
 }
 } catch {
 setTestResult({
 success: false,
 message: 'Falha de rede ao conectar com o endpoint da IA.',
 });
 } finally {
 setTestingConnection(false);
 }
 };

 return (
 <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 font-sans">
 {/* Header */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow">
 <h1 className="text-xl font-bold text-[#111D15] dark:text-slate-100 flex items-center space-x-2.5">
 <Settings className="w-5 h-5 text-[#2C6E49] dark:text-[#76B38B]" />
 <span>Configurações & Preferências do Sistema</span>
 </h1>
 <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-1">
 Dados do usuário ativo, perfil corporativo, integração de Inteligência Artificial e preferências.
 </p>
 </div>

 {/* User Card */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow flex items-center space-x-4">
 <UserAvatar name={currentUser.name} size="lg" className="w-12 h-12 text-sm font-bold bg-[#EEF2EE] text-[#1B3026] dark:bg-[#1C2E24] dark:text-[#76B38B]" />
 <div>
 <h2 className="text-base font-bold text-[#111D15] dark:text-slate-100">{currentUser.name}</h2>
 <p className="text-xs text-[#5E7567] dark:text-slate-400">{currentUser.email} • {currentUser.phone}</p>
 <div className="mt-2 flex items-center space-x-2">
 <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125]">
 Cargo: {currentUser.role}
 </span>
 <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2EE] dark:bg-[#17261D] text-[#5E7567] dark:text-slate-300 border border-[#D5E0D7] dark:border-[#1E3125]">
 {currentUser.department || 'Copper Group'}
 </span>
 </div>
 </div>
 </div>

 {/* ── Google Gemini AI Settings (Demonstration Key) ── */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5E0D7]/60 dark:border-[#1E3125] pb-4">
 <div className="flex items-center space-x-2.5">
 <div className="w-9 h-9 rounded-xl bg-[#1B3026] text-white flex items-center justify-center shadow-xs">
 <Sparkles className="w-4 h-4 text-emerald-400" />
 </div>
 <div>
 <div className="flex items-center space-x-2">
 <h3 className="text-sm font-bold text-[#111D15] dark:text-slate-100">
 Google Gemini AI (Chave de Demonstração)
 </h3>
 <span className="px-2 py-0.5 rounded-md bg-[#2C6E49] text-white text-[9px] font-mono font-bold uppercase">
 Free Tier / AI Studio
 </span>
 </div>
 <p className="text-xs text-[#5E7567] dark:text-slate-400 mt-0.5">
 Alimente o Personal Agent e o Assistente de Canais com a API gratuita do Google.
 </p>
 </div>
 </div>

 <a
 href="https://aistudio.google.com/app/apikey"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#2C6E49] dark:text-[#76B38B] hover:underline"
 >
 <span>Obter chave gratuita</span>
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 </div>

 <div className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] text-xs text-[#5E7567] dark:text-slate-300">
 <strong className="text-[#111D15] dark:text-slate-100">Como funciona:</strong> A chave inserida aqui é salva apenas na memória local do seu navegador (<code className="font-mono bg-white dark:bg-[#121D16] px-1 py-0.5 rounded border border-[#D5E0D7] dark:border-[#1E3125]">localStorage</code>), permitindo demonstrações sem expor credenciais no Git.
 </div>

 <div className="space-y-3">
 <div>
 <label className="block text-xs font-bold text-[#111D15] dark:text-slate-200 mb-1.5 flex items-center space-x-1.5">
 <Key className="w-3.5 h-3.5 text-[#2C6E49]" />
 <span>Chave de API do Google Gemini (API Key)</span>
 </label>

 <div className="relative">
 <input
 type={showKey ? 'text' : 'password'}
 value={apiKeyInput}
 onChange={(e) => setApiKeyInput(e.target.value)}
 placeholder="Ex: AIzaSy..."
 className="w-full px-3.5 py-2.5 pr-10 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs font-mono text-[#111D15] dark:text-slate-100 placeholder:text-[#5E7567]/60 focus:outline-hidden focus:ring-2 focus:ring-[#2C6E49] transition-all"
 />
 <button
 type="button"
 onClick={() => setShowKey(!showKey)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E7567] hover:text-[#111D15] dark:hover:text-white cursor-pointer"
 title={showKey ? 'Ocultar chave' : 'Exibir chave'}
 >
 {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
 <div>
 <label className="block text-xs font-bold text-[#111D15] dark:text-slate-200 mb-1.5 flex items-center space-x-1.5">
 <Bot className="w-3.5 h-3.5 text-[#2C6E49]" />
 <span>Modelo Selecionado</span>
 </label>
 <select
 value={selectedModel}
 onChange={(e) => setSelectedModel(e.target.value)}
 className="w-full px-3.5 py-2 bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] rounded-xl text-xs font-medium text-[#111D15] dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-[#2C6E49]"
 >
 {GEMINI_AVAILABLE_MODELS.map((m) => (
 <option key={m.id} value={m.id}>
 {m.name}
 </option>
 ))}
 </select>
 </div>

 <div className="flex items-center space-x-2 sm:self-end pt-1">
 <label className="flex items-center space-x-2 cursor-pointer py-2 px-1 text-xs text-[#111D15] dark:text-slate-200">
 <input
 type="checkbox"
 checked={thinkingEnabled}
 onChange={(e) => setThinkingEnabled(e.target.checked)}
 className="rounded text-[#2C6E49] focus:ring-[#2C6E49] w-4 h-4"
 />
 <span className="font-semibold text-xs">Exibir Cadeia de Raciocínio (Thinking)</span>
 </label>
 </div>
 </div>

 <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#D5E0D7]/40 dark:border-[#1E3125]">
 <button
 type="button"
 onClick={handleSaveKey}
 className="px-4 py-2 bg-[#1B3026] hover:bg-[#2A4A3C] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
 >
 <Save className="w-3.5 h-3.5" />
 <span>{savedSuccess ? 'Salvo!' : 'Salvar no Navegador'}</span>
 </button>

 <button
 type="button"
 onClick={handleTestKey}
 disabled={testingConnection}
 className="px-3 py-2 bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#1B3026] dark:text-[#76B38B] hover:bg-[#D5E0D7] rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
 title="Testar requisição"
 >
 {testingConnection ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin" />
 ) : (
 <Sparkles className="w-3.5 h-3.5" />
 )}
 <span>Testar</span>
 </button>

 {apiKeyInput && (
 <button
 type="button"
 onClick={handleRemoveKey}
 className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
 title="Remover chave salva"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 )}
 </div>

 {testResult && (
 <div
 className={`p-3 rounded-xl border text-xs flex items-start space-x-2 animate-in fade-in duration-150 ${
 testResult.success
 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
 : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
 }`}
 >
 {testResult.success ? (
 <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
 ) : (
 <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
 )}
 <p className="font-medium">{testResult.message}</p>
 </div>
 )}
 </div>
 </div>

 {/* ── Audio & Sound Feedback Section ── */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow space-y-5">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2.5 text-[#111D15] dark:text-slate-100 font-bold text-sm">
 <Volume2 className="w-5 h-5 text-[#2C6E49] dark:text-[#76B38B]" />
 <span>Feedback Sonoro & Áudio Corporativo (Web Audio API)</span>
 </div>

 <button
 onClick={toggleSound}
 className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer card-shadow ${
 soundEnabled
 ? 'bg-[#1B3026] text-white hover:bg-[#2A4A3C]'
 : 'bg-[#EEF2EE] dark:bg-[#1C2E24] text-[#5E7567] hover:bg-[#D5E0D7]'
 }`}
 >
 {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
 <span>{soundEnabled ? 'Sons Ativados' : 'Sons Silenciados'}</span>
 </button>
 </div>

 <p className="text-xs text-[#5E7567] dark:text-slate-300 leading-relaxed">
 O sistema utiliza síntese harmônica nativa via Web Audio API, com latência zero e sem dependência de download de arquivos externos. Clique nos botões abaixo para testar cada assinatura sonora:
 </p>

 {/* Sound Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
 {SOUND_PREVIEWS.map((sound) => {
 const Icon = sound.icon;
 return (
 <div
 key={sound.type}
 className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125] flex items-center justify-between space-x-3 card-shadow"
 >
 <div className="min-w-0 space-y-0.5">
 <div className="flex items-center space-x-1.5">
 <Icon className="w-3.5 h-3.5 text-[#2C6E49] dark:text-[#76B38B] shrink-0" />
 <span className="font-bold text-xs text-[#111D15] dark:text-slate-200 truncate">
 {sound.label}
 </span>
 </div>
 <p className="text-[10px] text-[#5E7567] dark:text-slate-400 truncate">
 {sound.description}
 </p>
 </div>

 <button
 onClick={() => playSound(sound.type)}
 className="p-2 rounded-xl bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] text-[#1B3026] dark:text-[#76B38B] hover:bg-[#1B3026] hover:text-white dark:hover:bg-[#1C2E24] dark:hover:text-emerald-400 transition-all cursor-pointer shrink-0 shadow-2xs group"
 title={`Testar som: ${sound.label}`}
 >
 <Play className="w-3.5 h-3.5 fill-current" />
 </button>
 </div>
 );
 })}
 </div>
 </div>

 {/* Cryptography Roadmap Section */}
 <div className="bg-white dark:bg-[#121D16] border border-[#D5E0D7] dark:border-[#1E3125] p-6 rounded-2xl card-shadow space-y-4">
 <div className="flex items-center space-x-2 text-[#2C6E49] dark:text-[#76B38B] font-bold text-sm">
 <ShieldCheck className="w-5 h-5" />
 <span>Arquitetura de Criptografia e Segurança</span>
 </div>

 <p className="text-xs text-[#5E7567] dark:text-slate-300 leading-relaxed">
 O sistema utiliza uma camada de abstração em <code className="font-mono bg-[#EEF2EE] dark:bg-[#0B120E] px-1.5 py-0.5 rounded text-[#1B3026] dark:text-[#76B38B] border border-[#D5E0D7] dark:border-[#1E3125]">lib/crypto</code> com a API nativa WebCrypto (AES-GCM 256 bits) para cifrar as mensagens transportadas.
 </p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
 <div className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
 <span className="font-semibold text-[#111D15] dark:text-slate-200 block mb-1">Status Atual:</span>
 <ul className="space-y-1 text-[#5E7567] dark:text-slate-400 text-[11px] list-disc list-inside">
 <li>Transporte seguro HTTPS/TLS</li>
 <li>Row Level Security (RLS) por perfil</li>
 <li>Payloads cifrados via WebCrypto API</li>
 <li>Feedback sonoro corporativo com Web Audio API</li>
 </ul>
 </div>

 <div className="p-3.5 bg-[#EEF2EE]/50 dark:bg-[#0B120E] rounded-xl border border-[#D5E0D7] dark:border-[#1E3125]">
 <span className="font-semibold text-[#2C6E49] dark:text-[#76B38B] block mb-1">E2EE Definitiva (Produção):</span>
 <ul className="space-y-1 text-[#5E7567] dark:text-slate-400 text-[11px] list-disc list-inside">
 <li>Pares de chaves pública/privada por usuário</li>
 <li>Chaves privadas guardadas exclusivamente no dispositivo</li>
 <li>Integração futura com Evolution API & Push Notifications</li>
 </ul>
 </div>
 </div>
 </div>
 </div>
 );
}
