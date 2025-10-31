import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { analytics, wallet } = await request.json();

    if (!analytics) {
      return NextResponse.json({ error: 'Analytics data required' }, { status: 400 });
    }

    // Generate comprehensive analysis
    const scores = calculateAdvancedScores(analytics);
    const insights = generateDeepInsights(analytics);
    const recommendations = generateSmartRecommendations(analytics);
    const predictions = generateAIPredictions(analytics);
    const patterns = analyzePatterns(analytics);
    const riskAnalysis = calculateRiskMetrics(analytics);
    const opportunityScore = calculateOpportunityScore(analytics);
    const portfolioHealth = assessPortfolioHealth(analytics);
    const behavioralFinance = analyzeBehavioralBias(analytics);
    const marketComparison = compareToMarket(analytics);

    return NextResponse.json({
      success: true,
      scores,
      insights,
      recommendations,
      predictions,
      patterns,
      riskAnalysis,
      opportunityScore,
      portfolioHealth,
      behavioralFinance,
      marketComparison,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Failed to generate insights'
    }, { status: 500 });
  }
}

// Advanced scoring system
function calculateAdvancedScores(analytics) {
  // Portfolio Score (0-100)
  let portfolioScore = 0;
  if (analytics.totalValue > 100000) portfolioScore += 30;
  else if (analytics.totalValue > 10000) portfolioScore += 25;
  else if (analytics.totalValue > 1000) portfolioScore += 15;
  else portfolioScore += 5;

  portfolioScore += Math.min(30, analytics.diversificationScore * 0.3);
  portfolioScore += Math.min(20, analytics.activeChains * 5);

  if (analytics.walletAge > 730) portfolioScore += 20;
  else if (analytics.walletAge > 365) portfolioScore += 15;
  else if (analytics.walletAge > 180) portfolioScore += 10;
  else portfolioScore += 5;

  // Risk Score
  let riskScore = 100;
  if (analytics.concentration > 60) riskScore -= 30;
  else if (analytics.concentration > 40) riskScore -= 15;
  if (analytics.totalTokens < 3) riskScore -= 20;
  if (analytics.activeChains === 1) riskScore -= 15;
  if (analytics.walletAge < 30) riskScore -= 10;

  // Performance Score
  const winRateNum = parseFloat(analytics.winRate) || 0;
  const performanceScore = Math.min(100, 
    50 + 
    (winRateNum * 0.5) + 
    (analytics.totalPnL > 0 ? 20 : -10) +
    (analytics.diversificationScore * 0.2)
  );

  // Activity Score
  const avgTx = parseFloat(analytics.avgTransactionsPerDay) || 0;
  const activityScore = Math.min(100, 
    (avgTx * 10) + 
    (analytics.totalTransactions / 10) + 
    (analytics.walletAge > 30 ? 20 : 5)
  );

  return {
    portfolio: Math.round(portfolioScore),
    risk: Math.max(0, Math.round(riskScore)),
    performance: Math.max(0, Math.round(performanceScore)),
    diversification: analytics.diversificationScore,
    activity: Math.round(activityScore),
    overall: Math.round((portfolioScore + riskScore + performanceScore) / 3)
  };
}

