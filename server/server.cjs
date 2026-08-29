const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3001;
const DB_FILE = path.join(__dirname, 'database.json');

// Initial persistent database structure
const initialDb = {
  user: {
    name: 'Group 1 Student Trader',
    usdtBalance: 10000.00,
    initialBalance: 10000.00
  },
  holdings: {
    BTC: 0.1,
    ETH: 1.0,
    SOL: 2.5
  },
  orders: [],
  trades: [
    {
      id: 'tx-1001',
      symbol: 'BTC',
      side: 'BUY',
      amount: 0.1,
      price: 65200.00,
      totalUSD: 6520.00,
      fee: 6.52,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      txHash: '0x8f3c7a91b2e45f61d803acdf4e569a12b7e8d90f1a2b3c4d5e6f7a8b9c0d1e2f',
      status: 'CONFIRMED'
    },
    {
      id: 'tx-1002',
      symbol: 'ETH',
      side: 'BUY',
      amount: 1.0,
      price: 3450.00,
      totalUSD: 3450.00,
      fee: 3.45,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      txHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
      status: 'CONFIRMED'
    }
  ],
  blocks: [
    {
      blockIndex: 104289,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      hash: '0x8f3c7a91b2e45f61d803acdf4e569a12b7e8d90f1a2b3c4d5e6f7a8b9c0d1e2f',
      prevHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      transactionsCount: 1,
      validator: 'Node-01 (Pritam - Team Lead)',
      gasUsed: '1,420,500 Gwei',
      status: 'Confirmed'
    },
    {
      blockIndex: 104290,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      hash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
      prevHash: '0x8f3c7a91b2e45f61d803acdf4e569a12b7e8d90f1a2b3c4d5e6f7a8b9c0d1e2f',
      transactionsCount: 1,
      validator: 'Node-02 (Shravani - Feeds Spec)',
      gasUsed: '2,150,000 Gwei',
      status: 'Confirmed'
    }
  ]
};

// Database helper functions
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error reading DB, resetting to initial', err);
    return initialDb;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB', err);
  }
}

// Compute real SHA-256 hash using Node.js crypto
function computeSHA256(text) {
  return '0x' + crypto.createHash('sha256').update(text).digest('hex');
}

// Live price cache from Binance API
let cachedPrices = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', price: 65420.50, change24h: 3.42, high24h: 66100.00, low24h: 63200.00, volume24h: '32.4B USDT', marketCap: '1.28T USD', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 3480.25, change24h: -1.15, high24h: 3560.00, low24h: 3410.00, volume24h: '18.9B USDT', marketCap: '418B USD', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', icon: '◎', price: 145.80, change24h: 5.84, high24h: 148.50, low24h: 136.20, volume24h: '4.2B USDT', marketCap: '67.8B USD', color: '#14F195' },
  { symbol: 'BNB', name: 'BNB Chain', icon: '❖', price: 580.10, change24h: 0.95, high24h: 588.00, low24h: 572.50, volume24h: '1.8B USDT', marketCap: '87.1B USD', color: '#F3BA2F' },
  { symbol: 'XRP', name: 'XRP Ledger', icon: '✕', price: 0.584, change24h: 2.10, high24h: 0.602, low24h: 0.565, volume24h: '1.1B USDT', marketCap: '32.5B USD', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', icon: '₳', price: 0.452, change24h: -2.35, high24h: 0.478, low24h: 0.441, volume24h: '650M USDT', marketCap: '16.2B USD', color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', price: 0.124, change24h: 8.45, high24h: 0.131, low24h: 0.112, volume24h: '1.4B USDT', marketCap: '17.9B USD', color: '#C2A633' },
  { symbol: 'AVAX', name: 'Avalanche', icon: '▲', price: 32.40, change24h: -0.82, high24h: 33.50, low24h: 31.80, volume24h: '480M USDT', marketCap: '12.8B USD', color: '#E84142' }
];

// Fetch real public price tickers from Binance REST API
function updateLiveMarketPrices() {
  https.get('https://api.binance.com/api/v3/ticker/24hr', (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const binanceData = JSON.parse(raw);
        if (Array.isArray(binanceData)) {
          cachedPrices = cachedPrices.map(item => {
            const pair = item.symbol + 'USDT';
            const found = binanceData.find(b => b.symbol === pair);
            if (found) {
              const p = parseFloat(found.lastPrice);
              const chg = parseFloat(found.priceChangePercent);
              return {
                ...item,
                price: p,
                change24h: chg,
                high24h: parseFloat(found.highPrice),
                low24h: parseFloat(found.lowPrice),
                volume24h: (parseFloat(found.quoteVolume) / 1e6).toFixed(1) + 'M USDT'
              };
            }
            return item;
          });
        }
      } catch (err) {
        cachedPrices = cachedPrices.map(a => ({
          ...a,
          price: Number((a.price * (1 + (Math.random() - 0.49) * 0.005)).toFixed(a.price < 1 ? 4 : 2))
        }));
      }
    });
  }).on('error', () => {
    cachedPrices = cachedPrices.map(a => ({
      ...a,
      price: Number((a.price * (1 + (Math.random() - 0.49) * 0.005)).toFixed(a.price < 1 ? 4 : 2))
    }));
  });
}

