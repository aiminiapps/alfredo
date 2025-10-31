import { NextResponse } from 'next/server';

const COVALENT_API_KEY = process.env.NEXT_PUBLIC_COVALENT_API_KEY;

const SUPPORTED_CHAINS = {
  ethereum: { id: '1', name: 'Ethereum', symbol: 'ETH', rpc: 'https://eth.llamarpc.com', icon: '⟠' },
  bsc: { id: '56', name: 'BSC', symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org', icon: '🔶' },
  polygon: { id: '137', name: 'Polygon', symbol: 'MATIC', rpc: 'https://polygon-rpc.com', icon: '🟣' },
  arbitrum: { id: '42161', name: 'Arbitrum', symbol: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc', icon: '🔵' },
  optimism: { id: '10', name: 'Optimism', symbol: 'ETH', rpc: 'https://mainnet.optimism.io', icon: '🔴' },
  base: { id: '8453', name: 'Base', symbol: 'ETH', rpc: 'https://mainnet.base.org', icon: '🔷' },
  avalanche: { id: '43114', name: 'Avalanche', symbol: 'AVAX', rpc: 'https://api.avax.network/ext/bc/C/rpc', icon: '🔺' },
  fantom: { id: '250', name: 'Fantom', symbol: 'FTM', rpc: 'https://rpc.ftm.tools', icon: '👻' }
};

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { 
        ...options, 
        signal: controller.signal 
      });
      
      clearTimeout(timeout);
      
      if (response.ok) return response;
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
}

async function scanChain(wallet, chainKey) {
  const chain = SUPPORTED_CHAINS[chainKey];
  const chainId = chain.id;

  try {
    const [balanceRes, txRes] = await Promise.all([
      fetchWithRetry(
        `https://api.covalenthq.com/v1/${chainId}/address/${wallet}/balances_v2/?key=${COVALENT_API_KEY}&nft=false&no-spam=true`
      ),
      fetchWithRetry(
        `https://api.covalenthq.com/v1/${chainId}/address/${wallet}/transactions_v2/?key=${COVALENT_API_KEY}&page-size=100`
      )
    ]);

    const balanceData = await balanceRes.json();
    const txData = await txRes.json();

    if (!balanceData.data || balanceData.error) {
      return { 
        chain: chainKey, 
        chainName: chain.name,
        icon: chain.icon,
        error: balanceData.error_message || 'Failed to fetch', 
        hasAssets: false 
      };
    }

    const items = balanceData.data.items || [];
    const txItems = txData.data?.items || [];

    const tokens = items
      .filter(item => item.balance && parseFloat(item.balance) > 0)
      .map(item => {
        const balance = parseFloat(item.balance) / Math.pow(10, item.contract_decimals);
        const valueUSD = item.quote || 0;
        const priceUSD = balance > 0 ? valueUSD / balance : 0;

        return {
          name: item.contract_name || 'Unknown',
          symbol: item.contract_ticker_symbol || 'UNKN',
          balance: balance,
          balanceFormatted: balance.toFixed(6),
          contractAddress: item.contract_address,
          valueUSD: valueUSD,
          priceUSD: priceUSD,
          logo: item.logo_url,
          isNative: item.native_token || false,
          percentChange24h: item.quote_rate_24h || 0,
          chain: chainKey,
          chainName: chain.name,
          decimals: item.contract_decimals
        };
      })
      .filter(token => token.valueUSD > 0.01)
      .sort((a, b) => b.valueUSD - a.valueUSD);

    const totalValue = tokens.reduce((sum, t) => sum + t.valueUSD, 0);

    const transactions = txItems.slice(0, 50).map(tx => {
      const value = parseFloat(tx.value) / Math.pow(10, 18);
      const gasSpent = (parseFloat(tx.gas_spent) * parseFloat(tx.gas_price)) / Math.pow(10, 18);
      
      return {
        hash: tx.tx_hash,
        from: tx.from_address,
        to: tx.to_address,
        value: value,
        valueUSD: tx.value_quote || 0,
        timestamp: new Date(tx.block_signed_at).getTime(),
        gasSpent: gasSpent,
        successful: tx.successful,
        chain: chainKey,
        chainName: chain.name
      };
    });

    return {
      chain: chainKey,
      chainName: chain.name,
      symbol: chain.symbol,
      icon: chain.icon,
      hasAssets: tokens.length > 0,
      totalValue: totalValue,
      tokens: tokens,
      transactions: transactions,
      tokenCount: tokens.length,
      txCount: transactions.length
    };

  } catch (error) {
    console.error(`Error scanning ${chainKey}:`, error);
    return {
      chain: chainKey,
      chainName: chain.name,
      icon: chain.icon,
      error: error.message,
      hasAssets: false
    };
  }
}

function calculatePnL(transactions, tokens) {
  const tokenPnL = {};
  
  tokens.forEach(token => {
    const relatedTxs = transactions.filter(tx => 
      tx.to?.toLowerCase().includes(token.contractAddress?.toLowerCase().slice(0, 10)) ||
      tx.from?.toLowerCase().includes(token.contractAddress?.toLowerCase().slice(0, 10))
    );

    const buys = relatedTxs.filter(tx => tx.to?.toLowerCase() !== token.contractAddress?.toLowerCase());
    const sells = relatedTxs.filter(tx => tx.from?.toLowerCase() !== token.contractAddress?.toLowerCase());

    const totalBuyValue = buys.reduce((sum, tx) => sum + (tx.valueUSD || 0), 0);
    const totalSellValue = sells.reduce((sum, tx) => sum + (tx.valueUSD || 0), 0);
    const currentValue = token.valueUSD;

    const avgBuyPrice = totalBuyValue > 0 && token.balance > 0 ? totalBuyValue / token.balance : 0;
    const unrealizedPnL = currentValue - (avgBuyPrice * token.balance);
    const realizedPnL = totalSellValue - totalBuyValue;
    const totalPnL = unrealizedPnL + realizedPnL;
    const profitPercent = totalBuyValue > 0 ? ((totalPnL / totalBuyValue) * 100) : 0;

    tokenPnL[token.symbol] = {
      symbol: token.symbol,
      name: token.name,
      entryPrice: avgBuyPrice,
      currentPrice: token.priceUSD,
      realizedPnL: realizedPnL,
      unrealizedPnL: unrealizedPnL,
      totalPnL: totalPnL,
      profitPercent: profitPercent,
      totalBuyValue: totalBuyValue,
      totalSellValue: totalSellValue,
      currentValue: currentValue,
      chain: token.chain
    };
  });

  return tokenPnL;
}

