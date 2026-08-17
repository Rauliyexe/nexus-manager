'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  Profile,
  Area,
  Obligation,
  DailyStatus,
  DailyStatusType,
  Alert,
  Conversation,
  Message,
  NotificationItem,
  WeeklyReportItem,
  MessageType,
  FinancialMetrics,
  AppMode,
} from '../types/nexus';
import { encryptMessage } from '../crypto/encryptMessage';

// Extended Mock Financial Dataset (Bloomberg Terminal Telemetry)
const SEED_FINANCIAL_METRICS: FinancialMetrics = {
  consolidatedCash: 14850000,
  monthlyRevenue: 48200000,
  revenueTarget: 45000000,
  ebitda: 8917000,
  ebitdaMargin: 18.5,
  defaultRate: 0.45,
  copperSpotUSD: 9840.0, // $9,840.00 / ton LME
  usdBrlRate: 5.42, // USD/BRL
  copperSpotBRLPerKg: 53.33, // R$ 53,33 / kg
  scrapBuyPriceBRLPerKg: 49.08, // R$ 49,08 / kg
  copperMarginPerTon: 4250, // R$ 4.250,00 / ton
  monthlyTonsProcessed: 11340,
  todayInflows: 1820000,
  todayOutflows: 1150000,
  todayNetBalance: 670000,
  recentTransactions: [
    { id: 'tx-1', time: '16:14:02', description: 'Faturamento Lote #4812 Dcopper — Vergalhão 8mm', category: 'Vendas Dcopper', amount: 980000, type: 'INFLOW' },
    { id: 'tx-2', time: '15:45:10', description: 'Pagamento Lote Sucata de Cobre #991 — Reciclagem SP', category: 'Compras Sucata', amount: -640000, type: 'OUTFLOW' },
    { id: 'tx-3', time: '14:20:00', description: 'Faturamento Lote #4811 Dcopper — Arame Trefilado', category: 'Vendas Dcopper', amount: 840000, type: 'INFLOW' },
    { id: 'tx-4', time: '11:15:30', description: 'Frete Logística Frota — Carretas Sucata MG', category: 'Logística / Frota', amount: -180000, type: 'OUTFLOW' },
    { id: 'tx-5', time: '09:30:00', description: 'Insumos Industriais Fundição 2 — Gás & Eletrodos', category: 'Compras', amount: -330000, type: 'OUTFLOW' },
  ],
  accounts: [
    { id: 'acc-1', bankName: 'Itaú BBA Corporate', accountNumber: 'c/c 48120-9', balance: 6420000, currency: 'BRL' },
    { id: 'acc-2', bankName: 'Bradesco Corporate', accountNumber: 'c/c 10922-4', balance: 4180000, currency: 'BRL' },
    { id: 'acc-3', bankName: 'BTG Pactual Tesouraria', accountNumber: 'c/c 88201-1', balance: 2750000, currency: 'BRL' },
    { id: 'acc-4', bankName: 'Banco do Brasil Operacional', accountNumber: 'c/c 33900-5', balance: 1500000, currency: 'BRL' },
  ],
  dre: [
    { code: '1.0', category: 'RECEITA BRUTA OPERACIONAL', amount: 48200000, percentageOfRevenue: 100.0, type: 'REVENUE' },
    { code: '1.1', category: 'Deduções de Receita e Impostos sobre Vendas', amount: -6266000, percentageOfRevenue: -13.0, type: 'DEDUCTION' },
    { code: '2.0', category: 'RECEITA LÍQUIDA', amount: 41934000, percentageOfRevenue: 87.0, type: 'REVENUE' },
    { code: '3.0', category: 'Custo de Matéria Prima (Sucata de Cobre / LME)', amount: -24100000, percentageOfRevenue: -50.0, type: 'COST' },
    { code: '3.1', category: 'Custo Industrial & Fundição Dcopper', amount: -4820000, percentageOfRevenue: -10.0, type: 'COST' },
    { code: '4.0', category: 'MARGEM BRUTA OPERACIONAL', amount: 13014000, percentageOfRevenue: 27.0, type: 'REVENUE' },
    { code: '5.0', category: 'Despesas Gerais e Administrativas (SG&A)', amount: -4097000, percentageOfRevenue: -8.5, type: 'EXPENSE' },
    { code: '6.0', category: 'EBITDA CONSOLIDADO', amount: 8917000, percentageOfRevenue: 18.5, type: 'EBITDA' },
    { code: '7.0', category: 'Depreciação, Amortização & IRPJ/CSLL', amount: -2169000, percentageOfRevenue: -4.5, type: 'TAX' },
    { code: '8.0', category: 'LUCRO LÍQUIDO DO EXERCÍCIO', amount: 6748000, percentageOfRevenue: 14.0, type: 'NET_INCOME' },
  ],
  agingSchedule: [
    { period: 'Vencendo Hoje', receivables: 2150000, payables: 1420000 },
    { period: 'Até 7 Dias', receivables: 4800000, payables: 3100000 },
    { period: '8 a 15 Dias', receivables: 3200000, payables: 2400000 },
    { period: '16 a 30 Dias', receivables: 1850000, payables: 1500000 },
    { period: 'Acima de 30 Dias', receivables: 400000, payables: 480000 },
  ],
};

