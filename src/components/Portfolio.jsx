import React from 'react';
import { Wallet, PieChart, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, RefreshCw, Layers } from 'lucide-react';

export default function Portfolio({ 
  userBalance, 
  userHoldings, 
  cryptoAssets, 
  transactions,
  totalPortfolioValue,
  onExecuteOrder,
  onResetPortfolio
}) {
  // Calculate invested holdings values
  let totalInvestedCryptoValue = 0;
  const holdingList = [];

  Object.entries(userHoldings).forEach(([symbol, amount]) => {
    if (amount > 0) {
      const asset = cryptoAssets.find(a => a.symbol === symbol) || { price: 0, name: symbol, color: '#00e5ff' };
      const currentValue = amount * asset.price;
      totalInvestedCryptoValue += currentValue;

      // Calculate approximate cost basis from transactions
      const assetTxs = transactions.filter(t => t.symbol === symbol && t.type === 'BUY');
      const totalBuyUsd = assetTxs.reduce((acc, t) => acc + t.totalUSD, 0);
      const totalBuyAmount = assetTxs.reduce((acc, t) => acc + t.amount, 0);
      const avgBuyPrice = totalBuyAmount > 0 ? totalBuyUsd / totalBuyAmount : asset.price;
      
      const pnlUsd = currentValue - (amount * avgBuyPrice);
      const pnlPct = avgBuyPrice > 0 ? ((asset.price - avgBuyPrice) / avgBuyPrice) * 100 : 0;

      holdingList.push({
        symbol,
        name: asset.name,
        amount,
        color: asset.color || '#00e5ff',
        currentPrice: asset.price,
        currentValue,
        avgBuyPrice,
        pnlUsd,
        pnlPct,
        assetObj: asset
      });
    }
  });

  const totalPnLUsd = totalPortfolioValue - 10000;
  const totalPnLPct = (totalPnLUsd / 10000) * 100;
  const isPositivePnl = totalPnLUsd >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>
      
      {/* Portfolio Overview Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Total Portfolio Value
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Initial capital: $10,000.00 USDT
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Available USDT Balance
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)' }}>
            ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Liquid Cash for Trading
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Crypto Holdings Value
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
            ${totalInvestedCryptoValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            {holdingList.length} Active Crypto Position(s)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Total Profit / Loss (PnL)
          </div>
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: isPositivePnl ? 'var(--accent-green)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {isPositivePnl ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            {isPositivePnl ? '+' : ''}${totalPnLUsd.toFixed(2)}
          </div>
          <div className="mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: isPositivePnl ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '0.2rem' }}>
            ({isPositivePnl ? '+' : ''}{totalPnLPct.toFixed(2)}% Return)
          </div>
        </div>

      </div>

      {/* Asset Allocation & Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
        
        {/* Holdings Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Wallet size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Your Crypto Holdings</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onResetPortfolio}>
              <RefreshCw size={14} /> Reset Balance to $10k
            </button>
          </div>

          {holdingList.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <PieChart size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p>No active crypto holdings in your portfolio.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Switch to the <strong>Trade</strong> tab to execute your first order!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.6rem' }}>Asset</th>
                    <th style={{ padding: '0.6rem' }}>Holdings</th>
                    <th style={{ padding: '0.6rem' }}>Avg Buy Price</th>
                    <th style={{ padding: '0.6rem' }}>Current Price</th>
                    <th style={{ padding: '0.6rem' }}>Market Value</th>
                    <th style={{ padding: '0.6rem' }}>Unrealized PnL</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingList.map((item) => {
                    const isItemPositive = item.pnlUsd >= 0;
                    return (
                      <tr key={item.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem 0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: item.color }}>{item.symbol}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.name}</span>
                          </div>
                        </td>
                        <td className="mono" style={{ padding: '0.75rem 0.6rem', fontWeight: 600 }}>
                          {item.amount} {item.symbol}
                        </td>
                        <td className="mono" style={{ padding: '0.75rem 0.6rem', color: 'var(--text-secondary)' }}>
                          ${item.avgBuyPrice.toFixed(2)}
                        </td>
                        <td className="mono" style={{ padding: '0.75rem 0.6rem', fontWeight: 600 }}>
                          ${item.currentPrice.toFixed(2)}
                        </td>
                        <td className="mono" style={{ padding: '0.75rem 0.6rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          ${item.currentValue.toFixed(2)}
                        </td>
                        <td className="mono" style={{ padding: '0.75rem 0.6rem', fontWeight: 700, color: isItemPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          {isItemPositive ? '+' : ''}${item.pnlUsd.toFixed(2)} ({isItemPositive ? '+' : ''}{item.pnlPct.toFixed(2)}%)
                        </td>
                        <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-sell btn-sm"
                            onClick={() => onExecuteOrder({
                              asset: item.assetObj,
                              symbol: item.symbol,
                              side: 'SELL',
                              type: 'MARKET',
                              amount: item.amount,
                              price: item.currentPrice,
                              totalUSD: item.currentValue,
                              leverage: 1,
                              fee: item.currentValue * 0.001
                            })}
                          >
                            Sell All
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Asset Distribution Bar & Chart */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
            <PieChart size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Asset Allocation</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {/* Cash vs Crypto Ratio */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                <span>USDT Cash</span>
                <span className="mono">{((userBalance / totalPortfolioValue) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(userBalance / totalPortfolioValue) * 100}%`, height: '100%', background: 'var(--accent-green)' }} />
              </div>
            </div>

            {holdingList.map((item) => {
              const sharePct = (item.currentValue / totalPortfolioValue) * 100;
              return (
                <div key={item.symbol}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>{item.symbol}</span>
                    <span className="mono">{sharePct.toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${sharePct}%`, height: '100%', background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
