const http = require('http');
const crypto = require('crypto');
const db = require('./db.cjs');

const PORT = process.env.PORT || 3005;

function computeSHA256(text) {
  return '0x' + crypto.createHash('sha256').update(text).digest('hex');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end(); }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'UP', service: 'Transaction & Blockchain Microservice', port: PORT }));
  }

  // Fetch Ledger Transactions & Blocks
  if (url.pathname === '/api/transactions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      success: true, 
      trades: db.getTrades(), 
      blocks: db.getBlocks() 
    }));
  }

  // Log Trade & Mine SHA-256 Blockchain Block
  if (url.pathname === '/api/transactions/log' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const tradeData = JSON.parse(body || '{}');
        const timestamp = new Date().toISOString();

        // 1. Generate Transaction SHA-256 Hash
        const txHash = computeSHA256(`${tradeData.side}:${tradeData.symbol}:${tradeData.amount}:${tradeData.price}:${timestamp}`);

        const newTrade = {
          id: tradeData.orderId || `tx-${Date.now()}`,
          symbol: tradeData.symbol,
          side: tradeData.side || 'BUY',
          type: tradeData.side || 'BUY',
          orderType: tradeData.orderType || 'MARKET',
          amount: parseFloat(tradeData.amount),
          price: parseFloat(tradeData.price),
          totalUSD: parseFloat(tradeData.totalUSD),
          fee: parseFloat(tradeData.fee || 0),
          timestamp,
          txHash,
          status: 'CONFIRMED'
        };

        // 2. SHA-256 Block Mining Engine
        const blocks = db.getBlocks();
        const lastBlock = blocks[blocks.length - 1];
        const prevHash = lastBlock ? lastBlock.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';
        const newBlockIndex = lastBlock ? lastBlock.blockIndex + 1 : 104291;
        const nonce = Math.floor(Math.random() * 900000 + 100000);

        const blockHash = computeSHA256(`${newBlockIndex}:${prevHash}:${txHash}:${timestamp}:${nonce}`);

        const newBlock = {
          blockIndex: newBlockIndex,
          timestamp,
          hash: blockHash,
          prevHash,
          transactionsCount: Math.floor(Math.random() * 15 + 5),
          validator: 'Node-01 (Primary Ledger Validator)',
          gasUsed: `${Math.floor(Math.random() * 1200000 + 400000)} Gwei`,
          status: 'Confirmed'
        };

        db.addTradeAndBlock(newTrade, newBlock);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          success: true, 
          trade: newTrade, 
          block: newBlock 
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
    });
    return;
  }

  // SHA-256 Hash Tester Endpoint
  if (url.pathname === '/api/blockchain/hash' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body || '{}');
        const hash = computeSHA256(text || 'CryptoSim');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, input: text, hash }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Endpoint not found on Transaction Service' }));
});

server.listen(PORT, () => {
  console.log(`[MICROSERVICE 4] Transaction & Blockchain Service running on port ${PORT}`);
});
