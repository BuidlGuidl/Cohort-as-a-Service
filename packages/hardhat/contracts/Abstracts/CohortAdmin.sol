// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CohortBase.sol";

/**
 * @title CohortAdmin
 * @dev Contract containing admin functionality for managing Cohort
 */
abstract contract CohortAdmin is CohortBase {
    using SafeERC20 for IERC20;

    /**
     * @dev Modify admin roles
     * @param adminAddress Address to grant/revoke admin role
     * @param shouldGrant Whether to grant or revoke the role
     */
    function modifyAdminRole(address adminAddress, bool shouldGrant) public onlyAdmin {
        if (shouldGrant) {
            if (streamingBuilders[adminAddress].cap != 0) revert InvalidBuilderAddress();
            grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
            emit AdminAdded(adminAddress);
        } else {
            if (adminAddress == primaryAdmin) revert AccessDenied();
            revokeRole(DEFAULT_ADMIN_ROLE, adminAddress);
            emit AdminRemoved(adminAddress);
        }
    }

    /**
     * @dev Transfer primary admin role
     * @param newPrimaryAdmin Address of the new primary admin
     */
    function transferPrimaryAdmin(address newPrimaryAdmin) public {
        if (msg.sender != primaryAdmin) revert NotAuthorized();
        if (newPrimaryAdmin == address(0)) revert InvalidNewAdminAddress();

        primaryAdmin = newPrimaryAdmin;

        _revokeRole(DEFAULT_ADMIN_ROLE, primaryAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, newPrimaryAdmin);

        emit PrimaryAdminTransferred(newPrimaryAdmin);
    }

    /**
     * @dev Lock or unlock the contract
     * @param _enable Whether to lock the contract
     */
    function toggleLock(bool _enable) public onlyAdmin {
        locked = _enable;
        emit ContractLocked(_enable);
    }

    /**
     * @dev Set whether this contract requires approval for withdrawals
     * @param _enable Whether to require approval
     */
    function toggleContractApprovalRequirement(bool _enable) public onlyAdmin {
        requireApprovalForWithdrawals = _enable;
        emit ApprovalRequirementChanged(address(this), _enable);
    }

    /**
     * @dev Set whether a builder requires approval for withdrawals
     * @param _builder Builder address
     * @param _requiresApproval Whether the builder requires approval
     */
    function setBuilderApprovalRequirement(
        address _builder,
        bool _requiresApproval
    ) public onlyAdmin isStreamActive(_builder) {
        requiresApproval[_builder] = _requiresApproval;
        emit ApprovalRequirementChanged(_builder, _requiresApproval);
    }

    /**
     * @dev Approve a withdrawal request
     * @param _builder Builder address
     * @param _requestId ID of the request to approve
     */
    function approveWithdraw(address _builder, uint256 _requestId) public onlyAdmin {
        if (withdrawRequests[_builder].length <= _requestId) revert WithdrawRequestNotFound();
        WithdrawRequest storage request = withdrawRequests[_builder][_requestId];

        if (request.completed) revert WithdrawRequestAlreadyCompleted();

        request.approved = true;
        emit WithdrawApproved(_builder, _requestId);
    }

    /**
     * @dev Reject a withdrawal request
     * @param _builder Builder address
     * @param _requestId ID of the request to reject
     */
    function rejectWithdraw(address _builder, uint256 _requestId) public onlyAdmin {
        if (withdrawRequests[_builder].length <= _requestId) revert WithdrawRequestNotFound();
        WithdrawRequest storage request = withdrawRequests[_builder][_requestId];

        if (request.completed) revert WithdrawRequestAlreadyCompleted();

        // Delete the request by marking it as completed but not approved
        request.completed = true;
        request.approved = false;
        emit WithdrawRejected(_builder, _requestId);
    }

    /**
     * @dev Drain the contract to the primary admin address
     * @param _token Token address (zero address for ETH)
     */
    function drainContract(address _token) public onlyAdmin nonReentrant {
        uint256 remainingBalance;

        // Drain Ether
        if (_token == address(0)) {
            remainingBalance = address(this).balance;
            if (remainingBalance > 0) {
                (bool sent, ) = primaryAdmin.call{ value: remainingBalance }("");
                if (!sent) revert EtherSendingFailed();
                emit ContractDrained(remainingBalance);
            }
            return;
        }

        // Drain ERC20 tokens
        remainingBalance = IERC20(_token).balanceOf(address(this));
        if (remainingBalance > 0) {
            IERC20(_token).safeTransfer(primaryAdmin, remainingBalance);
            emit ContractDrained(remainingBalance);
        }
    }

    /**
     * @dev Function to check if an address is an admin
     */

    function isAdmin(address _address) public view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, _address);
    }
}
