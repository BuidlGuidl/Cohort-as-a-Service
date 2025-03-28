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
     * @dev Complete a withdrawal that was previously approved
     * @param _requestId ID of the request to complete
     */
    function completeWithdraw(uint256 _requestId) public isStreamActive(msg.sender) nonReentrant isCohortLocked {
        // Check if request exists
        if (withdrawRequests[msg.sender].length <= _requestId) revert WithdrawRequestNotFound();
        WithdrawRequest storage request = withdrawRequests[msg.sender][_requestId];

        // Check if request is completed
        if (request.completed) revert WithdrawRequestAlreadyCompleted();

        // Check if approval is required and given
        if (requiresApproval[msg.sender] && !request.approved) revert WithdrawRequestNotApproved();

        if (isONETIME) {
            _processOneTimeWithdraw();
        } else {
            _processStreamWithdraw(request.amount);
        }

        // Mark request as completed
        request.completed = true;

        emit WithdrawCompleted(msg.sender, _requestId, request.amount);
        emit Withdraw(msg.sender, request.amount, request.reason);
    }

    /**
     * @dev Process a withdrawal for a streamed cohort
     * @param _amount Amount to withdraw
     */
    function _processStreamWithdraw(uint256 _amount) private {
        uint256 totalAmountCanWithdraw = unlockedBuilderAmount(msg.sender);
        if (totalAmountCanWithdraw < _amount) {
            revert InsufficientInStream(_amount, totalAmountCanWithdraw);
        }

        // Process the withdrawal
        BuilderStreamInfo storage builderStream = streamingBuilders[msg.sender];
        uint256 builderstreamLast = builderStream.last;
        uint256 timestamp = block.timestamp;
        uint256 cappedLast = timestamp - cycle;
        if (builderstreamLast < cappedLast) {
            builderstreamLast = cappedLast;
        }

        if (!isERC20) {
            uint256 contractFunds = address(this).balance;
            if (contractFunds < _amount) {
                revert InsufficientFundsInContract(_amount, contractFunds);
            }

            (bool sent, ) = msg.sender.call{ value: _amount }("");
            if (!sent) revert EtherSendingFailed();
        } else {
            uint256 contractFunds = IERC20(tokenAddress).balanceOf(address(this));
            if (contractFunds < _amount) {
                revert InsufficientFundsInContract(_amount, contractFunds);
            }

            IERC20(tokenAddress).safeTransfer(msg.sender, _amount);
        }

        // Update last withdrawal time
        builderStream.last = builderstreamLast + (((timestamp - builderstreamLast) * _amount) / totalAmountCanWithdraw);
    }

    /**
     * @dev Process a one-time withdrawal
     */
    function _processOneTimeWithdraw() private {
        BuilderStreamInfo storage builderStream = streamingBuilders[msg.sender];

        // Check if the builder has already withdrawn
        if (builderStream.last != type(uint256).max) {
            revert AlreadyWithdrawnOneTime();
        }

        uint256 _amount = builderStream.cap;

        if (!isERC20) {
            uint256 contractFunds = address(this).balance;
            if (contractFunds < _amount) {
                revert InsufficientFundsInContract(_amount, contractFunds);
            }

            (bool sent, ) = msg.sender.call{ value: _amount }("");
            if (!sent) revert EtherSendingFailed();
        } else {
            uint256 contractFunds = IERC20(tokenAddress).balanceOf(address(this));
            if (contractFunds < _amount) {
                revert InsufficientFundsInContract(_amount, contractFunds);
            }

            IERC20(tokenAddress).safeTransfer(msg.sender, _amount);
        }

        builderStream.last = block.timestamp;
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
            _processOneTimeWithdraw();
        } else {
            _processStreamWithdraw(_amount);
        }

        emit Withdraw(msg.sender, _amount, _reason);
    }
}
