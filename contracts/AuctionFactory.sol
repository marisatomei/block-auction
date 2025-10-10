// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Auction.sol";

/**
 * @title AuctionFactory
 * @dev Factory contract to create and manage multiple auctions
 */
contract AuctionFactory {
    // Array of all auction addresses
    address[] public auctions;

    // Mapping from creator address to their auction addresses
    mapping(address => address[]) public auctionsByCreator;

    // Events
    event AuctionCreated(
        address indexed auctionAddress,
        address indexed creator,
        string productName,
        string productDescription,
        uint256 duration,
        uint256 timestamp
    );

    // Errors with messages for better UX
    error InvalidProductName(string message);
    error InvalidProductDescription(string message);
    error InvalidDuration(string message);
    error InvalidPaginationParams(string message);

    /**
     * @dev Create a new auction
     * @param _productName Name of the product being auctioned
     * @param _productDescription Description of the product
     * @param _durationMinutes Duration of the auction in minutes
     * @return Address of the newly created auction contract
     */
    function createAuction(
        string memory _productName,
        string memory _productDescription,
        uint256 _durationMinutes
    ) external returns (address) {
        // Validate product name (1-200 characters)
        uint256 nameLength = bytes(_productName).length;
        if (nameLength == 0 || nameLength > 200) {
            revert InvalidProductName("Product name must be between 1 and 200 characters. Please provide a valid product name.");
        }

        // Validate product description (1-2000 characters)
        uint256 descLength = bytes(_productDescription).length;
        if (descLength == 0 || descLength > 2000) {
            revert InvalidProductDescription("Product description must be between 1 and 2000 characters. Please provide a valid description.");
        }

        // Validate duration (1 minute to 365 days = 525,600 minutes)
        if (_durationMinutes < 1 || _durationMinutes > 525600) {
            revert InvalidDuration("Auction duration must be between 1 minute and 365 days (525,600 minutes). Please choose a valid duration.");
        }

        // Create new auction contract
        Auction newAuction = new Auction(
            _productName,
            _productDescription,
            _durationMinutes,
            msg.sender
        );

        address auctionAddress = address(newAuction);

        // Add to auctions array
        auctions.push(auctionAddress);

        // Add to creator's auctions
        auctionsByCreator[msg.sender].push(auctionAddress);

        // Emit event
        emit AuctionCreated(
            auctionAddress,
            msg.sender,
            _productName,
            _productDescription,
            _durationMinutes,
            block.timestamp
        );

        return auctionAddress;
    }

    /**
     * @dev Get all auction addresses
     * @return Array of all auction contract addresses
     * @notice For large datasets, consider using getAuctionsPaginated instead
     */
    function getAllAuctions() external view returns (address[] memory) {
        return auctions;
    }

    /**
     * @dev Get auctions with pagination
     * @param _startIndex Starting index (0-based)
     * @param _count Number of auctions to return
     * @return paginatedAuctions Array of auction addresses for the requested page
     * @return total Total number of auctions
     */
    function getAuctionsPaginated(uint256 _startIndex, uint256 _count)
        external
        view
        returns (address[] memory paginatedAuctions, uint256 total)
    {
        uint256 totalAuctions = auctions.length;

        // Return empty array if start index is beyond array length
        if (_startIndex >= totalAuctions) {
            return (new address[](0), totalAuctions);
        }

        // Validate count is not zero
        if (_count == 0) {
            revert InvalidPaginationParams("Invalid pagination parameters. Count must be greater than zero.");
        }

        // Calculate actual number of items to return
        uint256 endIndex = _startIndex + _count;
        if (endIndex > totalAuctions) {
            endIndex = totalAuctions;
        }

        uint256 resultLength = endIndex - _startIndex;
        address[] memory result = new address[](resultLength);

        // Copy auction addresses to result array
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = auctions[_startIndex + i];
        }

        return (result, totalAuctions);
    }

    /**
     * @dev Get auctions created by a specific address
     * @param _creator Address of the creator
     * @return Array of auction addresses created by the specified creator
     */
    function getAuctionsByCreator(address _creator) external view returns (address[] memory) {
        return auctionsByCreator[_creator];
    }

    /**
     * @dev Get total number of auctions created
     * @return Total count of auctions
     */
    function getAuctionsCount() external view returns (uint256) {
        return auctions.length;
    }

    /**
     * @dev Get auction details for a specific auction address
     * @param _auctionAddress Address of the auction contract
     * @return name Product name
     * @return description Product description
     * @return creator Address of auction creator
     * @return endTime Auction end timestamp
     * @return highestBidder Current highest bidder address
     * @return highestBid Current highest bid amount
     * @return isActive Whether auction is still active
     * @return claimed Whether the creator has claimed the funds
     */
    function getAuctionDetails(address _auctionAddress) external view returns (
        string memory name,
        string memory description,
        address creator,
        uint256 endTime,
        address highestBidder,
        uint256 highestBid,
        bool isActive,
        bool claimed
    ) {
        Auction auction = Auction(_auctionAddress);
        return auction.getAuctionDetails();
    }
}
