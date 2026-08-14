const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// The 8 coins assigned to Person 1
const COIN_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2'
};

// In-memory cache to prevent hitting API rate limits
let cache = { data: null, lastFetch: 0 };
const CACHE_DURATION = 10000; // 10 seconds

// Helper: Fetch data from CoinGecko
async function fetchMarketData() {
  const now = Date.now();
  if (cache.data && now - cache.lastFetch < CACHE_DURATION) {
    return cache.data;
  }

  const coinIds = Object.values(COIN_MAP).join(',');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`;

  const response = await axios.get(url);
  
  const formattedData = response.data.map((coin) => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h,
    volume24h: coin.total_volume,
    high24h: coin.high_24h,
    low24h: coin.low_24h,
    updatedAt: coin.last_updated
  }));

  cache.data = formattedData;
  cache.lastFetch = now;
  return formattedData;
}

// 1. GET /api/market - Fetch all 8 coins
app.get('/api/market', async (req, res) => {
  try {
    const data = await fetchMarketData();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch market data' });
  }
});

// 2. GET /api/market/:symbol - Fetch specific coin (e.g. /api/market/BTC)
app.get('/api/market/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const allCoins = await fetchMarketData();
    const coin = allCoins.find((c) => c.symbol === symbol);

    if (!coin) {
      return res.status(404).json({ success: false, message: 'Coin not found in target 8 list' });
    }

    res.json({ success: true, data: coin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Root endpoint health check
app.get('/', (req, res) => {
  res.send('🚀 Live Market Feed Service is running! Go to /api/market to view data.');
});

app.listen(PORT, () => {
  console.log(`🚀 Live Market Feed Service running on http://localhost:${PORT}`);
});