# Decentralized Auction DApp

A full-stack decentralized auction platform built with **Solidity**, **Next.js 15**, **React 19**, **ethers.js v6**, and **Hardhat**. Users can create auctions, place bids, and withdraw funds in a trustless, transparent blockchain environment.

## Features

- 🏭 **Factory Pattern**: Create unlimited independent auctions
- 💰 **Decentralized Bidding**: Transparent, on-chain bid tracking
- 🔐 **Trustless Withdrawals**: Non-winners can withdraw automatically
- ⏱️ **Real-time Countdowns**: Live auction timers
- 🎨 **Modern UI**: eBay-inspired design with Tailwind CSS
- 🐳 **Docker Development**: Isolated Hardhat environment
- ✅ **Comprehensive Tests**: Full test coverage for smart contracts

## Tech Stack

### Smart Contracts
- Solidity ^0.8.28
- Hardhat (development & testing)
- OpenZeppelin patterns

### Frontend
- Next.js 15.5.4 (App Router)
- React 19.1.0
- ethers.js 6.15.0
- @metamask/detect-provider 2.0.0
- Tailwind CSS 4

### DevOps
- Docker & Docker Compose
- Hardhat Node (local blockchain)

## Project Structure

```
block-auction/
├── contracts/              # Solidity smart contracts
│   ├── Auction.sol        # Individual auction contract
│   └── AuctionFactory.sol # Factory for creating auctions
├── scripts/               # Deployment scripts
│   ├── deploy.js         # Local deployment
│   └── deploy-testnet.js # BSC Testnet deployment
├── test/                  # Contract tests
│   ├── Auction.test.js
│   └── AuctionFactory.test.js
├── docker/                # Docker configuration
│   ├── Dockerfile
│   └── .dockerignore
├── src/
│   ├── app/              # Next.js pages
│   │   ├── page.js       # Home (auction list)
│   │   ├── auction/[id]/ # Auction detail page
│   │   └── create/       # Create auction page
│   ├── components/       # React components
│   ├── context/          # Web3 context
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   └── constants/        # Config & ABIs (auto-generated)
├── docker-compose.yml
├── hardhat.config.js
└── package.json
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **MetaMask** - [Install browser extension](https://metamask.io/)

> **Important:** Ensure Docker Desktop is **running** before proceeding with installation.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/marisatomei/block-auction.git
   cd block-auction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up development environment**
   ```bash
   npm run dev:setup
   ```

   This command will:
   - Build the Docker image for Hardhat
   - Start the Hardhat node (local blockchain)
   - Compile the smart contracts
   - Deploy contracts to the local network
   - Auto-generate `src/constants/config.js` and `src/utils/abis.js`

   Wait for completion. You should see:
   ```
   ✓ AuctionFactory deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   ✓ Config saved to: src/constants/config.js
   ✓ ABIs saved to: src/utils/abis.js
   Synced generated files from container!
   ```

4. **Start Next.js development server**

   Open a **new terminal window** and run:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

   > **Note:** For BSC Testnet deployment, create a `.env` file from `.env.example` and add your private key.

5. **Configure MetaMask**

   **Add Hardhat Local Network:**
   1. Open MetaMask browser extension
   2. Click network dropdown → **Add Network** → **Add network manually**
   3. Enter:
      - **Network Name:** `Hardhat Local`
      - **RPC URL:** `http://127.0.0.1:8545`
      - **Chain ID:** `31337`
      - **Currency Symbol:** `ETH`
   4. Click **Save** and switch to Hardhat Local network

   **Import Test Account:**
   1. Run `npm run docker:logs` to see test accounts
   2. Copy the **Private Key** of Account #0 (has 10,000 ETH)
   3. MetaMask → Account icon → **Import Account**
   4. Paste the private key and import
   5. You should now see 10,000 ETH in your wallet

