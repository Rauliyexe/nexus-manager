'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Profile,
  Area,
  Obligation,
  DailyStatus,
  DailyStatusType,
  Alert,
  Conversation,
  Message,
  MessageAttachment,
  NotificationItem,
  WeeklyReportItem,
  MessageType,
  FinancialMetrics,
  AppMode,
  HubTask,
  TaskStatus,
  TaskPriority,
  TaskComment,
  HubIntegration,
  SupportTicket,
  TicketCategory,
  TicketStatus,
  USER_ROLE_LABELS,
  ITApprovalRequest,
  OwnerCriticalAlert,
  ApprovalStatus,
  UserRole,
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
    role: 'DONO',
    department: 'Diretoria Geral',
    active: true,
  },
  {
    id: 'usr-dir',
    name: 'Carlos Santos',
    email: 'carlos.diretoria@nexus.com.br',
    phone: '(11) 98888-0001',
    role: 'DIRETOR',
    department: 'Diretoria Executiva',
    active: true,
  },
  {
    id: 'usr-mgr-9',
    name: 'Patricia Mendes',
    email: 'patricia.ti@nexus.com.br',
    phone: '(11) 98888-0010',
    role: 'DIRETOR_TI',
    department: 'TI',
    active: true,
  },
  {
    id: 'usr-ti-tech',
    name: 'Lucas Nogueira',
    email: 'lucas.suporte@nexus.com.br',
    phone: '(11) 98888-0020',
    role: 'EQUIPE_TI',
    department: 'TI',
    active: true,
  },
  {
    id: 'usr-mgr-1',
    name: 'Ricardo Almeida',
    email: 'ricardo.compras@nexus.com.br',
    phone: '(11) 98888-0002',
    role: 'GERENTE_DEPARTAMENTO',
    department: 'Comercial Compras',
    active: true,
  },
  {
    id: 'usr-mgr-2',
    name: 'Vanessa Lima',
    email: 'vanessa.vendas@nexus.com.br',
    phone: '(11) 98888-0003',
    role: 'GERENTE_DEPARTAMENTO',
    department: 'Comercial Vendas',
    active: true,
  },
  {
    id: 'usr-mgr-3',
    name: 'Marcos Oliveira',
    email: 'marcos.logistica@nexus.com.br',
    phone: '(11) 98888-0004',
    role: 'GERENTE_DEPARTAMENTO',
    department: 'Logística',
    active: true,
  },
  {
    id: 'usr-mgr-4',
    name: 'João Silva',
    email: 'joao.financeiro@nexus.com.br',
    phone: '(11) 98888-0005',
    role: 'GERENTE',
    department: 'Financeiro',
    active: true,
  },
  {
    id: 'usr-mgr-5',
    name: 'Gabriel Barbosa',
    email: 'gabriel.compras@nexus.com.br',
    phone: '(11) 98888-0006',
    role: 'GERENTE_DEPARTAMENTO',
    department: 'Compras',
    active: true,
  },
  {
    id: 'usr-mgr-6',
    name: 'Fernanda Souza',
    email: 'fernanda.contabilidade@nexus.com.br',
    phone: '(11) 98888-0007',
    role: 'GERENTE_DEPARTAMENTO',
    department: 'Contabilidade',
    active: true,
  },
  {
    id: 'usr-mgr-7',
    name: 'Ana Paula Costa',
    email: 'ana.rh@nexus.com.br',
    phone: '(11) 98888-0008',
    role: 'GERENTE_DEPARTAMENTO',
    department: 'Recursos Humanos',
    active: true,
  },
  {
    id: 'usr-mgr-8',
    name: 'Roberto Rocha',
    email: 'roberto.seguranca@nexus.com.br',
    phone: '(11) 98888-0009',
    role: 'SUPERVISOR',
    department: 'Monitoramento Segurança',
    active: true,
  },
  {
    id: 'usr-mgr-10',
    name: 'Beatriz Martins',
    email: 'beatriz.auditoria@nexus.com.br',
    phone: '(11) 98888-0011',
    role: 'GERENTE_DEPARTAMENTO',
    department: 'Auditoria',
    active: true,
  },
  {
    id: 'usr-emp-1',
    name: 'Juliana Mendes',
    email: 'juliana.operacoes@nexus.com.br',
    phone: '(11) 98888-0030',
    role: 'FUNCIONARIO',
    department: 'Logística',
    active: true,
  },
];

const SEED_AREAS: Area[] = [
  { id: 'area-1', name: 'Comercial Compras', description: 'Aquisição comercial de sucatas metálicas, insumos de cobre e matérias-primas.', manager_id: 'usr-mgr-1' },
  { id: 'area-2', name: 'Comercial Vendas', description: 'Vendas comerciais de vergalhão, arames e produtos de cobre Dcopper.', manager_id: 'usr-mgr-2' },
  { id: 'area-3', name: 'Logística', description: 'Gestão de transporte, expedição e logística da frota de entregas.', manager_id: 'usr-mgr-3' },
  { id: 'area-4', name: 'Financeiro', description: 'Gestão do fluxo de caixa, contas a pagar, receber e tesouraria.', manager_id: 'usr-mgr-4' },
  { id: 'area-5', name: 'Compras', description: 'Compras corporativas, suprimentos industriais e cotação de fornecedores.', manager_id: 'usr-mgr-5' },
  { id: 'area-6', name: 'Contabilidade', description: 'Escrituração contábil, apuração fiscal, obrigações acessórias e balanços.', manager_id: 'usr-mgr-6' },
  { id: 'area-7', name: 'Recursos Humanos', description: 'Gestão de pessoas, recrutamento, departamento pessoal e eSocial.', manager_id: 'usr-mgr-7' },
  { id: 'area-8', name: 'Monitoramento Segurança', description: 'Monitoramento de câmeras 24h, segurança patrimonial e controle de acesso.', manager_id: 'usr-mgr-8' },
  { id: 'area-9', name: 'TI', description: 'Infraestrutura de TI, redes, segurança cibernética e suporte técnico.', manager_id: 'usr-mgr-9' },
  { id: 'area-10', name: 'Auditoria', description: 'Auditoria interna de processos, conformidade legal e controle de qualidade.', manager_id: 'usr-mgr-10' },
];

