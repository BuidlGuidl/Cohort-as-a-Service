// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CohortBuilderManager.sol";

/**
 * @title CohortWithdrawal
 * @dev Contract containing functionality for withdrawals in a Cohort
 */
abstract contract CohortWithdrawal is CohortBuilderManager {
    using SafeERC20 for IERC20;

    /**
     * @dev Request a withdrawal for builders that require approval
     * @param _amount Amount to withdraw
     * @param _reason Reason for withdrawal
     */
    function _requestWithdraw(uint256 _amount, string memory _reason) private noPendingRequests(msg.sender) {
        // Check if the builder has enough unlocked to withdraw
        uint256 totalAmountCanWithdraw = unlockedBuilderAmount(msg.sender);
        if (totalAmountCanWithdraw < _amount) {
            revert InsufficientInStream(_amount, totalAmountCanWithdraw);
        }

        // Create withdrawal request
        withdrawRequests[msg.sender].push(
            WithdrawRequest({
                amount: _amount,
                reason: _reason,
                approved: false,
                completed: false,
                requestTime: block.timestamp
            })
        );

        uint256 requestId = withdrawRequests[msg.sender].length - 1;
        emit WithdrawRequested(msg.sender, requestId, _amount, _reason);
    }

    /**
     * @dev Stream withdraw for a builder
     * @param _amount Amount to withdraw
     * @param _reason Reason for withdrawal
     */
    function streamWithdraw(
        uint256 _amount,
        string memory _reason
    ) public isStreamActive(msg.sender) nonReentrant isCohortLocked {
        if (requiresApproval[msg.sender]) {
            _requestWithdraw(_amount, _reason);
            return;
        }

        if (isONETIME) {
            _processOneTimeWithdraw(msg.sender);
        } else {
            _processStreamWithdraw(msg.sender, _amount);
        }

        emit Withdraw(msg.sender, _amount, _reason);
    }
}
