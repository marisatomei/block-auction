// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Auction
 * @dev Individual auction contract for a single product
 */
contract Auction {
    // Constants
    uint256 public constant MINIMUM_BID_INCREMENT = 0.001 ether;

    // State variables
    string public productName;
    string public productDescription;
    address public creator;
    uint256 public auctionEndTime;
    address public highestBidder;
    uint256 public highestBid;
    mapping(address => uint256) public bids;
    bool public claimedByCreator;

    // Events
    event NewBid(address indexed bidder, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed bidder, uint256 amount);
    event FundsClaimed(address indexed creator, uint256 amount);
    event AuctionCancelled(address indexed auctionAddress, address indexed creator, uint256 timestamp);

    // Errors with messages for better UX
    error AuctionEnded(string message);
    error AuctionStillActive(string message);
    error AlreadyPlacedBid(string message);
    error BidTooLow(string message);
    error NoBidToWithdraw(string message);
    error CannotWithdrawAsWinner(string message);
    error WithdrawalFailed(string message);
    error AlreadyClaimed(string message);
    error NotCreator(string message);
    error NoWinnerYet(string message);
    error InvalidCreatorAddress(string message);
    error AuctionAlreadyHasBids(string message);

    /**
     * @dev Constructor to create a new auction
     * @param _productName Name of the product being auctioned
     * @param _productDescription Description of the product
     * @param _durationMinutes Duration of the auction in minutes
     * @param _creator Address of the auction creator
     */
    constructor(
        string memory _productName,
        string memory _productDescription,
        uint256 _durationMinutes,
        address _creator
    ) {
        // Validate creator address
        if (_creator == address(0)) {
            revert InvalidCreatorAddress("Invalid creator address. Cannot create auction with zero address.");
        }

        productName = _productName;
        productDescription = _productDescription;
        creator = _creator;
        auctionEndTime = block.timestamp + (_durationMinutes * 1 minutes);
        highestBid = 0;
    }

    /**
     * @dev Place a bid on the auction
     * Must send BNB/ETH with the transaction
     * User can only bid once
     * Bid must be higher than current highest bid by at least MINIMUM_BID_INCREMENT
     */
    function placeBid() external payable {
        // Check if auction is still active
        if (isAuctionActive() == false) {
            revert AuctionEnded("This auction has already ended. You can no longer place bids.");
        }

        // Check if user has already placed a bid
        if (bids[msg.sender] > 0) {
            revert AlreadyPlacedBid("You have already placed a bid on this auction. Only one bid per address is allowed.");
        }

        // Check if bid is higher than current highest bid
        if (msg.value <= highestBid) {
            revert BidTooLow("Your bid must be higher than the current highest bid.");
        }

        // If there's already a highest bid, enforce minimum increment
        if (highestBid > 0 && msg.value < highestBid + MINIMUM_BID_INCREMENT) {
            revert BidTooLow("Your bid must be at least 0.001 ETH higher than the current highest bid.");
        }

        // Store the bid
        bids[msg.sender] = msg.value;
        highestBidder = msg.sender;
        highestBid = msg.value;

        // Emit event
        emit NewBid(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Get the winner of the auction
     * Can only be called after auction has ended
     * @return Address of the winner
     */
    function getWinner() external view returns (address) {
        if (isAuctionActive()) {
            revert AuctionStillActive("Auction is still active. Winner can only be determined after the auction ends.");
        }
        return highestBidder;
    }

    /**
     * @dev Withdraw bid for non-winning bidders
     * Can only be called after auction has ended
     * Winner cannot withdraw
     */
    function withdraw() external {
        // Check if auction has ended
        if (isAuctionActive()) {
            revert AuctionStillActive("Auction is still active. You can only withdraw after the auction ends.");
        }

        // Check if caller has a bid
        uint256 bidAmount = bids[msg.sender];
        if (bidAmount == 0) {
            revert NoBidToWithdraw("You have no bid to withdraw from this auction.");
        }

        // Check if caller is not the winner
        if (msg.sender == highestBidder) {
            revert CannotWithdrawAsWinner("Congratulations! As the winner, you cannot withdraw your bid. The creator will receive your payment.");
        }

        // Prevent re-entrancy by setting bid to 0 before transfer
        bids[msg.sender] = 0;

        // Transfer funds back to bidder
        (bool success, ) = payable(msg.sender).call{value: bidAmount}("");
        if (!success) {
            // Restore the bid if transfer failed
            bids[msg.sender] = bidAmount;
            revert WithdrawalFailed("Withdrawal failed. Please check your wallet and try again.");
        }

        emit FundsWithdrawn(msg.sender, bidAmount);
    }

    /**
     * @dev Cancel auction (only if no bids have been placed)
     * Can only be called by creator
     * Can only be cancelled if auction is still active and has no bids
     */
    function cancelAuction() external {
        // Check if caller is the creator
        if (msg.sender != creator) {
            revert NotCreator("Only the auction creator can cancel the auction.");
        }

        // Check if auction is still active
        if (!isAuctionActive()) {
            revert AuctionEnded("Auction has already ended. Cannot cancel an ended auction.");
        }

        // Check if there are any bids
        if (highestBid > 0) {
            revert AuctionAlreadyHasBids("Cannot cancel auction. Bids have already been placed and must be honored.");
        }

        // End auction immediately by setting end time to current timestamp
        auctionEndTime = block.timestamp;

        emit AuctionCancelled(address(this), msg.sender, block.timestamp);
    }

    /**
     * @dev Claim winning bid funds by auction creator
     * Can only be called after auction has ended
     * Only callable by the auction creator
     * Can only be claimed once
     */
    function claimFunds() external {
        // Check if auction has ended
        if (isAuctionActive()) {
            revert AuctionStillActive("Auction is still active. You can only claim funds after the auction ends.");
        }

        // Check if caller is the creator
        if (msg.sender != creator) {
            revert NotCreator("Only the auction creator can claim the winning bid funds.");
        }

        // Check if there is a winner
        if (highestBidder == address(0)) {
            revert NoWinnerYet("No winner yet. The auction needs at least one bid before funds can be claimed.");
        }

        // Check if funds have already been claimed
        if (claimedByCreator) {
            revert AlreadyClaimed("Funds have already been claimed for this auction.");
        }

        // Mark as claimed before transfer (checks-effects-interactions pattern)
        claimedByCreator = true;
        uint256 amount = highestBid;

        // Transfer funds to creator
        (bool success, ) = payable(creator).call{value: amount}("");
        if (!success) {
            // Restore state if transfer failed
            claimedByCreator = false;
            revert WithdrawalFailed("Failed to transfer funds. Please check your wallet and try again.");
        }

        emit FundsClaimed(creator, amount);
    }

    /**
     * @dev Check if auction is still active
     * @return True if auction is active, false otherwise
     */
    function isAuctionActive() internal view returns (bool) {
        return block.timestamp <= auctionEndTime;
    }

    /**
     * @dev Get all auction details in one call
     * @return name Product name
     * @return description Product description
     * @return auctionCreator Address of auction creator
     * @return endTime Auction end timestamp
     * @return currentHighestBidder Current highest bidder address
     * @return currentHighestBid Current highest bid amount
     * @return isActive Whether auction is still active
     * @return claimed Whether the creator has claimed the funds
     */
    function getAuctionDetails() external view returns (
        string memory name,
        string memory description,
        address auctionCreator,
        uint256 endTime,
        address currentHighestBidder,
        uint256 currentHighestBid,
        bool isActive,
        bool claimed
    ) {
        return (
            productName,
            productDescription,
            creator,
            auctionEndTime,
            highestBidder,
            highestBid,
            isAuctionActive(),
            claimedByCreator
        );
    }
}
