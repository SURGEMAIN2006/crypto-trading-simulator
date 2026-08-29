// Crypto Engine Service: Handles real-time price simulation, order matching, blockchain hashing & analytics

export const INITIAL_CRYPTO_ASSETS = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    price: 65420.50,
    change24h: 3.42,
    high24h: 66100.00,
    low24h: 63200.00,
    volume24h: '32.4B USDT',
    marketCap: '1.28T USD',
    circulatingSupply: '19.7M BTC',
    color: '#F7931A'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    price: 3480.25,
    change24h: -1.15,
    high24h: 3560.00,
    low24h: 3410.00,
    volume24h: '18.9B USDT',
    marketCap: '418B USD',
    circulatingSupply: '120.2M ETH',
    color: '#627EEA'
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    icon: '◎',
    price: 145.80,
    change24h: 5.84,
    high24h: 148.50,
    low24h: 136.20,
    volume24h: '4.2B USDT',
    marketCap: '67.8B USD',
    circulatingSupply: '465M SOL',
    color: '#14F195'
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB Chain',
    icon: '❖',
    price: 580.10,
    change24h: 0.95,
    high24h: 588.00,
    low24h: 572.50,
    volume24h: '1.8B USDT',
    marketCap: '87.1B USD',
    circulatingSupply: '150.1M BNB',
    color: '#F3BA2F'
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP Ledger',
    icon: '✕',
    price: 0.584,
    change24h: 2.10,
    high24h: 0.602,
    low24h: 0.565,
    volume24h: '1.1B USDT',
    marketCap: '32.5B USD',
    circulatingSupply: '55.8B XRP',
    color: '#23292F'
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    icon: '₳',
    price: 0.452,
    change24h: -2.35,
    high24h: 0.478,
    low24h: 0.441,
    volume24h: '650M USDT',
    marketCap: '16.2B USD',
    circulatingSupply: '35.7B ADA',
    color: '#0033AD'
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    icon: 'Ð',
    price: 0.124,
    change24h: 8.45,
    high24h: 0.131,
    low24h: 0.112,
    volume24h: '1.4B USDT',
    marketCap: '17.9B USD',
    circulatingSupply: '144B DOGE',
    color: '#C2A633'
  },
  {
    id: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    icon: '▲',
    price: 32.40,
    change24h: -0.82,
    high24h: 33.50,
    low24h: 31.80,
    volume24h: '480M USDT',
    marketCap: '12.8B USD',
    circulatingSupply: '395M AVAX',
    color: '#E84142'
  }
];

// Generate synthetic historical chart data points for interactive charts
export function generateHistoryChartData(basePrice, pointsCount = 40, volatility = 0.015) {
  const points = [];
  let currentPrice = basePrice * (1 - volatility * 3);
  const now = Date.now();
  const timeStep = 3600 * 1000; // 1 hour step

  for (let i = pointsCount - 1; i >= 0; i--) {
    const time = new Date(now - i * timeStep);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    
    // Geometric Brownian motion step
    const changePercent = (Math.random() - 0.48) * volatility;
    currentPrice = currentPrice * (1 + changePercent);
    
    const open = currentPrice;
    const high = open * (1 + Math.random() * volatility * 0.5);
    const low = open * (1 - Math.random() * volatility * 0.5);
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(Math.random() * 50 + 10);

    points.push({
      time: timeStr,
      price: Number(close.toFixed(close < 1 ? 4 : 2)),
      open: Number(open.toFixed(open < 1 ? 4 : 2)),
      high: Number(high.toFixed(high < 1 ? 4 : 2)),
      low: Number(low.toFixed(low < 1 ? 4 : 2)),
      close: Number(close.toFixed(close < 1 ? 4 : 2)),
      volume
    });
  }
  return points;
}

// Generate real-time order book bids & asks depth around current asset price
export function generateOrderBook(currentPrice) {
  const bids = [];
  const asks = [];
  const levels = 8;
  const spreadPercent = 0.0005; // 0.05% spread

  let bidPrice = currentPrice * (1 - spreadPercent);
  let askPrice = currentPrice * (1 + spreadPercent);

  let cumulativeBidVol = 0;
  let cumulativeAskVol = 0;

  for (let i = 0; i < levels; i++) {
    const bidAmount = Number((Math.random() * 1.5 + 0.1).toFixed(3));
    const askAmount = Number((Math.random() * 1.5 + 0.1).toFixed(3));
    
    cumulativeBidVol += bidAmount;
    cumulativeAskVol += askAmount;

    bids.push({
      price: Number(bidPrice.toFixed(currentPrice < 1 ? 4 : 2)),
      amount: bidAmount,
      total: Number((bidPrice * bidAmount).toFixed(2)),
      depth: Math.min(100, Math.round(cumulativeBidVol * 12))
    });

    asks.push({
      price: Number(askPrice.toFixed(currentPrice < 1 ? 4 : 2)),
      amount: askAmount,
      total: Number((askPrice * askAmount).toFixed(2)),
      depth: Math.min(100, Math.round(cumulativeAskVol * 12))
    });

    bidPrice *= (1 - (Math.random() * 0.0015 + 0.0005));
    askPrice *= (1 + (Math.random() * 0.0015 + 0.0005));
  }

  return { bids, asks: asks.reverse(), spread: Number((askPrice - bidPrice).toFixed(4)) };
}

// Cryptographic pseudo SHA-256 hash generator for transaction logging
export function generateTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Initial genesis blockchain blocks
export const INITIAL_BLOCKS = [
  {
    blockIndex: 104289,
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    hash: '0x8f3c7a91b2e45f61d803acdf4e569a12b7e8d90f1a2b3c4d5e6f7a8b9c0d1e2f',
    prevHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    transactionsCount: 14,
    validator: 'Node-01 (Primary Ledger Validator)',
    gasUsed: '1,420,500 Gwei',
    status: 'Confirmed'
  },
  {
    blockIndex: 104290,
    timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
    hash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    prevHash: '0x8f3c7a91b2e45f61d803acdf4e569a12b7e8d90f1a2b3c4d5e6f7a8b9c0d1e2f',
    transactionsCount: 22,
    validator: 'Node-02 (Market Feeds Validator)',
    gasUsed: '2,150,000 Gwei',
    status: 'Confirmed'
  },
  {
    blockIndex: 104291,
    timestamp: new Date().toLocaleTimeString(),
    hash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    prevHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
    transactionsCount: 8,
    validator: 'Node-03 (Order Matching Validator)',
    gasUsed: '890,200 Gwei',
    status: 'Confirmed'
  }
];

// Initial trade transactions
export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-101',
    symbol: 'BTC',
    type: 'BUY',
    amount: 0.1,
    price: 65200.00,
    totalUSD: 6520.00,
    timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
    txHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    status: 'SUCCESS',
    orderType: 'LIMIT'
  },
  {
    id: 'tx-102',
    symbol: 'ETH',
    type: 'BUY',
    amount: 1.5,
    price: 3450.00,
    totalUSD: 5175.00,
    timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
    txHash: '0x4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
    status: 'SUCCESS',
    orderType: 'MARKET'
  }
];
