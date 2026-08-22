import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#00f2fe', '#4facfe', '#00f2c3'];

export default function PortfolioApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [tradeFeedback, setTradeFeedback] = useState(null);

  const fetchUserData = async (userId) => {
    try {
      setLoadingPortfolio(true);
      const [portRes, txnRes] = await Promise.all([
        fetch(`http://localhost:5000/api/portfolio/user/${userId}`),
        fetch(`http://localhost:5000/api/transactions/user/${userId}`)
      ]);
      setPortfolio(await portRes.json());
      setTransactions(await txnRes.json());
    } catch (err) {
      console.error('Data sync error:', err);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchUserData(currentUser.userId);
    const interval = setInterval(() => fetchUserData(currentUser.userId), 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'login' ? '/api/user/login' : '/api/user/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser({ userId: data.userId, name: data.name, email: data.email });
        setAuthForm({ name: '', email: '', password: '' });
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Unable to connect to service server');
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setTradeFeedback(null);

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          symbol: selectedSymbol,
          type: tradeType,
          quantity: parseFloat(quantity)
        })
      });
      const result = await res.json();
      if (res.ok) {
        setTradeFeedback({ type: 'success', text: `ORDER EXECUTED // ${tradeType} ${quantity} ${selectedSymbol}` });
        setQuantity('');
        fetchUserData(currentUser.userId);
      } else {
        setTradeFeedback({ type: 'error', text: result.message });
      }
    } catch (err) {
      setTradeFeedback({ type: 'error', text: 'NETWORK EXECUTION ERROR' });
    }
  };

  if (!currentUser) {
    return (
      <div style={styles.authContainer}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={styles.cyberAuthCard}>
          <div style={styles.cyberGlow} />
          
          <div style={styles.authHeader}>
            <div style={styles.cyberBadge}>SYS_SERVICE // 02</div>
            <h2 style={styles.cyberTitle}>{authMode === 'login' ? 'TERMINAL ACCESS' : 'NEW OPERATOR'}</h2>
            <p style={styles.cyberSubtitle}>Enter credentials to establish secure connection</p>
          </div>

          <form onSubmit={handleAuthSubmit} style={styles.authForm}>
            {authMode === 'register' && (
              <div style={styles.fieldGroup}>
                <label style={styles.cyberLabel}>OPERATOR NAME</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  required
                  style={styles.cyberInput}
                />
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.cyberLabel}>IDENTIFIER (EMAIL)</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                style={styles.cyberInput}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.cyberLabel}>ACCESS CODE</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
                style={styles.cyberInput}
              />
            </div>

            {authError && <div style={styles.errorText}>⚠ {authError}</div>}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={styles.cyberBtn}>
              {authMode === 'login' ? 'INITIALIZE SESSION' : 'REGISTER CREW'}
            </motion.button>
          </form>

          <div style={styles.authSwitch}>
            <button style={styles.switchBtn} onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
              [{authMode === 'login' ? 'CREATE NEW OPERATOR ID' : 'RETURN TO TERMINAL LOGIN'}]
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loadingPortfolio && !portfolio) {
    return <div style={styles.loadingText}>SYNCHRONIZING BLOCKCHAIN STATE...</div>;
  }

  const pieData = portfolio?.holdings 
    ? Object.entries(portfolio.holdings).map(([sym, details]) => ({ name: sym, value: details.totalValue }))
    : [];

  const isProfit = (portfolio?.profitLoss || 0) >= 0;

  return (
    <div style={styles.shell}>
      {/* Navbar */}
      <div style={styles.navBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.statusPulse} />
          <div>
            <h2 style={styles.navTitle}>PORTFOLIO // SERVICE 02</h2>
            <span style={styles.userBadge}>OPERATOR: {currentUser.name} [{currentUser.email}]</span>
          </div>
        </div>
        <button onClick={() => setCurrentUser(null)} style={styles.logoutBtn}>TERMINATE SESSION</button>
      </div>

      {/* Financial Metrics Cards */}
      <div style={styles.metricsGrid}>
        <motion.div whileHover={{ y: -4 }} style={styles.cyberCard}>
          <span style={styles.metricLabel}>TOTAL PORTFOLIO VALUATION</span>
          <h2 style={styles.metricValue}>${portfolio?.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} style={styles.cyberCard}>
          <span style={styles.metricLabel}>LIQUID CASH BALANCE</span>
          <h2 style={styles.metricValue}>${portfolio?.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} style={styles.cyberCard}>
          <span style={styles.metricLabel}>ACTIVE ASSET VALUE</span>
          <h2 style={styles.metricValue}>${portfolio?.investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} style={{ ...styles.cyberCard, borderImage: isProfit ? 'linear-gradient(to right, #00f2c3, transparent) 1' : 'linear-gradient(to right, #ff0055, transparent) 1' }}>
          <span style={styles.metricLabel}>NET PROFIT / LOSS</span>
          <h2 style={{ ...styles.metricValue, color: isProfit ? '#00f2c3' : '#ff0055' }}>
            {isProfit ? '+' : ''}${portfolio?.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </motion.div>
      </div>

      {/* Main Panels */}
      <div style={styles.mainGrid}>
        <div style={styles.cyberPanel}>
          <h3 style={styles.panelTitle}>// HOLDINGS LEDGER</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>ASSET</th>
                <th style={styles.th}>QTY</th>
                <th style={styles.th}>SPOT PRICE</th>
                <th style={styles.th}>VALUATION</th>
              </tr>
            </thead>
            <tbody>
              {portfolio?.holdings && Object.entries(portfolio.holdings).map(([symbol, details]) => (
                <tr key={symbol} style={styles.tr}>
                  <td style={{ ...styles.td, color: '#00f2fe', fontWeight: 'bold' }}>{symbol}</td>
                  <td style={styles.td}>{details.amount}</td>
                  <td style={styles.td}>${details.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td style={styles.td}>${details.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.cyberPanel}>
          <h3 style={styles.panelTitle}>// ORDER EXECUTION ENGINE</h3>
          <form onSubmit={handleOrderSubmit} style={styles.tradeForm}>
            <div style={styles.toggleGroup}>
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                style={{ ...styles.toggleBtn, border: tradeType === 'BUY' ? '1px solid #00f2c3' : '1px solid #1f293d', color: tradeType === 'BUY' ? '#00f2c3' : '#64748b' }}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                style={{ ...styles.toggleBtn, border: tradeType === 'SELL' ? '1px solid #ff0055' : '1px solid #1f293d', color: tradeType === 'SELL' ? '#ff0055' : '#64748b' }}
              >
                SELL / SHORT
              </button>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.cyberLabel}>SELECT ASSET</label>
              <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)} style={styles.cyberInput}>
                <option value="BTC">BTC - Bitcoin</option>
                <option value="ETH">ETH - Ethereum</option>
                <option value="SOL">SOL - Solana</option>
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.cyberLabel}>QUANTITY</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={styles.cyberInput}
              />
            </div>

            <motion.button whileHover={{ scale: 1.01 }} type="submit" style={{ ...styles.cyberBtn, background: tradeType === 'BUY' ? 'linear-gradient(135deg, #00f2c3 0%, #00a8ff 100%)' : 'linear-gradient(135deg, #ff0055 0%, #ff5050 100%)' }}>
              EXECUTE {tradeType} ORDER
            </motion.button>

            {tradeFeedback && (
              <div style={{ ...styles.feedbackBox, color: tradeFeedback.type === 'success' ? '#00f2c3' : '#ff0055', borderColor: tradeFeedback.type === 'success' ? '#00f2c3' : '#ff0055' }}>
                {tradeFeedback.text}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Visual Allocation & Transaction Log */}
      <div style={{ ...styles.mainGrid, marginTop: '24px' }}>
        <div style={styles.cyberPanel}>
          <h3 style={styles.panelTitle}>// ALLOCATION METRICS</h3>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={6} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0a0f1d', borderRadius: 0, border: '1px solid #00f2fe' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.cyberPanel}>
          <h3 style={styles.panelTitle}>// TRANSACTION HISTORY</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>TYPE</th>
                <th style={styles.th}>CRYPTO</th>
                <th style={styles.th}>QTY</th>
                <th style={styles.th}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: '#475569' }}>NO TRANSACTIONS LOGGED</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.txnId} style={styles.tr}>
                    <td style={{ ...styles.td, fontFamily: 'monospace' }}>{t.txnId}</td>
                    <td style={{ ...styles.td, color: t.type === 'BUY' ? '#00f2c3' : '#ff0055', fontWeight: 'bold' }}>{t.type}</td>
                    <td style={styles.td}>{t.symbol}</td>
                    <td style={styles.td}>{t.quantity}</td>
                    <td style={styles.td}>${t.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Cyberpunk Neumorphism Dark Theme Stylesheet
const styles = {
  shell: { maxWidth: '1200px', margin: '0 auto', padding: '32px 20px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: '#e2e8f0', background: '#050811', minHeight: '100vh' },
  navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', background: 'radial-gradient(circle at top left, rgba(0,242,254,0.05), transparent)', padding: '20px 24px', border: '1px solid rgba(0, 242, 254, 0.2)', boxShadow: '0 0 15px rgba(0,242,254,0.05)' },
  statusPulse: { width: '10px', height: '10px', borderRadius: '50%', background: '#00f2c3', boxShadow: '0 0 10px #00f2c3' },
  navTitle: { margin: 0, fontSize: '1.2rem', letterSpacing: '2px', color: '#fff' },
  userBadge: { fontSize: '0.75rem', color: '#64748b' },
  logoutBtn: { background: 'transparent', color: '#ff0055', border: '1px solid #ff0055', padding: '8px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '1px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' },
  cyberCard: { background: '#0a0f1d', borderLeft: '3px solid #00f2fe', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  metricLabel: { fontSize: '0.65rem', color: '#64748b', letterSpacing: '1.5px' },
  metricValue: { margin: '12px 0 0 0', fontSize: '1.5rem', color: '#fff' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  cyberPanel: { background: '#0a0f1d', border: '1px solid rgba(0,242,254,0.15)', padding: '24px', position: 'relative' },
  panelTitle: { margin: '0 0 20px 0', fontSize: '0.9rem', color: '#00f2fe', letterSpacing: '2px' },
  tradeForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  toggleGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  toggleBtn: { padding: '12px', background: 'transparent', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  cyberLabel: { fontSize: '0.7rem', color: '#64748b', letterSpacing: '1px' },
  cyberInput: { padding: '12px', background: '#050811', border: '1px solid #1f293d', color: '#00f2fe', fontFamily: 'monospace', outline: 'none' },
  cyberBtn: { padding: '14px', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '1.5px' },
  feedbackBox: { padding: '10px', border: '1px solid', fontSize: '0.75rem', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' },
  thRow: { borderBottom: '1px solid #1f293d' },
  th: { padding: '12px 8px', color: '#64748b' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.02)' },
  td: { padding: '12px 8px' },
  
  // Auth Layout Styling
  authContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#03050c' },
  cyberAuthCard: { width: '100%', maxWidth: '420px', background: '#0a0f1d', border: '1px solid #00f2fe', padding: '40px', boxShadow: '0 0 30px rgba(0,242,254,0.15)', position: 'relative' },
  cyberBadge: { display: 'inline-block', color: '#00f2c3', border: '1px solid #00f2c3', padding: '2px 8px', fontSize: '0.65rem', marginBottom: '12px' },
  cyberTitle: { margin: 0, fontSize: '1.4rem', color: '#fff', letterSpacing: '2px' },
  cyberSubtitle: { margin: '8px 0 24px 0', fontSize: '0.75rem', color: '#64748b' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '18px' },
  errorText: { color: '#ff0055', fontSize: '0.75rem', textAlign: 'center' },
  authSwitch: { marginTop: '24px', textAlign: 'center' },
  switchBtn: { background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75rem' },
  loadingText: { color: '#00f2fe', textAlign: 'center', marginTop: '200px', fontFamily: 'monospace', letterSpacing: '2px' }
};