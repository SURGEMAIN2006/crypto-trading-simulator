import React from 'react';
import { X, Layers, Cpu, ShieldCheck, Server, Activity } from 'lucide-react';

export default function TeamModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const modules = [
    { 
      name: 'API Gateway Proxy (Port 3000)', 
      role: 'Reverse Proxy & Routing', 
      icon: Server,
      color: 'var(--accent-cyan)',
      focus: 'Aggregated /api/health monitoring, CORS handling, route proxying to microservices' 
    },
    { 
      name: 'User & Auth Microservice (Port 3002)', 
      role: 'Identity & Portfolio Management', 
      icon: ShieldCheck,
      color: '#a855f7',
      focus: 'JWT Auth token validation, SHA-256 password hashing, USDT balance & holdings tracking' 
    },
    { 
      name: 'Market Feeds & Analytics (Port 3003)', 
      role: 'Real-time Tickers & Quantitative DS', 
      icon: Activity,
      color: 'var(--accent-green)',
      focus: 'Binance live API ticker ingestion, RSI (14), SMA-20, Volatility variance & Fear/Greed Index' 
    },
    { 
      name: 'Order Matching Engine (Port 3004)', 
      role: 'Order Book & Trade Execution', 
      icon: Layers,
      color: '#ffab00',
      focus: 'Price-Time priority matching, Market & Limit order depth, Inter-service trade settlement' 
    },
    { 
      name: 'Transaction & Blockchain Service (Port 3005)', 
      role: 'Immutable Ledger & Block Mining', 
      icon: Cpu,
      color: '#e84142',
      focus: 'SHA-256 block mining engine, prevHash linkage, gas estimation, ledger query endpoints' 
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{ maxWidth: '680px', width: '100%', padding: '2rem', borderRadius: 20, border: '1px solid rgba(0, 229, 255, 0.3)', boxShadow: '0 0 40px rgba(0, 229, 255, 0.2)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={24} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Microservices System Architecture</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Microservices Component Stack</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.3rem' }}>
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.8rem'
                }}
              >
                <div style={{ padding: '0.5rem', borderRadius: 8, background: `${m.color}22`, border: `1px solid ${m.color}44`, marginTop: '0.1rem' }}>
                  <Icon size={18} color={m.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', color: m.color, fontWeight: 600, marginTop: '0.1rem' }}>{m.role}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.3 }}>{m.focus}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
        >
          Close & Return to Platform
        </button>

      </div>
    </div>
  );
}
