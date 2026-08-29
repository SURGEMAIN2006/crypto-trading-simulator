const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

const SERVICES = {
  USER_SERVICE: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  MARKET_SERVICE: process.env.MARKET_SERVICE_URL || 'http://localhost:3003',
  MATCHING_SERVICE: process.env.MATCHING_SERVICE_URL || 'http://localhost:3004',
  TRANSACTION_SERVICE: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3005',
  FRONTEND_APP: process.env.FRONTEND_URL || 'http://localhost:5173'
};

function proxyRequest(targetBaseUrl, req, res) {
  try {
    const targetUrl = new URL(req.url, targetBaseUrl);
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: { ...req.headers, host: targetUrl.host }
    };

    const proxy = http.request(options, (targetRes) => {
      res.writeHead(targetRes.statusCode, targetRes.headers);
      targetRes.pipe(res, { end: true });
    });

    proxy.on('error', (err) => {
      // Fallback: If Vite Dev Server isn't running, serve static built files from dist/ if available
      const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
      if (fs.existsSync(distIndex)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(fs.readFileSync(distIndex, 'utf-8'));
      }
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: `API Gateway Error forwarding to ${targetBaseUrl}: ${err.message}` 
      }));
    });

    req.pipe(proxy, { end: true });
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: `Gateway internal error: ${err.message}` }));
  }
}

function checkServiceHealth(targetUrlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(`${targetUrlStr}/health`);
      const req = http.get(u, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          resolve(res.statusCode === 200 ? 'UP' : `DOWN (${res.statusCode})`);
        });
      });
      req.on('error', () => resolve('DOWN (Unreachable)'));
      req.setTimeout(2000, () => { req.destroy(); resolve('DOWN (Timeout)'); });
    } catch (e) {
      resolve('DOWN (Config Error)');
    }
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { 
    res.writeHead(200); 
    return res.end(); 
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Gateway System Monitoring Dashboard
  if (url.pathname === '/health' || url.pathname === '/api/health') {
    const [userSt, marketSt, matchingSt, txSt] = await Promise.all([
      checkServiceHealth(SERVICES.USER_SERVICE),
      checkServiceHealth(SERVICES.MARKET_SERVICE),
      checkServiceHealth(SERVICES.MATCHING_SERVICE),
      checkServiceHealth(SERVICES.TRANSACTION_SERVICE)
    ]);

    const allUp = [userSt, marketSt, matchingSt, txSt].every(st => st === 'UP');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: allUp ? 'HEALTHY' : 'DEGRADED',
      system: 'Crypto Trading Simulator API Gateway',
      gatewayPort: PORT,
      timestamp: new Date().toISOString(),
      microservices: {
        userService: { url: SERVICES.USER_SERVICE, status: userSt },
        marketService: { url: SERVICES.MARKET_SERVICE, status: marketSt },
        matchingService: { url: SERVICES.MATCHING_SERVICE, status: matchingSt },
        transactionService: { url: SERVICES.TRANSACTION_SERVICE, status: txSt }
      }
    }));
  }

  // Routing Table to Microservices APIs
  if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/user')) {
    return proxyRequest(SERVICES.USER_SERVICE, req, res);
  }

  if (url.pathname.startsWith('/api/market') || url.pathname.startsWith('/api/analytics')) {
    return proxyRequest(SERVICES.MARKET_SERVICE, req, res);
  }

  if (url.pathname.startsWith('/api/orders')) {
    return proxyRequest(SERVICES.MATCHING_SERVICE, req, res);
  }

  if (url.pathname.startsWith('/api/transactions') || url.pathname.startsWith('/api/blockchain')) {
    return proxyRequest(SERVICES.TRANSACTION_SERVICE, req, res);
  }

  // Serve Built Static Files from dist if requested directly
  if (url.pathname.startsWith('/assets/')) {
    const assetPath = path.join(__dirname, '..', 'dist', url.pathname);
    if (fs.existsSync(assetPath)) {
      const ext = path.extname(assetPath);
      const mimeTypes = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      return res.end(fs.readFileSync(assetPath));
    }
  }

  // Route all UI pages & assets to React Application (Vite Dev Server or dist build)
  return proxyRequest(SERVICES.FRONTEND_APP, req, res);
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌐 API GATEWAY REVERSE PROXY RUNNING ON PORT ${PORT}`);
  console.log(`📡 User Service: ${SERVICES.USER_SERVICE}`);
  console.log(`📡 Market Service: ${SERVICES.MARKET_SERVICE}`);
  console.log(`📡 Matching Engine Service: ${SERVICES.MATCHING_SERVICE}`);
  console.log(`📡 Transaction & Ledger Service: ${SERVICES.TRANSACTION_SERVICE}`);
  console.log(`📡 React Frontend UI: ${SERVICES.FRONTEND_APP}`);
  console.log(`=======================================================`);
});
