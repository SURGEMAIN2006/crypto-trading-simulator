const API_URL = 'http://localhost:5000/api/market';

// Fetch all 8 coins from backend
export const fetchMarketOverview = async () => {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching market feed:", error);
    return [];
  }
};

// Fetch details for a specific single coin
export const fetchCoinDetails = async (symbol) => {
  try {
    const response = await fetch(`${API_URL}/${symbol}`);
    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
};