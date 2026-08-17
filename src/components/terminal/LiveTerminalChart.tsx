'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Activity,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  TrendingUp,
  BellRing,
  Layers,
} from 'lucide-react';

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LiveTerminalChartProps {
  initialPrice?: number;
  title?: string;
  assetSymbol?: string;
  unit?: string;
}

export const LiveTerminalChart: React.FC<LiveTerminalChartProps> = ({
  initialPrice = 9840,
  title = 'LME COPPER SPOT LIVE INTRADAY STREAM',
  assetSymbol = 'COPPER-LME',
  unit = 'USD/t',
}) => {
  const [isLive, setIsLive] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePct, setPriceChangePct] = useState(0);
  const [chartMode, setChartMode] = useState<'CANDLE' | 'LINE'>('CANDLE');
  const [timeframe, setTimeframe] = useState<'1s' | '5s' | '15s' | '1m'>('1s');

  // Indicators toggle
  const [showEMA, setShowEMA] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [alertPrice, setAlertPrice] = useState<number | null>(null);

  // Interactive Navigation State
  const [zoomLevel, setZoomLevel] = useState(1); // 0.5x to 2.5x
  const [panOffset, setPanOffset] = useState(0); // in candles
  const [isUserPanning, setIsUserPanning] = useState(false);

  // Hover & Crosshair State
  const [hoverData, setHoverData] = useState<{
    candle: CandleData | null;
    x: number;
    y: number;
    priceAtY: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allCandlesRef = useRef<CandleData[]>([]);

  // Initialize seed dataset (120 candles for deep panning)
  useEffect(() => {
    const seedCandles: CandleData[] = [];
    let base = initialPrice - 45;
    const now = Date.now();

    for (let i = 120; i >= 0; i--) {
      const open = base + (Math.random() - 0.48) * 14;
      const high = open + Math.random() * 12;
      const low = open - Math.random() * 12;
      const close = low + Math.random() * (high - low);
      const timeMs = now - i * 1500;
      const d = new Date(timeMs);
      const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      seedCandles.push({
        time: timeStr,
        timestamp: timeMs,
        open: Math.round(open * 10) / 10,
        high: Math.round(high * 10) / 10,
        low: Math.round(low * 10) / 10,
        close: Math.round(close * 10) / 10,
        volume: Math.floor(80 + Math.random() * 450),
      });
      base = close;
    }

    allCandlesRef.current = seedCandles;
    const last = seedCandles[seedCandles.length - 1];
    setCurrentPrice(last.close);
    setPriceChange(last.close - initialPrice);
    setPriceChangePct(((last.close - initialPrice) / initialPrice) * 100);
  }, [initialPrice]);

  // Real-time tick engine with configurable timeframe speed
  useEffect(() => {
    if (!isLive) return;

    const intervalSpeed = timeframe === '1s' ? 900 : timeframe === '5s' ? 2000 : 3500;

    const interval = setInterval(() => {
      const delta = (Math.random() - 0.49) * 8.0;
      setCurrentPrice((prev) => {
        const next = Math.max(8000, Math.round((prev + delta) * 10) / 10);
        const change = next - initialPrice;
        const pct = (change / initialPrice) * 100;
        setPriceChange(change);
        setPriceChangePct(pct);

        const now = Date.now();
        const timeStr = new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const candles = allCandlesRef.current;
        if (candles.length > 0) {
          const last = candles[candles.length - 1];
          const timeThreshold = timeframe === '1s' ? 2500 : timeframe === '5s' ? 6000 : 12000;

          if (now - last.timestamp > timeThreshold) {
            // Push new candle
            candles.push({
              time: timeStr,
              timestamp: now,
              open: last.close,
              high: Math.max(last.close, next),
              low: Math.min(last.close, next),
              close: next,
              volume: Math.floor(60 + Math.random() * 380),
            });
            if (candles.length > 250) candles.shift();
          } else {
            // Update current active candle
            last.high = Math.max(last.high, next);
            last.low = Math.min(last.low, next);
            last.close = next;
            last.volume += Math.floor(10 + Math.random() * 40);
          }
        }

        return next;
      });
    }, intervalSpeed);

    return () => clearInterval(interval);
  }, [isLive, timeframe, initialPrice]);

  // Mouse Interaction Handlers (Pan, Hover, Zoom, Click Alert)
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const initialPanOffsetRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    initialPanOffsetRef.current = panOffset;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle Panning
    if (isDraggingRef.current) {
      const deltaX = e.clientX - startXRef.current;
      const candlesMoved = Math.round(deltaX / 12);
      const newOffset = Math.max(0, Math.min(allCandlesRef.current.length - 15, initialPanOffsetRef.current + candlesMoved));
      setPanOffset(newOffset);
      setIsUserPanning(newOffset > 0);
    }

    // Handle Crosshair & Hover Tooltip
    const width = rect.width;
    const height = rect.height;
    const rightMargin = 70;
    const chartWidth = width - rightMargin;
    const chartHeight = height - (showVolume ? 35 : 15);

    if (mouseX <= chartWidth && mouseY <= height) {
      // Find candle under cursor
      const allCandles = allCandlesRef.current;
      const visibleCount = Math.floor((chartWidth / 16) / zoomLevel);
      const endIndex = allCandles.length - panOffset;
      const startIndex = Math.max(0, endIndex - visibleCount);
      const visibleCandles = allCandles.slice(startIndex, endIndex);

      if (visibleCandles.length > 0) {
        const slotWidth = chartWidth / visibleCandles.length;
        const candleIndex = Math.min(visibleCandles.length - 1, Math.max(0, Math.floor(mouseX / slotWidth)));
        const candle = visibleCandles[candleIndex];

        // Price at cursor Y
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        visibleCandles.forEach((c) => {
          if (c.low < minPrice) minPrice = c.low;
          if (c.high > maxPrice) maxPrice = c.high;
        });
        const padding = (maxPrice - minPrice) * 0.12 || 8;
        minPrice -= padding;
        maxPrice += padding;
        const priceRange = maxPrice - minPrice;
        const priceAtY = maxPrice - (mouseY / chartHeight) * priceRange;

        setHoverData({
          candle,
          x: mouseX,
          y: mouseY,
          priceAtY,
        });
      }
    } else {
      setHoverData(null);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setHoverData(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setZoomLevel((z) => Math.min(2.5, Math.round((z + 0.15) * 100) / 100));
    } else {
      // Zoom out
      setZoomLevel((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100));
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoverData && !isDraggingRef.current) {
      // Set or toggle price alert at clicked price
      const clicked = Math.round(hoverData.priceAtY * 10) / 10;
      setAlertPrice(alertPrice === clicked ? null : clicked);
    }
  };

  const resetPanAndZoom = () => {
    setPanOffset(0);
    setZoomLevel(1);
    setIsUserPanning(false);
  };

  // High-DPI Real-Time Render Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const logicalWidth = Math.floor(rect.width);
      const logicalHeight = Math.floor(rect.height) || 260;

      if (canvas.width !== logicalWidth * dpr || canvas.height !== logicalHeight * dpr) {
        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const rightMargin = 70;
      const chartWidth = logicalWidth - rightMargin;
      const chartHeight = logicalHeight - (showVolume ? 35 : 15);

      // 1. Grid Lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.07)';
      ctx.lineWidth = 1;

      const gridYCount = 5;
      for (let i = 0; i <= gridYCount; i++) {
        const y = Math.floor((chartHeight / gridYCount) * i) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
      }

      const gridXCount = 8;
      for (let i = 0; i <= gridXCount; i++) {
        const x = Math.floor((chartWidth / gridXCount) * i) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, logicalHeight);
        ctx.stroke();
      }

      // 2. Select Visible Sliced Candles based on Pan & Zoom
      const allCandles = allCandlesRef.current;
      if (allCandles.length < 2) {
        ctx.restore();
        return;
      }

      const visibleCount = Math.max(10, Math.floor((chartWidth / 16) / zoomLevel));
      const endIndex = allCandles.length - panOffset;
      const startIndex = Math.max(0, endIndex - visibleCount);
      const visibleCandles = allCandles.slice(startIndex, endIndex);

      if (visibleCandles.length < 2) {
        ctx.restore();
        return;
      }

      // 3. Compute Scaling
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      let maxVolume = 0;

      visibleCandles.forEach((c) => {
        if (c.low < minPrice) minPrice = c.low;
        if (c.high > maxPrice) maxPrice = c.high;
        if (c.volume > maxVolume) maxVolume = c.volume;
      });

      const padding = (maxPrice - minPrice) * 0.12 || 8;
      minPrice -= padding;
      maxPrice += padding;
      const priceRange = maxPrice - minPrice;

      const slotWidth = chartWidth / visibleCandles.length;
      const candleBodyWidth = Math.max(3, Math.min(18, slotWidth * 0.72));

      // 4. Calculate EMA (9) & SMA (20) Overlays
      const ema9Points: { x: number; y: number }[] = [];
      const sma20Points: { x: number; y: number }[] = [];

      let prevEma = visibleCandles[0].close;
      const k = 2 / (9 + 1);

      visibleCandles.forEach((c, idx) => {
        const x = idx * slotWidth + slotWidth / 2;

        // EMA 9
        const ema = c.close * k + prevEma * (1 - k);
        prevEma = ema;
        const emaY = chartHeight - ((ema - minPrice) / priceRange) * chartHeight;
        ema9Points.push({ x, y: emaY });

        // SMA 20 (simple average of past up to 20 candles)
        const sampleStart = Math.max(0, idx - 19);
        const sample = visibleCandles.slice(sampleStart, idx + 1);
        const avg = sample.reduce((acc, v) => acc + v.close, 0) / sample.length;
        const smaY = chartHeight - ((avg - minPrice) / priceRange) * chartHeight;
        sma20Points.push({ x, y: smaY });
      });

      // 5. Draw Candles / Area
      if (chartMode === 'CANDLE') {
        visibleCandles.forEach((c, idx) => {
          const centerX = Math.floor(idx * slotWidth + slotWidth / 2) + 0.5;
          const isBull = c.close >= c.open;

          const openY = chartHeight - ((c.open - minPrice) / priceRange) * chartHeight;
          const closeY = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
          const highY = chartHeight - ((c.high - minPrice) / priceRange) * chartHeight;
          const lowY = chartHeight - ((c.low - minPrice) / priceRange) * chartHeight;

          const color = isBull ? '#34d399' : '#f87171'; // Emerald vs Rose

          // High/Low Wick
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(centerX, Math.floor(highY));
          ctx.lineTo(centerX, Math.floor(lowY));
          ctx.stroke();

          // Body
          ctx.fillStyle = color;
          const bodyY = Math.floor(Math.min(openY, closeY));
          const bodyH = Math.max(2, Math.floor(Math.abs(closeY - openY)));
          ctx.fillRect(Math.floor(centerX - candleBodyWidth / 2), bodyY, Math.floor(candleBodyWidth), bodyH);

          // Volume Histogram
          if (showVolume) {
            const volH = Math.max(2, (c.volume / (maxVolume || 1)) * 26);
            ctx.fillStyle = isBull ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)';
            ctx.fillRect(Math.floor(centerX - candleBodyWidth / 2), logicalHeight - volH, Math.floor(candleBodyWidth), volH);
          }
        });
      } else {
        // Line Area Mode
        const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

        ctx.beginPath();
        visibleCandles.forEach((c, idx) => {
          const x = idx * slotWidth + slotWidth / 2;
          const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        ctx.lineTo((visibleCandles.length - 1) * slotWidth + slotWidth / 2, chartHeight);
        ctx.lineTo(slotWidth / 2, chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        visibleCandles.forEach((c, idx) => {
          const x = idx * slotWidth + slotWidth / 2;
          const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 6. Draw Indicator Overlays (EMA 9 in Sky Blue, SMA 20 in Purple)
      if (showEMA && ema9Points.length > 1) {
        ctx.beginPath();
        ema9Points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      if (showSMA && sma20Points.length > 1) {
        ctx.beginPath();
        sma20Points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = '#c084fc'; // Purple
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 7. Clicked Custom Price Alert Line
      if (alertPrice !== null) {
        const alertY = Math.floor(chartHeight - ((alertPrice - minPrice) / priceRange) * chartHeight) + 0.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#e11d48'; // Rose Alert
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, alertY);
        ctx.lineTo(chartWidth, alertY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#e11d48';
        ctx.fillRect(chartWidth + 2, alertY - 8, 64, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`ALERT $${alertPrice.toFixed(1)}`, chartWidth + 34, alertY);
      }

      // 8. Right Axis Price Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      for (let i = 0; i <= gridYCount; i++) {
        const y = (chartHeight / gridYCount) * i;
        const priceAtY = maxPrice - (i / gridYCount) * priceRange;
        ctx.fillText(`$${priceAtY.toFixed(1)}`, chartWidth + 6, y);
      }

      // 9. Live Price Cursor (Latest Active Candle)
      const lastCandle = allCandles[allCandles.length - 1];
      const liveY = Math.floor(chartHeight - ((lastCandle.close - minPrice) / priceRange) * chartHeight) + 0.5;

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, liveY);
      ctx.lineTo(chartWidth, liveY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(chartWidth + 2, liveY - 9, 64, 18);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`$${lastCandle.close.toFixed(1)}`, chartWidth + 34, liveY);

      // 10. Interactive Crosshair and Hover Pinning
      if (hoverData) {
        const hX = hoverData.x;
        const hY = hoverData.y;

        // Vertical Line
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hX, 0);
        ctx.lineTo(hX, chartHeight);
        ctx.stroke();

        // Horizontal Line
        ctx.beginPath();
        ctx.moveTo(0, hY);
        ctx.lineTo(chartWidth, hY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hover Price Tag on Y Axis
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(chartWidth + 2, hY - 8, 64, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`$${hoverData.priceAtY.toFixed(1)}`, chartWidth + 34, hY);

        // Hover Time Tag on X Axis
        if (hoverData.candle) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(hX - 30, chartHeight + 2, 60, 16);
          ctx.fillStyle = '#f8fafc';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(hoverData.candle.time, hX, chartHeight + 10);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [chartMode, currentPrice, zoomLevel, panOffset, hoverData, showEMA, showSMA, showVolume, alertPrice]);

  const activeCandle = hoverData?.candle || allCandlesRef.current[allCandlesRef.current.length - 1];

  return (
    <div className="bg-black border border-amber-500/30 rounded p-3 font-mono text-xs space-y-2.5 select-none shadow-2xl">
      {/* Top Header & Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-amber-300 text-xs tracking-wider">{title}</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold">
                {assetSymbol}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-0.5">
              <span>Timeframe:</span>
              {(['1s', '5s', '15s', '1m'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-1.5 py-0.2 rounded border transition-colors ${
                    timeframe === tf
                      ? 'bg-amber-500/30 text-amber-300 border-amber-500/60 font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Price & Action Toolbar */}
        <div className="flex items-center space-x-2.5">
          <div className="text-right pr-2">
            <div className="text-sm font-bold text-slate-100">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
              <span className="text-[10px] text-slate-400">{unit}</span>
            </div>
            <div className={`text-[10px] font-semibold ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
            </div>
          </div>

          {/* Interactive Tools Strip */}
          <div className="flex items-center space-x-1 border-l border-amber-500/30 pl-2">
            {/* Play/Pause */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`p-1.5 rounded border transition-colors ${
                isLive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}
              title={isLive ? 'Pausar Stream' : 'Retomar Stream'}
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Candle/Line Toggle */}
            <button
              onClick={() => setChartMode(chartMode === 'CANDLE' ? 'LINE' : 'CANDLE')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold"
              title="Alternar Modo de Exibição"
            >
              {chartMode === 'CANDLE' ? 'CANDLES' : 'LINHA'}
            </button>

            {/* Indicator Toggles */}
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-1.5 py-1 rounded border text-[9px] font-bold ${
                showEMA ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
              title="Toggle EMA 9 (Linha Azul)"
            >
              EMA9
            </button>

            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-1.5 py-1 rounded border text-[9px] font-bold ${
                showSMA ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
              title="Toggle SMA 20 (Linha Roxa)"
            >
              SMA20
            </button>

            {/* Zoom In/Out */}
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Reset View */}
            {(isUserPanning || zoomLevel !== 1) && (
              <button
                onClick={resetPanAndZoom}
                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold flex items-center space-x-1 animate-pulse"
                title="Voltar ao tempo real"
              >
                <RotateCcw className="w-3 h-3" />
                <span>AO VIVO</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time OHLCV Inspection Banner */}
      {activeCandle && (
        <div className="flex flex-wrap items-center justify-between text-[11px] bg-slate-950 px-3 py-1.5 rounded border border-amber-500/20 text-slate-300">
          <div className="flex items-center space-x-3">
            <span className="text-amber-400 font-bold">[{activeCandle.time}]</span>
            <span>O: <strong className="text-slate-100">${activeCandle.open.toFixed(1)}</strong></span>
            <span>H: <strong className="text-emerald-400">${activeCandle.high.toFixed(1)}</strong></span>
            <span>L: <strong className="text-rose-400">${activeCandle.low.toFixed(1)}</strong></span>
            <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>${activeCandle.close.toFixed(1)}</strong></span>
            <span>Vol: <strong className="text-sky-300">{activeCandle.volume}</strong></span>
          </div>

          <div className="flex items-center space-x-3 text-[10px]">
            {showEMA && <span className="text-sky-400">■ EMA(9)</span>}
            {showSMA && <span className="text-purple-400">■ SMA(20)</span>}
            {alertPrice && (
              <span className="text-rose-400 flex items-center space-x-1">
                <BellRing className="w-3 h-3" />
                <span>Alerta: ${alertPrice.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Interactive Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[260px] bg-slate-950/95 rounded border border-amber-500/20 overflow-hidden cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Floating Instruction / Status Indicator */}
        <div className="absolute top-2 left-2 pointer-events-none text-[9px] text-amber-500/40 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>ARRASTE PARA NAVEGAR NO HISTÓRICO • SCROLL PARA ZOOM • CLIQUE PARA ALERTA</span>
        </div>

        {/* Jump to Live Quick Button */}
        {isUserPanning && (
          <button
            onClick={resetPanAndZoom}
            className="absolute bottom-3 right-20 bg-amber-500/90 hover:bg-amber-400 text-black px-2.5 py-1 rounded shadow-lg text-[10px] font-bold flex items-center space-x-1 transition-all z-20"
          >
            <span>Ir para o Ao Vivo ⏭</span>
          </button>
        )}
      </div>

      {/* Bottom Technical Indicators Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] pt-0.5">
        <div className="p-1.5 bg-slate-950 border border-amber-500/20 rounded flex justify-between">
          <span className="text-slate-400">RSI (14):</span>
          <span className="text-emerald-400 font-bold">58.4 (NEUTRO)</span>
        </div>
        <div className="p-1.5 bg-slate-950 border border-amber-500/20 rounded flex justify-between">
          <span className="text-slate-400">ZOOM / ESCALA:</span>
          <span className="text-amber-300 font-bold">{(zoomLevel * 100).toFixed(0)}% ({allCandlesRef.current.length} velas)</span>
        </div>
        <div className="p-1.5 bg-slate-950 border border-amber-500/20 rounded flex justify-between">
          <span className="text-slate-400">SPREAD COMPRA:</span>
          <span className="text-sky-400 font-bold">+R$ 4.250 / t</span>
        </div>
        <div className="p-1.5 bg-slate-950 border border-amber-500/20 rounded flex justify-between">
          <span className="text-slate-400">FEED ENGINE:</span>
          <span className={isLive ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {isLive ? `● ONLINE (${timeframe})` : '❚❚ PAUSADO'}
          </span>
        </div>
      </div>
    </div>
  );
};
