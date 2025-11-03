import { NextResponse } from 'next/server';

// ✅ LBLX Token Transaction API - Updated for LabelX

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;
const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org';

console.log('🔧 LBLX Transaction API Configuration:');
console.log('- Admin Key:', ADMIN_PRIVATE_KEY ? '✅ Present' : '❌ Missing');
console.log('- Token Address:', TOKEN_CONTRACT_ADDRESS ? '✅ Present' : '❌ Missing');

const TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';

// Nonce tracking
const processedNonces = new Set();
setInterval(() => processedNonces.clear(), 600000);

// ✅ Direct RPC call
async function directRPCCall(method, params = []) {
  const response = await fetch(BSC_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now()
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(`RPC error: ${data.error.message}`);
  return data.result;
}

// ✅ Create transfer data for ERC-20
function createTransferData(recipientAddress, tokenAmountWei) {
  const cleanAddress = recipientAddress.replace('0x', '').toLowerCase();
  const paddedAddress = cleanAddress.padStart(64, '0');
  const amountHex = BigInt(tokenAmountWei).toString(16);
  const paddedAmount = amountHex.padStart(64, '0');
  const data = TRANSFER_FUNCTION_SIGNATURE + paddedAddress + paddedAmount;
  
  console.log('🔍 Transfer Data Construction:');
  console.log('- Function Sig:', TRANSFER_FUNCTION_SIGNATURE);
  console.log('- Address:', recipientAddress, '→', paddedAddress);
  console.log('- Amount Wei:', tokenAmountWei, '→', paddedAmount);
  console.log('- Final Data:', data);
  
  return data;
}

export async function POST(request) {
  const startTime = Date.now();
  console.log('\n🎯 LBLX Transaction API called at:', new Date().toISOString());

  try {
    // Environment validation
    if (!ADMIN_PRIVATE_KEY || !TOKEN_CONTRACT_ADDRESS) {
      return NextResponse.json({
        error: 'Missing environment variables'
      }, { status: 500 });
    }

    // Parse request
    const body = await request.json();
    const { taskId, address, message, signature, nonce, expiry, reward, isWelcomeBonus } = body;

    console.log('📦 Processing:', isWelcomeBonus ? 'Welcome Bonus' : `Task ${taskId}`);
    console.log('👤 To User:', address);
    console.log('💰 Amount:', reward, 'LBLX');

    // Load ethers v6
    const ethers = await import('ethers');
    const ethersLib = ethers.default || ethers;

    // Create wallet from private key
    const adminWallet = new ethersLib.Wallet(ADMIN_PRIVATE_KEY);

    // Validate recipient is not admin
    if (address.toLowerCase() === adminWallet.address.toLowerCase()) {
      console.error('❌ Self-transfer detected!');
      return NextResponse.json({
        error: 'Invalid recipient: cannot send to admin wallet'
      }, { status: 400 });
    }

    // Basic validation
    if (!address || !message || !signature || !reward) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate address
    if (!ethersLib.isAddress(address)) {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
    }

    // Verify signature
    try {
      const recoveredAddress = ethersLib.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Signature verified');
    } catch (sigError) {
      console.error('Signature error:', sigError);
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    // Expiry and nonce checks
    const now = Math.floor(Date.now() / 1000);
    if (now > parseInt(expiry)) {
      return NextResponse.json({ error: 'Request expired' }, { status: 400 });
    }

    const nonceKey = `${address}_${nonce}`;
    if (processedNonces.has(nonceKey)) {
      return NextResponse.json({ error: 'Nonce already used' }, { status: 409 });
    }

    processedNonces.add(nonceKey);

    // Task validation - Updated rewards for LabelX
    const validTasks = {
      followX: 100,
      commentX: 75,
      retweetX: 60,
      joinTelegram: 80,
      likeX: 50,
      shareX: 90,
      joinCommunity: 70,
      openMiniApp: 80,
      welcomeBonus: 10
    };

    if (!isWelcomeBonus) {
      if (!validTasks[taskId] || reward !== validTasks[taskId]) {
        return NextResponse.json({ error: 'Invalid task reward' }, { status: 400 });
      }
    }

    console.log('✅ All validations passed');

    // Test RPC
    const blockNumber = await directRPCCall('eth_blockNumber');
    console.log('✅ RPC working, block:', parseInt(blockNumber, 16));

    // Get admin nonce and gas price
    const [adminNonce, gasPrice] = await Promise.all([
      directRPCCall('eth_getTransactionCount', [adminWallet.address, 'pending']),
      directRPCCall('eth_gasPrice')
    ]);

    const bufferedGasPrice = Math.floor(parseInt(gasPrice, 16) * 1.2);

    // Token amount calculation
    const decimals = 18;
    const tokenAmountWei = ethersLib.parseUnits(reward.toString(), decimals);
    console.log('💰 Token amount (wei):', tokenAmountWei.toString());

    // Transaction data encoding
    const transactionData = createTransferData(address, tokenAmountWei.toString());

    // Build transaction
    const rawTransaction = {
      nonce: adminNonce,
      gasPrice: '0x' + bufferedGasPrice.toString(16),
      gasLimit: '0x186A0', // 100,000
      to: TOKEN_CONTRACT_ADDRESS,
      value: '0x0',
      data: transactionData,
      chainId: 56
    };

    console.log('🔨 Transaction built');

    // Sign and broadcast
    const signedTx = await adminWallet.signTransaction(rawTransaction);
    const txHash = await directRPCCall('eth_sendRawTransaction', [signedTx]);
    console.log('📤 Transaction sent:', txHash);

    // Wait for confirmation (up to 30 seconds)
    let receipt = null;
    let attempts = 0;

    while (!receipt && attempts < 30) {
      try {
        receipt = await directRPCCall('eth_getTransactionReceipt', [txHash]);
        if (receipt) break;
      } catch (error) {
        // Not ready yet
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!receipt) {
      return NextResponse.json({
        success: true,
        txHash,
        amount: reward,
        recipient: address,
        status: 'pending',
        explorer: `https://bscscan.com/tx/${txHash}`,
        message: 'Transaction sent, confirmation pending'
      });
    }

    const status = parseInt(receipt.status, 16);
    if (status !== 1) {
      return NextResponse.json({
        error: 'Transaction failed on chain',
        txHash,
        explorer: `https://bscscan.com/tx/${txHash}`
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;

    console.log('🎉 LBLX TRANSACTION SUCCESSFUL!');
    console.log('✅ Sent', reward, 'LBLX from', adminWallet.address, 'to', address);
    console.log('✅ TX Hash:', txHash);
    console.log('⏱️ Processing time:', processingTime, 'ms');

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber: parseInt(receipt.blockNumber, 16),
      gasUsed: parseInt(receipt.gasUsed, 16),
      amount: reward,
      symbol: 'LBLX',
      recipient: address,
      sender: adminWallet.address,
      processingTime,
      explorer: `https://bscscan.com/tx/${txHash}`,
      timestamp: new Date().toISOString(),
      mode: 'REAL_TRANSACTION_BSC'
    });

  } catch (error) {
    console.error('❌ Transaction Error:', error);
    return NextResponse.json({
      error: 'Transaction failed: ' + error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const ethers = await import('ethers');
    const ethersLib = ethers.default || ethers;
    const adminWallet = new ethersLib.Wallet(ADMIN_PRIVATE_KEY);
    const blockNumber = await directRPCCall('eth_blockNumber');

    return NextResponse.json({
      status: 'healthy',
      mode: 'REAL_TRANSACTIONS_BSC',
      blockNumber: parseInt(blockNumber, 16),
      adminWallet: adminWallet.address,
      tokenContract: TOKEN_CONTRACT_ADDRESS,
      tokenSymbol: 'LBLX',
      network: 'Binance Smart Chain',
      chainId: 56,
      rpcUrl: BSC_RPC_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 });
  }
}
