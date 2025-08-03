# Full-Stack USDT Transfer dApp

A full-stack dApp for transferring USDT on the Binance Smart Chain, where a backend service pays the gas fees. This allows for transfers from a user's wallet without requiring them to hold BNB.

---

## How It Works

This dApp uses a "spender" pattern with the ERC20 `transferFrom` function.

1.  **User Approval**: The wallet holding USDT first approves our deployed smart contract to spend a specific amount of their USDT. This is a one-time setup action performed on a block explorer like BSCScan.
2.  **dApp Interaction**: The recipient connects their wallet to the dApp, enters the USDT holder's address, and initiates the transfer.
3.  **Backend Execution**: A Next.js backend, funded with BNB, calls the smart contract's `transferUSDT` function. The contract then executes `transferFrom`, moving the approved USDT from the sender to the recipient. The backend's wallet covers the gas fees.

---

## Quick Start Guide

Follow these steps to deploy the contract and run the app.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- [Yarn](https://yarnpkg.com/) or npm
- [MetaMask](https://metamask.io/)

### Step 1: Deploy the Smart Contract

Deploy the `USDTTransferSpender` contract to the Binance Smart Chain using a tool like [Remix IDE](https://remix.ethereum.org/).

1.  **Compile**: Open the contract code below in Remix, compile it with Solidity `^0.8.0`.
2.  **Deploy**:
    - Connect your wallet to Remix (`Injected Provider - MetaMask`).
    - In the "Deploy" tab, provide the BSC USDT address for `_usdtTokenAddress`: `0x55d398326f99059fF775485246999027B3197955`.
    - Deploy the contract.
3.  **Save the new contract address.** This is your `SPENDER_CONTRACT_ADDRESS`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract USDTTransferSpender {
    address public immutable owner;
    address public immutable usdtTokenAddress;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(address _usdtTokenAddress) {
        owner = msg.sender;
        usdtTokenAddress = _usdtTokenAddress;
    }

    function transferUSDT(address from, address to, uint256 amount) external onlyOwner {
        IERC20 usdt = IERC20(usdtTokenAddress);
        require(usdt.allowance(from, address(this)) >= amount, "Insufficient allowance");
        bool success = usdt.transferFrom(from, to, amount);
        require(success, "Transfer failed");
    }
}
```

### Step 2: Configure Environment

1.  Clone the repo and install dependencies.
    ```bash
    git clone https://github.com/your-username/transfer-dapp.git
    cd transfer-dapp
    yarn install
    ```
2.  Create a `.env.local` file from the example (`cp .env.example .env.local`).
3.  Fill in your details:
    ```env
    # The private key of the wallet that deployed the contract (must hold BNB for gas).
    SPENDER_PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"

    # The contract address from Step 1.
    SPENDER_CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS"
    
    # The official USDT address on BSC.
    USDT_CONTRACT_ADDRESS="0x55d398326f99059fF775485246999027B3197955"
    ```

### Step 3: Grant USDT Allowance

The wallet holding the USDT must grant an allowance to your deployed spender contract.

1.  Go to the [USDT contract on BSCScan](https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955#writeContract).
2.  Connect the USDT holder's wallet.
3.  Use the `approve` function, providing your deployed `SPENDER_CONTRACT_ADDRESS` and the amount of USDT to approve.

### Step 4: Run the App

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) and follow the on-screen instructions to perform a transfer.
