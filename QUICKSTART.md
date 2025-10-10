# Quick Start Guide

Get your decentralized auction platform running in 5 minutes!

## Prerequisites

Make sure you have installed:
- ✅ Node.js 20+
- ✅ Docker Desktop (running)
- ✅ MetaMask browser extension

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Development Environment

```bash
# This will: build Docker, start Hardhat, compile & deploy contracts
npm run dev:setup
```

Wait for the deployment to complete. You should see:
```
✓ AuctionFactory deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✓ Config saved to: src/constants/config.js
✓ ABIs saved to: src/utils/abis.js
```

## Step 3: Start Next.js

In a **new terminal window**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 4: Configure MetaMask

### Add Hardhat Network

1. Open MetaMask
2. Click network dropdown → **Add Network** → **Add network manually**
3. Fill in:
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
4. Click **Save**

### Import Test Account

1. In terminal, run: `npm run docker:logs`
2. Find the **Account #0** section and copy the **Private Key**
3. MetaMask → Click account icon → **Import Account**
4. Paste the private key
5. You should now have 10,000 ETH! 💰

## Step 5: Use the DApp

### Connect Wallet
1. Click **"Connect Wallet"** in the header
2. MetaMask popup → **Connect**
3. Your address should appear in the header

### Create an Auction
1. Click **"Create Auction"** in navigation
2. Enter:
   - Product Name: "My First NFT"
   - Duration: 60 (minutes)
3. Click **"Create Auction"**
4. Confirm in MetaMask
5. Wait for confirmation → redirected to auction page

### Place a Bid
1. Open a **new browser window** (incognito mode recommended)
2. Import **Account #1** from Docker logs (different account)
3. Navigate to your auction
4. Enter bid amount: e.g., `0.5` ETH
5. Click **"Place Bid"**
6. Confirm in MetaMask
7. Watch the UI update in real-time!

### Test Withdrawal
1. Wait for auction to end (or create a 1-minute auction for testing)
2. The losing bidder can click **"Withdraw"**
3. Confirm in MetaMask
4. Funds returned! ✅

## Common Issues

### "Cannot connect to network"
```bash
npm run docker:restart
```

### "Transaction failed"
Make sure you're on **Hardhat Local** network in MetaMask

### "Contract not found"
```bash
npm run hardhat:deploy
```

### Complete Reset
```bash
npm run docker:down
docker-compose down -v
npm run dev:setup
```

## Next Steps

- ✅ Run tests: `npm run hardhat:test`
- ✅ Deploy to BSC Testnet (see README.md)
- ✅ Customize UI components
- ✅ Add image upload for auctions
- ✅ Implement bid history

## Useful Commands

```bash
# View Hardhat logs
npm run docker:logs

# Stop everything
npm run docker:down

# Restart Hardhat
npm run docker:restart

# Run tests
npm run hardhat:test

# Open Hardhat console
npm run hardhat:console
```

## Getting Help

- 📖 Read the full [README.md](./README.md)
- 🐛 Check [Troubleshooting](./README.md#troubleshooting) section
- 📝 Review contract tests in `/test` directory

---

Happy Auctioning! 🎉
