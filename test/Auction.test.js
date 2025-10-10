const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Auction", function () {
  let auction;
  let owner, bidder1, bidder2, bidder3;
  const PRODUCT_NAME = "Test Product";
  const PRODUCT_DESCRIPTION = "This is a test product description";
  const DURATION_MINUTES = 60;

  beforeEach(async function () {
    [owner, bidder1, bidder2, bidder3] = await ethers.getSigners();

    const Auction = await ethers.getContractFactory("Auction");
    auction = await Auction.deploy(PRODUCT_NAME, PRODUCT_DESCRIPTION, DURATION_MINUTES, owner.address);
    await auction.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct product name", async function () {
      expect(await auction.productName()).to.equal(PRODUCT_NAME);
    });

    it("Should set the correct product description", async function () {
      expect(await auction.productDescription()).to.equal(PRODUCT_DESCRIPTION);
    });

    it("Should set the correct creator", async function () {
      expect(await auction.creator()).to.equal(owner.address);
    });

    it("Should have correct end time", async function () {
      const currentTime = await time.latest();
      const endTime = await auction.auctionEndTime();
      const expectedEndTime = currentTime + DURATION_MINUTES * 60;

      expect(endTime).to.be.closeTo(expectedEndTime, 5);
    });

    it("Should initialize with zero highest bid", async function () {
      expect(await auction.highestBid()).to.equal(0);
    });
  });

  describe("Bidding", function () {
    it("Should accept valid bids", async function () {
      const bidAmount = ethers.parseEther("1.0");

      await auction.connect(bidder1).placeBid({ value: bidAmount });

      expect(await auction.highestBid()).to.equal(bidAmount);
      expect(await auction.highestBidder()).to.equal(bidder1.address);
      expect(await auction.bids(bidder1.address)).to.equal(bidAmount);
    });

    it("Should emit NewBid event", async function () {
      const bidAmount = ethers.parseEther("1.0");

      await expect(auction.connect(bidder1).placeBid({ value: bidAmount }))
        .to.emit(auction, "NewBid")
        .withArgs(bidder1.address, bidAmount, await time.latest() + 1);
    });

    it("Should accept higher bids from different users", async function () {
      await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.0") });
      await auction.connect(bidder2).placeBid({ value: ethers.parseEther("2.0") });

      expect(await auction.highestBid()).to.equal(ethers.parseEther("2.0"));
      expect(await auction.highestBidder()).to.equal(bidder2.address);
    });

    it("Should reject bids lower than or equal to current highest bid", async function () {
      await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.0") });

      await expect(
        auction.connect(bidder2).placeBid({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWithCustomError(auction, "BidTooLow");

      await expect(
        auction.connect(bidder2).placeBid({ value: ethers.parseEther("1.0") })
      ).to.be.revertedWithCustomError(auction, "BidTooLow");
    });

    it("Should reject second bid from same user", async function () {
      await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.0") });

      await expect(
        auction.connect(bidder1).placeBid({ value: ethers.parseEther("2.0") })
      ).to.be.revertedWithCustomError(auction, "AlreadyPlacedBid");
    });

    it("Should reject bids after auction ends", async function () {
      await time.increase(DURATION_MINUTES * 60 + 1);

      await expect(
        auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.0") })
      ).to.be.revertedWithCustomError(auction, "AuctionEnded");
    });
  });

  describe("Winner", function () {
    it("Should return winner after auction ends", async function () {
      await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.0") });
      await auction.connect(bidder2).placeBid({ value: ethers.parseEther("2.0") });

      await time.increase(DURATION_MINUTES * 60 + 1);

      expect(await auction.getWinner()).to.equal(bidder2.address);
    });

    it("Should reject getWinner call before auction ends", async function () {
      await expect(
        auction.getWinner()
      ).to.be.revertedWithCustomError(auction, "AuctionStillActive");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.0") });
      await auction.connect(bidder2).placeBid({ value: ethers.parseEther("2.0") });
      await auction.connect(bidder3).placeBid({ value: ethers.parseEther("3.0") });

      await time.increase(DURATION_MINUTES * 60 + 1);
    });

    it("Should allow non-winner to withdraw", async function () {
      const initialBalance = await ethers.provider.getBalance(bidder1.address);
      const bidAmount = ethers.parseEther("1.0");

      const tx = await auction.connect(bidder1).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(bidder1.address);

      expect(finalBalance).to.equal(initialBalance + bidAmount - gasUsed);
      expect(await auction.bids(bidder1.address)).to.equal(0);
    });

    it("Should emit FundsWithdrawn event", async function () {
      await expect(auction.connect(bidder1).withdraw())
        .to.emit(auction, "FundsWithdrawn")
        .withArgs(bidder1.address, ethers.parseEther("1.0"));
    });

    it("Should reject withdrawal before auction ends", async function () {
      const newAuction = await (await ethers.getContractFactory("Auction"))
        .deploy(PRODUCT_NAME, PRODUCT_DESCRIPTION, DURATION_MINUTES, owner.address);

      await newAuction.connect(bidder1).placeBid({ value: ethers.parseEther("1.0") });

      await expect(
        newAuction.connect(bidder1).withdraw()
      ).to.be.revertedWithCustomError(newAuction, "AuctionStillActive");
    });

    it("Should reject withdrawal from winner", async function () {
      await expect(
        auction.connect(bidder3).withdraw()
      ).to.be.revertedWithCustomError(auction, "CannotWithdrawAsWinner");
    });

    it("Should reject withdrawal if no bid placed", async function () {
      const [, , , , newBidder] = await ethers.getSigners();

      await expect(
        auction.connect(newBidder).withdraw()
      ).to.be.revertedWithCustomError(auction, "NoBidToWithdraw");
    });

    it("Should allow multiple non-winners to withdraw", async function () {
      await auction.connect(bidder1).withdraw();
      await auction.connect(bidder2).withdraw();

      expect(await auction.bids(bidder1.address)).to.equal(0);
      expect(await auction.bids(bidder2.address)).to.equal(0);
    });
  });

  describe("Auction Details", function () {
    it("Should return correct auction details", async function () {
      await auction.connect(bidder1).placeBid({ value: ethers.parseEther("1.5") });

      const details = await auction.getAuctionDetails();

      expect(details[0]).to.equal(PRODUCT_NAME); // name
      expect(details[1]).to.equal(PRODUCT_DESCRIPTION); // description
      expect(details[2]).to.equal(owner.address); // creator
      expect(details[4]).to.equal(bidder1.address); // highestBidder
      expect(details[5]).to.equal(ethers.parseEther("1.5")); // highestBid
      expect(details[6]).to.be.true; // isActive
    });
  });
});
