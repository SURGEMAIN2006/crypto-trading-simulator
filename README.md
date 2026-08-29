# 🌐 Crypto Trading Simulator & SHA-256 Blockchain Ledger

An enterprise-grade, multi-container microservices platform featuring real-time market data ingestion, quantitative analytics, price-time priority order matching, and immutable SHA-256 blockchain ledger block mining.

---

## 🏗️ Architecture Overview

```
                               ┌───────────────────────────┐
                               │  React 18 UI (Vite)       │
                               │  (Interactive Dashboard)  │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │ API Gateway Proxy (Port 3000) │
                             └───────────────┬───────────────┘
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         │                   │                               │                   │
         ▼                   ▼                               ▼                   ▼
┌──────────────────┐┌──────────────────┐           ┌──────────────────┐┌──────────────────┐
│ User & Auth      ││ Market & Feeds   │           │ Order Matching   ││ Transaction &    │
│ Microservice     ││ Microservice     │           │ Microservice     ││ Blockchain       │
│ (Port 3002)      ││ (Port 3003)      │           │ (Port 3004)      ││ (Port 3005)      │
└────────┬─────────┘└────────┬─────────┘           └────────┬─────────┘└────────┬─────────┘
         │                   │                              │                   │
         ▼                   ▼                              ▼                   ▼
┌──────────────────┐┌──────────────────┐           ┌──────────────────┐┌──────────────────┐
│ User DB          ││ Market DB        │           │ Matching DB      ││ Transaction DB   │
│ (users_db.json)  ││ (market_db.json) │           │ (matching_db.json││ (tx_db.json)     │
└──────────────────┘└──────────────────┘           └──────────────────┘└──────────────────┘
```

---

## 🧩 Microservices Specification

| Microservice | Port | Database | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `3000` | N/A | Central reverse proxy, route dispatching & `/api/health` monitoring |
| **User & Auth Service** | `3002` | `users_db.json` | JWT Authentication, password hashing, testnet USDT balances & crypto holdings |
| **Market & Feeds Service** | `3003` | `market_db.json` | Binance live API pricing, chart history buffers, RSI, SMA-20 & Fear/Greed Index |
| **Order Matching Engine** | `3004` | `matching_db.json` | Price-time priority matching for Market/Limit orders & depth queues |
| **Transaction & Blockchain** | `3005` | `transactions_db.json` | Immutable SHA-256 block mining, hash linking (`prevHash` ➔ `hash`) & ledger logging |

---

## ✨ Features

- **Decoupled Architecture**: Database-per-Microservice pattern ensuring complete isolation between services.
- **Interactive Technical Charts**: Real-time SVG chart with interactive crosshair inspection and live hover tooltip card.
- **Quantitative Analytics**: 14-period RSI, 20-period Simple Moving Average, Volatility Variance %, and Market Sentiment Index.
- **SHA-256 Block Mining Engine**: Cryptographically signs every executed trade into a block with previous block hash linkage.
- **Resilient Fallback Mode**: React UI seamlessly falls back to offline simulation mode if backends are restarting.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js v18+](https://nodejs.org/)
- [npm v9+](https://www.npmjs.com/)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/SURGEMAIN2006/crypto-trading-simulator.git
cd crypto-trading-simulator

# Install dependencies
npm install
```

### 2. Run Everything with a Single Command
```bash
npm run dev:all
```
This command starts all 5 microservices and the Vite React frontend concurrently.

- 🌐 **Web Dashboard**: `http://localhost:3000` (or `http://localhost:5173`)
- 📡 **Gateway Health Endpoint**: `http://localhost:3000/api/health`

---

## 🐳 Docker Deployment

To run all microservices inside isolated Docker containers:

```bash
docker-compose up --build
```

---

## 📡 API Gateway Endpoints

- `GET /api/health` - Gateway system health status and downstream microservice status
- `GET /api/market/live` - Fetch live cryptocurrency asset prices
- `GET /api/market/history?symbol=BTC` - Fetch chart history for specified asset
- `GET /api/analytics/ds?symbol=BTC` - Fetch quantitative RSI, SMA-20, and Fear/Greed index
- `GET /api/orders/book?symbol=BTC` - Query order book bids and asks depth
- `POST /api/orders/place` - Place a Market or Limit trade order
- `GET /api/user/portfolio` - Query current user balance and crypto holdings
- `GET /api/transactions` - Query blockchain ledger blocks and confirmed trades
