// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Cohort.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./Libraries/PriceConverter.sol";

/**
 * @title CohortFactory
 * @dev Factory contract for deploying new Cohort contracts with an updatable creation fee
 */
contract CohortFactory is Ownable {
    using PriceConverter for uint256;

    struct CohortInfo {
        address cohortAddress;
        string name;
        uint256 creationTimestamp;
    }

    struct CohortCreationParams {
        address primaryAdmin;
        address tokenAddress;
        string name;
        string description;
        uint256 cycle;
        address[] builders;
        uint256[] caps;
        bool requiresApproval;
        bool allowApplications;
    }

    AggregatorV3Interface private priceFeed;

    uint256 public creationFeeUSD;

    mapping(address => bool) public isCohort;
    mapping(uint256 => CohortInfo) public cohortRegistry;
    uint256 public totalCohorts;

    event CohortCreated(address indexed cohortAddress, address indexed primaryAdmin, string name, string description);

    event PriceFeedUpdated(address newPriceFeed);
    event CreationFeeUpdated(uint256 oldFee, uint256 newFee);

    error InsufficientPayment(uint256 required, uint256 provided);
    error PriceFeedInvalid();
    error FailedToSendETH();
    error InvalidFeeAmount();

    /**
     * @dev Constructor sets the price feed address and initial creation fee
     * @param _priceFeed Chainlink price feed address for ETH/USD
     */
    constructor(address _priceFeed) {
        if (_priceFeed == address(0)) revert PriceFeedInvalid();

        priceFeed = AggregatorV3Interface(_priceFeed);
        creationFeeUSD = 0.1 * 1e18;
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
     * @dev Updates the creation fee amount
     * @param _newFeeUSD New fee amount in USD (scaled by 1e18)
     */
    function updateCreationFee(uint256 _newFeeUSD) external onlyOwner {
        if (_newFeeUSD == 0) revert InvalidFeeAmount();

        uint256 oldFee = creationFeeUSD;
        creationFeeUSD = _newFeeUSD;

        emit CreationFeeUpdated(oldFee, _newFeeUSD);
    }

    /**
     * @dev Calculates required ETH amount for creation fee based on current ETH price
     * @return Required ETH amount in wei
     */
    function getRequiredEthAmount() public view returns (uint256) {
        // Using 1 hour as the maxStalePeriod
        uint256 maxStalePeriod = 1 * 60 * 60;
        uint256 ethPrice = PriceConverter.getPrice(priceFeed, maxStalePeriod);
        return (creationFeeUSD * 1e18) / ethPrice;
    }

    /**
     * @dev Creates a new Cohort contract
     * @param params Struct containing all parameters for cohort creation
     * @return Address of the newly created cohort
     */
    function createCohort(CohortCreationParams calldata params) external payable returns (address) {
        uint256 requiredEth = getRequiredEthAmount();
        uint256 maxStalePeriod = 1 * 60 * 60;

        if (msg.value.getConversionRate(priceFeed, maxStalePeriod) < creationFeeUSD) {
            revert InsufficientPayment(requiredEth, msg.value);
        }

        address cohortAddress = _deployNewCohort(params);
        _registerCohort(cohortAddress, params.name);

        (bool sent, ) = owner().call{ value: msg.value }("");
        if (!sent) revert FailedToSendETH();

        emit CohortCreated(cohortAddress, params.primaryAdmin, params.name, params.description);
        return cohortAddress;
    }

    /**
     * @dev Internal function to deploy a new Cohort contract
     * @param params Struct containing cohort parameters
     * @return Address of the newly created cohort
     */
    function _deployNewCohort(CohortCreationParams calldata params) internal returns (address) {
        Cohort newCohort = new Cohort(
            params.primaryAdmin,
            params.tokenAddress,
            params.name,
            params.description,
            params.cycle,
            params.builders,
            params.caps,
            params.requiresApproval,
            params.allowApplications
        );

        return address(newCohort);
    }

    /**
     * @dev Internal function to register a cohort in the registry
     * @param cohortAddress Address of the new cohort
     * @param name Name of the cohort
     */
    function _registerCohort(address cohortAddress, string calldata name) internal {
        isCohort[cohortAddress] = true;

        uint256 cohortId = totalCohorts;
        cohortRegistry[cohortId] = CohortInfo({
            cohortAddress: cohortAddress,
            name: name,
            creationTimestamp: block.timestamp
        });

        totalCohorts++;
    }

    /**
     * @dev Gets all created cohorts with their information
     * @return Array of CohortInfo structs
     */
    function getAllCohorts() external view returns (CohortInfo[] memory) {
        CohortInfo[] memory allCohorts = new CohortInfo[](totalCohorts);

        for (uint256 i = 0; i < totalCohorts; i++) {
            allCohorts[i] = cohortRegistry[i];
        }

        return allCohorts;
    }

    /**
     * @dev Gets cohort information by index
     * @param _index Index of the cohort in the registry
     * @return Cohort information
     */
    function getCohortByIndex(uint256 _index) external view returns (CohortInfo memory) {
        require(_index < totalCohorts, "Index out of bounds");
        return cohortRegistry[_index];
    }

    /**
     * @dev Gets the total number of created cohorts
     * @return Number of cohorts
     */
    function getTotalCohorts() external view returns (uint256) {
        return totalCohorts;
    }
}
