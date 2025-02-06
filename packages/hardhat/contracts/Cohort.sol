// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

//A smart contract for streaming Eth or ERC20 tokens to creators
//This is intended for research and development purposes only. Use this contract at your own risk and discretion.
//Pipoca

// Custom errors
error NoValueSent();
error InsufficientFundsInContract(uint256 requested, uint256 available);
error NoActiveFlowForCreator(address creator);
error InsufficientInFlow(uint256 requested, uint256 available);
error EtherSendingFailed();
error LengthsMismatch();
error InvalidCreatorAddress();
error CreatorAlreadyExists();
error ContractIsStopped();
error MaxCreatorsReached();
error AccessDenied();
error InvalidTokenAddress();
error NoFundsInContract();
error ERC20TransferFailed();
error ERC20SendingFailed(address token, address recipient);
error ERC20FundsTransferFailed(address token, address to, uint256 amount);
error BelowMinimumCap(uint256 provided, uint256 minimum);
error NotAuthorized();
error InvalidNewAdminAddress();

contract Cohort is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Fixed cycle, max creators and minimum cap
    uint256 constant CYCLE = 30 days;
    uint256 constant MAXCREATORS = 25;
    uint256 constant MINIMUM_CAP = 0.25 ether;
    uint256 constant MINIMUM_ERC20_CAP = 10 * 10 ** 18;

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

    // Modifier to check for admin permissions
    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AccessDenied();
        _;
    }

    // Constructor to setup admin role and initial creators
    constructor(address _primaryAdmin, address _tokenAddress, string memory _name, string memory _description) {
        _grantRole(DEFAULT_ADMIN_ROLE, _primaryAdmin);
        isAdmin[_primaryAdmin] = true;
        primaryAdmin = _primaryAdmin;
        name = _name;
        description = _description;

        if (_tokenAddress != address(0)) {
            isERC20 = true;
            tokenAddress = _tokenAddress;
        }
    }

    // Function to modify admin roles
    function modifyAdminRole(address adminAddress, bool shouldGrant) public onlyAdmin {
        if (shouldGrant) {
            if (flowingCreators[adminAddress].cap != 0) revert InvalidCreatorAddress();
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

    // Struct to store information about creator's flow
    struct CreatorFlowInfo {
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

    // Mapping to store the flow info of each creator
    mapping(address => CreatorFlowInfo) public flowingCreators;
    // Mapping to store the index of each creator in the activeCreators array
    mapping(address => uint256) public creatorIndex;
    // Array to store the addresses of all active creators
    address[] public activeCreators;
    // Mapping to see if an address is admin
    mapping(address => bool) public isAdmin;

    // Declare events to log various activities
    event FundsReceived(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount, string reason);
    event AddBuilder(address indexed to, uint256 amount);
    event UpdateBuilder(address indexed to, uint256 amount);
    event AdminAdded(address indexed to);
    event AdminRemoved(address indexed to);
    event AgreementDrained(uint256 amount);
    event PrimaryAdminTransferred(address indexed newAdmin);
    event ERC20FundsReceived(address indexed token, address indexed from, uint256 amount);

    // Check if a flow for a creator is active
    modifier isFlowActive(address _creator) {
        if (flowingCreators[_creator].cap == 0) revert NoActiveFlowForCreator(_creator);
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

    // Get all creators' data.
    function allCreatorsData(address[] calldata _creators) public view returns (CreatorFlowInfo[] memory) {
        uint256 creatorLength = _creators.length;
        CreatorFlowInfo[] memory result = new CreatorFlowInfo[](creatorLength);
        for (uint256 i = 0; i < creatorLength; ) {
            address creatorAddress = _creators[i];
            result[i] = flowingCreators[creatorAddress];
            unchecked {
                ++i;
            }
        }
        return result;
    }

    // Get the available amount for a creator.
    function availableCreatorAmount(address _creator) public view isFlowActive(_creator) returns (uint256) {
        CreatorFlowInfo memory creatorFlow = flowingCreators[_creator];
        uint256 timePassed = block.timestamp - creatorFlow.last;

        if (timePassed < CYCLE) {
            uint256 availableAmount = (timePassed * creatorFlow.cap) / CYCLE;
            return availableAmount;
        } else {
            return creatorFlow.cap;
        }
    }

    // Add a new creator's flow. No more than 25 creators are allowed.
    function addCreatorFlow(address payable _creator, uint256 _cap) public onlyAdmin {
        // Check for maximum creators.
        if (activeCreators.length >= MAXCREATORS) revert MaxCreatorsReached();

        validateCreatorInput(_creator, _cap);
        flowingCreators[_creator] = CreatorFlowInfo(_cap, block.timestamp - CYCLE);
        activeCreators.push(_creator);
        creatorIndex[_creator] = activeCreators.length - 1;
        emit AddBuilder(_creator, _cap);
    }

    // Add a batch of creators.
    function addBatch(address[] memory _creators, uint256[] memory _caps) public onlyAdmin {
        uint256 cLength = _creators.length;
        if (_creators.length >= MAXCREATORS) revert MaxCreatorsReached();
        if (cLength != _caps.length) revert LengthsMismatch();
        for (uint256 i = 0; i < cLength; ) {
            addCreatorFlow(payable(_creators[i]), _caps[i]);
            unchecked {
                ++i;
            }
        }
    }

    // Validate the input for a creator
    function validateCreatorInput(address payable _creator, uint256 _cap) internal view {
        //check if minimum cap is met, eth mode and erc20 mode
        if (_cap < MINIMUM_CAP && !isERC20) revert BelowMinimumCap(_cap, MINIMUM_CAP);
        if (_cap < MINIMUM_ERC20_CAP && isERC20) revert BelowMinimumCap(_cap, MINIMUM_ERC20_CAP);
        if (_creator == address(0)) revert InvalidCreatorAddress();
        if (isAdmin[_creator]) revert InvalidCreatorAddress();
        if (flowingCreators[_creator].cap > 0) revert CreatorAlreadyExists();
    }

    // Update a creator's flow cap
    function updateCreatorFlowCapCycle(
        address payable _creator,
        uint256 _newCap
    ) public onlyAdmin isFlowActive(_creator) {
        if (_newCap < MINIMUM_CAP && !isERC20) revert BelowMinimumCap(_newCap, MINIMUM_CAP);
        if (_newCap < MINIMUM_ERC20_CAP && isERC20) revert BelowMinimumCap(_newCap, MINIMUM_ERC20_CAP);

        CreatorFlowInfo storage creatorFlow = flowingCreators[_creator];

        creatorFlow.cap = _newCap;

        creatorFlow.last = block.timestamp - (CYCLE);

        emit UpdateBuilder(_creator, _newCap);
    }

    // Remove a creator's flow
    function removeCreatorFlow(address _creator) public onlyAdmin isFlowActive(_creator) {
        uint256 creatorIndexToRemove = creatorIndex[_creator];
        address lastCreator = activeCreators[activeCreators.length - 1];

        if (_creator != lastCreator) {
            activeCreators[creatorIndexToRemove] = lastCreator;
            creatorIndex[lastCreator] = creatorIndexToRemove;
        }

        activeCreators.pop();

        delete flowingCreators[_creator];
        delete creatorIndex[_creator];

        emit UpdateBuilder(_creator, 0);
    }

    function flowWithdraw(
        uint256 _amount,
        string memory _reason
    ) public isFlowActive(msg.sender) nonReentrant stopInEmergency {
        CreatorFlowInfo storage creatorFlow = flowingCreators[msg.sender];

        uint256 totalAmountCanWithdraw = availableCreatorAmount(msg.sender);
        if (totalAmountCanWithdraw < _amount) {
            revert InsufficientInFlow(_amount, totalAmountCanWithdraw);
        }

        uint256 creatorflowLast = creatorFlow.last;
        uint256 timestamp = block.timestamp;
        uint256 cappedLast = timestamp - CYCLE;
        if (creatorflowLast < cappedLast) {
            creatorflowLast = cappedLast;
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

        creatorFlow.last = creatorflowLast + (((timestamp - creatorflowLast) * _amount) / totalAmountCanWithdraw);

        emit Withdraw(msg.sender, _amount, _reason);
    }

    // Drain the agreement to the primary admin address
    function drainAgreement(address _token) public onlyAdmin nonReentrant {
        uint256 remainingBalance;

        // Drain Ether
        if (_token == address(0)) {
            remainingBalance = address(this).balance;
            if (remainingBalance > 0) {
                (bool sent, ) = primaryAdmin.call{ value: remainingBalance }("");
                if (!sent) revert EtherSendingFailed();
                emit AgreementDrained(remainingBalance);
            }
            return;
        }

        // Drain ERC20 tokens
        remainingBalance = IERC20(_token).balanceOf(address(this));
        if (remainingBalance > 0) {
            IERC20(_token).safeTransfer(primaryAdmin, remainingBalance);
            emit AgreementDrained(remainingBalance);
        }
    }

    

    // Fallback function to receive ether
    receive() external payable {}
}