const SEED_OBLIGATIONS: Obligation[] = [
  { id: 'ob-1', area_id: 'area-1', title: 'Cotação diária de Sucata de Cobre no LME', description: 'Atualizar tabela de preço de compra no comercial compras', frequency: 'DIARIA', due_time: '11:00', active: true, responsible_user_id: 'usr-mgr-1' },
  { id: 'ob-2', area_id: 'area-2', title: 'Relatório diário de carteira de vendas Dcopper', description: 'Conferir volume em toneladas faturado vs meta comercial', frequency: 'DIARIA', due_time: '16:00', active: true, responsible_user_id: 'usr-mgr-2' },
  { id: 'ob-3', area_id: 'area-3', title: 'Conferência de Checklist da Frota de Logística', description: 'Vistoria técnica de caminhões e roteirização de entregas', frequency: 'DIARIA', due_time: '08:00', active: true, responsible_user_id: 'usr-mgr-3' },
  { id: 'ob-4', area_id: 'area-4', title: 'Fechamento do fluxo de caixa e conciliação bancária', description: 'Validar extratos bancários e saldos corporativos', frequency: 'DIARIA', due_time: '15:30', active: true, responsible_user_id: 'usr-mgr-4' },
  { id: 'ob-5', area_id: 'area-5', title: 'Aprovação de Ordens de Compra industriais > R$ 50k', description: 'Verificar 3 cotações de fornecedores homologados', frequency: 'DIARIA', due_time: '16:30', active: true, responsible_user_id: 'usr-mgr-5' },
  { id: 'ob-6', area_id: 'area-6', title: 'Emissão de Guia SPED / Balancete Contábil', description: 'Verificar apuração de impostos e guias fiscais', frequency: 'MENSAL', due_time: '17:00', active: true, responsible_user_id: 'usr-mgr-6' },
  { id: 'ob-7', area_id: 'area-7', title: 'Envio de dados do eSocial para folha de pagamento', description: 'Transmitir lote de admissões e atestados ao governo', frequency: 'SEMANAL', due_time: '14:00', active: true, responsible_user_id: 'usr-mgr-7' },
  { id: 'ob-8', area_id: 'area-8', title: 'Ronda perimetral e auditoria de câmeras de segurança', description: 'Inspecionar monitoramento 24h dos galpões de fundição', frequency: 'DIARIA', due_time: '16:00', active: true, responsible_user_id: 'usr-mgr-8' },
  { id: 'ob-9', area_id: 'area-9', title: 'Auditoria de backup de servidores e links redundantes', description: 'Verificar integridade do cluster Supabase e firewall', frequency: 'DIARIA', due_time: '17:30', active: true, responsible_user_id: 'usr-mgr-9' },
  { id: 'ob-10', area_id: 'area-10', title: 'Auditoria interna de conformidade e licenças Cetesb', description: 'Validar renovação anual de condicionantes e normas', frequency: 'MENSAL', due_time: '17:00', active: true, responsible_user_id: 'usr-mgr-10' },
];

const TODAY = new Date().toISOString().split('T')[0];

const SEED_DAILY_STATUS: DailyStatus[] = [
  { id: 'st-1', area_id: 'area-1', user_id: 'usr-mgr-1', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:10:00Z` },
  { id: 'st-2', area_id: 'area-2', user_id: 'usr-mgr-2', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:15:00Z` },
  { id: 'st-3', area_id: 'area-3', user_id: 'usr-mgr-3', status: 'YELLOW', justification: 'Atraso na liberação da carreta #04 no pátio de triagem.', date: TODAY, created_at: `${TODAY}T16:42:00Z` },
  { id: 'st-4', area_id: 'area-4', user_id: 'usr-mgr-4', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:20:00Z` },
  { id: 'st-5', area_id: 'area-5', user_id: 'usr-mgr-5', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:25:00Z` },
  { id: 'st-6', area_id: 'area-6', user_id: 'usr-mgr-6', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:30:00Z` },
  { id: 'st-7', area_id: 'area-7', user_id: 'usr-mgr-7', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:05:00Z` },
  { id: 'st-8', area_id: 'area-8', user_id: 'usr-mgr-8', status: 'RED', justification: 'Falha detectada no sensor perimetral do portão 3.', date: TODAY, created_at: `${TODAY}T16:38:00Z` },
  { id: 'st-10', area_id: 'area-10', user_id: 'usr-mgr-10', status: 'GREEN', date: TODAY, created_at: `${TODAY}T16:35:00Z` },
];

const SEED_ALERTS: Alert[] = [
  {
    id: 'alt-1',
    area_id: 'area-8',
    type: 'CRITICAL',
    priority: 'CRITICAL',
    status: 'OPEN',
    title: '[CRÍTICO] Monitoramento Segurança — Sensor Perimetral Inoperante',
    description: 'Falha detectada no sensor perimetral do portão 3 às 16:38. Manutenção técnica acionada.',
    created_at: `${TODAY}T16:38:00Z`,
  },
  {
    id: 'alt-2',
    area_id: 'area-3',
    type: 'ATTENTION',
    priority: 'MEDIUM',
    status: 'OPEN',
    title: '[ATENÇÃO] Logística — Liberação Retida no Pátio',
    description: 'Atraso na liberação da carreta #04 no pátio de triagem às 16:42.',
    created_at: `${TODAY}T16:42:00Z`,
  },
  {
    id: 'alt-3',
    area_id: 'area-9',
    type: 'NO_RESPONSE',
    priority: 'HIGH',
    status: 'OPEN',
    title: '[PENDENTE] TI — Fechamento Diário Não Realizado',
    description: 'Área de TI não registrou o fechamento diário até o horário limite das 17:00.',
    created_at: `${TODAY}T17:00:00Z`,
  },
];

const SEED_CONVERSATIONS: Conversation[] = [
  { id: 'conv-area-4', type: 'AREA', title: 'Financeiro', area_id: 'area-4', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-1', type: 'AREA', title: 'Comercial Compras', area_id: 'area-1', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-2', type: 'AREA', title: 'Comercial Vendas', area_id: 'area-2', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-3', type: 'AREA', title: 'Logística', area_id: 'area-3', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-5', type: 'AREA', title: 'Compras', area_id: 'area-5', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-8', type: 'AREA', title: 'Monitoramento Segurança', area_id: 'area-8', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-area-9', type: 'AREA', title: 'TI & Infraestrutura', area_id: 'area-9', created_at: `${TODAY}T08:00:00Z` },
  { id: 'conv-grp-1', type: 'GROUP', title: 'Comitê Executivo • Diretoria + Gestão', created_at: `${TODAY}T09:00:00Z` },
  { id: 'conv-priv-1', type: 'PRIVATE', title: 'Carlos Santos (Diretoria)', created_at: `${TODAY}T10:00:00Z` },
  { id: 'conv-priv-2', type: 'PRIVATE', title: 'Ricardo Almeida (Compras)', created_at: `${TODAY}T10:15:00Z` },
];

