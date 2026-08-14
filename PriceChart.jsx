import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchCoinDetails } from '../Marketservice';

export default function PriceChart({ symbol }) {
  const [coinData, setCoinData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('24H');

  useEffect(() => {
    const loadDetails = async () => {
      const data = await fetchCoinDetails(symbol);
      if (data) {
        setCoinData(data);

        const pointsCount = timeframe === '1H' ? 8 : timeframe === '24H' ? 14 : 30;
        const currentPrice = data.price;
        const mockPoints = Array.from({ length: pointsCount }, (_, i) => {
          const variation = (Math.random() - 0.48) * (currentPrice * 0.025);
          return {
            time: timeframe === '1H' ? `${(pointsCount - i) * 8}m` : `${pointsCount - i}d`,
            price: +(currentPrice + variation).toFixed(2)
          };
        });
        mockPoints.push({ time: 'Now', price: currentPrice });
        setChartData(mockPoints);
      }
    };

    loadDetails();
  }, [symbol, timeframe]);

  if (!coinData) {
    return (
      <div style={{ color: '#888', padding: '30px', textAlign: 'center' }}>
        Loading interactive chart data for {symbol}...
      </div>
    );
  }

  const isPositive = coinData.change24h >= 0;
  const strokeColor = isPositive ? '#00ff7f' : '#ff4d4d';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'radial-gradient(circle at 20% 20%, #171724 0%, #0d0d14 100%)',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isPositive 
          ? '0 12px 32px rgba(0, 255, 127, 0.08)' 
          : '0 12px 32px rgba(255, 77, 77, 0.08)',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Header Info & Timeframe Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ color: '#8888a0', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>
            ACTIVE MARKET
          </div>
          <h2 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '24px' }}>
            {coinData.name} ({coinData.symbol})
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', letterSpacing: '-0.5px' }}>
              ${coinData.price?.toLocaleString()}
            </span>
            <span style={{ color: strokeColor, fontWeight: 'bold', fontSize: '16px' }}>
              {isPositive ? '▲' : '▼'} {coinData.change24h?.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Timeframe Switcher Buttons */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#0a0a10', padding: '5px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {['1H', '24H', '7D', '1M'].map((tf) => (
            <motion.button
              key={tf}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeframe(tf)}
              style={{
                backgroundColor: timeframe === tf ? strokeColor : 'transparent',
                color: timeframe === tf ? '#000000' : '#8888a0',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
            >
              {tf}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 24h High & Low Badges */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '18px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px' }}>
          <span style={{ color: '#888' }}>24h High: </span>
          <span style={{ color: '#00ff7f', fontWeight: 'bold' }}>${coinData.high24h?.toLocaleString()}</span>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px' }}>
          <span style={{ color: '#888' }}>24h Low: </span>
          <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>${coinData.low24h?.toLocaleString()}</span>
        </div>
      </div>

      {/* Market Sentiment Bar */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
          <span style={{ color: '#00ff7f' }}>BULLISH 68%</span>
          <span style={{ color: '#aaa' }}>MARKET SENTIMENT</span>
          <span style={{ color: '#ff4d4d' }}>BEARISH 32%</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: '#ff4d4d', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: '68%', height: '100%', backgroundColor: '#00ff7f' }} />
        </div>
      </div>

      {/* Interactive Graph with Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={timeframe + symbol}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', height: 320 }}
        >
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b2b3d" opacity={0.5} />
              <XAxis dataKey="time" stroke="#666" tickLine={false} />
              <YAxis domain={['auto', 'auto']} stroke="#666" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d0d14',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}