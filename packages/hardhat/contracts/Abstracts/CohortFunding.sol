// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CohortWithdrawal.sol";

/**
 * @title CohortFunding
 * @dev Contract containing functionality for funding a Cohort
 */
abstract contract CohortFunding is CohortWithdrawal {
    using SafeERC20 for IERC20;

    /**
     * @dev Fund the contract with ETH or ERC20 tokens
     * @param _amount Amount to fund (for ERC20 tokens)
     */
    function fundContract(uint256 _amount) public payable {
        if (!isERC20) {
            if (msg.value == 0) revert NoValueSent();
            emit FundsReceived(msg.sender, msg.value);
        } else {
            if (_amount == 0) revert NoValueSent();

            IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), _amount);

            emit ERC20FundsReceived(tokenAddress, msg.sender, _amount);
        }
    }
}
