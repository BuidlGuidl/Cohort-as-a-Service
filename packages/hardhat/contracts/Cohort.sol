// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Abstracts/CohortFunding.sol";

/**
 * @title Cohort
 * @dev Main contract for streaming ETH or ERC20 tokens to builders
 * Inherits all functionality from modular contracts
 */
contract Cohort is CohortFunding {
    /**
     * @dev Constructor that passes parameters to the base contract
     * @param _primaryAdmin Address of the primary admin
     * @param _tokenAddress Address of ERC20 token (zero address for ETH)
     * @param _name Name of the cohort
     * @param _description Description of the cohort
     * @param _cycle Cycle duration
     * @param _builders Array of builder addresses
     * @param _caps Array of cap values for builders
     * @param _requiresApproval Whether withdrawals require approval
     */
    constructor(
        address _primaryAdmin,
        address _tokenAddress,
        string memory _name,
        string memory _description,
        uint256 _cycle,
        address[] memory _builders,
        uint256[] memory _caps,
        bool _requiresApproval
    ) CohortBase(_primaryAdmin, _tokenAddress, _name, _description, _cycle, _builders, _caps, _requiresApproval) {}
}