// Deep insights generation
function generateDeepInsights(analytics) {
  const insights = [];

  // Portfolio Health Insights
  if (analytics.diversificationScore > 70) {
    insights.push({
      type: 'positive',
      category: 'Diversification',
      icon: '✅',
      title: 'Well Diversified Portfolio',
      message: `Excellent diversification with ${analytics.totalTokens} tokens across ${analytics.activeChains} chains reduces systemic risk.`,
      impact: 'high',
      confidence: 95
    });
  } else if (analytics.diversificationScore < 40) {
    insights.push({
      type: 'warning',
      category: 'Risk',
      icon: '⚠️',
      title: 'Low Diversification Alert',
      message: `Portfolio concentration at ${analytics.concentration}% increases volatility. Consider spreading investments.`,
      impact: 'high',
      confidence: 90
    });
  }

  // Concentration Analysis
  if (analytics.concentration > 50) {
    insights.push({
      type: 'warning',
      category: 'Risk',
      icon: '🎯',
      title: 'High Concentration Risk',
      message: `Top holding represents ${analytics.concentration}% of portfolio. Single-asset dependency detected.`,
      impact: 'critical',
      confidence: 95
    });
  }

  // Multi-Chain Benefits
  if (analytics.activeChains >= 4) {
    insights.push({
      type: 'positive',
      category: 'Strategy',
      icon: '🌐',
      title: 'Multi-Chain Excellence',
      message: `Active on ${analytics.activeChains} chains provides ecosystem diversification and opportunity access.`,
      impact: 'high',
      confidence: 88
    });
  } else if (analytics.activeChains === 1) {
    insights.push({
      type: 'info',
      category: 'Opportunity',
      icon: '🔗',
      title: 'Single Chain Exposure',
      message: 'Expanding to L2s and alternative chains could unlock new opportunities and reduce network risk.',
      impact: 'medium',
      confidence: 85
    });
  }

  // PnL Performance
  if (analytics.totalPnL > 0 && analytics.winRate > 60) {
    insights.push({
      type: 'positive',
      category: 'Performance',
      icon: '💰',
      title: 'Strong Performance Track Record',
      message: `${analytics.winRate}% win rate with $${analytics.totalPnL.toFixed(2)} profit demonstrates consistent strategy.`,
      impact: 'high',
      confidence: 92
    });
  } else if (analytics.totalPnL < 0) {
    insights.push({
      type: 'warning',
      category: 'Performance',
      icon: '📉',
      title: 'Portfolio Underperforming',
      message: `Current loss of $${Math.abs(analytics.totalPnL).toFixed(2)} suggests strategy review needed.`,
      impact: 'high',
      confidence: 88
    });
  }

  // Experience Level
  if (analytics.walletAge > 365) {
    insights.push({
      type: 'positive',
      category: 'Experience',
      icon: '🏆',
      title: 'Experienced Trader',
      message: `${analytics.walletAge} days of activity demonstrates long-term market participation.`,
      impact: 'medium',
      confidence: 100
    });
  } else if (analytics.walletAge < 30) {
    insights.push({
      type: 'info',
      category: 'Experience',
      icon: '🌱',
      title: 'New Wallet',
      message: 'Early stage portfolio. Focus on learning and gradual position building.',
      impact: 'low',
      confidence: 95
    });
  }

  // Trading Behavior
  const avgTx = parseFloat(analytics.avgTransactionsPerDay) || 0;
  if (avgTx > 5) {
    insights.push({
      type: 'info',
      category: 'Behavior',
      icon: '⚡',
      title: 'High Trading Frequency',
      message: `${avgTx.toFixed(1)} transactions/day suggests active trading. Monitor gas costs vs returns.`,
      impact: 'medium',
      confidence: 90
    });
  }

  return insights;
}

// Smart recommendations with actionable steps
function generateSmartRecommendations(analytics) {
  const recommendations = [];

  if (analytics.concentration > 50) {
    recommendations.push({
      priority: 'High',
      type: 'Rebalancing',
      icon: '⚖️',
      title: 'Critical: Reduce Concentration',
      description: `Your largest position (${analytics.concentration}%) creates significant risk exposure.`,
      impact: 'Risk Reduction',
      timeframe: 'Immediate',
      difficulty: 'Medium',
      expectedOutcome: 'Lower volatility, improved risk-adjusted returns',
      actions: [
        'Gradually reduce top position to 30-40% over 2-4 weeks',
        'Reinvest proceeds into 3-5 uncorrelated assets',
        'Consider bluechip alternatives (ETH, BTC, major protocols)',
        'Set stop-loss orders during rebalancing'
      ],
      metrics: {
        riskReduction: '35-45%',
        expectedVolatilityDecrease: '20-30%',
        timeToComplete: '2-4 weeks'
      }
    });
  }

  if (analytics.activeChains < 3) {
    recommendations.push({
      priority: 'Medium',
      type: 'Expansion',
      icon: '🌉',
      title: 'Multi-Chain Diversification',
      description: 'Limited to single chain. Expand for opportunities and risk mitigation.',
      impact: 'Opportunity Access',
      timeframe: '1-2 weeks',
      difficulty: 'Easy',
      expectedOutcome: 'Access to unique protocols, reduced network risk',
      actions: [
        'Bridge 10-20% to L2s (Arbitrum, Optimism, Base)',
        'Research native opportunities per chain',
        'Compare gas costs and transaction speeds',
        'Maintain presence on 3+ major chains'
      ],
      metrics: {
        opportunityIncrease: '40-60%',
        riskDiversification: '15-25%',
        estimatedGasSavings: '30-50%'
      }
    });
  }

  if (analytics.diversificationScore < 50) {
    recommendations.push({
      priority: 'High',
      type: 'Diversification',
      icon: '📊',
      title: 'Improve Portfolio Diversification',
      description: 'Low diversification increases idiosyncratic risk exposure.',
      impact: 'Risk-Adjusted Returns',
      timeframe: '2-4 weeks',
      difficulty: 'Medium',
      expectedOutcome: 'Better risk-adjusted returns, smoother performance',
      actions: [
        'Add 5-7 tokens across different sectors',
        'Target: DeFi (30%), L1s (30%), Infrastructure (20%), Other (20%)',
        'Limit single positions to 15-20% max',
        'Research correlation between holdings'
      ],
      metrics: {
        targetDiversification: '70-80',
        expectedSharpeImprovement: '15-25%',
        riskReduction: '20-30%'
      }
    });
  }

  if (analytics.totalPnL < -1000) {
    recommendations.push({
      priority: 'High',
      type: 'Strategy Review',
      icon: '🔍',
      title: 'Performance Analysis Required',
      description: 'Significant losses indicate strategy reassessment needed.',
      impact: 'Performance Recovery',
      timeframe: 'Immediate',
      difficulty: 'Hard',
      expectedOutcome: 'Improved decision-making framework',
      actions: [
        'Analyze losing positions for common patterns',
        'Review entry/exit timing decisions',
        'Consider implementing stop-loss discipline',
        'Reduce position sizes until consistency improves'
      ],
      metrics: {
        targetWinRate: '55-60%',
        maxDrawdownTarget: '15-20%',
        recoveryTimeframe: '3-6 months'
      }
    });
  }

  recommendations.push({
    priority: 'Low',
    type: 'Monitoring',
    icon: '🔔',
    title: 'Set Up Portfolio Alerts',
    description: 'Active monitoring helps capture opportunities and limit losses.',
    impact: 'Risk Management',
    timeframe: 'This Week',
    difficulty: 'Easy',
    expectedOutcome: 'Faster response to market movements',
    actions: [
      'Set price alerts at key support/resistance',
      'Enable wallet activity notifications',
      'Schedule weekly portfolio reviews',
      'Monitor smart contract risks'
    ],
    metrics: {
      responseTime: '90% faster',
      opportunityCaptureRate: '+25%',
      lossPreventionRate: '+30%'
    }
  });

  return recommendations;
}

