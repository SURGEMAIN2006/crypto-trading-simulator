const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'matching_db.json');

const INITIAL_BOOKS = {
  BTC: {
    bids: [
      { price: 65400.00, amount: 0.5, total: 32700.00, depth: 45 },
      { price: 65350.00, amount: 1.2, total: 78420.00, depth: 75 },
      { price: 65300.00, amount: 2.0, total: 130600.00, depth: 100 }
    ],
    asks: [
      { price: 65450.00, amount: 0.4, total: 26180.00, depth: 30 },
      { price: 65500.00, amount: 1.5, total: 98250.00, depth: 65 },
      { price: 65550.00, amount: 2.2, total: 144210.00, depth: 95 }
    ]
  },
  ETH: {
    bids: [
      { price: 3478.00, amount: 2.5, total: 8695.00, depth: 40 },
      { price: 3475.00, amount: 5.0, total: 17375.00, depth: 80 }
    ],
    asks: [
      { price: 3482.00, amount: 1.8, total: 6267.60, depth: 35 },
      { price: 3485.00, amount: 4.2, total: 14637.00, depth: 75 }
    ]
  }
};

class MatchingDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.save({
        books: INITIAL_BOOKS,
        orders: [],
        executions: []
      });
    }
  }

  load() {
    try {
      if (!fs.existsSync(DB_FILE)) this.init();
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('[MatchingDB Error]', e.message);
      return { books: INITIAL_BOOKS, orders: [], executions: [] };
    }
  }

  save(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[MatchingDB Write Error]', e.message);
    }
  }

  getOrderBook(symbol, currentPrice = 65000) {
    const db = this.load();
    const sym = symbol.toUpperCase();
    if (!db.books[sym]) {
      // Dynamic depth generator around price
      const spread = currentPrice * 0.001;
      db.books[sym] = {
        bids: [
          { price: Number((currentPrice - spread).toFixed(2)), amount: 0.8, total: Number(((currentPrice - spread) * 0.8).toFixed(2)), depth: 40 },
          { price: Number((currentPrice - spread * 2).toFixed(2)), amount: 1.5, total: Number(((currentPrice - spread * 2) * 1.5).toFixed(2)), depth: 80 }
        ],
        asks: [
          { price: Number((currentPrice + spread).toFixed(2)), amount: 0.6, total: Number(((currentPrice + spread) * 0.6).toFixed(2)), depth: 35 },
          { price: Number((currentPrice + spread * 2).toFixed(2)), amount: 1.8, total: Number(((currentPrice + spread * 2) * 1.8).toFixed(2)), depth: 75 }
        ]
      };
      this.save(db);
    }
    return db.books[sym];
  }

  recordOrder(order) {
    const db = this.load();
    db.orders.unshift(order);
    this.save(db);
  }

  recordExecution(execution) {
    const db = this.load();
    db.executions.unshift(execution);
    this.save(db);
  }
}

module.exports = new MatchingDatabase();