const SEED_PROFILES: Profile[] = [
  {
    id: 'usr-admin',
    name: 'Admin Nexus',
    email: 'admin@nexus.com.br',
    phone: '(11) 99999-9999',
    role: 'ADMIN',
    department: 'Tecnologia & Operações',
    active: true,
  },
  {
    id: 'usr-dir',
    name: 'Carlos Santos',
    email: 'carlos.diretoria@nexus.com.br',
    phone: '(11) 98888-0001',
    role: 'DIRECTOR',
    department: 'Diretoria Executiva',
    active: true,
  },
  {
    id: 'usr-mgr-1',
    name: 'Ricardo Almeida',
    email: 'ricardo.sucata@nexus.com.br',
    phone: '(11) 98888-0002',
    role: 'MANAGER',
    department: 'Compras Sucata',
    active: true,
  },
  {
    id: 'usr-mgr-2',
    name: 'Vanessa Lima',
    email: 'vanessa.vendas@nexus.com.br',
    phone: '(11) 98888-0003',
    role: 'MANAGER',
    department: 'Vendas Dcopper',
    active: true,
  },
  {
    id: 'usr-mgr-3',
    name: 'Marcos Oliveira',
    email: 'marcos.frota@nexus.com.br',
    phone: '(11) 98888-0004',
    role: 'MANAGER',
    department: 'Logística / Frota',
    active: true,
  },
  {
    id: 'usr-mgr-4',
    name: 'Patricia Mendes',
    email: 'patricia.controladoria@nexus.com.br',
    phone: '(11) 98888-0005',
    role: 'MANAGER',
    department: 'Controladoria',
    active: true,
  },
  {
    id: 'usr-mgr-5',
    name: 'João Silva',
    email: 'joao.financeiro@nexus.com.br',
    phone: '(11) 98888-0006',
    role: 'MANAGER',
    department: 'Financeiro',
    active: true,
  },
  {
    id: 'usr-mgr-6',
    name: 'Fernanda Souza',
    email: 'fernanda.fiscal@nexus.com.br',
    phone: '(11) 98888-0007',
    role: 'MANAGER',
    department: 'Fiscal / Contábil',
    active: true,
  },
  {
    id: 'usr-mgr-7',
    name: 'Roberto Rocha',
    email: 'roberto.seguranca@nexus.com.br',
    phone: '(11) 98888-0008',
    role: 'MANAGER',
    department: 'Segurança',
    active: true,
  },
  {
    id: 'usr-mgr-8',
    name: 'Ana Paula Costa',
    email: 'ana.rh@nexus.com.br',
    phone: '(11) 98888-0009',
    role: 'MANAGER',
    department: 'RH',
    active: true,
  },
  {
    id: 'usr-mgr-9',
    name: 'Gabriel Barbosa',
    email: 'gabriel.compras@nexus.com.br',
    phone: '(11) 98888-0010',
    role: 'MANAGER',
    department: 'Compras',
    active: true,
  },
  {
    id: 'usr-mgr-10',
    name: 'Beatriz Martins',
    email: 'beatriz.compliance@nexus.com.br',
    phone: '(11) 98888-0011',
    role: 'MANAGER',
    department: 'Compliance',
    active: true,
  },
];