const SEED_MESSAGES: Record<string, Message[]> = {
  'conv-area-4': [
    {
      id: 'msg-4-1',
      conversation_id: 'conv-area-4',
      sender_id: 'usr-mgr-4',
      sender: SEED_PROFILES.find((p) => p.id === 'usr-mgr-4'),
      content: 'A conciliação bancária do lote principal foi concluída sem divergências.',
      message_type: 'TEXT',
      created_at: `${TODAY}T14:20:00Z`,
      pinned: true,
      reactions: [{ emoji: '👍', count: 2, users: ['Carlos Santos', 'Mariana Lima'] }],
      attachments: [
        {
          name: 'fechamento-conciliacao-agosto-2026.pdf',
          size: '1.8 MB',
          type: 'PDF',
        },
      ],
      threadCount: 2,
      threadReplies: [
        {
          id: 'reply-4-1-1',
          conversation_id: 'conv-area-4',
          parentMessageId: 'msg-4-1',
          sender_id: 'usr-admin',
          sender: SEED_PROFILES.find((p) => p.id === 'usr-admin'),
          content: 'Excelente Fernanda! Todas as contas do Santander e Itaú estão validadas?',
          message_type: 'TEXT',
          created_at: `${TODAY}T14:25:00Z`,
        },
        {
          id: 'reply-4-1-2',
          conversation_id: 'conv-area-4',
          parentMessageId: 'msg-4-1',
          sender_id: 'usr-mgr-4',
          sender: SEED_PROFILES.find((p) => p.id === 'usr-mgr-4'),
          content: 'Sim, saldos 100% batidos conforme extratos consolidados.',
          message_type: 'TEXT',
          created_at: `${TODAY}T14:28:00Z`,
        },
      ],
    },
    {
      id: 'msg-4-2',
      conversation_id: 'conv-area-4',
      sender_id: 'usr-admin',
      sender: SEED_PROFILES.find((p) => p.id === 'usr-admin'),
      content: 'Precisamos preparar a prévia do EBITDA para a reunião de conselho amanhã às 10h.',
      message_type: 'TEXT',
      created_at: `${TODAY}T15:10:00Z`,
      reactions: [{ emoji: '🚀', count: 1, users: ['Fernanda Lima'] }],
    },
  ],
  'conv-area-1': [
    {
      id: 'msg-1-1',
      conversation_id: 'conv-area-1',
      sender_id: 'usr-mgr-1',
      sender: SEED_PROFILES.find((p) => p.id === 'usr-mgr-1'),
      content: 'Cotação LME do Cobre fechou em alta hoje ($9.480/ton). Reajustando tabela de compra de sucata mista.',
      message_type: 'TEXT',
      created_at: `${TODAY}T11:02:00Z`,
      pinned: true,
      attachments: [
        {
          name: 'tabela-cotacao-lme-diaria.xlsx',
          size: '420 KB',
          type: 'SHEET',
        },
      ],
      reactions: [{ emoji: '📈', count: 3, users: ['Carlos Santos', 'Mariana Lima', 'Fernanda Lima'] }],
    },
    {
      id: 'msg-1-2',
      conversation_id: 'conv-area-1',
      sender_id: 'usr-mgr-1',
      sender: SEED_PROFILES.find((p) => p.id === 'usr-mgr-1'),
      content: 'Precisamos agendar a auditoria do lote #992 de sucata de cobre com o setor de qualidade antes de sexta.',
      message_type: 'TEXT',
      created_at: `${TODAY}T11:30:00Z`,
    },
  ],
  'conv-grp-1': [
    {
      id: 'msg-grp-1',
      conversation_id: 'conv-grp-1',
      sender_id: 'usr-dir',
      sender: SEED_PROFILES.find((p) => p.id === 'usr-dir'),
      content: 'Alinhamento estratégico do trimestre: foco absoluto em manter a margem de contribuição acima de 18% e zerar atrasos logísticos.',
      message_type: 'TEXT',
      created_at: `${TODAY}T09:15:00Z`,
      pinned: true,
      reactions: [{ emoji: '🎯', count: 4, users: ['Carlos Santos', 'Ricardo Almeida', 'Mariana Lima', 'Fernanda Lima'] }],
    },
  ],
};

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ntf-1',
    user_id: 'usr-admin',
    title: '[CRÍTICO] Ocorrência em Monitoramento Segurança',
    message: 'Roberto Rocha registrou status crítico: Falha no sensor perimetral.',
    type: 'CRITICAL',
    read: false,
    link: '/areas/area-8',
    created_at: `${TODAY}T16:38:00Z`,
  },
];

