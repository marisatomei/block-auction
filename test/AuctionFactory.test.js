const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionFactory", function () {
  let factory;
  let owner, creator1, creator2;

  beforeEach(async function () {
    [owner, creator1, creator2] = await ethers.getSigners();

    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    factory = await AuctionFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await factory.getAddress()).to.be.properAddress;
    });

    it("Should start with zero auctions", async function () {
      expect(await factory.getAuctionsCount()).to.equal(0);
    });
  });

  describe("Creating Auctions", function () {
    it("Should create a new auction", async function () {
      const productName = "Test Product";
      const productDescription = "Test product description";
      const duration = 60;

      const tx = await factory.connect(creator1).createAuction(productName, productDescription, duration);
      await tx.wait();

      expect(await factory.getAuctionsCount()).to.equal(1);
    });

    it("Should emit AuctionCreated event", async function () {
      const productName = "Test Product";
      const productDescription = "Test product description";
      const duration = 60;

      await expect(factory.connect(creator1).createAuction(productName, productDescription, duration))
        .to.emit(factory, "AuctionCreated");
    });

    it("Should return auction address", async function () {
      const productName = "Test Product";
      const productDescription = "Test product description";
      const duration = 60;

      const tx = await factory.connect(creator1).createAuction(productName, productDescription, duration);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => {
          try {
            return factory.interface.parseLog(log).name === "AuctionCreated";
          } catch {
            return false;
          }
        }
      );

      const parsedEvent = factory.interface.parseLog(event);
      const auctionAddress = parsedEvent.args.auctionAddress;

      expect(auctionAddress).to.be.properAddress;
    });

    it("Should create multiple auctions", async function () {
      await factory.connect(creator1).createAuction("Product 1", "Description 1", 60);
      await factory.connect(creator1).createAuction("Product 2", "Description 2", 120);
      await factory.connect(creator2).createAuction("Product 3", "Description 3", 30);

      expect(await factory.getAuctionsCount()).to.equal(3);
    });

    it("Should track auctions by creator", async function () {
      await factory.connect(creator1).createAuction("Product 1", "Description 1", 60);
      await factory.connect(creator1).createAuction("Product 2", "Description 2", 120);
      await factory.connect(creator2).createAuction("Product 3", "Description 3", 30);

      const creator1Auctions = await factory.getAuctionsByCreator(creator1.address);
      const creator2Auctions = await factory.getAuctionsByCreator(creator2.address);

      expect(creator1Auctions.length).to.equal(2);
      expect(creator2Auctions.length).to.equal(1);
    });
  });

  describe("Retrieving Auctions", function () {
    beforeEach(async function () {
      await factory.connect(creator1).createAuction("Product 1", "Description 1", 60);
      await factory.connect(creator1).createAuction("Product 2", "Description 2", 120);
      await factory.connect(creator2).createAuction("Product 3", "Description 3", 30);
    });

    it("Should get all auctions", async function () {
      const allAuctions = await factory.getAllAuctions();

      expect(allAuctions.length).to.equal(3);
      expect(allAuctions[0]).to.be.properAddress;
      expect(allAuctions[1]).to.be.properAddress;
      expect(allAuctions[2]).to.be.properAddress;
    });

    it("Should get auctions by creator", async function () {
      const creator1Auctions = await factory.getAuctionsByCreator(creator1.address);
      const creator2Auctions = await factory.getAuctionsByCreator(creator2.address);

      expect(creator1Auctions.length).to.equal(2);
      expect(creator2Auctions.length).to.equal(1);
    });

    it("Should return empty array for creator with no auctions", async function () {
      const [, , , newUser] = await ethers.getSigners();
      const auctions = await factory.getAuctionsByCreator(newUser.address);

      expect(auctions.length).to.equal(0);
    });

    it("Should get auction details", async function () {
      const allAuctions = await factory.getAllAuctions();
      const firstAuction = allAuctions[0];

      const details = await factory.getAuctionDetails(firstAuction);

      expect(details[0]).to.equal("Product 1"); // name
      expect(details[1]).to.equal("Description 1"); // description
      expect(details[2]).to.equal(creator1.address); // creator
      expect(details[5]).to.equal(0); // highestBid (should be 0 initially)
      expect(details[6]).to.be.true; // isActive
    });
  });

  describe("Auction Functionality Through Factory", function () {
    it("Should create functional auction contract", async function () {
      const tx = await factory.connect(creator1).createAuction("Test Product", "Test Description", 60);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => {
          try {
            return factory.interface.parseLog(log).name === "AuctionCreated";
          } catch {
            return false;
          }
        }
      );

      const parsedEvent = factory.interface.parseLog(event);
      const auctionAddress = parsedEvent.args.auctionAddress;

      // Get auction contract instance
      const Auction = await ethers.getContractFactory("Auction");
      const auction = Auction.attach(auctionAddress);

      // Test auction functionality
      const [, , , bidder] = await ethers.getSigners();
      await auction.connect(bidder).placeBid({ value: ethers.parseEther("1.0") });

      expect(await auction.highestBid()).to.equal(ethers.parseEther("1.0"));
      expect(await auction.highestBidder()).to.equal(bidder.address);
    });
  });
});
