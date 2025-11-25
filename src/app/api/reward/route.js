import { NextResponse } from 'next/server';

// Environment variables
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || '0x47EF1B4064b760110069d50025F4656e4C6a8eC9';
const BSC_RPC_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org';

// Startup validation
console.log('\n🔧 AFRD Reward System Initialization');
console.log('=====================================');
console.log('Admin Key:', ADMIN_PRIVATE_KEY ? '✅ Configured' : '❌ MISSING');
console.log('Token Contract:', TOKEN_CONTRACT_ADDRESS);
console.log('RPC Endpoint:', BSC_RPC_URL);
console.log('=====================================\n');

// ERC-20 transfer function signature: transfer(address,uint256)
const TRANSFER_FUNCTION_SIGNATURE = '0xa9059cbb';

// Nonce tracking
const processedNonces = new Map();
const NONCE_EXPIRY_MS = 600000; // 10 minutes

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of processedNonces.entries()) {
    if (now - timestamp > NONCE_EXPIRY_MS) {
      processedNonces.delete(key);
    }
  }
}, 300000);

// Direct RPC call
async function directRPCCall(method, params = []) {
  try {
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

    if (!response.ok) {
      throw new Error(`RPC HTTP error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return data.result;
  } catch (error) {
    console.error('❌ RPC Call Failed:', method, error.message);
    throw error;
  }
}

// ✅ FIXED: Proper ERC-20 transfer encoding
function createTransferData(recipientAddress, tokenAmountWei) {
  // Remove 0x prefix and convert to lowercase
  const cleanAddress = recipientAddress.toLowerCase().replace('0x', '');
  
  // Pad address to 32 bytes (64 hex chars) - LEFT padding with zeros
  const paddedAddress = cleanAddress.padStart(64, '0');
  
  // Convert amount to hex and pad to 32 bytes (64 hex chars) - LEFT padding
  const amountBigInt = BigInt(tokenAmountWei);
  const amountHex = amountBigInt.toString(16);
  const paddedAmount = amountHex.padStart(64, '0');
  
  // Combine: function signature + padded address + padded amount
  const data = TRANSFER_FUNCTION_SIGNATURE + paddedAddress + paddedAmount;
  
  console.log('📝 Transfer Data Created:');
  console.log('  ├─ Function:', TRANSFER_FUNCTION_SIGNATURE);
  console.log('  ├─ To Address:', recipientAddress);
  console.log('  ├─ Padded Address:', '0x' + paddedAddress);
  console.log('  ├─ Amount (wei):', tokenAmountWei);
  console.log('  ├─ Padded Amount:', '0x' + paddedAmount);
  console.log('  └─ Full Data:', data.slice(0, 30) + '...');
  
  return data;
}

// Main POST handler
export async function POST(request) {
  const requestId = Date.now();
  const startTime = Date.now();
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎯 NEW REWARD REQUEST #${requestId}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  try {
    // 1. Environment Check
    if (!ADMIN_PRIVATE_KEY || !TOKEN_CONTRACT_ADDRESS) {
      console.error('❌ Missing environment variables!');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 });
    }

    // 2. Parse Request
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Invalid JSON body');
      return NextResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 });
    }

    const { taskId, address, message, signature, nonce, expiry, reward, isWelcomeBonus } = body;

    console.log('\n📦 Request Details:');
    console.log('  ├─ Type:', isWelcomeBonus ? '🎁 WELCOME BONUS' : `📋 TASK: ${taskId}`);
    console.log('  ├─ Recipient:', address);
    console.log('  ├─ Amount:', reward, 'AFRD');
    console.log('  ├─ Nonce:', nonce);
    console.log('  └─ Expiry:', new Date(expiry * 1000).toISOString());

    // 3. Validation
    if (!address || !message || !signature || !reward || !nonce || !expiry) {
      console.error('❌ Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // 4. Load Ethers
    const ethers = await import('ethers');
    const ethersLib = ethers.default || ethers;

    // 5. Validate Address
    if (!ethersLib.isAddress(address)) {
      console.error('❌ Invalid address format:', address);
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address'
      }, { status: 400 });
    }

    // 6. Create Admin Wallet
    let adminWallet;
    try {
      adminWallet = new ethersLib.Wallet(ADMIN_PRIVATE_KEY);
      console.log('\n👤 Admin Wallet:');
      console.log('  └─ Address:', adminWallet.address);
    } catch (walletError) {
      console.error('❌ Invalid admin private key');
      return NextResponse.json({
        success: false,
        error: 'Server wallet configuration error'
      }, { status: 500 });
    }

    // 7. Prevent Self-Transfer
    if (address.toLowerCase() === adminWallet.address.toLowerCase()) {
      console.error('❌ Self-transfer attempt blocked!');
      return NextResponse.json({
        success: false,
        error: 'Cannot transfer to admin wallet'
      }, { status: 400 });
    }

    // 8. Verify Signature
    console.log('\n🔐 Verifying Signature...');
    let recoveredAddress;
    try {
      recoveredAddress = ethersLib.verifyMessage(message, signature);
      console.log('  ├─ Recovered:', recoveredAddress);
      console.log('  └─ Expected:', address);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        console.error('❌ Signature mismatch!');
        return NextResponse.json({
          success: false,
          error: 'Invalid signature'
        }, { status: 401 });
      }
      console.log('✅ Signature valid');
    } catch (sigError) {
      console.error('❌ Signature verification failed:', sigError.message);
      return NextResponse.json({
        success: false,
        error: 'Signature verification failed'
      }, { status: 401 });
    }

    // 9. Check Expiry
    const now = Math.floor(Date.now() / 1000);
    if (now > parseInt(expiry)) {
      console.error('❌ Request expired');
      return NextResponse.json({
        success: false,
        error: 'Request has expired'
      }, { status: 400 });
    }

    // 10. Check Nonce
    const nonceKey = `${address.toLowerCase()}_${nonce}`;
    if (processedNonces.has(nonceKey)) {
      console.error('❌ Duplicate nonce detected!');
      return NextResponse.json({
        success: false,
        error: 'This request has already been processed'
      }, { status: 409 });
    }
    processedNonces.set(nonceKey, Date.now());

    // 11. Validate Reward Amount
    const VALID_TASKS = {
      followX: 100,
      likeX: 50,
      commentX: 75,
      retweetX: 60,
      joinTelegram: 80,
      shareX: 90
    };

    if (isWelcomeBonus) {
      if (reward !== 10) {
        console.error('❌ Invalid welcome bonus amount');
        return NextResponse.json({
          success: false,
          error: 'Invalid reward amount'
        }, { status: 400 });
      }
    } else {
      if (!taskId || !VALID_TASKS[taskId]) {
        console.error('❌ Invalid task ID:', taskId);
        return NextResponse.json({
          success: false,
          error: 'Invalid task'
        }, { status: 400 });
      }
      if (reward !== VALID_TASKS[taskId]) {
        console.error('❌ Invalid reward amount for task');
        return NextResponse.json({
          success: false,
          error: 'Invalid reward amount'
        }, { status: 400 });
      }
    }

    // 12. Test RPC Connection
    console.log('\n🌐 Testing BSC Connection...');
    let blockNumber;
    try {
      blockNumber = await directRPCCall('eth_blockNumber');
      console.log('✅ Connected to BSC, Block:', parseInt(blockNumber, 16));
    } catch (rpcError) {
      console.error('❌ RPC connection failed:', rpcError.message);
      return NextResponse.json({
        success: false,
        error: 'Blockchain connection error'
      }, { status: 503 });
    }

    // 13. Get Transaction Parameters
    console.log('\n⛽ Fetching transaction parameters...');
    let adminNonce, gasPrice;
    try {
      [adminNonce, gasPrice] = await Promise.all([
        directRPCCall('eth_getTransactionCount', [adminWallet.address, 'pending']),
        directRPCCall('eth_gasPrice')
      ]);
      
      const gasPriceGwei = parseInt(gasPrice, 16) / 1e9;
      console.log('  ├─ Admin nonce:', parseInt(adminNonce, 16));
      console.log('  └─ Gas price:', gasPriceGwei.toFixed(2), 'Gwei');
    } catch (error) {
      console.error('❌ Failed to fetch parameters:', error.message);
      return NextResponse.json({
        success: false,
        error: 'Failed to prepare transaction'
      }, { status: 500 });
    }

    // 14. Calculate Token Amount (18 decimals)
    const decimals = 18;
    const tokenAmountWei = ethersLib.parseUnits(reward.toString(), decimals);
    console.log('\n💰 Token Transfer:');
    console.log('  ├─ Amount:', reward, 'AFRD');
    console.log('  └─ Wei:', tokenAmountWei.toString());

    // 15. Create Transaction Data
    const transactionData = createTransferData(address, tokenAmountWei.toString());

    // 16. Build Transaction with 30% gas buffer
    const bufferedGasPrice = Math.floor(parseInt(gasPrice, 16) * 1.3);
    
    const rawTransaction = {
      nonce: adminNonce,
      gasPrice: '0x' + bufferedGasPrice.toString(16),
      gasLimit: '0x186A0', // 100,000 gas
      to: TOKEN_CONTRACT_ADDRESS,
      value: '0x0',
      data: transactionData,
      chainId: 56 // BSC Mainnet
    };

    console.log('\n🔨 Transaction Built:');
    console.log('  ├─ From:', adminWallet.address);
    console.log('  ├─ To (Contract):', TOKEN_CONTRACT_ADDRESS);
    console.log('  ├─ Recipient:', address);
    console.log('  ├─ Nonce:', parseInt(adminNonce, 16));
    console.log('  ├─ Gas Limit: 100,000');
    console.log('  └─ Chain ID: 56 (BSC)');

    // 17. Sign Transaction
    console.log('\n✍️ Signing transaction...');
    let signedTx;
    try {
      signedTx = await adminWallet.signTransaction(rawTransaction);
      console.log('✅ Transaction signed successfully');
    } catch (signError) {
      console.error('❌ Signing failed:', signError.message);
      return NextResponse.json({
        success: false,
        error: 'Failed to sign transaction'
      }, { status: 500 });
    }

    // 18. Broadcast Transaction
    console.log('\n📤 Broadcasting transaction to BSC...');
    let txHash;
    try {
      txHash = await directRPCCall('eth_sendRawTransaction', [signedTx]);
      console.log('✅ Transaction broadcasted!');
      console.log('  ├─ TX Hash:', txHash);
      console.log('  └─ Explorer:', `https://bscscan.com/tx/${txHash}`);
    } catch (sendError) {
      console.error('❌ Broadcast failed:', sendError.message);
      
      // Check if already known (duplicate)
      if (sendError.message.includes('already known') || sendError.message.includes('replacement')) {
        return NextResponse.json({
          success: false,
          error: 'Transaction already submitted or replaced'
        }, { status: 409 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to send transaction: ' + sendError.message
      }, { status: 500 });
    }

    // 19. Wait for Confirmation
    console.log('\n⏳ Waiting for confirmation...');
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout

    while (!receipt && attempts < maxAttempts) {
      try {
        receipt = await directRPCCall('eth_getTransactionReceipt', [txHash]);
        if (receipt) {
          console.log(`✅ Receipt received after ${attempts + 1} seconds`);
          break;
        }
      } catch (error) {
        // Receipt not ready yet
      }
      
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`  ⏱️ Still waiting... (${attempts}s)`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 20. Handle Pending
    if (!receipt) {
      console.log('⏸️ Transaction pending (timeout reached)');
      return NextResponse.json({
        success: true,
        txHash,
        amount: reward,
        recipient: address,
        status: 'pending',
        explorer: `https://bscscan.com/tx/${txHash}`,
        message: 'Transaction sent, awaiting confirmation'
      });
    }

    // 21. Verify Success
    const txStatus = parseInt(receipt.status, 16);
    if (txStatus !== 1) {
      console.error('❌ Transaction failed on blockchain!');
      return NextResponse.json({
        success: false,
        error: 'Transaction reverted on blockchain',
        txHash,
        explorer: `https://bscscan.com/tx/${txHash}`
      }, { status: 500 });
    }

    // 22. Success!
    const processingTime = Date.now() - startTime;
    const gasUsed = parseInt(receipt.gasUsed, 16);
    const blockNum = parseInt(receipt.blockNumber, 16);

    console.log('\n🎉 TRANSACTION SUCCESSFUL!');
    console.log('='.repeat(70));
    console.log('✅ Transferred:', reward, 'AFRD');
    console.log('✅ From:', adminWallet.address);
    console.log('✅ To:', address);
    console.log('✅ TX Hash:', txHash);
    console.log('✅ Block:', blockNum);
    console.log('✅ Gas Used:', gasUsed);
    console.log('✅ Time:', processingTime, 'ms');
    console.log('✅ View:', `https://bscscan.com/tx/${txHash}`);
    console.log('='.repeat(70) + '\n');

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber: blockNum,
      gasUsed,
      amount: reward,
      symbol: 'AFRD',
      from: adminWallet.address,
      to: address,
      contract: TOKEN_CONTRACT_ADDRESS,
      processingTime,
      explorer: `https://bscscan.com/tx/${txHash}`,
      timestamp: new Date().toISOString(),
      network: 'BSC Mainnet (Chain ID: 56)'
    });

  } catch (error) {
    console.error('\n💥 UNEXPECTED ERROR:');
    console.error('='.repeat(70));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(70) + '\n');

    return NextResponse.json({
      success: false,
      error: 'Transaction failed: ' + error.message
    }, { status: 500 });
  }
}

// Health Check
export async function GET() {
  try {
    const ethers = await import('ethers');
    const ethersLib = ethers.default || ethers;
    const adminWallet = new ethersLib.Wallet(ADMIN_PRIVATE_KEY);
    const blockNumber = await directRPCCall('eth_blockNumber');

    return NextResponse.json({
      status: 'healthy',
      project: 'Alfredo AI Reward System',
      mode: 'PRODUCTION',
      network: 'BSC Mainnet',
      chainId: 56,
      blockNumber: parseInt(blockNumber, 16),
      adminWallet: adminWallet.address,
      tokenContract: TOKEN_CONTRACT_ADDRESS,
      tokenSymbol: 'AFRD',
      rpcUrl: BSC_RPC_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