setInterval(updateLiveMarketPrices, 5000);
updateLiveMarketPrices();

// HTTP Router
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Service 1: Live Market Feeds Endpoint
  if (pathname === '/api/market/live' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, assets: cachedPrices, timestamp: new Date().toISOString() }));
    return;
  }

  // Service 2: User Portfolios & Wallet Endpoint
  if (pathname === '/api/portfolio' && req.method === 'GET') {
    const db = readDb();
    let totalCryptoUsd = 0;
    
    Object.entries(db.holdings).forEach(([sym, qty]) => {
      const asset = cachedPrices.find(a => a.symbol === sym);
      if (asset) {
        totalCryptoUsd += qty * asset.price;
      }
    });

    const totalPortfolioUSD = db.user.usdtBalance + totalCryptoUsd;
    const pnlUsd = totalPortfolioUSD - db.user.initialBalance;
    const pnlPct = (pnlUsd / db.user.initialBalance) * 100;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: db.user,
      usdtBalance: db.user.usdtBalance,
      holdings: db.holdings,
      totalCryptoUsd,
      totalPortfolioUSD,
      pnlUsd,
      pnlPct
    }));
    return;
  }

  // Reset Portfolio endpoint
  if (pathname === '/api/portfolio/reset' && req.method === 'POST') {
    const db = readDb();
    db.user.usdtBalance = 10000.00;
    db.holdings = { BTC: 0.1, ETH: 1.0, SOL: 2.5 };
    writeDb(db);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Portfolio reset to $10,000 USDT' }));
    return;
  }

  // Service 3: Order Matching Engine Endpoint
  if (pathname === '/api/orders/place' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const order = JSON.parse(body);
        const { symbol, side, amount, price } = order;
        const db = readDb();

        const qty = parseFloat(amount);
        const execPrice = parseFloat(price);
        const totalUSD = qty * execPrice;
        const fee = totalUSD * 0.001; // 0.1% transaction fee

        if (side === 'BUY') {
          if (totalUSD + fee > db.user.usdtBalance) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `Insufficient USDT balance. Needed: $${(totalUSD + fee).toFixed(2)}` }));
            return;
          }
          db.user.usdtBalance -= (totalUSD + fee);
          db.holdings[symbol] = (db.holdings[symbol] || 0) + qty;
        } else if (side === 'SELL') {
          const currentHolding = db.holdings[symbol] || 0;
          if (qty > currentHolding) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `Insufficient ${symbol} holdings. You have ${currentHolding}` }));
            return;
          }
          db.user.usdtBalance += (totalUSD - fee);
          db.holdings[symbol] = Math.max(0, currentHolding - qty);
        }

        const txPayload = `${side}:${symbol}:${qty}:${execPrice}:${Date.now()}`;
        const txHash = computeSHA256(txPayload);

        const newTrade = {
          id: `tx-${Date.now()}`,
          symbol,
          side,
          amount: qty,
          price: execPrice,
          totalUSD,
          fee,
          timestamp: new Date().toISOString(),
          txHash,
          status: 'CONFIRMED'
        };

        db.trades.unshift(newTrade);

        const prevBlock = db.blocks[db.blocks.length - 1];
        const newBlockIndex = prevBlock ? prevBlock.blockIndex + 1 : 10000;
        const blockHash = computeSHA256(`${newBlockIndex}:${prevBlock ? prevBlock.hash : '0x0'}:${txHash}:${Date.now()}`);

        const newBlock = {
          blockIndex: newBlockIndex,
          timestamp: new Date().toISOString(),
          hash: blockHash,
          prevHash: prevBlock ? prevBlock.hash : '0x00000000000000000000000000000000',
          transactionsCount: 1,
          validator: 'Node-01 (Group 1 Ledger Engine)',
          gasUsed: `${Math.floor(Math.random() * 1500000 + 500000)} Gwei`,
          status: 'Confirmed'
        };

        db.blocks.push(newBlock);
        writeDb(db);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          trade: newTrade,
          block: newBlock,
          usdtBalance: db.user.usdtBalance,
          holdings: db.holdings
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    });
    return;
  }

  // Service 4: Transaction History & Ledger Endpoint
  if (pathname === '/api/transactions' && req.method === 'GET') {
    const db = readDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, trades: db.trades, blocks: db.blocks }));
    return;
  }

  // Cryptographic Hash Tester Endpoint
  if (pathname === '/api/blockchain/hash' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);
        const hash = computeSHA256(text || 'CryptoSim');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, input: text, hash }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid payload' }));
      }
    });
    return;
  }

  // Serve Application HTML if requesting root
  if (pathname === '/' || pathname === '/index.html') {
    const appPath = path.join(__dirname, '..', 'crypto-app.html');
    if (fs.existsSync(appPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(appPath, 'utf-8'));
      return;
    }
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'API Endpoint Not Found' }));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Crypto Trading Simulator Backend API Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🟢 Services Active: Live Market Feeds, Portfolios, Order Matching, Transaction Ledger`);
  console.log(`=======================================================`);
});
