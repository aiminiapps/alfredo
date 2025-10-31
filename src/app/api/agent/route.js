import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.YOUR_SITE_URL || 'https://alfredo.ai',
    'X-Title': process.env.YOUR_SITE_NAME || 'Alfredo AI',
  },
});

export async function POST(request) {
  try {
    const { messages, walletData, model = 'meta-llama/llama-3.1-8b-instruct' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // Build context-aware system message
    let systemContext = `You are Alfredo, an advanced AI portfolio analyst specializing in Web3 and cryptocurrency. You provide insightful, actionable advice based on real wallet data.`;

    if (walletData && walletData.analytics) {
      const { analytics } = walletData;
      systemContext += `\n\nCurrent User Portfolio Context:
- Total Value: $${analytics.totalValue?.toFixed(2) || '0'}
- Active Chains: ${analytics.activeChains || 0}
- Total Tokens: ${analytics.totalTokens || 0}
- Wallet Age: ${analytics.walletAge || 0} days
- Trading Type: ${analytics.tradingType || 'Unknown'}
- Diversification Score: ${analytics.diversificationScore || 0}/100
- Risk Score: ${analytics.riskScore || 0}/100
- Total PnL: $${analytics.totalPnL?.toFixed(2) || '0'}
- Win Rate: ${analytics.winRate || 0}%

Top Holdings:
${analytics.topHoldings?.slice(0, 3).map(t => `- ${t.symbol}: $${t.valueUSD.toFixed(2)}`).join('\n') || 'None'}

Chain Distribution:
${analytics.chainDistribution?.map(c => `- ${c.chain}: $${c.value.toFixed(2)} (${c.percentage}%)`).join('\n') || 'None'}

Use this data to provide personalized, context-aware responses. Be helpful, concise, and data-driven. Focus on actionable insights.`;
    }

    const enhancedMessages = [
      {
        role: 'system',
        content: systemContext
      },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: model,
      messages: enhancedMessages,
      max_tokens: 500,
      temperature: 0.7
    });

    return NextResponse.json({
      success: true,
      reply: response.choices[0].message.content,
      model: model
    });

  } catch (error) {
    console.error('AI Agent Error:', error);
    
    // Fallback response
    return NextResponse.json({
      success: false,
      error: error.message,
      reply: "I'm having trouble processing your request right now. Please try again or rephrase your question."
    }, { status: 500 });
  }
}
