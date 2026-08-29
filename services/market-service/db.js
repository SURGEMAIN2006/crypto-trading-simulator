const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'market_db.json');

const INITIAL_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', price: 65420.50, change24h: 3.42, high24h: 66100, low24h: 63200, volume24h: '32.4B USDT', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 3480.25, change24h: -1.15, high24h: 3560, low24h: 3410, volume24h: '18.9B USDT', color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', icon: '◎', price: 145.80, change24h: 5.84, high24h: 148.5, low24h: 136.2, volume24h: '4.2B USDT', color: '#14F195' },
  { symbol: 'BNB', name: 'BNB Chain', icon: '❖', price: 580.10, change24h: 0.95, high24h: 588, low24h: 572.5, volume24h: '1.8B USDT', color: '#F3BA2F' },
  { symbol: 'XRP', name: 'XRP Ledger', icon: '✕', price: 0.584, change24h: 2.10, high24h: 0.602, low24h: 0.565, volume24h: '1.1B USDT', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', icon: '₳', price: 0.452, change24h: -2.35, high24h: 0.478, low24h: 0.441, volume24h: '650M USDT', color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', price: 0.124, change24h: 8.45, high24h: 0.131, low24h: 0.112, volume24h: '1.4B USDT', color: '#C2A633' },
  { symbol: 'AVAX', name: 'Avalanche', icon: '▲', price: 32.40, change24h: -0.82, high24h: 33.50, low24h: 31.80, volume24h: '480M USDT', color: '#E84142' }
];

class MarketDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const historyBuffer = {};
      INITIAL_ASSETS.forEach(asset => {
        historyBuffer[asset.symbol] = Array.from({ length: 30 }, (_, i) => {
          const base = asset.price;
          return Number((base * (1 + Math.sin(i * 0.5) * 0.02)).toFixed(asset.price < 1 ? 4 : 2));
        });
      });

      this.save({
        assets: INITIAL_ASSETS,
        historyBuffer,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  load() {
    try {
      if (!fs.existsSync(DB_FILE)) this.init();
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('[MarketDB Error]', e.message);
      return { assets: INITIAL_ASSETS, historyBuffer: {} };
    }
  }

  save(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[MarketDB Write Error]', e.message);
    }
  }

  getAssets() {
    return this.load().assets;
  }

  getAsset(symbol) {
    const assets = this.getAssets();
    return assets.find(a => a.symbol === symbol.toUpperCase()) || assets[0];
  }

  updateAssetPrices(updatedAssets) {
    const db = this.load();
    db.assets = updatedAssets;
    db.lastUpdated = new Date().toISOString();

    if (!db.historyBuffer) db.historyBuffer = {};

    updatedAssets.forEach(asset => {
      if (!db.historyBuffer[asset.symbol]) db.historyBuffer[asset.symbol] = [];
      db.historyBuffer[asset.symbol].push(asset.price);
      if (db.historyBuffer[asset.symbol].length > 60) {
        db.historyBuffer[asset.symbol].shift();
      }
    });

    this.save(db);
  }

  getPriceHistory(symbol) {
    const db = this.load();
    return db.historyBuffer && db.historyBuffer[symbol] ? db.historyBuffer[symbol] : [];
  }
}

module.exports = new MarketDatabase();
