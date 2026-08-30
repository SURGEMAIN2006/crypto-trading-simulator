import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MarketTicker from './components/MarketTicker';
import TradingPanel from './components/TradingPanel';
import OrderBook from './components/OrderBook';
import Portfolio from './components/Portfolio';
import BlockchainLedger from './components/BlockchainLedger';
import DataScienceInference from './components/DataScienceInference';
import TeamModal from './components/TeamModal';
import AuthScreen from './components/AuthScreen';

import { api } from './services/api';
import { 
  INITIAL_CRYPTO_ASSETS, 
  generateHistoryChartData, 
  generateTxHash,
  INITIAL_BLOCKS,
  INITIAL_TRANSACTIONS 
} from './services/cryptoEngine';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cryptosim_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!currentUser);

  const [activeTab, setActiveTab] = useState('trade');
  const [cryptoAssets, setCryptoAssets] = useState(INITIAL_CRYPTO_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState(INITIAL_CRYPTO_ASSETS[0]);
  const [chartData, setChartData] = useState(() => generateHistoryChartData(INITIAL_CRYPTO_ASSETS[0].price));

  // Wallet & Portfolio State
  const [userBalance, setUserBalance] = useState(currentUser ? currentUser.usdtBalance || 10000.00 : 10000.00);
  const [userHoldings, setUserHoldings] = useState(currentUser ? currentUser.holdings || { BTC: 0.1, ETH: 1.0, SOL: 2.5 } : { BTC: 0.1, ETH: 1.0, SOL: 2.5 });

  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState('CHECKING');

  // Login handler
  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setUserBalance(user.usdtBalance || 10000.00);
    if (user.holdings) setUserHoldings(user.holdings);
    try {
      localStorage.setItem('cryptosim_user', JSON.stringify(user));
      if (token) localStorage.setItem('cryptosim_token', token);
    } catch (e) {}
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('cryptosim_user');
      localStorage.removeItem('cryptosim_token');
    } catch (e) {}
  };

  // Check Microservices Gateway status on mount and poll every 10 seconds
  useEffect(() => {
    async function checkHealth() {
      const health = await api.getSystemHealth();
      if (health && (health.status === 'HEALTHY' || health.status === 'UP' || health.status === 'DEGRADED')) {
        setGatewayStatus('UP');
      } else {
        setGatewayStatus('OFFLINE');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Market Tickers from Market Microservice (or fallback to tick interval)
  useEffect(() => {
    async function fetchMarketFeeds() {
      const res = await api.getLivePrices();
      if (res && res.success && Array.isArray(res.assets) && res.assets.length > 0) {
        setCryptoAssets(prevAssets => {
          return res.assets.map(remoteAsset => {
            const localMatch = prevAssets.find(a => a.symbol === remoteAsset.symbol);
            return {
              ...localMatch,
              ...remoteAsset,
              id: localMatch ? localMatch.id : remoteAsset.symbol.toLowerCase(),
              icon: localMatch ? localMatch.icon : '🪙',
              color: localMatch ? localMatch.color : '#00e5ff'
            };
          });
        });
      }
    }

    fetchMarketFeeds();
    const interval = setInterval(() => {
      if (gatewayStatus === 'UP') {
        fetchMarketFeeds();
      } else {
        // Fallback Brownian motion tick simulation
        setCryptoAssets((prevAssets) => {
          return prevAssets.map((asset) => {
            const tickDelta = (Math.random() - 0.49) * 0.008;
            const newPrice = Math.max(0.001, asset.price * (1 + tickDelta));
            const newChange = asset.change24h + (tickDelta * 50);

            return {
              ...asset,
              price: Number(newPrice.toFixed(newPrice < 1 ? 4 : 2)),
              change24h: Number(newChange.toFixed(2)),
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice)
            };
          });
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [gatewayStatus]);

  // Fetch Ledger Transactions & Blocks from Transaction Microservice
  useEffect(() => {
    async function fetchLedger() {
      if (gatewayStatus === 'UP') {
        const res = await api.getBlockchainLedger();
        if (res && res.success) {
          if (Array.isArray(res.trades) && res.trades.length > 0) {
            setTransactions(res.trades);
          }
          if (Array.isArray(res.blocks) && res.blocks.length > 0) {
            setBlocks(res.blocks);
          }
        }
      }
    }
    fetchLedger();
  }, [gatewayStatus]);

  // Update selected asset price reference and chart when selected asset ticks
  useEffect(() => {
    const updated = cryptoAssets.find(a => a.symbol === selectedAsset.symbol || a.id === selectedAsset.id);
    if (updated && updated.price !== selectedAsset.price) {
      setSelectedAsset(updated);
    }
  }, [cryptoAssets, selectedAsset.symbol, selectedAsset.id]);

  // Handle asset selection change
  const handleSelectAsset = async (asset) => {
    setSelectedAsset(asset);
    if (gatewayStatus === 'UP') {
      const chartRes = await api.getAssetChartHistory(asset.symbol);
      if (chartRes && chartRes.success && Array.isArray(chartRes.points)) {
        setChartData(chartRes.points);
        return;
      }
    }
    setChartData(generateHistoryChartData(asset.price));
  };

  // Compute total portfolio valuation (USDT + Crypto holdings)
  const totalPortfolioValue = userBalance + Object.entries(userHoldings).reduce((acc, [sym, qty]) => {
    const asset = cryptoAssets.find(a => a.symbol === sym);
    return acc + (asset ? qty * asset.price : 0);
  }, 0);

  // Handle executing a buy or sell order via Order Matching Microservice
  const handleExecuteOrder = async (order) => {
    const { symbol, side, amount, price, totalUSD, fee } = order;

    if (gatewayStatus === 'UP') {
      const matchRes = await api.executeOrder({
        symbol,
        side,
        type: order.type || 'MARKET',
        amount,
        price,
        userId: currentUser ? currentUser.id : 'u-101'
      });

      if (matchRes && matchRes.success) {
        // Update portfolio state from User Service response
        if (matchRes.portfolio) {
          setUserBalance(matchRes.portfolio.usdtBalance);
          setUserHoldings(matchRes.portfolio.holdings);
        }
        // Update transaction and mined block from Transaction Service
        if (matchRes.transaction) {
          setTransactions(prev => [matchRes.transaction, ...prev]);
        }
        if (matchRes.minedBlock) {
          setBlocks(prev => [...prev, matchRes.minedBlock]);
        }
        return;
      }
    }

    // Local fallback order execution
    if (side === 'BUY') {
      setUserBalance((prev) => prev - (totalUSD + fee));
      setUserHoldings((prev) => ({
        ...prev,
        [symbol]: (prev[symbol] || 0) + amount
      }));
    } else if (side === 'SELL') {
      setUserBalance((prev) => prev + (totalUSD - fee));
      setUserHoldings((prev) => ({
        ...prev,
        [symbol]: Math.max(0, (prev[symbol] || 0) - amount)
      }));
    }

    const txHash = generateTxHash();

    const newTx = {
      id: `tx-${Date.now()}`,
      symbol,
      type: side,
      amount,
      price,
      totalUSD,
      timestamp: new Date().toLocaleTimeString(),
      txHash,
      status: 'SUCCESS',
      orderType: order.type
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (transactions.length % 2 === 0) {
      const newBlockIndex = blocks.length > 0 ? blocks[blocks.length - 1].blockIndex + 1 : 1000;
      const newBlock = {
        blockIndex: newBlockIndex,
        timestamp: new Date().toLocaleTimeString(),
        hash: generateTxHash(),
        prevHash: blocks.length > 0 ? blocks[blocks.length - 1].hash : '0x00000000000000000000000000000000',
        transactionsCount: Math.floor(Math.random() * 15 + 5),
        validator: 'Node-01 (Primary Ledger Validator)',
        gasUsed: `${Math.floor(Math.random() * 1000000 + 500000)} Gwei`,
        status: 'Confirmed'
      };
      setBlocks((prev) => [...prev, newBlock]);
    }
  };

  // Reset portfolio balance
  const handleResetPortfolio = () => {
    setUserBalance(10000.00);
    setUserHoldings({ BTC: 0.1, ETH: 1.0, SOL: 2.5 });
  };

  // If user is not authenticated, show Sign In / Login Screen first!
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Bar with Gateway Connectivity & User Profile */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        portfolioBalance={userBalance}
        totalPortfolioValue={totalPortfolioValue}
        onResetPortfolio={handleResetPortfolio}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        gatewayStatus={gatewayStatus}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Live Market Ticker Tape */}
      <MarketTicker
        assets={cryptoAssets}
        onSelectAsset={handleSelectAsset}
        selectedAssetId={selectedAsset.id || selectedAsset.symbol}
      />

      {/* Main Tab Content */}
      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'trade' && (
          <TradingPanel
            selectedAsset={selectedAsset}
            chartData={chartData}
            userBalance={userBalance}
            userHoldings={userHoldings}
            onExecuteOrder={handleExecuteOrder}
          />
        )}

        {activeTab === 'orderbook' && (
          <OrderBook selectedAsset={selectedAsset} />
        )}

        {activeTab === 'portfolio' && (
          <Portfolio
            userBalance={userBalance}
            userHoldings={userHoldings}
            cryptoAssets={cryptoAssets}
            transactions={transactions}
            totalPortfolioValue={totalPortfolioValue}
            onExecuteOrder={handleExecuteOrder}
            onResetPortfolio={handleResetPortfolio}
          />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainLedger
            blocks={blocks}
            transactions={transactions}
          />
        )}

        {activeTab === 'analytics' && (
          <DataScienceInference
            assets={cryptoAssets}
            transactions={transactions}
          />
        )}
      </main>

      {/* System Architecture Specs Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.4)', marginTop: '2rem' }}>
        <p>
          Crypto Trading Simulator & SHA-256 Blockchain Ledger • Enterprise Microservices Platform
        </p>
      </footer>

    </div>
  );
}