6. **Start using the DApp**

   - Visit [http://localhost:3000](http://localhost:3000)
   - Click **"Connect Wallet"** and approve in MetaMask
   - Create your first auction!

### Testing

Verify your setup by running the test suite:

#### Run all tests
```bash
npm run hardhat:test
```

#### Run tests in watch mode
```bash
docker-compose run --rm hardhat-test npx hardhat test --watch
```

#### Test coverage
```bash
docker-compose exec hardhat npx hardhat coverage
```

## Deployment to BSC Testnet

**Prerequisites:**
- MetaMask with BSC Testnet network configured:
  - **Network Name:** BSC Testnet
  - **RPC URL:** https://data-seed-prebsc-1-s1.binance.org:8545/
  - **Chain ID:** 97
  - **Currency Symbol:** tBNB
  - **Block Explorer:** https://testnet.bscscan.com/
- Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart

**Deployment Steps:**

1. **Create .env file from example**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your private key**
   ```env
   PRIVATE_KEY=your_private_key_here_without_0x_prefix
   ```

3. **Deploy to BSC Testnet**
   ```bash
   npm run hardhat:deploy:testnet
   ```

4. **Update Next.js environment**
   ```env
   NEXT_PUBLIC_USE_LOCAL=false
   ```

5. **Restart Next.js**
   ```bash
   npm run dev
   ```

## Available Commands

### Quick Shortcuts
- `npm run dev:setup` - **Full setup** (build Docker, start node, compile & deploy)
- `npm run dev` - Start Next.js development server

### Docker Management
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start Hardhat node
- `npm run docker:down` - Stop containers
- `npm run docker:logs` - View Hardhat node logs
- `npm run docker:restart` - Restart Hardhat node

### Contract Development
- `npm run hardhat:compile` - Compile smart contracts
- `npm run hardhat:test` - Run all tests
- `npm run hardhat:deploy` - Deploy to local network (auto-syncs files)
- `npm run hardhat:deploy:testnet` - Deploy to BSC Testnet
- `npm run hardhat:clean` - Clean compiled artifacts
- `npm run hardhat:console` - Open Hardhat console

### Frontend Development
- `npm run build` - Build Next.js for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Smart Contract Architecture

### Auction.sol

Individual auction contract with the following features:

- **Constructor:** Create auction with product name and duration
- **placeBid():** Place a bid (must be higher than current highest)
- **withdraw():** Withdraw funds for non-winners after auction ends
- **getWinner():** Get winner address after auction ends
- **getAuctionDetails():** Get all auction information

**Key Rules:**
- One bid per address
- Bid must exceed current highest bid
- No bidding after auction ends
- Only non-winners can withdraw

### AuctionFactory.sol

Factory contract to create and manage auctions:

- **createAuction():** Deploy new Auction contract
- **getAllAuctions():** Get all auction addresses
- **getAuctionsByCreator():** Get auctions by creator address
- **getAuctionDetails():** Get details for a specific auction

## Usage Guide

### Creating an Auction

1. Connect your wallet
2. Click "Create Auction" in the header
3. Enter product name and duration (in minutes)
4. Click "Create Auction" and confirm in MetaMask
5. You'll be redirected to your new auction page

### Placing a Bid

1. Navigate to an auction detail page
2. Enter your bid amount (must be higher than current bid)
3. Click "Place Bid" and confirm in MetaMask
4. Wait for transaction confirmation

### Withdrawing Funds

1. Wait for auction to end
2. If you didn't win, a "Withdraw" button will appear
3. Click "Withdraw" and confirm in MetaMask
4. Your bid amount will be returned to your wallet

## Troubleshooting

### Docker is not running
**Error:** `Cannot connect to the Docker daemon`

**Solution:** Start Docker Desktop and wait for it to fully initialize, then try again.

### Port 8545 already in use
**Error:** `bind: address already in use`

**Solution:**
```bash
npm run docker:down
npm run docker:up
```

### Hardhat node not responding
**Solution:**
```bash
npm run docker:restart
```

### Contract compilation fails
**Solution:**
```bash
npm run hardhat:clean
npm run docker:restart
npm run hardhat:compile
```

### Contracts not found in frontend
**Error:** `Contract not deployed on this network`

**Solution:** Redeploy and sync:
```bash
npm run hardhat:deploy
```

### MetaMask shows wrong network
- Make sure you're connected to **"Hardhat Local"** (Chain ID: 31337) for local development
- Or **"BSC Testnet"** (Chain ID: 97) for production

### Nonce too high error
This happens when you reset the blockchain but MetaMask still has old transaction history.

**Solution:**
1. MetaMask → Settings → Advanced
2. Scroll down and click **"Clear activity tab data"**
3. Reconnect your wallet

### Transaction fails
- Check account has sufficient balance
- Verify you're on the correct network
- Check browser console for error messages

### Complete reset (if all else fails)
```bash
npm run docker:down
docker-compose down -v
rm -rf artifacts cache src/constants/config.js src/utils/abis.js
npm run dev:setup
```

Then reset MetaMask activity data as described above.

## Security Considerations

- ✅ Checks-Effects-Interactions pattern in withdrawal and claimFunds
- ✅ Reentrancy protection
- ✅ Custom errors for gas efficiency
- ✅ No owner privileges (fully decentralized)
- ✅ Immutable auction parameters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run hardhat:test`
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Review test files for usage examples

---

Built with ❤️ using Next.js, Solidity, and ethers.js