const SEED_DELEGATED_TASKS: HubTask[] = [
  {
    id: 'task-1',
    code: 'TASK-0000',
    title: 'Cotação & Auditoria de Sucata de Cobre — Lote #992',
    description: 'Realizar auditoria física e cotação de pureza do lote de sucata proveniente do galpão SP.',
    area_id: 'area-1',
    area_name: 'Comercial Compras',
    delegated_by_id: 'usr-dir',
    delegated_by_name: 'Carlos Santos',
    delegated_by_role: 'Diretor Executivo',
    delegated_by_dept: 'Diretoria Geral',
    delegated_by_code: 'MAT-0001',
    delegated_by_email: 'carlos.santos@nexus.com.br',
    assigned_to_id: 'usr-mgr-1',
    assigned_to_name: 'Ricardo Almeida',
    assigned_to_role: 'Gerente Comercial Compras',
    assigned_to_dept: 'Comercial Compras',
    assigned_to_code: 'MAT-0104',
    assigned_to_email: 'ricardo.compras@nexus.com.br',
    started_at: `${TODAY}T11:05:00Z`,
    started_by_name: 'Ricardo Almeida',
    started_by_role: 'Gerente Comercial Compras',
    started_by_code: 'MAT-0104',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: `${TODAY}`,
    created_at: `${TODAY}T10:30:15Z`,
    updated_at: `${TODAY}T14:15:00Z`,
    comments: [
      {
        id: 'cm-1',
        user_id: 'usr-dir',
        user_name: 'Carlos Santos',
        user_role: 'DIRECTOR',
        content: 'Ricardo, por favor verificar se a liga atende ao padrão 99.8% de pureza.',
        created_at: `${TODAY}T10:32:00Z`,
      },
      {
        id: 'cm-2',
        user_id: 'usr-mgr-1',
        user_name: 'Ricardo Almeida',
        user_role: 'MANAGER',
        content: 'Inspeção iniciada. O laboratório de ensaios já retirou 3 amostras do lote.',
        created_at: `${TODAY}T14:15:00Z`,
      },
    ],
  },
  {
    id: 'task-2',
    code: 'TASK-0001',
    title: 'Manutenção Preventiva do Portão 3 & Sensores Perimetrais',
    description: 'Inspecionar sensores de presença infravermelho e recalibrar alarme no portão 3.',
    area_id: 'area-8',
    area_name: 'Monitoramento Segurança',
    delegated_by_id: 'usr-admin',
    delegated_by_name: 'Admin Nexus',
    delegated_by_role: 'Supervisão de TI / Operações',
    delegated_by_dept: 'TI',
    delegated_by_code: 'MAT-0002',
    delegated_by_email: 'admin@nexus.com.br',
    assigned_to_id: 'usr-mgr-8',
    assigned_to_name: 'Roberto Rocha',
    assigned_to_role: 'Gestor de Monitoramento Segurança',
    assigned_to_dept: 'Monitoramento Segurança',
    assigned_to_code: 'MAT-0108',
    assigned_to_email: 'roberto.seguranca@nexus.com.br',
    status: 'OPEN',
    priority: 'CRITICAL',
    due_date: `${TODAY}`,
    created_at: `${TODAY}T16:40:00Z`,
    updated_at: `${TODAY}T16:40:00Z`,
    comments: [
      {
        id: 'cm-3',
        user_id: 'usr-admin',
        user_name: 'Admin Nexus',
        user_role: 'ADMIN',
        content: 'Chamado urgente gerado automaticamente devido a alerta de falha no sensor.',
        created_at: `${TODAY}T16:40:00Z`,
      },
    ],
  },
  {
    id: 'task-3',
    code: 'TASK-0002',
    title: 'Conciliação Extraordinária de Câmbio USD/BRL do Contrato LME',
    description: 'Efetuar trava cambial (Forward Lock) para cobrir carregamento de vergalhão faturado.',
    area_id: 'area-4',
    area_name: 'Financeiro',
    delegated_by_id: 'usr-dir',
    delegated_by_name: 'Carlos Santos',
    delegated_by_role: 'Diretor Executivo',
    delegated_by_dept: 'Diretoria Geral',
    delegated_by_code: 'MAT-0001',
    delegated_by_email: 'carlos.santos@nexus.com.br',
    assigned_to_id: 'usr-mgr-4',
    assigned_to_name: 'João Silva',
    assigned_to_role: 'Gerente Financeiro',
    assigned_to_dept: 'Financeiro',
    assigned_to_code: 'MAT-0105',
    assigned_to_email: 'joao.financeiro@nexus.com.br',
    started_at: `${TODAY}T09:15:00Z`,
    started_by_name: 'João Silva',
    started_by_role: 'Gerente Financeiro',
    started_by_code: 'MAT-0105',
    completed_at: `${TODAY}T15:30:22Z`,
    completed_by_name: 'João Silva',
    completed_by_role: 'Gerente Financeiro',
    completed_by_code: 'MAT-0105',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    due_date: `${TODAY}`,
    created_at: `${TODAY}T09:00:00Z`,
    updated_at: `${TODAY}T15:30:22Z`,
    comments: [
      {
        id: 'cm-4',
        user_id: 'usr-mgr-4',
        user_name: 'João Silva',
        user_role: 'MANAGER',
        content: 'Trava concluída no valor de R$ 5,4200 com a tesouraria do BTG Pactual.',
        created_at: `${TODAY}T15:30:22Z`,
      },
    ],
  },
  {
    id: 'task-4',
    code: 'TASK-0003',
    title: 'Auditoria de Licença Ambiental Cetesb Fundição 2',
    description: 'Revisar laudos de emissão de fumaça e documentação para renovação anual.',
    area_id: 'area-10',
    area_name: 'Auditoria',
    delegated_by_id: 'usr-dir',
    delegated_by_name: 'Carlos Santos',
    delegated_by_role: 'Diretor Executivo',
    delegated_by_dept: 'Diretoria Geral',
    delegated_by_code: 'MAT-0001',
    delegated_by_email: 'carlos.santos@nexus.com.br',
    assigned_to_id: 'usr-mgr-10',
    assigned_to_name: 'Beatriz Martins',
    assigned_to_role: 'Gerente de Auditoria',
    assigned_to_dept: 'Auditoria',
    assigned_to_code: 'MAT-0111',
    assigned_to_email: 'beatriz.auditoria@nexus.com.br',
    started_at: `${TODAY}T11:30:00Z`,
    started_by_name: 'Beatriz Martins',
    started_by_role: 'Gerente de Auditoria',
    started_by_code: 'MAT-0111',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due_date: `${TODAY}`,
    created_at: `${TODAY}T11:00:00Z`,
    updated_at: `${TODAY}T11:30:00Z`,
    comments: [
      {
        id: 'cm-5',
        user_id: 'usr-mgr-10',
        user_name: 'Beatriz Martins',
        user_role: 'MANAGER',
        content: 'Documentação reunida. Agendada visita do engenheiro ambiental para quinta-feira.',
        created_at: `${TODAY}T11:30:00Z`,
      },
    ],
  },
];

