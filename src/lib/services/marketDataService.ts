export interface MarketDataQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume?: number;
  timestamp: string;
  source: string;
}

export type ConnectionState = 'LIVE' | 'CACHE' | 'OFFLINE' | 'DEGRADED';
export type MarketStatus = 'OPEN' | 'CLOSED' | 'AFTER_HOURS';

export interface RealMarketDataResponse {
  copperSpotUSD: number;
  usdBrlRate: number;
  eurBrlRate: number;
  btcUsdRate: number;
  copperSpotBRLPerKg: number;
  scrapBuyPriceBRLPerKg: number;
  copperMarginPerTon: number;
  marketStatus: MarketStatus;
  marketStatusReason: string;
  lastUpdateTimestamp: string;
  connectionState: ConnectionState;
  provider: string;
  quotes?: Record<string, MarketDataQuote>;
}

/**
  * Evaluates current market trading status for LME & FX markets.
  */
export function calculateMarketStatus(nowDate: Date = new Date()): {
  status: MarketStatus;
  reason: string;
} {
  const day = nowDate.getUTCDay(); // 0 = Sun, 6 = Sat
  const utcHour = nowDate.getUTCHours();

  // Weekend: Market Closed
  if (day === 0 || day === 6) {
    return {
      status: 'CLOSED',
      reason: 'Mercado Fechado (Fim de Semana)',
    };
  }

  // LME & FX UTC Trading Hours: 01:00 UTC to 21:00 UTC
  if (utcHour >= 1 && utcHour < 21) {
    return {
      status: 'OPEN',
      reason: 'Mercado Aberto (Sessão Regular LME / PTAX)',
    };
  } else if (utcHour >= 21 && utcHour < 23) {
    return {
      status: 'AFTER_HOURS',
      reason: 'Sessão Pós-Mercado (After Hours)',
    };
  } else {
    return {
      status: 'CLOSED',
      reason: 'Mercado Fechado (Fora do Horário de Negociação)',
    };
  }
}