function generateAdvancedAnalytics(allChainData, wallet) {
  const allTokens = allChainData.flatMap(chain => chain.tokens || []);
  const allTransactions = allChainData.flatMap(chain => chain.transactions || []);
  
  const totalPortfolioValue = allTokens.reduce((sum, t) => sum + t.valueUSD, 0);
  const activeChains = allChainData.filter(c => c.hasAssets);
  
  const oldestTx = allTransactions.length > 0
    ? allTransactions.reduce((oldest, tx) => tx.timestamp < oldest.timestamp ? tx : oldest)
    : null;
  const walletAge = oldestTx
    ? Math.floor((Date.now() - oldestTx.timestamp) / (1000 * 60 * 60 * 24))
    : 0;

  const pnlData = calculatePnL(allTransactions, allTokens);
  
  const totalRealizedPnL = Object.values(pnlData).reduce((sum, p) => sum + p.realizedPnL, 0);
  const totalUnrealizedPnL = Object.values(pnlData).reduce((sum, p) => sum + p.unrealizedPnL, 0);
  const totalPnL = totalRealizedPnL + totalUnrealizedPnL;

  const topTokenValue = allTokens.length > 0 ? allTokens[0].valueUSD : 0;
  const concentration = totalPortfolioValue > 0 ? (topTokenValue / totalPortfolioValue * 100) : 0;
  const diversificationScore = Math.min(100, (allTokens.length * 5) + (100 - concentration));

  const avgTxPerDay = walletAge > 0 ? allTransactions.length / walletAge : 0;
  const tradingType = avgTxPerDay > 5 ? 'Day Trader' : avgTxPerDay > 1 ? 'Active Trader' : avgTxPerDay > 0.1 ? 'Moderate Investor' : 'HODLer';

  const chainDistribution = activeChains.map(chain => ({
    chain: chain.chainName,
    chainKey: chain.chain,
    icon: chain.icon,
    value: chain.totalValue,
    percentage: (chain.totalValue / totalPortfolioValue * 100).toFixed(2),
    tokenCount: chain.tokenCount
  })).sort((a, b) => b.value - a.value);

  const riskScore = 100 - Math.min(50, concentration / 2) - (allTokens.length < 5 ? 20 : 0) - (activeChains.length === 1 ? 15 : 0);

  const profitableTokens = Object.values(pnlData).filter(p => p.totalPnL > 0).length;
  const losingTokens = Object.values(pnlData).filter(p => p.totalPnL < 0).length;
  const winRate = allTokens.length > 0 ? (profitableTokens / allTokens.length * 100) : 0;

  return {
    wallet: wallet,
    totalValue: totalPortfolioValue,
    totalTokens: allTokens.length,
    totalTransactions: allTransactions.length,
    activeChains: activeChains.length,
    walletAge: walletAge,
    diversificationScore: Math.round(diversificationScore),
    concentration: concentration.toFixed(2),
    tradingType: tradingType,
    riskScore: Math.round(riskScore),
    chainDistribution: chainDistribution,
    pnlData: pnlData,
    totalRealizedPnL: totalRealizedPnL,
    totalUnrealizedPnL: totalUnrealizedPnL,
    totalPnL: totalPnL,
    profitableTokens: profitableTokens,
    losingTokens: losingTokens,
    winRate: winRate.toFixed(1),
    topHoldings: allTokens.slice(0, 10),
    recentActivity: allTransactions.slice(0, 20),
    avgTransactionsPerDay: avgTxPerDay.toFixed(2)
  };
}

export async function POST(request) {
  try {
    const { wallet, chains } = await request.json();

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const chainsToScan = chains || Object.keys(SUPPORTED_CHAINS);

    console.log(`🔍 Scanning ${wallet} across ${chainsToScan.length} chains...`);

    const scanPromises = chainsToScan.map(chain => scanChain(wallet, chain));
    const chainResults = await Promise.all(scanPromises);

    const successfulScans = chainResults.filter(r => !r.error);
    const activeChains = chainResults.filter(r => r.hasAssets);

    if (successfulScans.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to scan any chains',
        details: chainResults.map(r => ({ chain: r.chain, error: r.error }))
      }, { status: 500 });
    }

    const analytics = generateAdvancedAnalytics(successfulScans, wallet);

    console.log(`✅ ${activeChains.length} active chains | $${analytics.totalValue.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      wallet: wallet,
      timestamp: new Date().toISOString(),
      scannedChains: successfulScans.length,
      activeChains: activeChains.length,
      chainResults: chainResults,
      analytics: analytics,
      supportedChains: SUPPORTED_CHAINS
    });

  } catch (error) {
    console.error('Scan Error:', error);
    return NextResponse.json({
      error: 'Failed to scan wallet',
      message: error.message
    }, { status: 500 });
  }
}
