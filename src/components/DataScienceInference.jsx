import React from 'react';
import { Award } from 'lucide-react';

export default function DataScienceInference({ assets, transactions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>
      
      {/* Overview Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#0f172a', border: '1px solid rgba(0, 229, 255, 0.3)', boxShadow: '0 0 25px rgba(0, 229, 255, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={24} color="var(--accent-gold)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>Market Analytics</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
        
        {/* Fear & Greed Sentiment Gauge */}
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', background: '#0f172a' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
            Market Sentiment Index
          </h4>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '8px solid var(--accent-green)', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-green-glow)', background: '#131d31' }}>
            <span className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)' }}>74</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>GREED</span>
          </div>
        </div>

        {/* Buy vs Sell Order Distribution */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: '#0f172a' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
            Order Flow Distribution (Volume Ratio)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Buy Volume (Bids)</span>
                <span className="mono" style={{ color: 'var(--accent-green)' }}>62.4%</span>
              </div>
              <div style={{ width: '100%', height: 12, background: '#131d31', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '62.4%', height: '100%', background: 'var(--accent-green)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>Sell Volume (Asks)</span>
                <span className="mono" style={{ color: 'var(--accent-red)' }}>37.6%</span>
              </div>
              <div style={{ width: '100%', height: 12, background: '#131d31', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '37.6%', height: '100%', background: 'var(--accent-red)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Volatility Index */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: '#0f172a' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
            30-Day Volatility Variance
          </h4>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            4.82% <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>(Moderate Risk)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
