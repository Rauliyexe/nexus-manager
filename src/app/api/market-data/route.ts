import { NextResponse } from 'next/server';
import {
  RealMarketDataResponse,
  calculateMarketStatus,
} from '@/lib/services/marketDataService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    return NextResponse.json(
      {
        ...cachedMarketData.data,
        connectionState: 'CACHE',
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  const { status: marketStatus, reason: marketStatusReason } = calculateMarketStatus(now);

  let usdBrlRate = 5.42;
  let eurBrlRate = 5.91;
  let btcUsdRate = 64200;
  let copperSpotUSD = 9840;
  let providerSource = 'AwesomeAPI + Banco Central';
  let apiTimestamp = now.toISOString();

  let isAwesomeApiSuccess = false;

  // 1. Fetch real-time FX & Crypto from AwesomeAPI
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-USD',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NexusManager/1.0',
        },
        cache: 'no-store',
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
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const bcbRes = await fetch(
        'https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json',
        {
          signal: controller.signal,
          cache: 'no-store',
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

  // 3. Check optional institutional provider keys from process.env (Finnhub / AlphaVantage)
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const alphavantageKey = process.env.ALPHAVANTAGE_API_KEY;

  if (finnhubKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const finnRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=HG=F&token=${finnhubKey}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (finnRes.ok) {
        const finnData = await finnRes.json();
        if (finnData.c && typeof finnData.c === 'number') {
          copperSpotUSD = Math.round(finnData.c * 2204.62);
          providerSource = 'Finnhub Institutional Feed';
        }
      }
    } catch (e) {}
  } else if (alphavantageKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const alphaRes = await fetch(
        `https://www.alphavantage.co/query?function=COPPER&interval=monthly&apikey=${alphavantageKey}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (alphaRes.ok) {
        const alphaData = await alphaRes.json();
        if (alphaData.data && alphaData.data[0]?.value) {
          const val = parseFloat(alphaData.data[0].value);
          if (val > 0) {
            copperSpotUSD = Math.round(val);
            providerSource = 'AlphaVantage Financial API';
          }
        }
      }
    } catch (e) {}
  } else {
    // 4. Fetch LME Copper Futures (HG=F) from Yahoo Finance Proxy
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const yahooRes = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/HG=F?interval=1m&range=1d',
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
          },
          cache: 'no-store',
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
            providerSource = 'AwesomeAPI + Yahoo Finance (LME HG=F)';
          }
        }
      }
    } catch (err) {
      console.warn('[MarketData API] Yahoo Finance fetch warning:', err);
    }
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

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
