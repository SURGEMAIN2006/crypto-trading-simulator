import React, { useState, useEffect } from 'react';
import { Layers, ArrowDownUp, Zap, ShieldCheck } from 'lucide-react';
import { generateOrderBook } from '../services/cryptoEngine';

export default function OrderBook({ selectedAsset }) {
  const [orderBook, setOrderBook] = useState(() => generateOrderBook(selectedAsset.price));
  const [recentTrades, setRecentTrades] = useState([]);

  // Stream order book updates every 1.5 seconds
  useEffect(() => {
    setOrderBook(generateOrderBook(selectedAsset.price));

    const interval = setInterval(() => {
      setOrderBook(generateOrderBook(selectedAsset.price));

      // Simulate live matched trade
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const tradePrice = selectedAsset.price * (1 + (Math.random() - 0.5) * 0.001);
      const tradeAmount = (Math.random() * 0.5 + 0.05).toFixed(4);

      setRecentTrades((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          side,
          price: Number(tradePrice.toFixed(selectedAsset.price < 1 ? 4 : 2)),
          amount: tradeAmount
        },
        ...prev.slice(0, 14)
      ]);
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginTop: '1.25rem' }}>
      
      {/* Order Book Depth Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Order Book & Matching Depth</h2>
            <span className="badge badge-purple">{selectedAsset.symbol}/USDT</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} color="var(--accent-green)" />
            <span>Matching Engine: Active (Vishakha Lead)</span>
          </div>
        </div>

        {/* Bids and Asks Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          {/* ASKS (SELL ORDERS) */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>ASKS (Sellers Wall)</span>
              <span>Spread Depth</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
              <span>Price (USDT)</span>
              <span style={{ textAlign: 'right' }}>Size ({selectedAsset.symbol})</span>
              <span style={{ textAlign: 'right' }}>Total (USDT)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {orderBook.asks.map((ask, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.4rem',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  {/* Depth Background Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${ask.depth}%`,
                      background: 'rgba(255, 23, 68, 0.15)',
                      pointerEvents: 'none'
                    }}
                  />
                  <span className="mono" style={{ color: 'var(--accent-red)', fontWeight: 600, zIndex: 1 }}>
                    ${ask.price}
                  </span>
                  <span className="mono" style={{ textAlign: 'right', color: 'var(--text-primary)', zIndex: 1 }}>
                    {ask.amount}
                  </span>
                  <span className="mono" style={{ textAlign: 'right', color: 'var(--text-secondary)', zIndex: 1 }}>
                    ${ask.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BIDS (BUY ORDERS) */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>BIDS (Buyers Wall)</span>
              <span>Spread Depth</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem', marginBottom: '0.3rem' }}>
              <span>Price (USDT)</span>
              <span style={{ textAlign: 'right' }}>Size ({selectedAsset.symbol})</span>
              <span style={{ textAlign: 'right' }}>Total (USDT)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {orderBook.bids.map((bid, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.4rem',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  {/* Depth Background Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: `${bid.depth}%`,
                      background: 'rgba(0, 230, 118, 0.15)',
                      pointerEvents: 'none'
                    }}
                  />
                  <span className="mono" style={{ color: 'var(--accent-green)', fontWeight: 600, zIndex: 1 }}>
                    ${bid.price}
                  </span>
                  <span className="mono" style={{ textAlign: 'right', color: 'var(--text-primary)', zIndex: 1 }}>
                    {bid.amount}
                  </span>
                  <span className="mono" style={{ textAlign: 'right', color: 'var(--text-secondary)', zIndex: 1 }}>
                    ${bid.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Spread Highlight Bar */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowDownUp size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Market Spread:</span>
            <span className="mono text-gold" style={{ fontWeight: 700 }}>${orderBook.spread} USDT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Mid Price: <span className="mono text-cyan">${selectedAsset.price}</span>
          </div>
        </div>

      </div>

      {/* Real-time Order Matching Stream */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
          <Zap size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Trade Executions</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
          <span>Time</span>
          <span style={{ textAlign: 'center' }}>Price (USDT)</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '420px', overflowY: 'auto' }}>
          {recentTrades.map((trade) => (
            <div
              key={trade.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                fontSize: '0.75rem',
                padding: '0.2rem 0',
                borderBottom: '1px stroke rgba(255,255,255,0.03)'
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{trade.time}</span>
              <span className="mono" style={{ textAlign: 'center', color: trade.side === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                ${trade.price}
              </span>
              <span className="mono" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                {trade.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
