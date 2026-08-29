// Unified API Client for Microservices Gateway (Port 3000)

const GATEWAY_URL = 'http://localhost:3000';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${GATEWAY_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API Client Warning] ${endpoint}: ${err.message}`);
    return null;
  }
}

export const api = {
  // Check API Gateway System Health
  async getSystemHealth() {
    return await request('/api/health');
  },

  // Market & Feeds Microservice
  async getLivePrices() {
    return await request('/api/market/live');
  },

  async getAssetChartHistory(symbol = 'BTC') {
    return await request(`/api/market/history?symbol=${symbol}`);
  },

  async getDataScienceAnalytics(symbol = 'BTC') {
    return await request(`/api/analytics/ds?symbol=${symbol}`);
  },

  // Order Matching Engine Microservice
  async getOrderBook(symbol = 'BTC') {
    return await request(`/api/orders/book?symbol=${symbol}`);
  },

  async executeOrder(orderData) {
    return await request('/api/orders/place', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // User & Auth Microservice
  async getUserPortfolio() {
    return await request('/api/user/portfolio');
  },

  async login(email, password) {
    return await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(email, password, name) {
    return await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  },

  // Transaction & Blockchain Microservice
  async getBlockchainLedger() {
    return await request('/api/transactions');
  },

  async computeSha256Hash(text) {
    return await request('/api/blockchain/hash', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }
};
