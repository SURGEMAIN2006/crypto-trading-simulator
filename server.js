import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const PORT = 5000;

// ==========================================
// PORTFOLIO / USER STATE
// ==========================================

const usersDatabase = {
  "101": {
    userId: "101",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    wallet: {
      cashBalance: 50000.00
    },
    holdings: {
      BTC: 0.025,
      ETH: 1.5,
      SOL: 10.0
    }
  }
};

let transactionHistory = [];

// ==========================================
// LIVE MARKET DATA
// ==========================================

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

// In-memory cache
let cache = { data: null, lastFetch: 0 };
const CACHE_DURATION = 10000;

// Fetch data from CoinGecko
async function fetchMarketData() {
  const now = Date.now();

  if (cache.data && now - cache.lastFetch < CACHE_DURATION) {
    return cache.data;
  }

  const coinIds = Object.values(COIN_MAP).join(',');

  const url =
    `https://api.coingecko.com/api/v3/coins/markets?` +
    `vs_currency=usd&ids=${coinIds}` +
    `&order=market_cap_desc&sparkline=false`;

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

// ==========================================
// MARKET API
// ==========================================

// GET /api/market
app.get('/api/market', async (req, res) => {
  try {
    const data = await fetchMarketData();

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch market data'
    });
  }
});

// GET /api/market/:symbol
app.get('/api/market/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const allCoins = await fetchMarketData();

    const coin = allCoins.find((c) => c.symbol === symbol);

    if (!coin) {
      return res.status(404).json({
        success: false,
        message: 'Coin not found in target 8 list'
      });
    }

    res.json({
      success: true,
      data: coin
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==========================================
// ROOT / HEALTH CHECK
// ==========================================

app.get('/', (req, res) => {
  res.send(
    '🚀 Crypto Trading Simulator API is running! Go to /api/market to view market data.'
  );
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});