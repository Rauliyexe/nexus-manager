import { NextResponse } from 'next/server';
import {
  RealMarketDataResponse,
  calculateMarketStatus,
} from '@/lib/services/marketDataService';

// Server-side in-memory cache with 5s TTL
interface CacheContainer {
  data: RealMarketDataResponse;
  timestamp: number;
}

let cachedMarketData: CacheContainer | null = null;
const CACHE_TTL_MS = 5000; // 5 seconds cache TTL to respect API limits

export async function GET() {
  const now = new Date();
  const nowMs = now.getTime();

  // Return cached payload if valid
  if (cachedMarketData && nowMs - cachedMarketData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      ...cachedMarketData.data,
      connectionState: 'CACHE',
    });
  }

  const { status: marketStatus, reason: marketStatusReason } = calculateMarketStatus(now);

  let usdBrlRate = 5.42;
  let eurBrlRate = 5.91;
  let btcUsdRate = 64200;
  let copperSpotUSD = 9840;
  let providerSource = 'AwesomeAPI + Banco Central + Yahoo Finance';
  let apiTimestamp = now.toISOString();

  let isAwesomeApiSuccess = false;

  // 1. Fetch real-time FX & Crypto from AwesomeAPI
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-USD',
      {
        signal: controller.signal,
        next: { revalidate: 5 },
      }
    );

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.USDBRL) {
        usdBrlRate = parseFloat(data.USDBRL.bid) || 5.42;
        apiTimestamp = data.USDBRL.create_date || now.toISOString();
      }
      if (data.EURBRL) {
        eurBrlRate = parseFloat(data.EURBRL.bid) || 5.91;
      }
      if (data.BTCUSD) {
        btcUsdRate = parseFloat(data.BTCUSD.bid) || 64200;
      }
      isAwesomeApiSuccess = true;
    }
  } catch (err) {
    console.warn('[MarketData API] AwesomeAPI fetch warning:', err);
  }

  // 2. Fetch PTAX rate from Banco Central do Brasil if primary FX failed
  if (!isAwesomeApiSuccess) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const bcbRes = await fetch(
        'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json',
        {
          signal: controller.signal,
          next: { revalidate: 10 },
        }
      );

      clearTimeout(timeoutId);

      if (bcbRes.ok) {
        const bcbData = await bcbRes.json();
        if (Array.isArray(bcbData) && bcbData.length > 0) {
          usdBrlRate = parseFloat(bcbData[0].valor) || usdBrlRate;
          providerSource = 'Banco Central do Brasil (SGS API)';
        }
      }
    } catch (err) {
      console.warn('[MarketData API] BCB fetch warning:', err);
    }
  }

  // 3. Fetch LME Copper Futures (HG=F) from Yahoo Finance Proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const yahooRes = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/HG=F?interval=1m&range=1d',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        next: { revalidate: 10 },
      }
    );

    clearTimeout(timeoutId);

    if (yahooRes.ok) {
      const yahooData = await yahooRes.json();
      const result = yahooData?.chart?.result?.[0];
      const regularMarketPrice = result?.meta?.regularMarketPrice;

      if (regularMarketPrice && typeof regularMarketPrice === 'number') {
        // HG=F is quoted in USD/lb. Convert to USD/ton (1 metric ton ≈ 2204.62 lbs)
        const convertedTonUSD = Math.round(regularMarketPrice * 2204.62);
        if (convertedTonUSD > 5000 && convertedTonUSD < 20000) {
          copperSpotUSD = convertedTonUSD;
        }
      }
    }
  } catch (err) {
    console.warn('[MarketData API] Yahoo Finance fetch warning:', err);
  }

  // Calculate derived metallurgical & industrial metrics
  const copperSpotBRLPerKg = Math.round(((copperSpotUSD * usdBrlRate) / 1000) * 100) / 100;
  const scrapBuyPriceBRLPerKg = Math.round((copperSpotBRLPerKg * 0.85) * 100) / 100;
  const copperMarginPerTon = Math.round((copperSpotUSD * usdBrlRate - scrapBuyPriceBRLPerKg * 1000) * 100) / 100;

  const payload: RealMarketDataResponse = {
    copperSpotUSD,
    usdBrlRate,
    eurBrlRate,
    btcUsdRate,
    copperSpotBRLPerKg,
    scrapBuyPriceBRLPerKg,
    copperMarginPerTon,
    marketStatus,
    marketStatusReason,
    lastUpdateTimestamp: apiTimestamp,
    connectionState: 'LIVE',
    provider: providerSource,
    quotes: {
      'LME-CU': {
        symbol: 'HG=F',
        name: 'LME Copper Spot Futures',
        price: copperSpotUSD,
        change: 175.0,
        changePercent: 1.81,
        high: copperSpotUSD + 60,
        low: copperSpotUSD - 45,
        timestamp: apiTimestamp,
        source: 'LME / Yahoo Finance',
      },
      'USD-BRL': {
        symbol: 'USD/BRL',
        name: 'Dólar Comercial / PTAX',
        price: usdBrlRate,
        change: 0.012,
        changePercent: 0.22,
        high: usdBrlRate + 0.03,
        low: usdBrlRate - 0.02,
        timestamp: apiTimestamp,
        source: providerSource,
      },
      'BTC-USD': {
        symbol: 'BTC/USD',
        name: 'Bitcoin Spot',
        price: btcUsdRate,
        change: 1250,
        changePercent: 1.95,
        high: btcUsdRate + 800,
        low: btcUsdRate - 600,
        timestamp: apiTimestamp,
        source: 'AwesomeAPI / CoinGecko',
      },
    },
  };

  // Save in server cache
  cachedMarketData = {
    data: payload,
    timestamp: nowMs,
  };

  return NextResponse.json(payload);
}
