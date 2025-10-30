// app/api/wallet/route.js
import { NextResponse } from 'next/server';

const COVALENT_API_KEY = process.env.NEXT_PUBLIC_COVALENT_API_KEY;

const CHAIN_IDS = {
  ethereum: '1',
  bsc: '56',
  polygon: '137',
  arbitrum: '42161',
  base: '8453',
  avalanche: '43114',
  optimism: '10'
};

const getChainId = (network) => {
  return CHAIN_IDS[network] || '1';
};

async function getCovalentData(chainId, wallet) {
  const balanceUrl = `https://api.covalenthq.com/v1/${chainId}/address/${wallet}/balances_v2/?key=${COVALENT_API_KEY}`;
  const txUrl = `https://api.covalenthq.com/v1/${chainId}/address/${wallet}/transactions_v2/?key=${COVALENT_API_KEY}&page-size=50`;
  
  const [balanceRes, txRes] = await Promise.all([
    fetch(balanceUrl),
    fetch(txUrl)
  ]);

  const balanceData = await balanceRes.json();
  const txData = await txRes.json();

  return { balanceData, txData };
}

async function getCoinGeckoPrices(contractAddresses) {
  if (!contractAddresses || contractAddresses.length === 0) return {};
  
  const addresses = contractAddresses.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true&include_market_cap=true`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('CoinGecko Error:', error);
    return {};
  }
}

function calculateRiskScore(data) {
  let riskScore = 100;
  const factors = [];

  const { tokens, transactions, statistics } = data;

  // Portfolio diversity
  if (tokens.length < 3) {
    riskScore -= 20;
    factors.push('Low portfolio diversification');
  } else if (tokens.length > 20) {
    riskScore -= 10;
    factors.push('Very high token diversity (potential risk)');
  }

  // Transaction activity
  if (transactions.length < 10) {
    riskScore -= 15;
    factors.push('Low transaction activity');
  }

  // Failed transactions
  const failureRate = statistics.failedTransactions / statistics.totalTransactions;
  if (failureRate > 0.15) {
    riskScore -= 25;
    factors.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
  }

  // Token concentration
  const sortedTokens = [...tokens].sort((a, b) => b.valueUSD - a.valueUSD);
  if (sortedTokens.length > 0) {
    const topTokenValue = sortedTokens[0].valueUSD;
    const totalValue = tokens.reduce((sum, t) => sum + t.valueUSD, 0);
    const concentration = (topTokenValue / totalValue) * 100;
    
    if (concentration > 80) {
      riskScore -= 15;
      factors.push('High concentration in single asset');
    }
  }

  // Gas spending
  if (statistics.totalGasSpent > 1) {
    factors.push('Active trader (high gas usage)');
    riskScore -= 5;
  }

  riskScore = Math.max(20, Math.min(100, riskScore));

  return {
    score: riskScore,
    level: riskScore > 75 ? 'Low' : riskScore > 50 ? 'Medium' : 'High',
    factors: factors.length > 0 ? factors : ['Portfolio appears healthy']
  };
}

export async function POST(request) {
  try {
    const { wallet, network } = await request.json();

    if (!wallet || !network) {
      return NextResponse.json({ error: 'Wallet and network required' }, { status: 400 });
    }

    const chainId = getChainId(network);
    
    console.log('Fetching wallet data from Covalent:', { wallet, network, chainId });

    // Get Covalent data
    const { balanceData, txData } = await getCovalentData(chainId, wallet);

    if (!balanceData.data || balanceData.error) {
      return NextResponse.json({ 
        error: 'Failed to fetch wallet data', 
        details: balanceData.error_message || 'Invalid response from Covalent' 
      }, { status: 400 });
    }

    // Process token balances
    const items = balanceData.data.items || [];
    const nativeToken = items.find(item => item.native_token) || items[0];
    
    const nativeBalance = nativeToken 
      ? (parseFloat(nativeToken.balance) / Math.pow(10, nativeToken.contract_decimals)).toFixed(4)
      : '0.0000';

    const nativeSymbol = nativeToken?.contract_ticker_symbol || 'ETH';

    // Process all tokens
    const processedTokens = items
      .filter(item => item.balance && parseFloat(item.balance) > 0)
      .map(item => {
        const balance = parseFloat(item.balance) / Math.pow(10, item.contract_decimals);
        const valueUSD = item.quote || 0;
        const priceUSD = balance > 0 ? valueUSD / balance : 0;

        return {
          name: item.contract_name || 'Unknown',
          symbol: item.contract_ticker_symbol || 'UNKN',
          balance: balance.toFixed(6),
          balanceRaw: item.balance,
          decimals: item.contract_decimals,
          contractAddress: item.contract_address,
          valueUSD: valueUSD,
          priceUSD: priceUSD,
          logo: item.logo_url,
          isNative: item.native_token || false,
          percentChange24h: item.quote_rate_24h || 0
        };
      })
      .filter(token => token.valueUSD > 0.01)
      .sort((a, b) => b.valueUSD - a.valueUSD);

    // Calculate total portfolio value
    const totalPortfolioValue = processedTokens.reduce((sum, token) => sum + token.valueUSD, 0);

    // Process transactions
    const txItems = txData.data?.items || [];
    const processedTxs = txItems.map(tx => {
      const value = parseFloat(tx.value) / Math.pow(10, 18);
      const gasSpent = (parseFloat(tx.gas_spent) * parseFloat(tx.gas_price)) / Math.pow(10, 18);

      return {
        hash: tx.tx_hash,
        from: tx.from_address,
        to: tx.to_address,
        value: value.toFixed(6),
        valueUSD: tx.value_quote || 0,
        timestamp: new Date(tx.block_signed_at).getTime(),
        blockHeight: tx.block_height,
        gasSpent: gasSpent.toFixed(6),
        gasPrice: (parseFloat(tx.gas_price) / 1e9).toFixed(2),
        successful: tx.successful,
        isError: !tx.successful
      };
    });

    // Calculate statistics
    const totalTxCount = processedTxs.length;
    const failedTxCount = processedTxs.filter(tx => !tx.successful).length;
    const successRate = totalTxCount > 0 ? ((totalTxCount - failedTxCount) / totalTxCount * 100).toFixed(1) : '0';

    const totalGasSpent = processedTxs.reduce((sum, tx) => sum + parseFloat(tx.gasSpent), 0);

    // Activity timeline (last 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const recentTxs = processedTxs.filter(tx => tx.timestamp > thirtyDaysAgo);
    
    const activityByDay = {};
    const last30Days = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      activityByDay[dateStr] = 0;
      last30Days.push(dateStr);
    }
    
    recentTxs.forEach(tx => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      if (activityByDay.hasOwnProperty(date)) {
        activityByDay[date]++;
      }
    });

    const activityTimeline = last30Days.map(date => ({
      date,
      transactions: activityByDay[date] || 0
    }));

    // Token distribution for charts
    const topTokens = processedTokens.slice(0, 10).map(token => ({
      name: token.symbol,
      value: token.valueUSD,
      percentage: totalPortfolioValue > 0 ? ((token.valueUSD / totalPortfolioValue) * 100).toFixed(2) : 0
    }));

    // Performance metrics
    const profitableTokens = processedTokens.filter(t => t.percentChange24h > 0).length;
    const totalChange24h = processedTokens.reduce((sum, t) => {
      const weight = t.valueUSD / totalPortfolioValue;
      return sum + (t.percentChange24h * weight);
    }, 0);

    // Wallet age
    const oldestTx = processedTxs.length > 0 
      ? processedTxs.reduce((oldest, tx) => tx.timestamp < oldest.timestamp ? tx : oldest)
      : null;
    
    const walletAge = oldestTx 
      ? Math.floor((now - oldestTx.timestamp) / (1000 * 60 * 60 * 24))
      : 0;

    // Assemble data for risk calculation
    const dataForRisk = {
      tokens: processedTokens,
      transactions: processedTxs,
      statistics: {
        totalTransactions: totalTxCount,
        failedTransactions: failedTxCount,
        totalGasSpent: totalGasSpent
      }
    };

    const riskAssessment = calculateRiskScore(dataForRisk);

    // Final wallet data
    const walletData = {
      address: wallet,
      network: network,
      chainId: chainId,
      balance: {
        native: nativeBalance,
        symbol: nativeSymbol,
        valueUSD: nativeToken?.quote || 0
      },
      portfolio: {
        totalValueUSD: totalPortfolioValue.toFixed(2),
        totalTokens: processedTokens.length,
        change24h: totalChange24h.toFixed(2),
        profitableTokens: profitableTokens
      },
      statistics: {
        totalTransactions: totalTxCount,
        successfulTransactions: totalTxCount - failedTxCount,
        failedTransactions: failedTxCount,
        successRate: successRate,
        totalGasSpent: totalGasSpent.toFixed(6),
        walletAge: walletAge,
        firstTransaction: oldestTx ? new Date(oldestTx.timestamp).toISOString() : null,
        lastTransaction: processedTxs.length > 0 ? new Date(processedTxs[0].timestamp).toISOString() : null
      },
      tokens: processedTokens,
      topTokens: topTokens,
      transactions: processedTxs.slice(0, 30),
      activityTimeline: activityTimeline,
      riskAssessment: riskAssessment
    };

    console.log('Successfully processed wallet data');
    return NextResponse.json({ success: true, data: walletData });
    
  } catch (error) {
    console.error('Wallet API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch wallet data', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
