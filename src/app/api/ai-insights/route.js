import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { walletData } = await request.json();

    const insights = {
      portfolioScore: calculatePortfolioScore(walletData),
      tradingBehavior: analyzeTradingBehavior(walletData),
      diversificationScore: calculateDiversification(walletData),
      activityPattern: analyzeActivityPattern(walletData),
      recommendations: generateRecommendations(walletData),
      predictions: generatePredictions(walletData)
    };

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculatePortfolioScore(data) {
  let score = 0;
  const { tokens, statistics, portfolio } = data;

  if (parseFloat(portfolio.totalValueUSD) > 10000) score += 25;
  else if (parseFloat(portfolio.totalValueUSD) > 1000) score += 15;
  else score += 5;

  if (tokens.length >= 10) score += 25;
  else if (tokens.length >= 5) score += 15;
  else score += 5;

  if (parseFloat(statistics.successRate) > 95) score += 25;
  else if (parseFloat(statistics.successRate) > 85) score += 15;
  else score += 5;

  if (statistics.walletAge > 365) score += 25;
  else if (statistics.walletAge > 180) score += 15;
  else score += 5;

  return Math.min(score, 100);
}

function analyzeTradingBehavior(data) {
  const txCount = data.statistics.totalTransactions;
  const walletAge = data.statistics.walletAge || 1;
  const avgTxPerDay = txCount / walletAge;

  if (avgTxPerDay > 5) return { type: 'Day Trader', description: 'Very active trading pattern', color: '#FF453A' };
  if (avgTxPerDay > 1) return { type: 'Active Trader', description: 'Regular trading activity', color: '#FFB347' };
  if (avgTxPerDay > 0.1) return { type: 'Moderate Investor', description: 'Occasional trading', color: '#4CD964' };
  return { type: 'HODLer', description: 'Long-term holder', color: '#4CD964' };
}

function calculateDiversification(data) {
  const { tokens, portfolio } = data;
  const totalValue = parseFloat(portfolio.totalValueUSD);
  
  if (tokens.length === 0) return { score: 0, level: 'None' };
  
  const topTokenValue = tokens.reduce((max, t) => Math.max(max, t.valueUSD), 0);
  const concentration = (topTokenValue / totalValue) * 100;

  let score = 100 - concentration;
  score += (tokens.length * 2);
  score = Math.min(score, 100);

  return {
    score: Math.round(score),
    level: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Fair' : 'Poor',
    concentration: concentration.toFixed(1)
  };
}

function analyzeActivityPattern(data) {
  const { activityTimeline } = data;
  const recentActivity = activityTimeline.slice(-7);
  const totalRecent = recentActivity.reduce((sum, day) => sum + day.transactions, 0);
  
  return {
    last7Days: totalRecent,
    trend: totalRecent > 10 ? 'Increasing' : totalRecent > 5 ? 'Stable' : 'Decreasing',
    pattern: totalRecent > 20 ? 'Very Active' : totalRecent > 10 ? 'Active' : 'Low Activity'
  };
}

function generateRecommendations(data) {
  const recommendations = [];
  const { tokens, portfolio, statistics, riskAssessment } = data;

  if (tokens.length < 5) {
    recommendations.push({
      type: 'Diversification',
      priority: 'High',
      message: 'Consider diversifying your portfolio across more assets to reduce risk',
      action: 'Add 3-5 more tokens from different sectors'
    });
  }

  if (parseFloat(statistics.totalGasSpent) > 1) {
    recommendations.push({
      type: 'Gas Optimization',
      priority: 'Medium',
      message: 'High gas spending detected. Consider optimizing transaction timing',
      action: 'Use gas trackers and transact during low-fee periods'
    });
  }

  if (riskAssessment.level === 'High') {
    recommendations.push({
      type: 'Risk Management',
      priority: 'High',
      message: 'Your portfolio shows high-risk indicators',
      action: 'Consider rebalancing towards more stable assets'
    });
  }

  if (parseFloat(portfolio.change24h) < -10) {
    recommendations.push({
      type: 'Market Alert',
      priority: 'High',
      message: 'Significant portfolio decline detected',
      action: 'Review your positions and consider stop-loss strategies'
    });
  }

  return recommendations;
}

function generatePredictions(data) {
  const { portfolio, statistics, tokens } = data;
  
  return {
    portfolioGrowth: {
      trend: parseFloat(portfolio.change24h) > 0 ? 'Bullish' : 'Bearish',
      confidence: 65,
      projection30d: parseFloat(portfolio.change24h) * 30
    },
    activityForecast: {
      expected: statistics.totalTransactions > 100 ? 'High' : 'Moderate',
      confidence: 70
    },
    riskForecast: {
      level: tokens.length > 10 ? 'Decreasing' : 'Stable',
      confidence: 60
    }
  };
}
