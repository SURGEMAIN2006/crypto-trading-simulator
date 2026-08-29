import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Layers, 
  Cpu, 
  BarChart2, 
  RefreshCw, 
  Server
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  portfolioBalance, 
  totalPortfolioValue,
  onResetPortfolio,
  onOpenTeamModal,
  gatewayStatus = 'UP'
}) {
  const tabs = [
    { id: 'trade', label: 'Live Market & Trade', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio & PnL', icon: Wallet },
    { id: 'orderbook', label: 'Order Book Depth', icon: Layers },
    { id: 'blockchain', label: 'Blockchain Ledger', icon: Cpu },
    { id: 'analytics', label: 'Quantitative Analytics', icon: BarChart2 },
  ];

  const isGatewayUp = gatewayStatus === 'UP' || gatewayStatus === 'HEALTHY';

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.8rem 1.5rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Platform Spec */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: 42, 
            height: 42, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #00e5ff 0%, #a855f7 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
          }}>
            <Cpu size={24} color="#000" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                CRYPTO<span style={{ color: 'var(--accent-cyan)' }}>SIM</span>
              </h1>
              <span className="badge badge-purple" style={{ cursor: 'pointer' }} onClick={onOpenTeamModal}>
                <Cpu size={12} /> System Specs
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Enterprise Microservices Architecture • SHA-256 Blockchain & Analytics
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.3rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn btn-sm"
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(168,85,247,0.2) 100%)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid transparent',
                  borderRadius: 8,
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Wallet & Gateway Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Testnet Balance
            </div>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onResetPortfolio}
            title="Reset Virtual Wallet to $10,000 USDT"
          >
            <RefreshCw size={14} />
            Reset
          </button>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: isGatewayUp ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 171, 0, 0.1)', 
            padding: '0.4rem 0.8rem', 
            borderRadius: 20, 
            border: `1px solid ${isGatewayUp ? 'rgba(0,230,118,0.3)' : 'rgba(255,171,0,0.3)'}` 
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isGatewayUp ? 'var(--accent-green)' : '#ffab00' }} className="pulse" />
            <Server size={12} color={isGatewayUp ? 'var(--accent-green)' : '#ffab00'} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isGatewayUp ? 'var(--accent-green)' : '#ffab00' }}>
              {isGatewayUp ? 'Microservices Connected' : 'SimNet Standalone'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