// AI-powered predictions
function generateAIPredictions(analytics) {
  const pnlTrend = analytics.totalPnL > 0 ? 'bullish' : analytics.totalPnL < 0 ? 'bearish' : 'neutral';
  const volatilityLevel = analytics.concentration > 50 ? 'high' : analytics.concentration > 30 ? 'medium' : 'low';

  return {
    shortTerm: {
      timeframe: '7 days',
      outlook: pnlTrend,
      confidence: 65,
      expectedVolatility: volatilityLevel,
      keyFactors: [
        'Current momentum trend',
        'Portfolio concentration level',
        'Market correlation exposure'
      ],
      projectedRange: {
        optimistic: analytics.totalValue * 1.08,
        realistic: analytics.totalValue * 1.02,
        pessimistic: analytics.totalValue * 0.95
      }
    },
    mediumTerm: {
      timeframe: '30 days',
      outlook: analytics.diversificationScore > 60 ? 'stable growth' : 'uncertain',
      confidence: 55,
      expectedVolatility: volatilityLevel,
      keyFactors: [
        'Diversification effectiveness',
        'Market cycle position',
        'Risk management discipline'
      ],
      projectedRange: {
        optimistic: analytics.totalValue * 1.15,
        realistic: analytics.totalValue * 1.05,
        pessimistic: analytics.totalValue * 0.88
      }
    },
    riskAssessment: {
      level: analytics.concentration > 60 ? 'High Risk' : analytics.concentration > 40 ? 'Moderate Risk' : 'Low Risk',
      maxDrawdownEstimate: `${(analytics.concentration * 0.5).toFixed(0)}%`,
      recoveryTime: analytics.walletAge > 180 ? 'Fast (2-4 weeks)' : 'Moderate (4-8 weeks)',
      blackSwanVulnerability: analytics.activeChains < 2 ? 'High' : 'Medium'
    }
  };
}

