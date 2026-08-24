import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MarketTicker from './api/components/MarketTicker';
import PriceChart from './api/components/PriceChart';

// Dynamic brand color palette for selected coins
const coinThemes = {
  BTC: { primary: '#f7931a', glow: 'rgba(247, 147, 26, 0.15)' },
  ETH: { primary: '#627eea', glow: 'rgba(98, 126, 234, 0.15)' },
  SOL: { primary: '#14f195', glow: 'rgba(20, 241, 149, 0.15)' },
  BNB: { primary: '#f3ba2f', glow: 'rgba(243, 186, 47, 0.15)' },
  XRP: { primary: '#00a4e4', glow: 'rgba(0, 164, 228, 0.15)' },
  DOGE: { primary: '#c2a633', glow: 'rgba(194, 166, 51, 0.15)' },
  ADA: { primary: '#0033ad', glow: 'rgba(0, 51, 173, 0.15)' },
  AVAX: { primary: '#e84142', glow: 'rgba(232, 65, 66, 0.15)' }
};

export default function App() {
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  // Fallback theme if a coin isn't mapped
  const activeTheme = coinThemes[selectedCoin] || {
    primary: '#00ff7f',
    glow: 'rgba(0, 255, 127, 0.15)'
  };

  return (
    <div
      style={{
        padding: '28px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#0a0a10',
        minHeight: '100vh',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Background Glow Orbs */}
      <motion.div
        animate={{ background: `radial-gradient(circle, ${activeTheme.glow} 0%, rgba(0,0,0,0) 70%)` }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '500px',
          height: '500px',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ background: `radial-gradient(circle, ${activeTheme.glow} 0%, rgba(0,0,0,0) 70%)` }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '600px',
          height: '600px',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Dynamic Glowing Accent Square */}
            <motion.div
              animate={{
                backgroundColor: activeTheme.primary,
                boxShadow: `0 0 12px ${activeTheme.primary}`
              }}
              transition={{ duration: 0.5 }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px'
              }}
            />

            {/* Glowing Text Title */}
            <motion.h1
              animate={{
                color: activeTheme.primary,
                textShadow: `0 0 12px ${activeTheme.primary}aa, 0 0 24px ${activeTheme.primary}44`
              }}
              transition={{ duration: 0.5 }}
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '900',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              CRYPTO TRADING SIMULATOR
            </motion.h1>
          </div>

          {/* Live Indicator Badge */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: activeTheme.primary,
              border: `1px solid ${activeTheme.primary}`,
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: `0 0 10px ${activeTheme.glow}`,
              transition: 'all 0.5s ease'
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              style={{
                width: '7px',
                height: '7px',
                backgroundColor: activeTheme.primary,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${activeTheme.primary}`
              }}
            />
            LIVE FEED
          </div>
        </motion.div>

        {/* Global Macro Stats Bar */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#8888a0',
            overflowX: 'auto'
          }}
        >
          <div><span style={{ color: '#aaa' }}>Global Vol (24h):</span> <strong style={{ color: '#fff' }}>$84.2B</strong></div>
          <div><span style={{ color: '#aaa' }}>BTC Dominance:</span> <strong style={{ color: activeTheme.primary }}>54.2%</strong></div>
          <div><span style={{ color: '#aaa' }}>Market Health:</span> <strong style={{ color: activeTheme.primary }}>74 (Greed)</strong></div>
          <div><span style={{ color: '#aaa' }}>Active Feed Cache:</span> <strong style={{ color: '#fff' }}>10s Polling</strong></div>
        </div>

        {/* Live Market Ticker */}
        <MarketTicker
          selectedCoin={selectedCoin}
          onSelectCoin={(symbol) => setSelectedCoin(symbol)}
        />

        {/* Dynamic Chart Section */}
        <PriceChart symbol={selectedCoin} themeColor={activeTheme.primary} />
      </div>
    </div>
  );
}