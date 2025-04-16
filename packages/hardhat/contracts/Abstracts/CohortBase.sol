// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./CohortEvents.sol";
import "./ICohortStructs.sol";

/**
 * @title CohortBase
 * @dev Base contract containing core functionality and variables for Cohort contracts
 */
abstract contract CohortBase is ICohortStructs, AccessControl, ReentrancyGuard, CohortEvents {
    using SafeERC20 for IERC20;

    // Constants
    uint256 constant MAXCREATORS = 25;
    uint256 constant MINIMUM_CAP = 0.00001 ether;
    uint256 constant MINIMUM_ERC20_CAP = 1 * 10 ** 6;
    uint256 constant MAX_NAME_LENGTH = 40;

    // Cohort configuration
    uint256 public cycle;
    bool public isERC20;
    bool public isONETIME;
    bool public locked;
    bool public requireApprovalForWithdrawals;
    string public name;
    string public description;
    address public tokenAddress;
    address public primaryAdmin;

    // Builder data
    mapping(address => BuilderStreamInfo) public streamingBuilders;
    mapping(address => uint256) public builderIndex;
    address[] public activeBuilders;

    // Withdrawal request data
    mapping(address => WithdrawRequest[]) public withdrawRequests;
    mapping(address => bool) public requiresApproval;

    /**
     * @dev Constructor to setup admin role and initial builders
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
    ) {
        if (bytes(_name).length > MAX_NAME_LENGTH) revert MaxNameLength(bytes(_name).length, MAX_NAME_LENGTH);

        _grantRole(DEFAULT_ADMIN_ROLE, _primaryAdmin);
        primaryAdmin = _primaryAdmin;
        name = _name;
        description = _description;
        cycle = _cycle;
        requireApprovalForWithdrawals = _requiresApproval;

        if (_tokenAddress != address(0)) {
            isERC20 = true;
            tokenAddress = _tokenAddress;
        }

        if (_cycle == 0) {
            isONETIME = true;
        }

        if (_builders.length == 0) return;

        uint256 cLength = _builders.length;
        if (_builders.length >= MAXCREATORS) revert MaxBuildersReached();
        if (cLength != _caps.length) revert LengthsMismatch();
        for (uint256 i = 0; i < cLength; ) {
            validateBuilderInput(payable(_builders[i]), _caps[i]);

            if (cycle == 0) {
                streamingBuilders[_builders[i]] = BuilderStreamInfo(_caps[i], type(uint256).max);
            } else {
                streamingBuilders[_builders[i]] = BuilderStreamInfo(_caps[i], block.timestamp - _cycle);
            }

            activeBuilders.push(_builders[i]);
            builderIndex[_builders[i]] = activeBuilders.length - 1;
            emit AddBuilder(_builders[i], _caps[i]);

            if (_requiresApproval) {
                requiresApproval[_builders[i]] = true;
                emit ApprovalRequirementChanged(_builders[i], true);
            }

            unchecked {
                ++i;
            }
        }
    }

    // Modifiers
    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AccessDenied();
        _;
    }

    modifier isStreamActive(address _builder) {
        if (streamingBuilders[_builder].cap == 0) revert NoActiveStreamForBuilder(_builder);
        _;
    }

    modifier isCohortLocked() {
        if (locked) revert ContractIsLocked();
        _;
    }

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

    /**
     * @dev Validates the input for a builder
     */
    function validateBuilderInput(address payable _builder, uint256 _cap) internal view {
        if (_cap < MINIMUM_CAP && !isERC20) revert BelowMinimumCap(_cap, MINIMUM_CAP);
        if (_cap < MINIMUM_ERC20_CAP && isERC20) revert BelowMinimumCap(_cap, MINIMUM_ERC20_CAP);
        if (_builder == address(0)) revert InvalidBuilderAddress();
        if (hasRole(DEFAULT_ADMIN_ROLE, _builder)) revert InvalidBuilderAddress();
        if (streamingBuilders[_builder].cap > 0) revert BuilderAlreadyExists();
    }

    /**
     * @dev Get the unlocked amount for a builder
     * @param _builder Builder address
     * @return Unlocked amount for the builder
     */
    function unlockedBuilderAmount(address _builder) public view isStreamActive(_builder) returns (uint256) {
        BuilderStreamInfo memory builderStream = streamingBuilders[_builder];

        if (isONETIME) {
            if (builderStream.last == type(uint256).max) {
                return builderStream.cap;
            } else {
                return 0;
            }
        }

        uint256 timePassed = block.timestamp - builderStream.last;

        if (timePassed < cycle) {
            uint256 unlockedAmount = (timePassed * builderStream.cap) / cycle;
            return unlockedAmount;
        } else {
            return builderStream.cap;
        }
    }

    // Fallback function to receive ether
    receive() external payable {}
}
