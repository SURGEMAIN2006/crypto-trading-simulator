import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart, 
  Activity, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react';

export default function TradingPanel({ 
  selectedAsset, 
  chartData, 
  userBalance, 
  userHoldings, 
  onExecuteOrder 
}) {
  const [orderSide, setOrderSide] = useState('BUY'); // 'BUY' or 'SELL'
  const [orderType, setOrderType] = useState('MARKET'); // 'MARKET' or 'LIMIT'
  const [chartType, setChartType] = useState('LINE'); // 'LINE' or 'CANDLE'
  const [timeframe, setTimeframe] = useState('24H');
  
  const [amount, setAmount] = useState('0.1');
  const [limitPrice, setLimitPrice] = useState(selectedAsset.price.toString());
  const [leverage, setLeverage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);

  // Calculate order calculations
  const parsedAmount = parseFloat(amount) || 0;
  const executionPrice = orderType === 'LIMIT' ? (parseFloat(limitPrice) || selectedAsset.price) : selectedAsset.price;
  const totalValue = parsedAmount * executionPrice;
  const requiredMargin = totalValue / leverage;
  const estFee = totalValue * 0.001; // 0.1% fee

  const isPositive = selectedAsset.change24h >= 0;
  const assetBalance = userHoldings[selectedAsset.symbol] || 0;

  // Chart hover mouse calculation
  const handleMouseMove = (e) => {
    if (!chartSvg || !chartSvg.points || chartSvg.points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * chartSvg.width;

    let closest = chartSvg.points[0];
    let minDistance = Math.abs(svgX - closest.x);

    for (let i = 1; i < chartSvg.points.length; i++) {
      const dist = Math.abs(svgX - chartSvg.points[i].x);
      if (dist < minDistance) {
        minDistance = dist;
        closest = chartSvg.points[i];
      }
    }

    setHoverPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
  };

  // Chart SVG calculations
  const chartSvg = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.998;
    const maxPrice = Math.max(...prices) * 1.002;
    const priceRange = maxPrice - minPrice || 1;

    const width = 800;
    const height = 340;
    const padding = 40;

    const points = chartData.map((d, index) => {
      const x = padding + (index / (chartData.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.price - minPrice) / priceRange) * (height - padding * 2);
      return { x, y, data: d };
    });

    const lineD = points.reduce((acc, point, i) => 
      `${acc} ${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`, ''
    );

    const areaD = `${lineD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    return { points, lineD, areaD, minPrice, maxPrice, width, height, padding };
  }, [chartData]);

  const handleQuickPercent = (pct) => {
    if (orderSide === 'BUY') {
      const maxUsdt = userBalance * (pct / 100);
      const calculatedCrypto = maxUsdt / executionPrice;
      setAmount(calculatedCrypto.toFixed(calculatedCrypto < 1 ? 4 : 2));
    } else {
      const calculatedCrypto = assetBalance * (pct / 100);
      setAmount(calculatedCrypto.toFixed(calculatedCrypto < 1 ? 4 : 2));
    }
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setNotification({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (orderSide === 'BUY' && requiredMargin > userBalance) {
      setNotification({ type: 'error', text: `Insufficient USDT balance. Needed: $${requiredMargin.toFixed(2)}` });
      return;
    }

    if (orderSide === 'SELL' && parsedAmount > assetBalance) {
      setNotification({ type: 'error', text: `Insufficient ${selectedAsset.symbol} balance. You hold ${assetBalance} ${selectedAsset.symbol}` });
      return;
    }

    const orderData = {
      asset: selectedAsset,
      symbol: selectedAsset.symbol,
      side: orderSide,
      type: orderType,
      amount: parsedAmount,
      price: executionPrice,
      totalUSD: totalValue,
      leverage,
      fee: estFee
    };

    onExecuteOrder(orderData);

    setNotification({
      type: 'success',
      text: `${orderSide} Order Executed! ${parsedAmount} ${selectedAsset.symbol} @ $${executionPrice.toFixed(2)}`
    });

    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginTop: '1.25rem' }}>
      
      {/* Chart & Market Overview Area */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Header Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ 
              width: 44, 
              height: 44, 
              borderRadius: '50%', 
              background: selectedAsset.color + '22', 
              color: selectedAsset.color, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              border: `1px solid ${selectedAsset.color}44`
            }}>
              {selectedAsset.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedAsset.name}</h2>
                <span className="badge badge-purple">{selectedAsset.symbol}/USDT</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Market Cap: {selectedAsset.marketCap}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Live Price</div>
              <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                ${selectedAsset.price < 1 ? selectedAsset.price.toFixed(4) : selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>24h Change</div>
              <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {isPositive ? '+' : ''}{selectedAsset.change24h.toFixed(2)}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>24h High / Low</div>
              <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--accent-green)' }}>${selectedAsset.high24h}</span> / <span style={{ color: 'var(--accent-red)' }}>${selectedAsset.low24h}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>24h Volume</div>
              <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {selectedAsset.volume24h}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {['1H', '24H', '7D', '1M', 'ALL'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  background: timeframe === tf ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                  color: timeframe === tf ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: timeframe === tf ? '1px solid rgba(0,229,255,0.4)' : '1px solid transparent',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setChartType('LINE')}
              className="btn btn-sm"
              style={{
                background: chartType === 'LINE' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: chartType === 'LINE' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <Activity size={14} /> Line
            </button>
            <button
              onClick={() => setChartType('CANDLE')}
              className="btn btn-sm"
              style={{
                background: chartType === 'CANDLE' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: chartType === 'CANDLE' ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <BarChart size={14} /> Candles
            </button>
          </div>
        </div>

        {/* Interactive SVG Chart Container with Cursor Hover Info */}
        <div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'relative', width: '100%', height: '340px', background: 'rgba(5, 8, 15, 0.6)', borderRadius: 12, border: '1px solid var(--border-color)', padding: '1rem', overflow: 'hidden', cursor: 'crosshair' }}
        >
          {/* Live Hover Info Box Overlay */}
          {hoverPoint && hoverPoint.data && (
            <div style={{
              position: 'absolute',
              top: '0.8rem',
              right: '0.8rem',
              background: 'rgba(12, 18, 32, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              borderRadius: 10,
              padding: '0.6rem 1rem',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)',
              pointerEvents: 'none',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '1.2rem'
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</div>
                <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {hoverPoint.data.time}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</div>
                <div className="mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                  ${hoverPoint.data.price < 1 ? hoverPoint.data.price.toFixed(4) : hoverPoint.data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Volume</div>
                <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                  {hoverPoint.data.volume} USDT
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High / Low</div>
                <div className="mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent-green)' }}>${hoverPoint.data.high}</span> / <span style={{ color: 'var(--accent-red)' }}>${hoverPoint.data.low}</span>
                </div>
              </div>
            </div>
          )}

          {chartSvg && (
            <svg viewBox={`0 0 ${chartSvg.width} ${chartSvg.height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                <line
                  key={ratio}
                  x1={chartSvg.padding}
                  y1={chartSvg.height * ratio}
                  x2={chartSvg.width - chartSvg.padding}
                  y2={chartSvg.height * ratio}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
              ))}

              {chartType === 'LINE' ? (
                <>
                  <path d={chartSvg.areaD} fill="url(#chartGradient)" />
                  <path
                    d={chartSvg.lineD}
                    fill="none"
                    stroke={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {chartSvg.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={i === chartSvg.points.length - 1 ? 5 : 2}
                      fill={isPositive ? 'var(--accent-green)' : 'var(--accent-red)'}
                    />
                  ))}
                </>
              ) : (
                /* Candlestick view simulation */
                chartData.map((d, i) => {
                  const x = chartSvg.padding + (i / (chartData.length - 1)) * (chartSvg.width - chartSvg.padding * 2);
                  const isUp = d.close >= d.open;
                  const candleColor = isUp ? 'var(--accent-green)' : 'var(--accent-red)';
                  
                  const yOpen = chartSvg.height - chartSvg.padding - ((d.open - chartSvg.minPrice) / (chartSvg.maxPrice - chartSvg.minPrice)) * (chartSvg.height - chartSvg.padding * 2);
                  const yClose = chartSvg.height - chartSvg.padding - ((d.close - chartSvg.minPrice) / (chartSvg.maxPrice - chartSvg.minPrice)) * (chartSvg.height - chartSvg.padding * 2);
                  const yHigh = chartSvg.height - chartSvg.padding - ((d.high - chartSvg.minPrice) / (chartSvg.maxPrice - chartSvg.minPrice)) * (chartSvg.height - chartSvg.padding * 2);
                  const yLow = chartSvg.height - chartSvg.padding - ((d.low - chartSvg.minPrice) / (chartSvg.maxPrice - chartSvg.minPrice)) * (chartSvg.height - chartSvg.padding * 2);

                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                  return (
                    <g key={i}>
                      <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={candleColor} strokeWidth="1.5" />
                      <rect
                        x={x - 4}
                        y={bodyTop}
                        width={8}
                        height={bodyHeight}
                        fill={candleColor}
                        rx={1}
                      />
                    </g>
                  );
                })
              )}

              {/* Crosshair & Active Point Marker on Mouse Hover */}
              {hoverPoint && (
                <g style={{ pointerEvents: 'none' }}>
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={hoverPoint.x}
                    y1={chartSvg.padding}
                    x2={hoverPoint.x}
                    y2={chartSvg.height - chartSvg.padding}
                    stroke="var(--accent-cyan)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.85"
                  />
                  {/* Horizontal Crosshair Line */}
                  <line
                    x1={chartSvg.padding}
                    y1={hoverPoint.y}
                    x2={chartSvg.width - chartSvg.padding}
                    y2={hoverPoint.y}
                    stroke="var(--accent-cyan)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.85"
                  />
                  {/* Glowing Active Target Point Circle */}
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.y}
                    r="6.5"
                    fill="var(--accent-cyan)"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    style={{ filter: 'drop-shadow(0 0 8px var(--accent-cyan))' }}
                  />
                </g>
              )}
            </svg>
          )}
        </div>

      </div>

      {/* Buy / Sell Order Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Notification Alert */}
        {notification && (
          <div style={{
            padding: '0.6rem 0.8rem',
            borderRadius: 8,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: notification.type === 'success' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 23, 68, 0.2)',
            border: `1px solid ${notification.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            color: notification.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {notification.text}
          </div>
        )}

        {/* Side Tabs: Buy vs Sell */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: 10 }}>
          <button
            type="button"
            onClick={() => setOrderSide('BUY')}
            style={{
              padding: '0.6rem',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: orderSide === 'BUY' ? 'var(--accent-green)' : 'transparent',
              color: orderSide === 'BUY' ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            BUY {selectedAsset.symbol}
          </button>
          <button
            type="button"
            onClick={() => setOrderSide('SELL')}
            style={{
              padding: '0.6rem',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: orderSide === 'SELL' ? 'var(--accent-red)' : 'transparent',
              color: orderSide === 'SELL' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            SELL {selectedAsset.symbol}
          </button>
        </div>

        {/* Order Type Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setOrderType('MARKET')}
            style={{
              flex: 1,
              padding: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              background: orderType === 'MARKET' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: orderType === 'MARKET' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Market Order
          </button>
          <button
            onClick={() => setOrderType('LIMIT')}
            style={{
              flex: 1,
              padding: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              background: orderType === 'LIMIT' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: orderType === 'LIMIT' ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Limit Order
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          {/* Limit Price Input if Limit Order */}
          {orderType === 'LIMIT' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Limit Price (USDT)
              </label>
              <input
                type="number"
                step="any"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="mono"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Amount Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              <span>Quantity</span>
              <span>Available: {orderSide === 'BUY' ? `$${userBalance.toFixed(2)} USDT` : `${assetBalance} ${selectedAsset.symbol}`}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mono"
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  paddingRight: '3.5rem',
                  borderRadius: 8,
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              />
              <span style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {selectedAsset.symbol}
              </span>
            </div>
          </div>

          {/* Quick Percentage Presets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem' }}>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                style={{
                  padding: '0.25rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Leverage Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              <span>Leverage Multiplier</span>
              <span className="mono text-cyan" style={{ fontWeight: 700 }}>{leverage}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          {/* Summary Breakdown */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Order Value:</span>
              <span className="mono" style={{ color: '#fff' }}>${totalValue.toFixed(2)} USDT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Required Margin ({leverage}x):</span>
              <span className="mono" style={{ color: 'var(--accent-gold)' }}>${requiredMargin.toFixed(2)} USDT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Est. Gas / Trading Fee (0.1%):</span>
              <span className="mono" style={{ color: 'var(--text-secondary)' }}>${estFee.toFixed(3)} USDT</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className={`btn ${orderSide === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '0.4rem' }}
          >
            <Zap size={18} />
            {orderSide} {selectedAsset.symbol} NOW
          </button>

        </form>

      </div>

    </div>
  );
}