const SEED_AREAS: Area[] = [
  { id: 'area-1', name: 'Compras Sucata', description: 'Aquisição de sucata de cobre, alumínio e ligas metálicas.', manager_id: 'usr-mgr-1' },
  { id: 'area-2', name: 'Vendas Dcopper', description: 'Comercialização de vergalhão e arames de cobre Dcopper.', manager_id: 'usr-mgr-2' },
  { id: 'area-3', name: 'Logística / Frota', description: 'Gestão de transporte, expedição e manutenção da frota.', manager_id: 'usr-mgr-3' },
  { id: 'area-4', name: 'Controladoria', description: 'Auditoria interna, DRE gerencial e margens operacionais.', manager_id: 'usr-mgr-4' },
  { id: 'area-5', name: 'Financeiro', description: 'Fluxo de caixa, tesouraria, contas a pagar e receber.', manager_id: 'usr-mgr-5' },
  { id: 'area-6', name: 'Fiscal / Contábil', description: 'Emissão de NFs, obrigações acessórias e fechamento fiscal.', manager_id: 'usr-mgr-6' },
  { id: 'area-7', name: 'Segurança', description: 'Segurança patrimonial, controle de acesso e monitoramento.', manager_id: 'usr-mgr-7' },
  { id: 'area-8', name: 'RH', description: 'Gestão de pessoas, folha de pagamento e treinamento.', manager_id: 'usr-mgr-8' },
  { id: 'area-9', name: 'Compras', description: 'Insumos industriais, peças de reposição e contratos.', manager_id: 'usr-mgr-9' },
  { id: 'area-10', name: 'Compliance', description: 'Conformidade legal, licenças ambientais e auditoria.', manager_id: 'usr-mgr-10' },
];

const SEED_OBLIGATIONS: Obligation[] = [
  { id: 'ob-1', area_id: 'area-1', title: 'Cotação diária de Sucata de Cobre no LME', description: 'Atualizar tabela de preço de compra no sistema', frequency: 'DIARIA', due_time: '11:00', active: true, responsible_user_id: 'usr-mgr-1' },
  { id: 'ob-2', area_id: 'area-2', title: 'Relatório diário de carteira de pedidos Dcopper', description: 'Conferir volume em toneladas faturado vs meta', frequency: 'DIARIA', due_time: '16:00', active: true, responsible_user_id: 'usr-mgr-2' },
  { id: 'ob-3', area_id: 'area-3', title: 'Conferência de Checklist da Frota Própria', description: 'Vistoria técnica de caminhões antes de liberar frete', frequency: 'DIARIA', due_time: '08:00', active: true, responsible_user_id: 'usr-mgr-3' },
  { id: 'ob-4', area_id: 'area-4', title: 'Fechamento semanal da margem operacional', description: 'Conferir apuração de custo industrial', frequency: 'SEMANAL', due_time: '17:00', active: true, responsible_user_id: 'usr-mgr-4' },
  { id: 'ob-5', area_id: 'area-5', title: 'Conciliação bancária diária das contas Nexus', description: 'Validar extratos de todas as contas corporativas', frequency: 'DIARIA', due_time: '15:30', active: true, responsible_user_id: 'usr-mgr-5' },
  { id: 'ob-6', area_id: 'area-6', title: 'Emissão de Guia SPED / Impostos estaduais', description: 'Verificar recolhimento ICMS ST', frequency: 'MENSAL', due_time: '17:00', active: true, responsible_user_id: 'usr-mgr-6' },
  { id: 'ob-7', area_id: 'area-7', title: 'Ronda perimetral e auditoria de câmeras de alta tensão', description: 'Inspecionar galpões de fundição 1 e 2', frequency: 'DIARIA', due_time: '16:00', active: true, responsible_user_id: 'usr-mgr-7' },
  { id: 'ob-8', area_id: 'area-8', title: 'Envio de dados do eSocial para folha de pagamento', description: 'Transmitir lote de admissões e atestados', frequency: 'SEMANAL', due_time: '14:00', active: true, responsible_user_id: 'usr-mgr-8' },
  { id: 'ob-9', area_id: 'area-9', title: 'Aprovação de Ordens de Compra industriais > R$ 50k', description: 'Verificar 3 cotações de fornecedores homologados', frequency: 'DIARIA', due_time: '16:30', active: true, responsible_user_id: 'usr-mgr-9' },
  { id: 'ob-10', area_id: 'area-10', title: 'Auditoria de licença ambiental Cetesb / IBAMA', description: 'Validar renovação anual de condicionantes', frequency: 'MENSAL', due_time: '17:00', active: true, responsible_user_id: 'usr-mgr-10' },
];

