// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ICohortStructs
 * @dev Interface defining common structures and errors used across cohort contracts
 */
interface ICohortStructs {
    // Builder stream information
    struct BuilderStreamInfo {
        uint256 cap; // Maximum amount of funds that can be withdrawn in a cycle
        uint256 last; // The timestamp of the last withdrawal
    }

    // Withdrawal request structure
    struct WithdrawRequest {
        uint256 amount;
        string reason;
        bool approved;
        bool completed;
        uint256 requestTime;
    }

    // Custom errors
    error NoValueSent();
    error InsufficientFundsInContract(uint256 requested, uint256 unlocked);
    error NoActiveStreamForBuilder(address builder);
    error InsufficientInStream(uint256 requested, uint256 unlocked);
    error EtherSendingFailed();
    error LengthsMismatch();
    error InvalidBuilderAddress();
    error BuilderAlreadyExists();
    error ContractIsLocked();
    error MaxBuildersReached();
    error AccessDenied();
    error InvalidTokenAddress();
    error NoFundsInContract();
    error ERC20TransferFailed();
    error ERC20SendingFailed(address token, address recipient);
    error ERC20FundsTransferFailed(address token, address to, uint256 amount);
    error BelowMinimumCap(uint256 provided, uint256 minimum);
    error NotAuthorized();
    error InvalidNewAdminAddress();
    error MaxNameLength(uint256 providedLength, uint256 maxLength);
    error NoWithdrawRequest();
    error WithdrawRequestNotApproved();
    error WithdrawRequestAlreadyCompleted();
    error WithdrawRequestNotFound();
    error PendingWithdrawRequestExists();
    error AlreadyWithdrawnOneTime();
}