// Pattern analysis
function analyzePatterns(analytics) {
  return {
    tradingPattern: {
      type: analytics.tradingType,
      frequency: parseFloat(analytics.avgTransactionsPerDay) || 0,
      consistency: analytics.totalTransactions > 50 ? 'High' : analytics.totalTransactions > 20 ? 'Medium' : 'Low',
      recommendation: analytics.avgTransactionsPerDay > 5 
        ? 'Consider reducing frequency to optimize costs'
        : 'Current frequency appears sustainable'
    },
    performancePattern: {
      trend: analytics.totalPnL > 0 ? 'Winning' : 'Losing',
      winRate: `${analytics.winRate}%`,
      profitFactor: analytics.totalRealizedPnL > 0 
        ? (analytics.totalRealizedPnL / Math.abs(analytics.totalUnrealizedPnL)).toFixed(2)
        : 'N/A',
      consistency: parseFloat(analytics.winRate) > 60 ? 'Strong' : parseFloat(analytics.winRate) > 45 ? 'Moderate' : 'Weak'
    },
    riskPattern: {
      appetite: analytics.concentration > 50 ? 'Aggressive' : analytics.concentration > 30 ? 'Moderate' : 'Conservative',
      diversificationApproach: analytics.totalTokens > 10 ? 'Diversified' : analytics.totalTokens > 5 ? 'Balanced' : 'Concentrated',
      timeHorizon: analytics.tradingType === 'HODLer' ? 'Long-term' : analytics.tradingType === 'Day Trader' ? 'Short-term' : 'Medium-term'
    }
  };
}

// Risk metrics calculation
function calculateRiskMetrics(analytics) {
  const concentration = parseFloat(analytics.concentration);
  const volatilityScore = Math.min(100, concentration + (100 - analytics.diversificationScore));
  const liquidityRisk = analytics.totalValue < 1000 ? 'High' : analytics.totalValue < 10000 ? 'Medium' : 'Low';

  return {
    concentrationRisk: {
      level: concentration > 60 ? 'Critical' : concentration > 40 ? 'High' : concentration > 25 ? 'Moderate' : 'Low',
      score: Math.round(concentration),
      impact: 'Portfolio vulnerable to single asset performance'
    },
    volatilityRisk: {
      level: volatilityScore > 70 ? 'High' : volatilityScore > 40 ? 'Moderate' : 'Low',
      score: Math.round(volatilityScore),
      expectedRange: `±${(volatilityScore * 0.5).toFixed(0)}%`
    },
    liquidityRisk: {
      level: liquidityRisk,
      concern: analytics.totalValue < 1000 ? 'Limited capital for diversification' : 'Adequate liquidity',
      recommendation: liquidityRisk === 'High' ? 'Focus on liquid assets' : 'Well positioned'
    },
    chainRisk: {
      level: analytics.activeChains === 1 ? 'High' : analytics.activeChains < 3 ? 'Moderate' : 'Low',
      exposure: `${analytics.activeChains} chain${analytics.activeChains !== 1 ? 's' : ''}`,
      recommendation: analytics.activeChains < 2 ? 'Expand to multiple chains' : 'Well diversified'
    },
    overallRiskScore: Math.round((concentration + volatilityScore) / 2)
  };
}

// Opportunity score calculation
function calculateOpportunityScore(analytics) {
  let score = 50;

  // Multi-chain bonus
  score += analytics.activeChains * 5;

  // Diversification bonus
  if (analytics.diversificationScore > 70) score += 20;
  else if (analytics.diversificationScore > 50) score += 10;

  // Experience bonus
  if (analytics.walletAge > 365) score += 15;
  else if (analytics.walletAge > 180) score += 8;

  // Performance bonus
  if (analytics.totalPnL > 0) score += 10;

  score = Math.min(100, score);

  return {
    score: Math.round(score),
    level: score > 80 ? 'Excellent' : score > 60 ? 'Good' : score > 40 ? 'Fair' : 'Limited',
    factors: {
      marketAccess: analytics.activeChains >= 3 ? 'Excellent' : 'Limited',
      capitalEfficiency: analytics.totalValue > 10000 ? 'High' : 'Moderate',
      experienceLevel: analytics.walletAge > 365 ? 'Expert' : analytics.walletAge > 90 ? 'Intermediate' : 'Beginner',
      performanceTrack: analytics.totalPnL > 0 ? 'Positive' : 'Needs Improvement'
    },
    recommendations: [
      'Explore yield farming opportunities',
      'Consider staking high-conviction assets',
      'Research emerging protocols on active chains',
      'Monitor liquidity mining programs'
    ]
  };
}

// Portfolio health assessment
function assessPortfolioHealth(analytics) {
  const healthScore = Math.round(
    (analytics.diversificationScore * 0.3) +
    (analytics.riskScore * 0.3) +
    ((analytics.totalPnL > 0 ? 80 : 40) * 0.2) +
    (Math.min(100, analytics.activeChains * 20) * 0.2)
  );

  return {
    overall: healthScore,
    status: healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : healthScore > 40 ? 'Fair' : 'Needs Attention',
    components: {
      diversification: {
        score: analytics.diversificationScore,
        status: analytics.diversificationScore > 70 ? 'Healthy' : 'Needs Improvement',
        weight: 30
      },
      riskManagement: {
        score: analytics.riskScore,
        status: analytics.riskScore > 70 ? 'Strong' : analytics.riskScore > 50 ? 'Adequate' : 'Weak',
        weight: 30
      },
      performance: {
        score: analytics.totalPnL > 0 ? 80 : 40,
        status: analytics.totalPnL > 0 ? 'Profitable' : 'Loss Making',
        weight: 20
      },
      positioning: {
        score: Math.min(100, analytics.activeChains * 20),
        status: analytics.activeChains >= 3 ? 'Well Positioned' : 'Limited Exposure',
        weight: 20
      }
    },
    alerts: generateHealthAlerts(analytics)
  };
}