const TODAY = new Date().toISOString().split('T')[0];

const SEED_DAILY_STATUS: DailyStatus[] = [
  { id: 'st-1', area_id: 'area-1', user_id: 'usr-mgr-1', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:10:00Z` },
  { id: 'st-2', area_id: 'area-2', user_id: 'usr-mgr-2', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:15:00Z` },
  { id: 'st-3', area_id: 'area-3', user_id: 'usr-mgr-3', status: 'YELLOW', justification: 'Atraso na liberação da carreta #04 no pátio de triagem.', date: TODAY, created_at: `${TODAY}T16:42:00Z` },
  { id: 'st-4', area_id: 'area-4', user_id: 'usr-mgr-4', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:20:00Z` },
  { id: 'st-5', area_id: 'area-5', user_id: 'usr-mgr-5', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:25:00Z` },
  { id: 'st-6', area_id: 'area-6', user_id: 'usr-mgr-6', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:30:00Z` },
  { id: 'st-7', area_id: 'area-7', user_id: 'usr-mgr-7', status: 'RED', justification: 'Falha detectada no sensor perimetral do portão 3.', date: TODAY, created_at: `${TODAY}T16:38:00Z` },
  { id: 'st-8', area_id: 'area-8', user_id: 'usr-mgr-8', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:05:00Z` },
  { id: 'st-10', area_id: 'area-10', user_id: 'usr-mgr-10', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:35:00Z` },
];

const SEED_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    area_id: 'area-7',
    type: 'CRITICAL',
    priority: 'CRITICAL',
    status: 'OPEN',
    title: '[CRÍTICO] Segurança — Sensor Perimetral Inoperante',
    description: 'Falha detectada no sensor perimetral do portão 3 às 16:38. Manutenção técnica acionada.',
    created_at: `${TODAY}T16:38:00Z`,
  },
  {
    id: 'alt-2',
    area_id: 'area-3',
    type: 'ATTENTION',
    priority: 'MEDIUM',
    status: 'OPEN',
    title: '[ATENÇÃO] Logística / Frota — Liberação Retida',
    description: 'Atraso na liberação da carreta #04 no pátio de triagem às 16:42.',
    created_at: `${TODAY}T16:42:00Z`,
  },
  {
    id: 'alt-3',
    area_id: 'area-9',
    type: 'NO_RESPONSE',
    priority: 'HIGH',
    status: 'OPEN',
    title: '[PENDENTE] Compras — Fechamento Não Realizado',
    description: 'Área de Compras não registrou o fechamento diário até o horário limite das 17:00.',
    created_at: `${TODAY}T17:00:00Z`,
  },
];

const SEED_CONVERSATIONS: Conversation[] = [
  { id: 'conv-area-5', type: 'AREA', title: 'Financeiro', area_id: 'area-5', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-3', type: 'AREA', title: 'Logística / Frota', area_id: 'area-3', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-7', type: 'AREA', title: 'Segurança', area_id: 'area-7', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-9', type: 'AREA', title: 'Compras', area_id: 'area-9', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-grp-1', type: 'GROUP', title: 'Diretoria + Financeiro + Controladoria', created_at: `${TODAY}T09:00:00Z` },
  { id: 'conv-priv-1', type: 'PRIVATE', title: 'João Silva & Carlos Santos', created_at: `${TODAY}T10:00:00Z` },
];

const SEED_MESSAGES: Record<string, Message[]> = {
  'conv-area-5': [
    {
      id: 'msg-5-1',
      conversation_id: 'conv-area-5',
      sender_id: 'usr-mgr-5',
      content: 'A conciliação bancária do lote principal foi concluída sem divergências.',
      message_type: 'TEXT',
      created_at: `${TODAY}T14:20:00Z`,
    },
  ],
};

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ntf-1',
    user_id: 'usr-admin',
    title: '[CRÍTICO] Ocorrência em Segurança',
    message: 'Roberto Rocha registrou status crítico: Falha no sensor perimetral.',
    type: 'CRITICAL',
    read: false,
    link: '/areas/area-7',
    created_at: `${TODAY}T16:38:00Z`,
  },
];

interface NexusContextType {
  appMode: AppMode;
  isTransitioningMode: boolean;
  setAppMode: (mode: AppMode) => void;
  currentUser: Profile;
  profiles: Profile[];
  areas: Area[];
  obligations: Obligation[];
  dailyStatuses: DailyStatus[];
  alerts: Alert[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  notifications: NotificationItem[];
  weeklyReports: WeeklyReportItem[];
  financialMetrics: FinancialMetrics;
  activeConversationId: string | null;
  hasFinancialAccess: (user: Profile) => boolean;
  setActiveConversationId: (id: string | null) => void;
  switchUser: (userId: string) => void;
  submitDailyStatus: (areaId: string, status: DailyStatusType, justification?: string) => Promise<void>;
  createObligation: (obData: Omit<Obligation, 'id' | 'created_at' | 'updated_at'>) => void;
  toggleObligationActive: (id: string) => void;
  deleteObligation: (id: string) => void;
  sendMessage: (conversationId: string, content: string, messageType?: MessageType) => Promise<void>;
  createGroupConversation: (title: string, memberUserIds: string[]) => string;
  createPrivateConversation: (targetUserId: string) => string;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  markNotificationRead: (id: string) => void;
  runSimulationEvent: (event: '07:00' | '16:30' | '17:00') => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppModeState] = useState<AppMode>('OPERATIONS');
  const [isTransitioningMode, setIsTransitioningMode] = useState<boolean>(false);
  const [profiles] = useState<Profile[]>(SEED_PROFILES);
  const [currentUser, setCurrentUser] = useState<Profile>(SEED_PROFILES[0]);
  const [areas, setAreas] = useState<Area[]>(SEED_AREAS);
  const [obligations, setObligations] = useState<Obligation[]>(SEED_OBLIGATIONS);
  const [dailyStatuses, setDailyStatuses] = useState<DailyStatus[]>(SEED_DAILY_STATUS);
  const [alerts, setAlerts] = useState<Alert[]>(SEED_ALERTS);
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(SEED_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [financialMetrics] = useState<FinancialMetrics>(SEED_FINANCIAL_METRICS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-area-5');

  const setAppMode = (newMode: AppMode) => {
    if (newMode === appMode) return;
    setIsTransitioningMode(true);
    setTimeout(() => {
      setAppModeState(newMode);
    }, 250);
    setTimeout(() => {
      setIsTransitioningMode(false);
    }, 600);
  };

  const hasFinancialAccess = (user: Profile): boolean => {
    if (user.role === 'ADMIN' || user.role === 'DIRECTOR') return true;
    if (user.role === 'MANAGER' && (user.department?.includes('Financeiro') || user.department?.includes('Controladoria'))) {
      return true;
    }
    return false;
  };

  const enrichedAreas = areas.map((area) => {
    const todayStatusObj = dailyStatuses.find(
      (st) => st.area_id === area.id && st.date === TODAY
    );
    const areaManager = profiles.find((p) => p.id === area.manager_id);
    const openAlerts = alerts.filter(
      (a) => a.area_id === area.id && a.status !== 'RESOLVED'
    );
    const areaObligations = obligations.filter((o) => o.area_id === area.id);

    return {
      ...area,
      manager: areaManager,
      currentStatus: todayStatusObj ? todayStatusObj.status : 'NO_RESPONSE',
      currentJustification: todayStatusObj?.justification,
      obligationsCount: areaObligations.length,
      openAlertsCount: openAlerts.length,
      lastUpdated: todayStatusObj?.created_at
        ? new Date(todayStatusObj.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : 'Sem registro',
    };
  });

  const switchUser = (userId: string) => {
    const found = profiles.find((p) => p.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const submitDailyStatus = async (
    areaId: string,
    status: DailyStatusType,
    justification?: string
  ) => {
    const targetArea = areas.find((a) => a.id === areaId);
    if (!targetArea) return;

    const timestamp = new Date().toISOString();
    const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newStatusEntry: DailyStatus = {
      id: `st-${Date.now()}`,
      area_id: areaId,
      user_id: currentUser.id,
      user: currentUser,
      status,
      justification,
      date: TODAY,
      created_at: timestamp,
    };

    setDailyStatuses((prev) => [
      ...prev.filter((st) => !(st.area_id === areaId && st.date === TODAY)),
      newStatusEntry,
    ]);

    let generatedAlert: Alert | null = null;

    if (status === 'YELLOW') {
      generatedAlert = {
        id: `alt-${Date.now()}`,
        area_id: areaId,
        type: 'ATTENTION',
        priority: 'MEDIUM',
        status: 'OPEN',
        title: `[ATENÇÃO] ${targetArea.name} — Ocorrência Informada`,
        description: justification || 'Situação de atenção registrada pelo gestor.',
        created_at: timestamp,
      };
    } else if (status === 'RED') {
      generatedAlert = {
        id: `alt-${Date.now()}`,
        area_id: areaId,
        type: 'CRITICAL',
        priority: 'CRITICAL',
        status: 'OPEN',
        title: `[CRÍTICO] ${targetArea.name} — Ocorrência de Alta Severidade`,
        description: justification || 'Ocorrência de alta severidade informada no fechamento.',
        created_at: timestamp,
      };
    }

    if (generatedAlert) {
      setAlerts((prev) => [generatedAlert!, ...prev]);
    }

    const areaConvId = `conv-area-${areaId.replace('area-', '')}`;
    let systemText = '';

    if (status === 'GREEN') {
      systemText = `[SISTEMA - FECHAMENTO OPERACIONAL]\nStatus: OK\nÁrea: ${targetArea.name}\nHorário: ${formattedTime}\nRegistrado por: ${currentUser.name}`;
    } else if (status === 'YELLOW') {
      systemText = `[SISTEMA - EVENTO DE ATENÇÃO]\nStatus: ATENÇÃO\nÁrea: ${targetArea.name}\nJustificativa: "${justification}"\nHorário: ${formattedTime}\nRegistrado por: ${currentUser.name}`;
    } else if (status === 'RED') {
      systemText = `[SISTEMA - INCIDENTE CRÍTICO]\nStatus: CRÍTICO\nÁrea: ${targetArea.name}\nJustificativa: "${justification}"\nHorário: ${formattedTime}\nRegistrado por: ${currentUser.name}`;
    }

    await sendMessage(areaConvId, systemText, 'SYSTEM');
  };

  const createObligation = (obData: Omit<Obligation, 'id' | 'created_at' | 'updated_at'>) => {
    const newOb: Obligation = {
      ...obData,
      id: `ob-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setObligations((prev) => [newOb, ...prev]);
  };

  const toggleObligationActive = (id: string) => {
    setObligations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o))
    );
  };

  const deleteObligation = (id: string) => {
    setObligations((prev) => prev.filter((o) => o.id !== id));
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    messageType: MessageType = 'TEXT'
  ) => {
    const timestamp = new Date().toISOString();
    const encrypted = await encryptMessage(content, conversationId);

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversation_id: conversationId,
      sender_id: messageType === 'SYSTEM' ? undefined : currentUser.id,
      sender: messageType === 'SYSTEM' ? undefined : currentUser,
      content: encrypted.ciphertext,
      message_type: messageType,
      created_at: timestamp,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, lastMessage: newMsg } : c))
    );
  };

  const createGroupConversation = (title: string, memberUserIds: string[]): string => {
    const newId = `conv-grp-${Date.now()}`;
    const newGroup: Conversation = {
      id: newId,
      type: 'GROUP',
      title,
      created_at: new Date().toISOString(),
    };

    setConversations((prev) => [newGroup, ...prev]);
    sendMessage(newId, `Grupo "${title}" criado por ${currentUser.name}.`, 'SYSTEM');
    return newId;
  };

  const createPrivateConversation = (targetUserId: string): string => {
    const existing = conversations.find(
      (c) => c.type === 'PRIVATE' && c.title?.includes(targetUserId)
    );
    if (existing) return existing.id;

    const target = profiles.find((p) => p.id === targetUserId);
    const newId = `conv-priv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      type: 'PRIVATE',
      title: `${currentUser.name} & ${target?.name || 'Usuário'}`,
      created_at: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    return newId;
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'ACKNOWLEDGED', acknowledged_by: currentUser.id }
          : a
      )
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'RESOLVED', resolved_by: currentUser.id }
          : a
      )
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const runSimulationEvent = (event: '07:00' | '16:30' | '17:00') => {
    const timestamp = new Date().toISOString();

    if (event === '07:00') {
      areas.forEach((area) => {
        const convId = `conv-area-${area.id.replace('area-', '')}`;
        sendMessage(
          convId,
          `[SISTEMA - ROTINA DIÁRIA 07:00]\nÁrea: ${area.name}\nRotina diária inicializada.\nFavor verificar obrigações operacionais.`,
          'SYSTEM'
        );
      });
    } else if (event === '16:30') {
      areas.forEach((area) => {
        const convId = `conv-area-${area.id.replace('area-', '')}`;
        sendMessage(
          convId,
          `[SISTEMA - COBRANÇA 16:30]\nÁrea: ${area.name}\nSolicitação de registro de fechamento operacional de hoje.`,
          'SYSTEM'
        );
      });
    } else if (event === '17:00') {
      areas.forEach((area) => {
        const hasStatus = dailyStatuses.some(
          (st) => st.area_id === area.id && st.date === TODAY
        );
        if (!hasStatus) {
          const noRespAlert: Alert = {
            id: `alt-noresp-${area.id}-${Date.now()}`,
            area_id: area.id,
            type: 'NO_RESPONSE',
            priority: 'HIGH',
            status: 'OPEN',
            title: `[PENDENTE] ${area.name} — Fechamento Não Realizado`,
            description: `Área de ${area.name} não enviou o fechamento diário até as 17:00.`,
            created_at: timestamp,
          };
          setAlerts((prev) => [noRespAlert, ...prev]);

          const convId = `conv-area-${area.id.replace('area-', '')}`;
          sendMessage(
            convId,
            `[SISTEMA - TEMPO LIMITE EXCEDIDO]\nStatus: SEM RESPOSTA\nÁrea: ${area.name}\nHorário limite: 17:00`,
            'SYSTEM'
          );
        }
      });
    }
  };

  const weeklyReports: WeeklyReportItem[] = enrichedAreas.map((area) => {
    const green = area.currentStatus === 'GREEN' ? 4 : 3;
    const yellow = area.currentStatus === 'YELLOW' ? 1 : 0;
    const red = area.currentStatus === 'RED' ? 1 : 0;
    const noResp = area.currentStatus === 'NO_RESPONSE' ? 1 : 0;
    const total = green + yellow + red + noResp;
    const compliance = Math.round((green / total) * 100);

    return {
      id: `wrk-${area.id}`,
      area_id: area.id,
      area_name: area.name,
      manager_name: area.manager?.name || 'Não atribuído',
      green_days: green,
      yellow_days: yellow,
      red_days: red,
      no_response_days: noResp,
      compliance_score: compliance,
    };
  });

  return (
    <NexusContext.Provider
      value={{
        appMode,
        isTransitioningMode,
        setAppMode,
        currentUser,
        profiles,
        areas: enrichedAreas,
        obligations,
        dailyStatuses,
        alerts,
        conversations,
        messages,
        notifications,
        weeklyReports,
        financialMetrics,
        activeConversationId,
        hasFinancialAccess,
        setActiveConversationId,
        switchUser,
        submitDailyStatus,
        createObligation,
        toggleObligationActive,
        deleteObligation,
        sendMessage,
        createGroupConversation,
        createPrivateConversation,
        acknowledgeAlert,
        resolveAlert,
        markNotificationRead,
        runSimulationEvent,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('useNexus must be used within a NexusProvider');
  }
  return context;
};
