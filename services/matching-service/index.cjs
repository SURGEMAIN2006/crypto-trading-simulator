const http = require('http');
const db = require('./db.cjs');

const PORT = process.env.PORT || 3004;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3005';

function sendPostRequest(targetUrlStr, payload) {
  return new Promise((resolve, reject) => {
    try {
      const targetUrl = new URL(targetUrlStr);
      const data = JSON.stringify(payload);
      const req = http.request({
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ success: false, raw: body });
          }
        });
      });

      req.on('error', (err) => {
        console.warn(`[Inter-Service Call Warning] Failed calling ${targetUrlStr}: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      req.write(data);
      req.end();
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); return res.end(); }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'UP', service: 'Order Matching Engine Microservice', port: PORT }));
  }

  // Fetch Order Book Depth
  if (url.pathname === '/api/orders/book' && req.method === 'GET') {
    const symbol = url.searchParams.get('symbol') || 'BTC';
    const book = db.getOrderBook(symbol);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, symbol, book }));
  }

  // Order Placement & Matching Engine Execution
  if (url.pathname === '/api/orders/place' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { symbol, side, type, amount, price, userId } = JSON.parse(body || '{}');
        const qty = parseFloat(amount);
        const execPrice = parseFloat(price);
        const totalUSD = qty * execPrice;
        const fee = totalUSD * 0.001; // 0.1% trading fee

        const orderId = `ord-${Date.now()}`;
        const newOrder = {
          id: orderId,
          symbol,
          side,
          type: type || 'MARKET',
          amount: qty,
          price: execPrice,
          totalUSD,
          fee,
          status: 'FILLED',
          timestamp: new Date().toISOString()
        };

        db.recordOrder(newOrder);

        // Calculate portfolio balance deltas
        const usdtDelta = side === 'BUY' ? -(totalUSD + fee) : (totalUSD - fee);
        const qtyDelta = side === 'BUY' ? qty : -qty;

        // 1. Inter-Service Call to User Service -> Update Portfolio
        const userResult = await sendPostRequest(`${USER_SERVICE_URL}/api/user/portfolio/update`, {
          userId: userId || 'u-101',
          usdtDelta,
          symbol,
          qtyDelta
        });

        // 2. Inter-Service Call to Transaction Service -> Log Trade & Mine SHA-256 Block
        const txResult = await sendPostRequest(`${TRANSACTION_SERVICE_URL}/api/transactions/log`, {
          orderId,
          symbol,
          side,
          amount: qty,
          price: execPrice,
          totalUSD,
          fee,
          orderType: type || 'MARKET'
        });

        db.recordExecution({
          orderId,
          userUpdate: userResult.success,
          ledgerUpdate: txResult.success,
          blockMined: txResult.block ? txResult.block.hash : null
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          matched: true,
          status: 'FILLED',
          order: newOrder,
          portfolio: userResult.user || null,
          transaction: txResult.trade || null,
          minedBlock: txResult.block || null
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Endpoint not found on Matching Service' }));
});

server.listen(PORT, () => {
  console.log(`[MICROSERVICE 3] Order Matching Engine Service running on port ${PORT}`);
});