const SEED_INTEGRATIONS: HubIntegration[] = [
  {
    id: 'int-1',
    name: 'Feed LME Copper (London Metal Exchange)',
    type: 'API',
    status: 'ONLINE',
    lastSync: 'Há 2 minutos',
    latencyMs: 142,
    endpointUrl: 'api.lme.com/v1/copper/spot',
    description: 'Cotação contínua em tempo real do preço do Cobre USD/ton.',
  },
  {
    id: 'int-2',
    name: 'Banco Central do Brasil (BACEN PTAX)',
    type: 'API',
    status: 'ONLINE',
    lastSync: 'Há 5 minutos',
    latencyMs: 88,
    endpointUrl: 'olinda.bcb.gov.br/ptax/v1',
    description: 'Taxa oficial diária de Câmbio USD/BRL e indicadores de inflação.',
  },
  {
    id: 'int-3',
    name: 'Supabase Database Cluster (Projetos & Histórico)',
    type: 'DATABASE',
    status: 'ONLINE',
    lastSync: 'Ativo (Real-time WS)',
    latencyMs: 24,
    endpointUrl: 'nexus-prod.supabase.co',
    description: 'Persistência centralizada de rituais, delegamento de tarefas e logs.',
  },
  {
    id: 'int-4',
    name: 'ERP Dcopper Sync Industrial',
    type: 'ERP',
    status: 'SYNCING',
    lastSync: 'Sincronizando...',
    latencyMs: 210,
    endpointUrl: 'erp.dcopper.internal/sync',
    description: 'Integração com faturamento, inventário de sucata e ordens de produção.',
  },
  {
    id: 'int-5',
    name: 'Bot Telegram / WhatsApp Alertas Operacionais',
    type: 'WEBHOOK',
    status: 'ONLINE',
    lastSync: 'Há 1 minuto',
    latencyMs: 115,
    endpointUrl: 'api.telegram.org/bot-nexus-alerts',
    description: 'Notificações imediatas em pop-up e mensagens para gestores em plantão.',
  },
];

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'tck-1',
    code: 'INC-0000',
    title: 'Substituição de Switch no Pátio de Logística #2',
    description: 'Switch de rede apresentou perda de pacotes durante a leitura de barcode de cargas.',
    category: 'TI_SUPPORTE',
    area_id: 'area-3',
    area_name: 'Logística',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    created_at: `${TODAY}T09:30:00Z`,
    updated_at: `${TODAY}T10:15:00Z`,
    created_by_id: 'usr-mgr-3',
    created_by_name: 'Marcos Oliveira',
    created_by_role: 'Gerente de Logística',
    created_by_code: 'MAT-0104',
    assigned_to_name: 'Patricia Mendes',
    assigned_to_code: 'MAT-0110',
  },
  {
    id: 'tck-2',
    code: 'INC-0001',
    title: 'Recalibração do Sensor Perimetral Portão 3',
    description: 'Alarme perimetral disparando falso positivo por interferência no sensor óptico.',
    category: 'SEGURANCA',
    area_id: 'area-8',
    area_name: 'Monitoramento Segurança',
    priority: 'CRITICAL',
    status: 'OPEN',
    created_at: `${TODAY}T16:38:00Z`,
    updated_at: `${TODAY}T16:38:00Z`,
    created_by_id: 'usr-admin',
    created_by_name: 'Admin Nexus',
    created_by_role: 'NOC / TI',
    created_by_code: 'MAT-0002',
    assigned_to_name: 'Roberto Rocha',
    assigned_to_code: 'MAT-0108',
  },
  {
    id: 'tck-3',
    code: 'INC-0002',
    title: 'Solicitação de Acesso ao Módulo SPED Contábil',
    description: 'Liberar credencial de acesso de leitura para novos analistas do setor de Contabilidade.',
    category: 'TI_SUPPORTE',
    area_id: 'area-6',
    area_name: 'Contabilidade',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    created_at: `${TODAY}T11:00:00Z`,
    updated_at: `${TODAY}T14:20:00Z`,
    created_by_id: 'usr-mgr-6',
    created_by_name: 'Fernanda Souza',
    created_by_role: 'Gerente de Contabilidade',
    created_by_code: 'MAT-0107',
    assigned_to_name: 'Patricia Mendes',
    assigned_to_code: 'MAT-0110',
    resolution_notes: 'Credenciais concedidas no sistema de privilégios com permissão SPED_READONLY.',
  },
];

const SEED_IT_REQUESTS: ITApprovalRequest[] = [
  {
    id: 'req-1',
    code: 'REQ-0001',
    title: 'Alteração de Cargo: Juliana Mendes',
    description: 'Solicitação para promover funcionária do setor de Logística para Gerente de Departamento.',
    requested_by_name: 'Lucas Nogueira',
    requested_by_role: 'Equipe de TI',
    target_user_id: 'usr-emp-1',
    target_user_name: 'Juliana Mendes',
    current_role: 'FUNCIONARIO',
    proposed_role: 'GERENTE_DEPARTAMENTO',
    sensitivity: 'HIGH',
    status: 'PENDING_TI_APPROVAL',
    created_at: `${TODAY}T14:10:00Z`,
  },
  {
    id: 'req-2',
    code: 'REQ-0002',
    title: 'Elevação de Privilégios: Roberto Rocha',
    description: 'Concessão de privilégios para elevação ao cargo de Diretor de TI.',
    requested_by_name: 'Admin Nexus',
    requested_by_role: 'Dono',
    target_user_id: 'usr-mgr-8',
    target_user_name: 'Roberto Rocha',
    current_role: 'SUPERVISOR',
    proposed_role: 'DIRETOR_TI',
    sensitivity: 'CRITICAL',
    status: 'PENDING_TI_APPROVAL',
    created_at: `${TODAY}T16:45:00Z`,
  },
];

