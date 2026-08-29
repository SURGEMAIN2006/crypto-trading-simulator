const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'transactions_db.json');

const INITIAL_TRADES = [
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
    status: 'CONFIRMED',
    orderType: 'LIMIT'
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
    txHash: '0x4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
    status: 'CONFIRMED',
    orderType: 'MARKET'
  }
];

const INITIAL_BLOCKS = [
  {
    blockIndex: 104289,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    hash: '0x8f3c7a91b2e45f61d803acdf4e569a12b7e8d90f1a2b3c4d5e6f7a8b9c0d1e2f',
    prevHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    transactionsCount: 14,
    validator: 'Node-01 (Group 1 Ledger Engine)',
    gasUsed: '1,420,500 Gwei',
    status: 'Confirmed'
  },
  {
    blockIndex: 104290,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    hash: '0x4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
    prevHash: '0x8f3c7a91b2e45f61d803acdf4e569a12b7e8d90f1a2b3c4d5e6f7a8b9c0d1e2f',
    transactionsCount: 22,
    validator: 'Node-02 (Group 1 Validator Node)',
    gasUsed: '2,150,000 Gwei',
    status: 'Confirmed'
  }
];

class TransactionDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.save({
        trades: INITIAL_TRADES,
        blocks: INITIAL_BLOCKS
      });
    }
  }

  load() {
    try {
      if (!fs.existsSync(DB_FILE)) this.init();
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('[TxDB Error]', e.message);
      return { trades: INITIAL_TRADES, blocks: INITIAL_BLOCKS };
    }
  }

  save(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[TxDB Write Error]', e.message);
    }
  }

  getTrades() {
    return this.load().trades;
  }

  getBlocks() {
    return this.load().blocks;
  }

  addTradeAndBlock(trade, block) {
    const db = this.load();
    db.trades.unshift(trade);
    db.blocks.push(block);
    this.save(db);
  }
}

module.exports = new TransactionDatabase();
