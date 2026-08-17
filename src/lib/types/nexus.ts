export type UserRole = 'ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE';

export type DailyStatusType = 'GREEN' | 'YELLOW' | 'RED' | 'NO_RESPONSE';

export type ObligationFrequency = 'DIARIA' | 'SEMANAL' | 'MENSAL';

export type AlertType = 'CRITICAL' | 'ATTENTION' | 'NO_RESPONSE';
export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export type ConversationType = 'AREA' | 'GROUP' | 'PRIVATE';
export type MessageType = 'TEXT' | 'SYSTEM' | 'CLOSING_UPDATE' | 'ALERT_UPDATE';

export type AppMode = 'OPERATIONS' | 'FINANCIAL_TERMINAL';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  active: boolean;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager?: Profile;
  currentStatus?: DailyStatusType;
  currentJustification?: string;
  obligationsCount?: number;
  openAlertsCount?: number;
  lastUpdated?: string;
}

export interface Obligation {
  id: string;
  area_id: string;
  area?: Area;
  title: string;
  description?: string;
  frequency: ObligationFrequency;
  due_time: string; // HH:mm
  active: boolean;
  responsible_user_id?: string;
  responsibleUser?: Profile;
  created_at?: string;
  updated_at?: string;
}

export interface DailyStatus {
  id: string;
  area_id: string;
  area?: Area;
  user_id: string;
  user?: Profile;
  status: DailyStatusType;
  justification?: string;
  date: string; // YYYY-MM-DD
  created_at?: string;
}

export interface Alert {
  id: string;
  area_id: string;
  area?: Area;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  description: string;
  created_at: string;
  acknowledged_by?: string;
  resolved_by?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  area_id?: string;
  created_at: string;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender?: Profile;
  content: string; // Plaintext or Encrypted format
  message_type: MessageType;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  read: boolean;
  link?: string;
  created_at: string;
}

export interface WeeklyReportItem {
  id: string;
  area_id: string;
  area_name: string;
  manager_name: string;
  green_days: number;
  yellow_days: number;
  red_days: number;
  no_response_days: number;
  compliance_score: number; // 0-100%
}

// Financial Metrics & DRE Interfaces
export interface AccountBalance {
  id: string;
  bankName: string;
  accountNumber: string;
  balance: number; // BRL
  currency: string;
}

export interface DREItem {
  code: string;
  category: string;
  amount: number; // BRL
  percentageOfRevenue: number;
  type: 'REVENUE' | 'DEDUCTION' | 'COST' | 'EXPENSE' | 'EBITDA' | 'TAX' | 'NET_INCOME';
}

export interface AgingScheduleItem {
  period: string; // e.g. "Hoje", "7 Dias", "15 Dias", "30 Dias", "60 Dias"
  receivables: number; // BRL
  payables: number; // BRL
}

export interface CashTransaction {
  id: string;
  time: string;
  description: string;
  category: string;
  amount: number; // positive = inflow, negative = outflow
  type: 'INFLOW' | 'OUTFLOW';
}

export interface FinancialMetrics {
  consolidatedCash: number;
  monthlyRevenue: number;
  revenueTarget: number;
  ebitda: number;
  ebitdaMargin: number;
  defaultRate: number; // percentage
  copperSpotUSD: number; // LME Copper USD/ton
  usdBrlRate: number; // USD to BRL rate
  copperSpotBRLPerKg: number; // BRL/kg
  scrapBuyPriceBRLPerKg: number; // BRL/kg
  copperMarginPerTon: number; // BRL/ton
  monthlyTonsProcessed: number;
  todayInflows: number;
  todayOutflows: number;
  todayNetBalance: number;
  recentTransactions: CashTransaction[];
  accounts: AccountBalance[];
  dre: DREItem[];
  agingSchedule: AgingScheduleItem[];
}

// Hedge & Derivative Instruments Interfaces
export type HedgeStrategy = 'FORWARD_LOCK' | 'COLLAR' | 'PUT_OPTION' | 'B3_DOL_FUT';

export interface HedgePosition {
  id: string;
  contractCode: string;
  strategy: HedgeStrategy;
  commodity: 'COPPER_LME' | 'USD_BRL';
  volumeTons: number;
  strikePriceUSD: number;
  exchangeRateBRL: number;
  lockedPriceBRLPerKg: number;
  currentSpotBRLPerKg: number;
  pnlBRL: number;
  status: 'ACTIVE' | 'SETTLED' | 'PENDING';
  maturityDate: string;
}

export interface HedgeSimulationResult {
  volumeTons: number;
  unhedgedRevenueBRL: number;
  hedgedRevenueBRL: number;
  lockedGrossMarginBRL: number;
  pnlDifferenceBRL: number;
  marginProtectionPct: number;
  breakEvenUSD: number;
}

// Cashflow Forecasting & Stress Testing Interfaces
export type ForecastScenario = 'BASE' | 'OPTIMISTIC' | 'STRESS';

export interface ForecastPeriodPoint {
  dayOffset: number; // e.g. +7, +15, +30, +60, +90
  dateLabel: string;
  projectedReceivables: number;
  projectedPayables: number;
  netPeriodCash: number;
  projectedEndingCash: number;
  riskFlag?: 'HEALTHY' | 'MODERATE' | 'CRITICAL';
}

// Commodity Arbitrage & Margin Sensitivity Interfaces
export interface CommodityArbitrageMetrics {
  lmeCopperUSD: number;
  usdBrl: number;
  importParityBRLPerKg: number; // (LME * USD / 1000) * 1.09 (tax & freight)
  scrapNationalBuyBRLPerKg: number;
  refiningCostBRLPerKg: number;
  netRefiningMarginBRLPerKg: number;
  netRefiningMarginPerTon: number;
  deltaEbitdaPer100USD: number; // Sensibilidade de EBITDA em BRL para cada $100 na LME
  deltaEbitdaPer10CentsDollar: number; // Sensibilidade para cada R$ 0,10 no câmbio
}

