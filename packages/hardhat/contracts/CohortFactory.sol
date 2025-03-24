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
        uint256 ethPrice = PriceConverter.getPrice(priceFeed);
        return (creationFeeUSD * 1e18) / ethPrice;
    }

    /**
     * @dev Creates a new Cohort contract
     * @param _primaryAdmin Address of the primary admin
     * @param _tokenAddress Address of ERC20 token (zero address for ETH)
     * @param _name Name of the cohort
     * @param _description Description of the cohort
     * @param _cycle Cycle duration
     * @param _builders Array of builder addresses
     * @param _caps Array of cap values for builders
     * @return Address of the newly created cohort
     */
    function createCohort(
        address _primaryAdmin,
        address _tokenAddress,
        string memory _name,
        string memory _description,
        uint256 _cycle,
        address[] memory _builders,
        uint256[] memory _caps,
        bool _requiresApproval
    ) external payable returns (address) {
        uint256 requiredEth = getRequiredEthAmount();

        if (msg.value.getConversionRate(priceFeed) < creationFeeUSD) {
            revert InsufficientPayment(requiredEth, msg.value);
        }

        Cohort newCohort = new Cohort(
            _primaryAdmin,
            _tokenAddress,
            _name,
            _description,
            _cycle,
            _builders,
            _caps,
            _requiresApproval
        );

        address cohortAddress = address(newCohort);
        isCohort[cohortAddress] = true;

        uint256 cohortId = totalCohorts;
        cohortRegistry[cohortId] = CohortInfo({
            cohortAddress: cohortAddress,
            name: _name,
            creationTimestamp: block.timestamp
        });

        totalCohorts++;

        (bool sent, ) = owner().call{ value: msg.value }("");
        if (!sent) revert FailedToSendETH();

        emit CohortCreated(cohortAddress, _primaryAdmin, _name, _description);
        return cohortAddress;
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
