import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMarketOverview } from '../Marketservice';

// Generates a unique SVG curve path for each coin based on its symbol
const getSparklinePath = (symbol, isPositive) => {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const p1 = (hash % 10) + 3;
  const p2 = ((hash * 2) % 12) + 4;

  return isPositive
    ? `M0,16 Q10,${p1} 20,${p2} T40,2`
    : `M0,${p1} Q10,16 20,${p2} T40,18`;
};

export default function MarketTicker({ onSelectCoin, selectedCoin }) {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Load favorited coins from localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorite_coins');
    return saved ? JSON.parse(saved) : [];
  });

  const loadPrices = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const data = await fetchMarketOverview();
      if (data && Array.isArray(data)) {
        setCoins(data);
      } else {
        setHasError(true);
      }
    } catch (err) {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 10000); // 10s auto-refresh polling
    return () => clearInterval(interval);
  }, []);

  // Toggle favorite starring & persist to localStorage
  const toggleFavorite = (symbol, e) => {
    e.stopPropagation(); // Prevents selecting card on star click
    const updated = favorites.includes(symbol)
      ? favorites.filter((s) => s !== symbol)
      : [...favorites, symbol];
    setFavorites(updated);
    localStorage.setItem('favorite_coins', JSON.stringify(updated));
  };

  // Sort starred assets to the front of the list
  const sortedCoins = [...coins].sort((a, b) => {
    const aFav = favorites.includes(a.symbol);
    const bFav = favorites.includes(b.symbol);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const filteredCoins = sortedCoins.filter(
    (coin) =>
      coin.symbol.toLowerCase().includes(search.toLowerCase()) ||
      coin.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Search & Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', color: '#8888a0', fontWeight: '700', letterSpacing: '0.5px' }}>
          MARKET OVERVIEW
        </span>
        <input
          type="text"
          placeholder="Search ticker (e.g. SOL)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            backgroundColor: '#14141e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            outline: 'none',
            width: '200px',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => (e.target.style.borderColor = '#00ff7f')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        />
      </div>

      {/* Connection Error Banner */}
      {hasError && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: '10px',
            color: '#ff4d4d',
            fontSize: '13px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}
        >
          <span>⚠️ Failed to sync market prices. Backend or CoinGecko API may be unreachable.</span>
          <button
            onClick={loadPrices}
            style={{
              backgroundColor: '#ff4d4d',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Horizontal Ticker Row */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          padding: '8px 4px 16px 4px'
        }}
      >
        {loading ? (
          /* Animated Skeleton Loaders */
          [1, 2, 3, 4, 5, 6].map((n) => (
            <motion.div
              key={n}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                minWidth: '140px',
                height: '110px',
                backgroundColor: '#1a1a26',
                borderRadius: '12px'
              }}
            />
          ))
        ) : filteredCoins.length === 0 && !hasError ? (
          <div style={{ padding: '20px', color: '#aaa', fontSize: '14px' }}>
            No cryptocurrency found matching "{search}"
          </div>
        ) : (
          <AnimatePresence>
            {filteredCoins.map((coin) => {
              const isPositive = coin.change24h >= 0;
              const isSelected = coin.symbol === selectedCoin;
              const isFav = favorites.includes(coin.symbol);

              return (
                <motion.div
                  key={coin.symbol}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectCoin && onSelectCoin(coin.symbol)}
                  style={{
                    cursor: 'pointer',
                    padding: '14px 16px',
                    backgroundColor: '#12121a',
                    borderRadius: '12px',
                    minWidth: '140px',
                    border: isSelected
                      ? '1px solid #00ff7f'
                      : isPositive
                      ? '1px solid rgba(0, 255, 127, 0.15)'
                      : '1px solid rgba(255, 77, 77, 0.15)',
                    boxShadow: isSelected
                      ? '0 0 16px rgba(0, 255, 127, 0.35)'
                      : '0 4px 12px rgba(0, 0, 0, 0.4)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Star Button */}
                      <span
                        onClick={(e) => toggleFavorite(coin.symbol, e)}
                        style={{
                          cursor: 'pointer',
                          color: isFav ? '#ffd700' : '#444455',
                          fontSize: '14px',
                          transition: 'color 0.2s'
                        }}
                        title={isFav ? 'Unpin coin' : 'Pin to front'}
                      >
                        ★
                      </span>
                      <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{coin.symbol}</span>
                    </div>

                    {/* Unique Sparkline SVG */}
                    <svg width="32" height="16" viewBox="0 0 40 20">
                      <path
                        d={getSparklinePath(coin.symbol, isPositive)}
                        fill="none"
                        stroke={isPositive ? '#00ff7f' : '#ff4d4d'}
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>

                  {/* Price */}
                  <div style={{ fontSize: '15px', marginTop: '6px', fontWeight: '600' }}>
                    ${coin.price ? coin.price.toLocaleString() : '0.00'}
                  </div>

                  {/* 24h Percentage Change */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: isPositive ? '#00ff7f' : '#ff4d4d',
                      marginTop: '2px',
                      fontWeight: '600'
                    }}
                  >
                    {isPositive ? '▲' : '▼'} {coin.change24h ? coin.change24h.toFixed(2) : '0.00'}%
                  </div>

                  {/* 24h Volume */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#8888a0',
                      marginTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: '6px'
                    }}
                  >
                    Vol: ${coin.volume24h ? (coin.volume24h / 1e6).toFixed(1) + 'M' : 'N/A'}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}