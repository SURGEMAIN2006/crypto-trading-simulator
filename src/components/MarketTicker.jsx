import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MarketTicker({ assets, onSelectAsset, selectedAssetId }) {
  return (
    <div style={{ 
      background: '#07090e', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)', 
      padding: '0.6rem 0', 
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0 1.5rem', scrollbarWidth: 'none' }}>
        {assets.map((asset) => {
          const isSelected = selectedAssetId === asset.id || selectedAssetId === asset.symbol;
          const isPositive = asset.change24h >= 0;
          return (
            <div
              key={asset.id || asset.symbol}
              onClick={() => onSelectAsset(asset)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 0.9rem',
                background: isSelected ? '#13233a' : '#0f172a',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '170px',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: isSelected ? '0 0 12px rgba(0, 229, 255, 0.25)' : 'none'
              }}
            >
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: '50%', 
                background: asset.color + '22',
                color: asset.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: `1px solid ${asset.color}44`
              }}>
                {asset.icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>{asset.symbol}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/USDT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                    ${asset.price < 1 ? asset.price.toFixed(4) : asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 600, 
                      display: 'flex', 
                      alignItems: 'center',
                      color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}
                  >
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
