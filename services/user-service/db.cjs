const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'users_db.json');

const INITIAL_DATA = {
  users: [
    {
      id: 'u-101',
      email: 'trader@cryptosim.io',
      name: 'Institutional Demo Trader',
      passwordHash: crypto.createHash('sha256').update('password123:salt_cryptosim').digest('hex'),
      usdtBalance: 10000.00,
      initialBalance: 10000.00,
      holdings: { BTC: 0.1, ETH: 1.0, SOL: 2.5 },
      createdAt: new Date().toISOString()
    }
  ]
};

class UserDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.save(INITIAL_DATA);
    }
  }

  load() {
    try {
      if (!fs.existsSync(DB_FILE)) return INITIAL_DATA;
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[UserDB Error]', e.message);
      return INITIAL_DATA;
    }
  }

  save(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[UserDB Write Error]', e.message);
    }
  }

  getUserByEmail(email) {
    const db = this.load();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getUserById(id) {
    const db = this.load();
    return db.users.find(u => u.id === id) || null;
  }

  createUser(email, password, name) {
    const db = this.load();
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User already exists');
    }

    const salt = 'salt_cryptosim';
    const passwordHash = crypto.createHash('sha256').update(`${password}:${salt}`).digest('hex');
    const newUser = {
      id: `u-${Date.now()}`,
      email,
      name: name || 'Demo Trader',
      passwordHash,
      usdtBalance: 10000.00,
      initialBalance: 10000.00,
      holdings: { BTC: 0.1, ETH: 1.0 },
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    this.save(db);
    return newUser;
  }

  updatePortfolio(userId, { usdtDelta, symbol, qtyDelta }) {
    const db = this.load();
    const userIndex = db.users.findIndex(u => u.id === userId || userId === 'default' || userId === 'u-101');
    const user = userIndex !== -1 ? db.users[userIndex] : db.users[0];

    if (!user) throw new Error('User not found');

    if (usdtDelta !== undefined && !isNaN(usdtDelta)) {
      user.usdtBalance = Math.max(0, user.usdtBalance + parseFloat(usdtDelta));
    }

    if (symbol && qtyDelta !== undefined && !isNaN(qtyDelta)) {
      if (!user.holdings) user.holdings = {};
      const currentQty = user.holdings[symbol] || 0;
      const newQty = Math.max(0, currentQty + parseFloat(qtyDelta));
      user.holdings[symbol] = Number(newQty.toFixed(6));
    }

    if (userIndex !== -1) {
      db.users[userIndex] = user;
    } else {
      db.users[0] = user;
    }

    this.save(db);
    return user;
  }

  getDefaultUser() {
    const db = this.load();
    return db.users[0] || INITIAL_DATA.users[0];
  }
}

module.exports = new UserDatabase();