interface NexusContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  appMode: AppMode;
  isTransitioningMode: boolean;
  setAppMode: (mode: AppMode) => void;
  hubRoleView: 'OWNER' | 'EMPLOYEE';
  setHubRoleView: (roleView: 'OWNER' | 'EMPLOYEE') => void;
  currentUser: Profile;
  profiles: Profile[];
  areas: Area[];
  obligations: Obligation[];
  dailyStatuses: DailyStatus[];
  alerts: Alert[];
  tasks: HubTask[];
  tickets: SupportTicket[];
  itRequests: ITApprovalRequest[];
  activeOwnerCriticalAlert: OwnerCriticalAlert | null;
  integrations: HubIntegration[];
  activePopUpTask: HubTask | null;
  incomingTaskNotification: { task: HubTask; time: string } | null;
  setActivePopUpTask: (task: HubTask | null) => void;
  dismissIncomingTaskNotification: () => void;
  delegateTask: (taskData: {
    title: string;
    description: string;
    area_id: string;
    assigned_to_id?: string;
    priority: TaskPriority;
    due_date: string;
    initial_comment?: string;
  }) => HubTask;
  createTicket: (ticketData: {
    title: string;
    description: string;
    category: TicketCategory;
    area_id: string;
    priority: TaskPriority;
  }) => SupportTicket;
  updateTicketStatus: (ticketId: string, status: TicketStatus, notes?: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateUserProfileRole: (targetUserId: string, proposedRole: UserRole) => void;
  approveITRequest: (requestId: string) => void;
  rejectITRequest: (requestId: string, reason?: string) => void;
  dismissOwnerCriticalAlert: () => void;
  addTaskComment: (taskId: string, content: string) => void;
  triggerIntegrationSync: (integrationId: string) => Promise<void>;
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
  sendMessage: (
    conversationId: string,
    content: string,
    messageType?: MessageType,
    attachments?: MessageAttachment[]
  ) => Promise<void>;
  togglePinMessage: (conversationId: string, messageId: string) => void;
  addReaction: (conversationId: string, messageId: string, emoji: string) => void;
  sendThreadReply: (conversationId: string, parentMessageId: string, content: string) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => void;
  createGroupConversation: (title: string, memberUserIds: string[]) => string;
  createPrivateConversation: (targetUserId: string) => string;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  markNotificationRead: (id: string) => void;
  runSimulationEvent: (event: '07:00' | '16:30' | '17:00') => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [appMode, setAppModeState] = useState<AppMode>('OPERATIONS');
  const [isTransitioningMode, setIsTransitioningMode] = useState<boolean>(false);
  const [hubRoleView, setHubRoleView] = useState<'OWNER' | 'EMPLOYEE'>('OWNER');

  useEffect(() => {
    const savedTheme = localStorage.getItem('copper_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('copper_theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };
  const [profiles, setProfiles] = useState<Profile[]>(SEED_PROFILES);
  const [currentUser, setCurrentUser] = useState<Profile>(SEED_PROFILES[0]);
  const [areas, setAreas] = useState<Area[]>(SEED_AREAS);
  const [obligations, setObligations] = useState<Obligation[]>(SEED_OBLIGATIONS);
  const [dailyStatuses, setDailyStatuses] = useState<DailyStatus[]>(SEED_DAILY_STATUS);
  const [alerts, setAlerts] = useState<Alert[]>(SEED_ALERTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED_TICKETS);
  const [itRequests, setItRequests] = useState<ITApprovalRequest[]>(SEED_IT_REQUESTS);
  const [activeOwnerCriticalAlert, setActiveOwnerCriticalAlert] = useState<OwnerCriticalAlert | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(SEED_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics>(SEED_FINANCIAL_METRICS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-area-5');

  // Real Market Data Polling & Synchronization Engine (Next.js API Server Route)
  useEffect(() => {
    let isSubscribed = true;

    const fetchRealMarketData = async () => {
      try {
        const res = await fetch('/api/market-data');
        if (res.ok) {
          const data = await res.json();
          if (!isSubscribed) return;

          setFinancialMetrics((prev) => ({
            ...prev,
            copperSpotUSD: data.copperSpotUSD || prev.copperSpotUSD,
            usdBrlRate: data.usdBrlRate || prev.usdBrlRate,
            copperSpotBRLPerKg: data.copperSpotBRLPerKg || prev.copperSpotBRLPerKg,
            scrapBuyPriceBRLPerKg: data.scrapBuyPriceBRLPerKg || prev.scrapBuyPriceBRLPerKg,
            copperMarginPerTon: data.copperMarginPerTon || prev.copperMarginPerTon,
            connectionState: data.connectionState || 'LIVE',
            lastUpdateTimestamp: data.lastUpdateTimestamp || new Date().toISOString(),
            providerInfo: data.provider || 'AwesomeAPI + Banco Central',
            marketStatus: data.marketStatus || 'OPEN',
            marketStatusReason: data.marketStatusReason || 'Mercado Aberto',
          }));
        }
      } catch (err) {
        console.warn('[RealMarketData Sync Warning]:', err);
        if (!isSubscribed) return;
        setFinancialMetrics((prev) => ({
          ...prev,
          connectionState: 'DEGRADED',
        }));
      }
    };

    fetchRealMarketData();
    const interval = setInterval(fetchRealMarketData, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

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
    if (user.role === 'DONO' || user.role === 'DIRETOR' || user.role === 'DIRETOR_TI') return true;
    if (
      (user.role === 'GERENTE' || user.role === 'GERENTE_DEPARTAMENTO') &&
      (user.department?.includes('Financeiro') || user.department?.includes('Contabilidade') || user.department?.includes('Auditoria'))
    ) {
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
      if (found.role === 'DONO') {
        setHubRoleView('OWNER');
      } else {
        setHubRoleView('EMPLOYEE');
      }
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
    messageType: MessageType = 'TEXT',
    attachments?: MessageAttachment[]
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
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, lastMessage: newMsg } : c))
    );
  };

  const togglePinMessage = (conversationId: string, messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) =>
        m.id === messageId ? { ...m, pinned: !m.pinned } : m
      ),
    }));
  };

  const addReaction = (conversationId: string, messageId: string, emoji: string) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || [];
        const existingReactionIndex = currentReactions.findIndex((r) => r.emoji === emoji);

        let newReactions = [...currentReactions];
        if (existingReactionIndex > -1) {
          const currentR = newReactions[existingReactionIndex];
          const hasUser = currentR.users.includes(currentUser.name);
          if (hasUser) {
            // Remove user reaction
            const newUsers = currentR.users.filter((u) => u !== currentUser.name);
            if (newUsers.length === 0) {
              newReactions.splice(existingReactionIndex, 1);
            } else {
              newReactions[existingReactionIndex] = {
                ...currentR,
                count: newUsers.length,
                users: newUsers,
              };
            }
          } else {
            // Add user to existing reaction
            newReactions[existingReactionIndex] = {
              ...currentR,
              count: currentR.count + 1,
              users: [...currentR.users, currentUser.name],
            };
          }
        } else {
          // Add new reaction emoji
          newReactions.push({
            emoji,
            count: 1,
            users: [currentUser.name],
          });
        }
        return { ...m, reactions: newReactions };
      }),
    }));
  };

  const sendThreadReply = async (
    conversationId: string,
    parentMessageId: string,
    content: string
  ) => {
    const timestamp = new Date().toISOString();
    const replyMsg: Message = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversation_id: conversationId,
      parentMessageId,
      sender_id: currentUser.id,
      sender: currentUser,
      content,
      message_type: 'TEXT',
      created_at: timestamp,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).map((m) => {
        if (m.id !== parentMessageId) return m;
        const existingReplies = m.threadReplies || [];
        return {
          ...m,
          threadReplies: [...existingReplies, replyMsg],
          threadCount: (m.threadCount || 0) + 1,
        };
      }),
    }));
  };

  const deleteMessage = (conversationId: string, messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).filter((m) => m.id !== messageId),
    }));
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

  const [tasks, setTasks] = useState<HubTask[]>(SEED_DELEGATED_TASKS);
  const [integrations, setIntegrations] = useState<HubIntegration[]>(SEED_INTEGRATIONS);
  const [activePopUpTask, setActivePopUpTask] = useState<HubTask | null>(null);
  const [incomingTaskNotification, setIncomingTaskNotification] = useState<{ task: HubTask; time: string } | null>(null);

  const dismissIncomingTaskNotification = () => {
    setIncomingTaskNotification(null);
  };

  const delegateTask = (taskData: {
    title: string;
    description: string;
    area_id: string;
    assigned_to_id?: string;
    priority: TaskPriority;
    due_date: string;
    initial_comment?: string;
  }): HubTask => {
    const area = areas.find((a) => a.id === taskData.area_id);
    const assignedUser = profiles.find((p) => p.id === taskData.assigned_to_id);
    const nowISO = new Date().toISOString();
    const taskId = `task-${Date.now()}`;
    const seqCode = `TASK-${String(tasks.length).padStart(4, '0')}`;

    const comments: TaskComment[] = [];
    if (taskData.initial_comment && taskData.initial_comment.trim() !== '') {
      comments.push({
        id: `cm-${Date.now()}`,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        content: taskData.initial_comment.trim(),
        created_at: nowISO,
      });
    }

    const newTask: HubTask = {
      id: taskId,
      code: seqCode,
      title: taskData.title,
      description: taskData.description,
      area_id: taskData.area_id,
      area_name: area?.name || 'Geral',
      delegated_by_id: currentUser.id,
      delegated_by_name: currentUser.name,
      delegated_by_role: USER_ROLE_LABELS[currentUser.role] || currentUser.role,
      delegated_by_dept: currentUser.department || 'Diretoria Geral',
      delegated_by_code: 'MAT-0001',
      delegated_by_email: currentUser.email || 'carlos.santos@nexus.com.br',
      assigned_to_id: taskData.assigned_to_id,
      assigned_to_name: assignedUser?.name || area?.manager?.name || 'Setor ' + (area?.name || ''),
      assigned_to_role: assignedUser ? 'Gerente de Área' : 'Analista Responsável',
      assigned_to_dept: area?.name || 'Operacional',
      assigned_to_code: assignedUser ? `MAT-01${assignedUser.id.replace('usr-mgr-', '').padStart(2, '0')}` : 'MAT-0100',
      assigned_to_email: assignedUser?.email || 'operacoes@nexus.com.br',
      status: 'OPEN',
      priority: taskData.priority,
      due_date: taskData.due_date || TODAY,
      created_at: nowISO,
      updated_at: nowISO,
      comments,
    };

    setTasks((prev) => [newTask, ...prev]);

    // Trigger Pop-up Toast
    setIncomingTaskNotification({ task: newTask, time: 'Agora mesmo' });

    // Also push a global notification item
    const notifItem: NotificationItem = {
      id: `ntf-task-${Date.now()}`,
      user_id: assignedUser?.id || currentUser.id,
      title: `[NOVA TAREFA] ${newTask.code} — ${newTask.title}`,
      message: `${currentUser.name} delegou uma nova tarefa para ${newTask.area_name}.`,
      type: newTask.priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      read: false,
      link: `/hub?task=${newTask.id}`,
      created_at: nowISO,
    };
    setNotifications((prev) => [notifItem, ...prev]);

    return newTask;
  };

  const createTicket = (ticketData: {
    title: string;
    description: string;
    category: TicketCategory;
    area_id: string;
    priority: TaskPriority;
  }): SupportTicket => {
    const area = areas.find((a) => a.id === ticketData.area_id);
    const nowISO = new Date().toISOString();
    const ticketId = `tck-${Date.now()}`;
    const seqCode = `INC-${String(tickets.length).padStart(4, '0')}`;

    const newTicket: SupportTicket = {
      id: ticketId,
      code: seqCode,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      area_id: ticketData.area_id,
      area_name: area?.name || 'Geral',
      priority: ticketData.priority,
      status: 'OPEN',
      created_at: nowISO,
      updated_at: nowISO,
      created_by_id: currentUser.id,
      created_by_name: currentUser.name,
      created_by_role: USER_ROLE_LABELS[currentUser.role] || currentUser.role,
      created_by_code: 'MAT-0001',
      assigned_to_name: area?.manager?.name || 'Equipe de Atendimento',
      assigned_to_code: 'MAT-0110',
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Also push notification
    const notifItem: NotificationItem = {
      id: `ntf-tck-${Date.now()}`,
      user_id: currentUser.id,
      title: `[NOVO CHAMADO] ${newTicket.code} — ${newTicket.title}`,
      message: `${currentUser.name} abriu um chamado operacional para ${newTicket.area_name}.`,
      type: newTicket.priority === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      read: false,
      link: `/tasks?ticket=${newTicket.id}`,
      created_at: nowISO,
    };
    setNotifications((prev) => [notifItem, ...prev]);

    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, notes?: string) => {
    const nowISO = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            updated_at: nowISO,
            ...(notes ? { resolution_notes: notes } : {}),
          };
        }
        return t;
      })
    );
  };

  const updateUserProfileRole = (targetUserId: string, proposedRole: UserRole) => {
    const targetUser = profiles.find((p) => p.id === targetUserId);
    if (!targetUser) return;
    if (targetUser.role === proposedRole) return;

    const nowISO = new Date().toISOString();
    const isSensitive =
      proposedRole === 'DONO' ||
      proposedRole === 'DIRETOR' ||
      proposedRole === 'DIRETOR_TI' ||
      targetUser.role === 'DIRETOR_TI';
    const isCritical = proposedRole === 'DONO' || proposedRole === 'DIRETOR_TI';

    const reqId = `req-${Date.now()}`;
    const seqCode = `REQ-${String(itRequests.length + 1).padStart(4, '0')}`;

    const newRequest: ITApprovalRequest = {
      id: reqId,
      code: seqCode,
      title: `Alteração de Cargo: ${targetUser.name}`,
      description: `Solicitação para alterar cargo de ${USER_ROLE_LABELS[targetUser.role]} para ${USER_ROLE_LABELS[proposedRole]}.`,
      requested_by_name: currentUser.name,
      requested_by_role: USER_ROLE_LABELS[currentUser.role] || currentUser.role,
      target_user_id: targetUser.id,
      target_user_name: targetUser.name,
      current_role: targetUser.role,
      proposed_role: proposedRole,
      sensitivity: isCritical ? 'CRITICAL' : isSensitive ? 'HIGH' : 'MEDIUM',
      status: 'PENDING_TI_APPROVAL',
      created_at: nowISO,
    };

    setItRequests((prev) => [newRequest, ...prev]);

    // If action is CRITICAL or HIGH, trigger Pop-up for the Owner
    if (isCritical || isSensitive) {
      setActiveOwnerCriticalAlert({
        id: `crit-${Date.now()}`,
        protocol: `ALERT-CRIT-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `[ALERTA CRÍTICO DE TI] Solicitação de Cargo Sensível`,
        description: `O colaborador ${currentUser.name} (${USER_ROLE_LABELS[currentUser.role]}) solicitou alteração do cargo de ${targetUser.name} para ${USER_ROLE_LABELS[proposedRole]}. Esta operação requer aprovação final da Diretoria de TI.`,
        author_name: currentUser.name,
        author_role: USER_ROLE_LABELS[currentUser.role] || currentUser.role,
        timestamp: nowISO,
        target_name: targetUser.name,
        action_summary: `Elevação / Alteração de Privilégio: ${USER_ROLE_LABELS[targetUser.role]} ➔ ${USER_ROLE_LABELS[proposedRole]}`,
      });
    }

    // Push notification to TI Director
    const notifItem: NotificationItem = {
      id: `ntf-ti-${Date.now()}`,
      user_id: 'usr-mgr-9', // Patricia Mendes (Diretora de TI)
      title: `[SOLICITAÇÃO TI] ${newRequest.code} — Pendente de Aprovação`,
      message: `${currentUser.name} solicitou alteração de cargo para ${targetUser.name}.`,
      type: isCritical ? 'CRITICAL' : 'WARNING',
      read: false,
      link: `/ti-console?req=${reqId}`,
      created_at: nowISO,
    };
    setNotifications((prev) => [notifItem, ...prev]);
  };

  const approveITRequest = (requestId: string) => {
    const req = itRequests.find((r) => r.id === requestId);
    if (!req) return;

    const nowISO = new Date().toISOString();

    // 1. Update request status to APPROVED
    setItRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED',
              approved_by_name: currentUser.name,
              approved_at: nowISO,
            }
          : r
      )
    );

    // 2. Update target user role in profiles list
    setProfiles((prev) =>
      prev.map((p) => (p.id === req.target_user_id ? { ...p, role: req.proposed_role } : p))
    );

    // If current user was updated, update currentUser state as well
    if (currentUser.id === req.target_user_id) {
      setCurrentUser((prev) => ({ ...prev, role: req.proposed_role }));
    }
  };

  const rejectITRequest = (requestId: string, reason?: string) => {
    setItRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              rejection_reason: reason || 'Rejeitado pela Diretoria de TI.',
            }
          : r
      )
    );
  };

  const dismissOwnerCriticalAlert = () => {
    setActiveOwnerCriticalAlert(null);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const nowISO = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isStarting = status === 'IN_PROGRESS' && !t.started_at;
          const isCompleting = status === 'COMPLETED';

          const updated: HubTask = {
            ...t,
            status,
            updated_at: nowISO,
            ...(isStarting
              ? {
                  started_at: nowISO,
                  started_by_name: currentUser.name,
                  started_by_role: USER_ROLE_LABELS[currentUser.role] || currentUser.role,
                  started_by_code: 'MAT-0001',
                }
              : {}),
            ...(isCompleting
              ? {
                  completed_at: nowISO,
                  completed_by_name: currentUser.name,
                  completed_by_role: USER_ROLE_LABELS[currentUser.role] || currentUser.role,
                  completed_by_code: 'MAT-0001',
                }
              : {}),
          };

          if (activePopUpTask?.id === taskId) {
            setActivePopUpTask(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const addTaskComment = (taskId: string, content: string) => {
    if (!content.trim()) return;
    const nowISO = new Date().toISOString();
    const newComment: TaskComment = {
      id: `cm-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      content: content.trim(),
      created_at: nowISO,
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            updated_at: nowISO,
            comments: [...t.comments, newComment],
          };
          if (activePopUpTask?.id === taskId) {
            setActivePopUpTask(updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const triggerIntegrationSync = async (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, status: 'SYNCING', lastSync: 'Sincronizando...' } : i))
    );
    await new Promise((res) => setTimeout(res, 1200));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === integrationId
          ? {
              ...i,
              status: 'ONLINE',
              lastSync: 'Sincronizado agora',
              latencyMs: Math.floor(Math.random() * 40) + 15,
            }
          : i
      )
    );
  };

  return (
    <NexusContext.Provider
      value={{
        theme,
        toggleTheme,
        appMode,
        isTransitioningMode,
        setAppMode,
        hubRoleView,
        setHubRoleView,
        currentUser,
        profiles,
        areas: enrichedAreas,
        obligations,
        dailyStatuses,
        alerts,
        tasks,
        tickets,
        itRequests,
        activeOwnerCriticalAlert,
        integrations,
        activePopUpTask,
        incomingTaskNotification,
        setActivePopUpTask,
        dismissIncomingTaskNotification,
        delegateTask,
        createTicket,
        updateTicketStatus,
        updateTaskStatus,
        updateUserProfileRole,
        approveITRequest,
        rejectITRequest,
        dismissOwnerCriticalAlert,
        addTaskComment,
        triggerIntegrationSync,
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
        togglePinMessage,
        addReaction,
        sendThreadReply,
        deleteMessage,
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
