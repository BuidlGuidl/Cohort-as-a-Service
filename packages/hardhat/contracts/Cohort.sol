// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

//A smart contract for streaming Eth or ERC20 tokens to builders

// Custom errors
error NoValueSent();
error InsufficientFundsInContract(uint256 requested, uint256 available);
error NoActiveFlowForBuilder(address builder);
error InsufficientInFlow(uint256 requested, uint256 available);
error EtherSendingFailed();
error LengthsMismatch();
error InvalidBuilderAddress();
error BuilderAlreadyExists();
error ContractIsStopped();
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

error NoWithdrawalRequest();
error WithdrawalRequestNotApproved();
error WithdrawalRequestAlreadyCompleted();
error WithdrawalRequestNotFound();

contract Cohort is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 constant MAXCREATORS = 25;
    uint256 constant MINIMUM_CAP = 0.25 ether;
    uint256 constant MINIMUM_ERC20_CAP = 10 * 10 ** 18;

    // Cycle duration for the flow
    uint256 public cycle;

    // ERC20 support
    bool public isERC20;

    // Emergency mode variable
    bool public stopped;

    // Cohort name
    string public name;

    // Cohort description
    string public description;

    // Token address for ERC20 support
    address public tokenAddress;

    // Primary admin for remaining balances
    address public primaryAdmin;

    // Constructor to setup admin role and initial builders
    constructor(
        address _primaryAdmin,
        address _tokenAddress,
        string memory _name,
        string memory _description,
        uint256 _cycle,
        address[] memory _builders,
        uint256[] memory _caps
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, _primaryAdmin);
        isAdmin[_primaryAdmin] = true;
        primaryAdmin = _primaryAdmin;
        name = _name;
        description = _description;
        cycle = _cycle;

        if (_tokenAddress != address(0)) {
            isERC20 = true;
            tokenAddress = _tokenAddress;
        }

        if (_builders.length == 0) return;

        uint256 cLength = _builders.length;
        if (_builders.length >= MAXCREATORS) revert MaxBuildersReached();
        if (cLength != _caps.length) revert LengthsMismatch();
        for (uint256 i = 0; i < cLength; ) {
            validateBuilderInput(payable(_builders[i]), _caps[i]);
            flowingBuilders[_builders[i]] = BuilderFlowInfo(_caps[i], block.timestamp - _cycle);
            activeBuilders.push(_builders[i]);
            builderIndex[_builders[i]] = activeBuilders.length - 1;
            emit AddBuilder(_builders[i], _caps[i]);

            unchecked {
                ++i;
            }
        }
    }

    // Function to modify admin roles
    function modifyAdminRole(address adminAddress, bool shouldGrant) public onlyAdmin {
        if (shouldGrant) {
            if (flowingBuilders[adminAddress].cap != 0) revert InvalidBuilderAddress();
            grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
            isAdmin[adminAddress] = true;
            emit AdminAdded(adminAddress);
        } else {
            if (adminAddress == primaryAdmin) revert AccessDenied();
            revokeRole(DEFAULT_ADMIN_ROLE, adminAddress);
            isAdmin[adminAddress] = false;
            emit AdminRemoved(adminAddress);
        }
    }

    // Struct to store information about builder's flow
    struct BuilderFlowInfo {
        uint256 cap; // Maximum amount of funds that can be withdrawn in a cycle
        uint256 last; // The timestamp of the last withdrawal
    }

    // Function to transfer primary admin role
    function transferPrimaryAdmin(address newPrimaryAdmin) public {
        if (msg.sender != primaryAdmin) revert NotAuthorized();
        if (newPrimaryAdmin == address(0)) revert InvalidNewAdminAddress();

        primaryAdmin = newPrimaryAdmin;

        _revokeRole(DEFAULT_ADMIN_ROLE, primaryAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, newPrimaryAdmin);

        emit PrimaryAdminTransferred(newPrimaryAdmin);
    }

    // Withdrawal request structure
    struct WithdrawalRequest {
        uint256 amount;
        string reason;
        bool approved;
        bool completed;
        uint256 requestTime;
    }

    // Mapping to store withdrawal requests for each builder
    mapping(address => WithdrawalRequest[]) public withdrawalRequests;

    // Mapping to track whether specific builders require approval
    mapping(address => bool) public requiresApproval;

    // Modifier to check for admin permissions
    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AccessDenied();
        _;
    }

    // Mapping to store the flow info of each builder
    mapping(address => BuilderFlowInfo) public flowingBuilders;
    // Mapping to store the index of each builder in the activeBuilders array
    mapping(address => uint256) public builderIndex;
    // Array to store the addresses of all active builders
    address[] public activeBuilders;
    // Mapping to see if an address is admin
    mapping(address => bool) public isAdmin;

    // Declare events to log various activities
    event FundsReceived(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount, string reason);
    event AddBuilder(address indexed to, uint256 amount);
    event UpdateBuilder(address indexed to, uint256 amount);

    event AdminAdded(address indexed to);
    event AdminRemoved(address indexed to);
    event ContractDrained(uint256 amount);
    event PrimaryAdminTransferred(address indexed newAdmin);
    event ERC20FundsReceived(address indexed token, address indexed from, uint256 amount);

    // Withdrawal request events
    event WithdrawalRequested(address indexed builder, uint256 requestId, uint256 amount, string reason);
    event WithdrawalApproved(address indexed builder, uint256 requestId);
    event WithdrawalRejected(address indexed builder, uint256 requestId);
    event WithdrawalCompleted(address indexed builder, uint256 requestId, uint256 amount);
    event ApprovalRequirementChanged(address indexed builder, bool requiresApproval);

    // Check if a flow for a builder is active
    modifier isFlowActive(address _builder) {
        if (flowingBuilders[_builder].cap == 0) revert NoActiveFlowForBuilder(_builder);
        _;
    }

    // Check if the contract is stopped
    modifier stopInEmergency() {
        if (stopped) revert ContractIsStopped();
        _;
    }

    // Fund contract
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

    // Enable or disable emergency mode
    function emergencyMode(bool _enable) public onlyAdmin {
        stopped = _enable;
    }

    // Get all builders' data.
    function allBuildersData(address[] calldata _builders) public view returns (BuilderFlowInfo[] memory) {
        uint256 builderLength = _builders.length;
        BuilderFlowInfo[] memory result = new BuilderFlowInfo[](builderLength);
        for (uint256 i = 0; i < builderLength; ) {
            address builderAddress = _builders[i];
            result[i] = flowingBuilders[builderAddress];
            unchecked {
                ++i;
            }
        }
        return result;
    }

    // Get the available amount for a builder.
    function availableBuilderAmount(address _builder) public view isFlowActive(_builder) returns (uint256) {
        BuilderFlowInfo memory builderFlow = flowingBuilders[_builder];
        uint256 timePassed = block.timestamp - builderFlow.last;

        if (timePassed < cycle) {
            uint256 availableAmount = (timePassed * builderFlow.cap) / cycle;
            return availableAmount;
        } else {
            return builderFlow.cap;
        }
    }

    // Add a new builder's flow. No more than 25 builders are allowed.
    function addBuilderFlow(address payable _builder, uint256 _cap) public onlyAdmin {
        // Check for maximum builders.
        if (activeBuilders.length >= MAXCREATORS) revert MaxBuildersReached();

        validateBuilderInput(_builder, _cap);
        flowingBuilders[_builder] = BuilderFlowInfo(_cap, block.timestamp - cycle);
        activeBuilders.push(_builder);
        builderIndex[_builder] = activeBuilders.length - 1;
        emit AddBuilder(_builder, _cap);
    }

    // Add a batch of builders.
    function addBatch(address[] memory _builders, uint256[] memory _caps) public onlyAdmin {
        uint256 cLength = _builders.length;
        if (_builders.length >= MAXCREATORS) revert MaxBuildersReached();
        if (cLength != _caps.length) revert LengthsMismatch();
        for (uint256 i = 0; i < cLength; ) {
            addBuilderFlow(payable(_builders[i]), _caps[i]);
            unchecked {
                ++i;
            }
        }
    }

    // Validate the input for a builder
    function validateBuilderInput(address payable _builder, uint256 _cap) internal view {
        //check if minimum cap is met, eth mode and erc20 mode
        if (_cap < MINIMUM_CAP && !isERC20) revert BelowMinimumCap(_cap, MINIMUM_CAP);
        if (_cap < MINIMUM_ERC20_CAP && isERC20) revert BelowMinimumCap(_cap, MINIMUM_ERC20_CAP);
        if (_builder == address(0)) revert InvalidBuilderAddress();
        if (isAdmin[_builder]) revert InvalidBuilderAddress();
        if (flowingBuilders[_builder].cap > 0) revert BuilderAlreadyExists();
    }

    // Update a builder's flow cap
    function updateBuilderFlowCapCycle(
        address payable _builder,
        uint256 _newCap
    ) public onlyAdmin isFlowActive(_builder) {
        if (_newCap < MINIMUM_CAP && !isERC20) revert BelowMinimumCap(_newCap, MINIMUM_CAP);
        if (_newCap < MINIMUM_ERC20_CAP && isERC20) revert BelowMinimumCap(_newCap, MINIMUM_ERC20_CAP);

        BuilderFlowInfo storage builderFlow = flowingBuilders[_builder];

        builderFlow.cap = _newCap;

        builderFlow.last = block.timestamp - (cycle);

        emit UpdateBuilder(_builder, _newCap);
    }

    // Remove a builder's flow
    function removeBuilderFlow(address _builder) public onlyAdmin isFlowActive(_builder) {
        uint256 builderIndexToRemove = builderIndex[_builder];
        address lastBuilder = activeBuilders[activeBuilders.length - 1];

        if (_builder != lastBuilder) {
            activeBuilders[builderIndexToRemove] = lastBuilder;
            builderIndex[lastBuilder] = builderIndexToRemove;
        }

        activeBuilders.pop();

        delete flowingBuilders[_builder];
        delete builderIndex[_builder];

        emit UpdateBuilder(_builder, 0);
    }

    // Set whether a builder requires approval for withdrawals
    function setBuilderApprovalRequirement(
        address _builder,
        bool _requiresApproval
    ) public onlyAdmin isFlowActive(_builder) {
        requiresApproval[_builder] = _requiresApproval;
        emit ApprovalRequirementChanged(_builder, _requiresApproval);
    }

    // Request a withdrawal - for builders that require approval
    function _requestWithdrawal(uint256 _amount, string memory _reason) private {
        // Check if the builder has enough available to withdraw
        uint256 totalAmountCanWithdraw = availableBuilderAmount(msg.sender);
        if (totalAmountCanWithdraw < _amount) {
            revert InsufficientInFlow(_amount, totalAmountCanWithdraw);
        }

        // Create withdrawal request
        withdrawalRequests[msg.sender].push(
            WithdrawalRequest({
                amount: _amount,
                reason: _reason,
                approved: false,
                completed: false,
                requestTime: block.timestamp
            })
        );

        uint256 requestId = withdrawalRequests[msg.sender].length - 1;
        emit WithdrawalRequested(msg.sender, requestId, _amount, _reason);
    }

    // Approve a withdrawal request - only admins can call this
    function approveWithdrawal(address _builder, uint256 _requestId) public onlyAdmin {
        if (withdrawalRequests[_builder].length <= _requestId) revert WithdrawalRequestNotFound();
        WithdrawalRequest storage request = withdrawalRequests[_builder][_requestId];

        if (request.completed) revert WithdrawalRequestAlreadyCompleted();

        request.approved = true;
        emit WithdrawalApproved(_builder, _requestId);
    }

    // Reject a withdrawal request - only admins can call this
    function rejectWithdrawal(address _builder, uint256 _requestId) public onlyAdmin {
        if (withdrawalRequests[_builder].length <= _requestId) revert WithdrawalRequestNotFound();
        WithdrawalRequest storage request = withdrawalRequests[_builder][_requestId];

        if (request.completed) revert WithdrawalRequestAlreadyCompleted();

        // Delete the request by marking it as completed but not approved
        request.completed = true;
        request.approved = false;
        emit WithdrawalRejected(_builder, _requestId);
    }

    // Complete a withdrawal that was previously approved
    function completeWithdrawal(uint256 _requestId) public isFlowActive(msg.sender) nonReentrant stopInEmergency {
        // Check if request exists
        if (withdrawalRequests[msg.sender].length <= _requestId) revert WithdrawalRequestNotFound();
        WithdrawalRequest storage request = withdrawalRequests[msg.sender][_requestId];

        // Check if request is completed
        if (request.completed) revert WithdrawalRequestAlreadyCompleted();

        // Check if approval is required and given
        if (requiresApproval[msg.sender] && !request.approved) revert WithdrawalRequestNotApproved();

        _processFlowWithdraw(request.amount);

        // Mark request as completed
        request.completed = true;

        emit WithdrawalCompleted(msg.sender, _requestId, request.amount);
        emit Withdraw(msg.sender, request.amount, request.reason);
    }

    function flowWithdraw(
        uint256 _amount,
        string memory _reason
    ) public isFlowActive(msg.sender) nonReentrant stopInEmergency {
        if (requiresApproval[msg.sender]) {
            _requestWithdrawal(_amount, _reason);
            return;
        }

        _processFlowWithdraw(_amount);

        emit Withdraw(msg.sender, _amount, _reason);
    }

    function _processFlowWithdraw(uint256 _amount) private {
        uint256 totalAmountCanWithdraw = availableBuilderAmount(msg.sender);
        if (totalAmountCanWithdraw < _amount) {
            revert InsufficientInFlow(_amount, totalAmountCanWithdraw);
        }

        // Process the withdrawal similar to flowWithdraw
        BuilderFlowInfo storage builderFlow = flowingBuilders[msg.sender];
        uint256 builderflowLast = builderFlow.last;
        uint256 timestamp = block.timestamp;
        uint256 cappedLast = timestamp - cycle;
        if (builderflowLast < cappedLast) {
            builderflowLast = cappedLast;
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
        builderFlow.last = builderflowLast + (((timestamp - builderflowLast) * _amount) / totalAmountCanWithdraw);
    }

    // Drain the contract to the primary admin address
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

    // Fallback function to receive ether
    receive() external payable {}
}
