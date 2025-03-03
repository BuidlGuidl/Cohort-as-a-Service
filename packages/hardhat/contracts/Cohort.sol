// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

//A smart contract for streaming Eth or ERC20 tokens to builders

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

error NoWithdrawRequest();
error WithdrawRequestNotApproved();
error WithdrawRequestAlreadyCompleted();
error WithdrawRequestNotFound();
error PendingWithdrawRequestExists();

contract Cohort is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 constant MAXCREATORS = 25;
    uint256 constant MINIMUM_CAP = 0.00001 ether;
    uint256 constant MINIMUM_ERC20_CAP = 1 * 10 ** 18;

    // Cycle duration for the stream
    uint256 public cycle;

    // ERC20 support
    bool public isERC20;

    // Emergency mode variable
    bool public locked;

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
            streamingBuilders[_builders[i]] = BuilderStreamInfo(_caps[i], block.timestamp - _cycle);
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
            if (streamingBuilders[adminAddress].cap != 0) revert InvalidBuilderAddress();
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

    // Struct to store information about builder's stream
    struct BuilderStreamInfo {
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
    struct WithdrawRequest {
        uint256 amount;
        string reason;
        bool approved;
        bool completed;
        uint256 requestTime;
    }

    // Mapping to store withdrawal requests for each builder
    mapping(address => WithdrawRequest[]) public withdrawRequests;

    // Mapping to track whether specific builders require approval
    mapping(address => bool) public requiresApproval;

    // Modifier to check for admin permissions
    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AccessDenied();
        _;
    }

    // Mapping to store the stream info of each builder
    mapping(address => BuilderStreamInfo) public streamingBuilders;
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

    event ContractLocked(bool locked);

    // Withdrawal request events
    event WithdrawRequested(address indexed builder, uint256 requestId, uint256 amount, string reason);
    event WithdrawApproved(address indexed builder, uint256 requestId);
    event WithdrawRejected(address indexed builder, uint256 requestId);
    event WithdrawCompleted(address indexed builder, uint256 requestId, uint256 amount);
    event ApprovalRequirementChanged(address indexed builder, bool requiresApproval);

    // Check if a stream for a builder is active
    modifier isStreamActive(address _builder) {
        if (streamingBuilders[_builder].cap == 0) revert NoActiveStreamForBuilder(_builder);
        _;
    }

    // Check if the contract is locked
    modifier isCohortLocked() {
        if (locked) revert ContractIsLocked();
        _;
    }

    // Modifier to check if builder has no pending withdrawal requests
    modifier noPendingRequests(address _builder) {
        bool hasPending = false;
        uint256 requestCount = withdrawRequests[_builder].length;

        for (uint256 i = 0; i < requestCount; ) {
            if (!withdrawRequests[_builder][i].completed) {
                hasPending = true;
                break;
            }
            unchecked {
                ++i;
            }
        }

        if (hasPending) revert PendingWithdrawRequestExists();
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
    function lock(bool _enable) public onlyAdmin {
        locked = _enable;
        emit ContractLocked(_enable);
    }

    // Get all builders' data.
    function allBuildersData(address[] calldata _builders) public view returns (BuilderStreamInfo[] memory) {
        uint256 builderLength = _builders.length;
        BuilderStreamInfo[] memory result = new BuilderStreamInfo[](builderLength);
        for (uint256 i = 0; i < builderLength; ) {
            address builderAddress = _builders[i];
            result[i] = streamingBuilders[builderAddress];
            unchecked {
                ++i;
            }
        }
        return result;
    }

    // Get the unlocked amount for a builder.
    function unlockedBuilderAmount(address _builder) public view isStreamActive(_builder) returns (uint256) {
        BuilderStreamInfo memory builderStream = streamingBuilders[_builder];
        uint256 timePassed = block.timestamp - builderStream.last;

        if (timePassed < cycle) {
            uint256 unlockedAmount = (timePassed * builderStream.cap) / cycle;
            return unlockedAmount;
        } else {
            return builderStream.cap;
        }
    }

    // Add a new builder's stream. No more than 25 builders are allowed.
    function addBuilderStream(address payable _builder, uint256 _cap) public onlyAdmin {
        // Check for maximum builders.
        if (activeBuilders.length >= MAXCREATORS) revert MaxBuildersReached();

        validateBuilderInput(_builder, _cap);
        streamingBuilders[_builder] = BuilderStreamInfo(_cap, block.timestamp - cycle);
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
            addBuilderStream(payable(_builders[i]), _caps[i]);
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
        if (streamingBuilders[_builder].cap > 0) revert BuilderAlreadyExists();
    }

    // Update a builder's stream cap
    function updateBuilderStreamCap(
        address payable _builder,
        uint256 _newCap
    ) public onlyAdmin isStreamActive(_builder) {
        if (_newCap < MINIMUM_CAP && !isERC20) revert BelowMinimumCap(_newCap, MINIMUM_CAP);
        if (_newCap < MINIMUM_ERC20_CAP && isERC20) revert BelowMinimumCap(_newCap, MINIMUM_ERC20_CAP);

        BuilderStreamInfo storage builderStream = streamingBuilders[_builder];

        builderStream.cap = _newCap;

        builderStream.last = block.timestamp - (cycle);

        emit UpdateBuilder(_builder, _newCap);
    }

    // Remove a builder's stream
    function removeBuilderStream(address _builder) public onlyAdmin isStreamActive(_builder) {
        uint256 builderIndexToRemove = builderIndex[_builder];
        address lastBuilder = activeBuilders[activeBuilders.length - 1];

        if (_builder != lastBuilder) {
            activeBuilders[builderIndexToRemove] = lastBuilder;
            builderIndex[lastBuilder] = builderIndexToRemove;
        }

        activeBuilders.pop();

        delete streamingBuilders[_builder];
        delete builderIndex[_builder];

        emit UpdateBuilder(_builder, 0);
    }

    // Set whether a builder requires approval for withdrawals
    function setBuilderApprovalRequirement(
        address _builder,
        bool _requiresApproval
    ) public onlyAdmin isStreamActive(_builder) {
        requiresApproval[_builder] = _requiresApproval;
        emit ApprovalRequirementChanged(_builder, _requiresApproval);
    }

    // Request a withdrawal - for builders that require approval
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

    // Approve a withdrawal request - only admins can call this
    function approveWithdraw(address _builder, uint256 _requestId) public onlyAdmin {
        if (withdrawRequests[_builder].length <= _requestId) revert WithdrawRequestNotFound();
        WithdrawRequest storage request = withdrawRequests[_builder][_requestId];

        if (request.completed) revert WithdrawRequestAlreadyCompleted();

        request.approved = true;
        emit WithdrawApproved(_builder, _requestId);
    }

    // Reject a withdrawal request - only admins can call this
    function rejectWithdraw(address _builder, uint256 _requestId) public onlyAdmin {
        if (withdrawRequests[_builder].length <= _requestId) revert WithdrawRequestNotFound();
        WithdrawRequest storage request = withdrawRequests[_builder][_requestId];

        if (request.completed) revert WithdrawRequestAlreadyCompleted();

        // Delete the request by marking it as completed but not approved
        request.completed = true;
        request.approved = false;
        emit WithdrawRejected(_builder, _requestId);
    }

    // Complete a withdrawal that was previously approved
    function completeWithdraw(uint256 _requestId) public isStreamActive(msg.sender) nonReentrant isCohortLocked {
        // Check if request exists
        if (withdrawRequests[msg.sender].length <= _requestId) revert WithdrawRequestNotFound();
        WithdrawRequest storage request = withdrawRequests[msg.sender][_requestId];

        // Check if request is completed
        if (request.completed) revert WithdrawRequestAlreadyCompleted();

        // Check if approval is required and given
        if (requiresApproval[msg.sender] && !request.approved) revert WithdrawRequestNotApproved();

        _processStreamWithdraw(request.amount);

        // Mark request as completed
        request.completed = true;

        emit WithdrawCompleted(msg.sender, _requestId, request.amount);
        emit Withdraw(msg.sender, request.amount, request.reason);
    }

    function streamWithdraw(
        uint256 _amount,
        string memory _reason
    ) public isStreamActive(msg.sender) nonReentrant isCohortLocked {
        if (requiresApproval[msg.sender]) {
            _requestWithdraw(_amount, _reason);
            return;
        }

        _processStreamWithdraw(_amount);

        emit Withdraw(msg.sender, _amount, _reason);
    }

    function _processStreamWithdraw(uint256 _amount) private {
        uint256 totalAmountCanWithdraw = unlockedBuilderAmount(msg.sender);
        if (totalAmountCanWithdraw < _amount) {
            revert InsufficientInStream(_amount, totalAmountCanWithdraw);
        }

        // Process the withdrawal similar to streamWithdraw
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
