// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Cohort.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./Libraries/PriceConverter.sol";

/**
 * @title CohortFactory
 * @dev Factory contract for deploying new Cohort contracts with a creation fee
 */
contract CohortFactory is Ownable {
    using PriceConverter for uint256;

    AggregatorV3Interface private priceFeed;

    uint256 public constant CREATION_FEE_USD = 10 * 1e18; // 10 USD

    mapping(address => bool) public isCohort;

    address[] public cohorts;

    event CohortCreated(address indexed cohortAddress, address indexed primaryAdmin, string name, string description);
    event PriceFeedUpdated(address newPriceFeed);

    error InsufficientPayment(uint256 required, uint256 provided);
    error PriceFeedInvalid();
    error FailedToSendETH();

    /**
     * @dev Constructor sets the price feed address for ETH/USD conversion
     * @param _priceFeed Chainlink price feed address for ETH/USD
     */
    constructor(address _priceFeed) Ownable(msg.sender) {
        if (_priceFeed == address(0)) revert PriceFeedInvalid();
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /**
     * @dev Updates the price feed address
     * @param _newPriceFeed New price feed address
     */
    function updatePriceFeed(address _newPriceFeed) external onlyOwner {
        if (_newPriceFeed == address(0)) revert PriceFeedInvalid();
        priceFeed = AggregatorV3Interface(_newPriceFeed);
        emit PriceFeedUpdated(_newPriceFeed);
    }

    /**
     * @dev Calculates required ETH amount for creation fee
     * @return Required ETH amount in wei
     */
    function getRequiredEthAmount() public view returns (uint256) {
        uint256 ethPrice = PriceConverter.getPrice(priceFeed);
        return (CREATION_FEE_USD * 1e18) / ethPrice;
    }

    /**
     * @dev Creates a new Cohort contract
     * @param _primaryAdmin Address of the primary admin
     * @param _tokenAddress Address of ERC20 token (zero address for ETH)
     * @param _name Name of the cohort
     * @return Address of the newly created cohort
     */
    function createCohort(
        address _primaryAdmin,
        address _tokenAddress,
        string memory _name,
        string memory _description
    ) external payable returns (address) {
        uint256 requiredEth = getRequiredEthAmount();

        if (msg.value.getConversionRate(priceFeed) < CREATION_FEE_USD) {
            revert InsufficientPayment(requiredEth, msg.value);
        }

        Cohort newCohort = new Cohort(_primaryAdmin, _tokenAddress, _name, _description);

        address cohortAddress = address(newCohort);
        isCohort[cohortAddress] = true;
        cohorts.push(cohortAddress);

        (bool sent, ) = owner().call{ value: msg.value }("");
        if (!sent) revert FailedToSendETH();

        emit CohortCreated(cohortAddress, _primaryAdmin, _name, _description);
        return cohortAddress;
    }

    /**
     * @dev Gets all created cohorts
     * @return Array of cohort addresses
     */
    function getAllCohorts() external view returns (address[] memory) {
        return cohorts;
    }

    /**
     * @dev Gets the total number of created cohorts
     * @return Number of cohorts
     */
    function getTotalCohorts() external view returns (uint256) {
        return cohorts.length;
    }
}
