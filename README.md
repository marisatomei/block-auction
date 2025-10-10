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

- Node.js 20+
- Docker & Docker Compose
- MetaMask browser extension

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd block-auction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env .env.local
   ```

   Edit `.env` if needed (defaults are fine for local development).

### Development Workflow

#### Option 1: Quick Start (Recommended)

```bash
# Build Docker image, start Hardhat node, compile & deploy contracts
npm run dev:setup

# In another terminal, start Next.js
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

#### Option 2: Step-by-Step

1. **Build Docker image**
   ```bash
   npm run docker:build
   ```

2. **Start Hardhat node**
   ```bash
   npm run docker:up
   ```

3. **Compile contracts**
   ```bash
   npm run hardhat:compile
   ```

4. **Deploy contracts**
   ```bash
   npm run hardhat:deploy
   ```
   This will auto-generate:
   - `src/constants/config.js` (contract addresses)
   - `src/utils/abis.js` (contract ABIs)

5. **Start Next.js app**
   ```bash
   npm run dev
   ```

6. **View Hardhat logs** (optional)
   ```bash
   npm run docker:logs
   ```

### Testing

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

## MetaMask Setup

### For Local Development (Hardhat)

1. Open MetaMask → Networks → Add Network
2. Enter the following:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

3. Import a test account:
   - Check Docker logs: `npm run docker:logs`
   - Copy a private key from the account list
   - MetaMask → Import Account → Paste private key

### For BSC Testnet (Production)

1. Add BSC Testnet to MetaMask:
   - **Network Name:** BSC Testnet
   - **RPC URL:** https://data-seed-prebsc-1-s1.binance.org:8545/
   - **Chain ID:** 97
   - **Currency Symbol:** tBNB
   - **Block Explorer:** https://testnet.bscscan.com/

2. Get testnet BNB:
   - Visit: https://testnet.bnbchain.org/faucet-smart
   - Enter your wallet address
   - Request tBNB

## Deployment to BSC Testnet

1. **Update .env with your private key**
   ```env
   PRIVATE_KEY=your_private_key_here
   BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
   ```

2. **Deploy to BSC Testnet**
   ```bash
   npm run hardhat:deploy:testnet
   ```

3. **Update Next.js environment**
   ```env
   NEXT_PUBLIC_USE_LOCAL=false
   ```

4. **Restart Next.js**
   ```bash
   npm run dev
   ```

## Available NPM Scripts

### Docker Commands
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start Hardhat node
- `npm run docker:down` - Stop containers
- `npm run docker:logs` - View Hardhat logs
- `npm run docker:restart` - Restart Hardhat node

### Hardhat Commands
- `npm run hardhat:compile` - Compile contracts
- `npm run hardhat:test` - Run tests
- `npm run hardhat:deploy` - Deploy to local network
- `npm run hardhat:deploy:testnet` - Deploy to BSC Testnet
- `npm run hardhat:clean` - Clean artifacts
- `npm run hardhat:console` - Open Hardhat console

### Next.js Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Workflow Shortcuts
- `npm run dev:all` - Start Hardhat + Next.js
- `npm run dev:setup` - Full setup (build, deploy, compile)

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

### Contract compilation fails
```bash
npm run hardhat:clean
npm run docker:restart
npm run hardhat:compile
```

### MetaMask shows wrong network
- Check that you're connected to "Hardhat Local" (Chain ID: 31337)
- Or "BSC Testnet" (Chain ID: 97) for production

### Deployment fails
- Ensure Hardhat node is running: `npm run docker:logs`
- Check that Docker containers are up: `docker ps`

### Transaction fails
- Check account has sufficient balance
- Verify you're on the correct network
- Check browser console for error messages

### Docker issues
```bash
# Complete reset
npm run docker:down
docker-compose down -v
npm run docker:build
npm run dev:setup
```

## Security Considerations

- ✅ Checks-Effects-Interactions pattern in withdrawal
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
- Check existing documentation in `/docs`
- Review test files for usage examples

---

Built with ❤️ using Next.js, Solidity, and ethers.js
