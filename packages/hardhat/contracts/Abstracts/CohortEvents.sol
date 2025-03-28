// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title CohortEvents
 * @dev Abstract contract containing all events emitted by Cohort contracts
 */
abstract contract CohortEvents {
    // Core events
    event FundsReceived(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount, string reason);
    event AddBuilder(address indexed to, uint256 amount);
    event UpdateBuilder(address indexed to, uint256 amount);
    event AdminAdded(address indexed to);
    event AdminRemoved(address indexed to);
    event ContractDrained(uint256 amount);
    event PrimaryAdminTransferred(address indexed newAdmin);
    event ERC20FundsReceived(address indexed token, address indexed from, uint256 amount);
    event ContractLocked(bool locked);

    // Withdrawal request events
    event WithdrawRequested(address indexed builder, uint256 requestId, uint256 amount, string reason);
    event WithdrawApproved(address indexed builder, uint256 requestId);
    event WithdrawRejected(address indexed builder, uint256 requestId);
    event WithdrawCompleted(address indexed builder, uint256 requestId, uint256 amount);
    event ApprovalRequirementChanged(address indexed builder, bool requiresApproval);
}
