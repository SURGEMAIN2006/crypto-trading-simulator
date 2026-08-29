const http = require('http');
const https = require('https');
const db = require('./db.cjs');

const PORT = process.env.PORT || 3003;

function fetchBinancePrices() {
  https.get('https://api.binance.com/api/v3/ticker/24hr', (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      try {
        const binanceData = JSON.parse(raw);
        if (Array.isArray(binanceData)) {
          const currentAssets = db.getAssets();
          const updated = currentAssets.map(item => {
            const pair = item.symbol + 'USDT';
            const found = binanceData.find(b => b.symbol === pair);
            if (found) {
              const p = parseFloat(found.lastPrice);
              return {
                ...item,
                price: p,
                change24h: parseFloat(found.priceChangePercent),
                high24h: parseFloat(found.highPrice),
                low24h: parseFloat(found.lowPrice),
                volume24h: (parseFloat(found.quoteVolume) / 1e6).toFixed(1) + 'M USDT'
              };
            }
            // Dynamic simulation tick if not on binance
            const delta = (Math.random() - 0.49) * 0.006;
            const newP = Math.max(0.001, item.price * (1 + delta));
            return {
              ...item,
              price: Number(newP.toFixed(newP < 1 ? 4 : 2)),
              change24h: Number((item.change24h + delta * 20).toFixed(2))
            };
          });

          db.updateAssetPrices(updated);
        }
      } catch (err) {
        simulateMarketPrices();
      }
    });
  }).on('error', () => {
    simulateMarketPrices();
  });
}

function simulateMarketPrices() {
  const currentAssets = db.getAssets();
  const updated = currentAssets.map(item => {
    const delta = (Math.random() - 0.49) * 0.008;
    const newP = Math.max(0.001, item.price * (1 + delta));
    return {
      ...item,
      price: Number(newP.toFixed(newP < 1 ? 4 : 2)),
      change24h: Number((item.change24h + delta * 30).toFixed(2)),
      high24h: Math.max(item.high24h, newP),
      low24h: Math.min(item.low24h, newP)
    };
  });
  db.updateAssetPrices(updated);
}

setInterval(fetchBinancePrices, 4000);
fetchBinancePrices();

// Data Science Analytics Calculations
function calculateRSI(prices) {
  if (prices.length < 5) return 50.0;
  let gains = 0, losses = 0;
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / (prices.length - 1);
  const avgLoss = losses / (prices.length - 1);
  if (avgLoss === 0) return 100.0;
  const rs = avgGain / avgLoss;
  return Number((100 - (100 / (1 + rs))).toFixed(2));
}

function calculateSMA(prices, period = 20) {
  if (prices.length === 0) return 0;
  const slice = prices.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return Number((sum / slice.length).toFixed(2));
}

function calculateVariance(prices) {
  if (prices.length < 2) return 1.5;
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squareDiffs = prices.map(p => Math.pow(p - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / prices.length;
  return Number((Math.sqrt(avgSquareDiff) / mean * 100).toFixed(2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end(); }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      status: 'UP', 
      service: 'Market Feeds & Data Science Microservice', 
      port: PORT,
      timestamp: new Date().toISOString()
    }));
  }

  // Live Ticker Feeds
  if (url.pathname === '/api/market/live' && req.method === 'GET') {
    const assets = db.getAssets();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, assets, timestamp: new Date().toISOString() }));
  }

  // Historical Candle Chart Data per Asset
  if (url.pathname === '/api/market/history' && req.method === 'GET') {
    const symbol = (url.searchParams.get('symbol') || 'BTC').toUpperCase();
    const prices = db.getPriceHistory(symbol);
    const asset = db.getAsset(symbol);

    const now = Date.now();
    const historyPoints = prices.map((price, idx) => {
      const time = new Date(now - (prices.length - idx) * 3600000);
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
      return {
        time: timeStr,
        price,
        open: price * 0.998,
        high: price * 1.002,
        low: price * 0.995,
        close: price,
        volume: Math.floor(Math.random() * 50 + 10)
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, symbol, points: historyPoints }));
  }

  // Data Science Inferences Endpoint
  if (url.pathname === '/api/analytics/ds' && req.method === 'GET') {
    const symbol = (url.searchParams.get('symbol') || 'BTC').toUpperCase();
    const prices = db.getPriceHistory(symbol);
    const asset = db.getAsset(symbol);

    const rsi = calculateRSI(prices);
    const ma20 = calculateSMA(prices, 20);
    const volatilityVariancePct = calculateVariance(prices);
    const fearGreedIndex = Math.min(99, Math.max(10, Math.round(rsi * 0.7 + 25)));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      asset: symbol,
      price: asset.price,
      rsi,
      ma20,
      fearGreedIndex,
      fearGreedLabel: fearGreedIndex > 70 ? 'GREED' : fearGreedIndex < 30 ? 'FEAR' : 'NEUTRAL',
      buyVolumeRatioPct: 62.4,
      sellVolumeRatioPct: 37.6,
      volatilityVariancePct
    }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Endpoint not found on Market Service' }));
});

server.listen(PORT, () => {
  console.log(`[MICROSERVICE 2] Market & Analytics Service running on port ${PORT}`);
});
