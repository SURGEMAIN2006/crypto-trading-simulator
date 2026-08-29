const http = require('http');
const crypto = require('crypto');
const db = require('./db.cjs');

const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_group1_key';

function generateJwtToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ 
    id: user.id, 
    email: user.email, 
    name: user.name, 
    exp: Date.now() + 86400000 
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyJwtToken(token) {
  if (!token) return null;
  try {
    const parts = token.replace('Bearer ', '').split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { 
    res.writeHead(200); 
    return res.end(); 
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Healthcheck Endpoint
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ 
      status: 'UP', 
      service: 'User & Auth Microservice', 
      port: PORT,
      timestamp: new Date().toISOString()
    }));
  }

  // Auth: Register Endpoint
  if (url.pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password, name } = JSON.parse(body || '{}');
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Email and password required' }));
        }

        const newUser = db.createUser(email, password, name);
        const token = generateJwtToken(newUser);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            usdtBalance: newUser.usdtBalance,
            holdings: newUser.holdings
          }
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
    });
    return;
  }

  // Auth: Login Endpoint
  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Email and password required' }));
        }

        const user = db.getUserByEmail(email);
        const passwordHash = crypto.createHash('sha256').update(`${password}:salt_cryptosim`).digest('hex');

        if (!user || user.passwordHash !== passwordHash) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: 'Invalid email or password' }));
        }

        const token = generateJwtToken(user);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            usdtBalance: user.usdtBalance,
            holdings: user.holdings
          }
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
    });
    return;
  }

  // Portfolio Endpoint (GET)
  if (url.pathname === '/api/user/portfolio' && req.method === 'GET') {
    const authHeader = req.headers['authorization'];
    const decoded = verifyJwtToken(authHeader);
    const userId = decoded ? decoded.id : 'u-101';

    const user = db.getUserById(userId) || db.getDefaultUser();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        usdtBalance: user.usdtBalance,
        holdings: user.holdings,
        initialBalance: user.initialBalance
      }
    }));
  }

  // Update Portfolio Endpoint (POST)
  if (url.pathname === '/api/user/portfolio/update' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { userId, usdtDelta, symbol, qtyDelta } = JSON.parse(body || '{}');
        const authHeader = req.headers['authorization'];
        const decoded = verifyJwtToken(authHeader);
        const targetUserId = userId || (decoded ? decoded.id : 'u-101');

        const updatedUser = db.updatePortfolio(targetUserId, { usdtDelta, symbol, qtyDelta });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            usdtBalance: updatedUser.usdtBalance,
            holdings: updatedUser.holdings
          }
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Endpoint not found on User Service' }));
});

server.listen(PORT, () => {
  console.log(`[MICROSERVICE 1] User & Auth Service running on port ${PORT}`);
});
