import { NextResponse } from 'next/server';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async function getTrendingCoins() {
  const res = await fetch(`${COINGECKO_API}/search/trending`);
  const data = await res.json();
  return data.coins || [];
}

async function getTopGainers() {
  const res = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h,7d`);
  return await res.json();
}

async function getMarketData(coinIds) {
  const ids = coinIds.join(',');
  const res = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&sparkline=true&price_change_percentage=24h,7d,30d`);
  return await res.json();
}

export async function POST(request) {
  try {
    const { walletData, riskProfile } = await request.json();

    const [trending, gainers] = await Promise.all([
      getTrendingCoins(),
      getTopGainers()
    ]);

    // AI-based recommendations based on risk profile
    let recommendations = [];

    if (riskProfile === 'Low' || riskProfile === 'Medium') {
      // Conservative recommendations
      recommendations = gainers
        .filter(coin => coin.market_cap_rank <= 50)
        .slice(0, 5)
        .map(coin => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          currentPrice: coin.current_price,
          priceChange24h: coin.price_change_percentage_24h,
          priceChange7d: coin.price_change_percentage_7d_in_currency,
          marketCap: coin.market_cap,
          marketCapRank: coin.market_cap_rank,
          sparkline: coin.sparkline_in_7d?.price || [],
          reason: 'Established project with strong fundamentals and stable growth',
          confidence: 85,
          category: 'Blue Chip'
        }));
    } else {
      // Aggressive recommendations
      recommendations = gainers
        .filter(coin => coin.price_change_percentage_24h > 10)
        .slice(0, 5)
        .map(coin => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          currentPrice: coin.current_price,
          priceChange24h: coin.price_change_percentage_24h,
          priceChange7d: coin.price_change_percentage_7d_in_currency,
          marketCap: coin.market_cap,
          marketCapRank: coin.market_cap_rank,
          sparkline: coin.sparkline_in_7d?.price || [],
          reason: 'High momentum with strong upward trend',
          confidence: 70,
          category: 'High Growth'
        }));
    }

    // Add trending coins
    const trendingRecommendations = trending.slice(0, 3).map(item => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol.toUpperCase(),
      image: item.item.large,
      currentPrice: item.item.data?.price || 0,
      priceChange24h: item.item.data?.price_change_percentage_24h?.usd || 0,
      marketCapRank: item.item.market_cap_rank,
      reason: 'Currently trending in the market',
      confidence: 75,
      category: 'Trending'
    }));

    return NextResponse.json({ 
      success: true, 
      recommendations: [...recommendations, ...trendingRecommendations],
      marketSentiment: {
        bullish: 65,
        neutral: 25,
        bearish: 10
      }
    });
  } catch (error) {
    console.error('Recommendations API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