function generateHealthAlerts(analytics) {
  const alerts = [];

  if (analytics.concentration > 60) {
    alerts.push({ severity: 'high', message: 'Critical concentration risk detected' });
  }

  if (analytics.totalPnL < -1000) {
    alerts.push({ severity: 'high', message: 'Significant portfolio losses require review' });
  }

  if (analytics.activeChains === 1) {
    alerts.push({ severity: 'medium', message: 'Single chain exposure increases risk' });
  }

  if (analytics.walletAge < 30) {
    alerts.push({ severity: 'low', message: 'New wallet - proceed with caution' });
  }

  return alerts;
}

// Behavioral bias analysis
function analyzeBehavioralBias(analytics) {
  const biases = [];

  // Overconcentration bias
  if (analytics.concentration > 50) {
    biases.push({
      type: 'Overconcentration Bias',
      severity: 'High',
      description: 'Excessive confidence in single asset suggests anchoring bias',
      mitigation: 'Set maximum position size rules (e.g., 25% cap)'
    });
  }

  // Overtrading bias
  const avgTx = parseFloat(analytics.avgTransactionsPerDay) || 0;
  if (avgTx > 5) {
    biases.push({
      type: 'Overtrading',
      severity: 'Medium',
      description: 'High transaction frequency may indicate action bias',
      mitigation: 'Implement mandatory cool-down periods between trades'
    });
  }

  // Loss aversion
  if (analytics.totalPnL < 0 && analytics.totalTransactions < 20) {
    biases.push({
      type: 'Loss Aversion',
      severity: 'Medium',
      description: 'Low activity after losses suggests fear-driven paralysis',
      mitigation: 'Start with small positions to rebuild confidence'
    });
  }

  return {
    detected: biases.length,
    biases: biases,
    overall: biases.length > 2 ? 'Multiple biases affecting decisions' : biases.length > 0 ? 'Some biases present' : 'Limited bias detected',
    recommendation: biases.length > 0 
      ? 'Consider implementing systematic decision-making rules'
      : 'Maintain current disciplined approach'
  };
}

// Market comparison
function compareToMarket(analytics) {
  // Simulated market averages (in production, fetch real data)
  const marketAverages = {
    diversificationScore: 55,
    activeChains: 2,
    winRate: 48,
    avgPortfolioValue: 5000,
    avgWalletAge: 120
  };

  return {
    diversification: {
      user: analytics.diversificationScore,
      market: marketAverages.diversificationScore,
      percentile: analytics.diversificationScore > 70 ? 'Top 25%' : analytics.diversificationScore > 50 ? 'Top 50%' : 'Below Average',
      comparison: analytics.diversificationScore > marketAverages.diversificationScore ? 'Above Average' : 'Below Average'
    },
    multiChainAdoption: {
      user: analytics.activeChains,
      market: marketAverages.activeChains,
      percentile: analytics.activeChains >= 4 ? 'Top 10%' : analytics.activeChains >= 2 ? 'Top 40%' : 'Below Average',
      comparison: analytics.activeChains > marketAverages.activeChains ? 'Above Average' : 'Below Average'
    },
    performance: {
      user: `${analytics.winRate}%`,
      market: `${marketAverages.winRate}%`,
      percentile: parseFloat(analytics.winRate) > 60 ? 'Top 20%' : parseFloat(analytics.winRate) > 50 ? 'Top 40%' : 'Below Average',
      comparison: parseFloat(analytics.winRate) > marketAverages.winRate ? 'Above Average' : 'Below Average'
    },
    portfolioSize: {
      user: analytics.totalValue,
      market: marketAverages.avgPortfolioValue,
      percentile: analytics.totalValue > 50000 ? 'Top 5%' : analytics.totalValue > 10000 ? 'Top 25%' : analytics.totalValue > 5000 ? 'Top 50%' : 'Below Average',
      comparison: analytics.totalValue > marketAverages.avgPortfolioValue ? 'Above Average' : 'Below Average'
    },
    overall: 'Your portfolio shows unique characteristics compared to market averages'
  };
}
