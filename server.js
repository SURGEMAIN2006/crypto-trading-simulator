import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ==========================================
// SERVICE 2 STATE STORE (IN-MEMORY DATABASE)
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

const SYMBOL_TO_ID = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana'
};

// 10-Second Cache Engine for CoinGecko API
let priceCache = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10000;

async function fetchLivePrices() {
  const now = Date.now();
  if (priceCache && (now - lastFetchTime < CACHE_DURATION_MS)) {
    return priceCache;
  }

  const ids = Object.values(SYMBOL_TO_ID).join(',');
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  );

  if (!response.ok) throw new Error('Failed to fetch market rates');

  priceCache = await response.json();
  lastFetchTime = now;
  return priceCache;
}

// ==========================================
// SERVICE 2 RESPONSIBILITIES & ENDPOINTS
// ==========================================

// 1. User Registration
app.post('/api/user/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existingUser = Object.values(usersDatabase).find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User email already registered' });
  }

  const newUserId = (Object.keys(usersDatabase).length + 101).toString();
  usersDatabase[newUserId] = {
    userId: newUserId,
    name,
    email,
    password,
    wallet: { cashBalance: 50000.00 },
    holdings: { BTC: 0.025, ETH: 1.5, SOL: 10.0 }
  };

  res.status(201).json({ message: 'User registered', userId: newUserId, name, email });
});

// 2. User Login
app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;
  const user = Object.values(usersDatabase).find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ message: 'Login successful', userId: user.userId, name: user.name, email: user.email });
});

// 3. GET User Portfolio (Valuation & P/L)
app.get('/api/portfolio/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const user = usersDatabase[userId];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const prices = await fetchLivePrices();
    let totalInvestedCryptoValue = 0;
    const holdingsValuation = {};

    for (const [symbol, amount] of Object.entries(user.holdings)) {
      const coinId = SYMBOL_TO_ID[symbol];
      const unitPrice = prices[coinId]?.usd || 0;
      const totalValue = amount * unitPrice;

      totalInvestedCryptoValue += totalValue;
      holdingsValuation[symbol] = {
        amount,
        unitPrice,
        totalValue
      };
    }

    const portfolioValue = user.wallet.cashBalance + totalInvestedCryptoValue;
    const initialSeedValuation = 50000.00;
    const profitLoss = portfolioValue - initialSeedValuation;

    res.json({
      userId: user.userId,
      name: user.name,
      cashBalance: user.wallet.cashBalance,
      investedAmount: totalInvestedCryptoValue,
      portfolioValue,
      profitLoss,
      holdings: holdingsValuation
    });
  } catch (err) {
    res.status(500).json({ error: 'Valuation calculation failure' });
  }
});

// 4. Update Portfolio After Trades
app.post('/api/orders', async (req, res) => {
  const { userId, symbol, type, quantity } = req.body;
  const user = usersDatabase[userId];

  if (!user) return res.status(404).json({ error: 'User not found' });

  const parsedQty = parseFloat(quantity);
  if (!symbol || !type || isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ status: 'FAILED', message: 'Invalid order request' });
  }

  try {
    const prices = await fetchLivePrices();
    const coinId = SYMBOL_TO_ID[symbol];
    const executionPrice = prices[coinId]?.usd || 0;
    const totalCost = parsedQty * executionPrice;

    if (type === 'BUY') {
      if (user.wallet.cashBalance < totalCost) {
        return res.status(400).json({ status: 'FAILED', message: 'Insufficient cash balance' });
      }
      user.wallet.cashBalance -= totalCost;
      user.holdings[symbol] = (user.holdings[symbol] || 0) + parsedQty;
    } else if (type === 'SELL') {
      if ((user.holdings[symbol] || 0) < parsedQty) {
        return res.status(400).json({ status: 'FAILED', message: 'Insufficient crypto holdings' });
      }
      user.wallet.cashBalance += totalCost;
      user.holdings[symbol] -= parsedQty;
    }

    const txn = {
      txnId: `TXN${Date.now().toString().slice(-6)}`,
      userId: user.userId,
      symbol,
      type,
      quantity: parsedQty,
      price: executionPrice,
      total: totalCost,
      timestamp: new Date().toISOString()
    };
    transactionHistory.unshift(txn);

    res.json({ status: 'EXECUTED', order: txn, newCashBalance: user.wallet.cashBalance });
  } catch (err) {
    res.status(500).json({ status: 'FAILED', message: 'Execution error' });
  }
});

// 5. GET User Transactions
app.get('/api/transactions/user/:userId', (req, res) => {
  const txns = transactionHistory.filter(t => t.userId === req.params.userId);
  res.json(txns);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Service 2 listening on port ${PORT}`));