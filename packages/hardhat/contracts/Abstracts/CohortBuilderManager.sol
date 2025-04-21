// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CohortAdmin.sol";

/**
 * @title CohortBuilderManager
 * @dev Contract containing functionality for managing builders in a Cohort
 */
abstract contract CohortBuilderManager is CohortAdmin {
    /**
     * @dev Get all builders' data
     * @param _builders Array of builder addresses
     * @return Array of BuilderStreamInfo for each builder
     */
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

    /**
     * @dev Add a new builder's stream
     * @param _builder Builder address
     * @param _cap Maximum amount of funds that can be withdrawn in a cycle
     */
    function addBuilderStream(address payable _builder, uint256 _cap) public onlyAdmin {
        // Check for maximum builders.
        if (activeBuilders.length >= MAXCREATORS) revert MaxBuildersReached();

        validateBuilderInput(_builder, _cap);

        if (isONETIME) {
            streamingBuilders[_builder] = BuilderStreamInfo(_cap, type(uint256).max);
        } else {
            streamingBuilders[_builder] = BuilderStreamInfo(_cap, block.timestamp - cycle);
        }

        activeBuilders.push(_builder);
        builderIndex[_builder] = activeBuilders.length - 1;

        if (requireApprovalForWithdrawals) {
            requiresApproval[_builder] = true;
            emit ApprovalRequirementChanged(_builder, true);
        }
        emit AddBuilder(_builder, _cap);
    }

    /**
     * @dev Add a batch of builders
     * @param _builders Array of builder addresses
     * @param _caps Array of cap values
     */
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

    /**
     * @dev Update a builder's stream cap
     * @param _builder Builder address
     * @param _newCap New cap value
     */
    function updateBuilderStreamCap(
        address payable _builder,
        uint256 _newCap
    ) public onlyAdmin isStreamActive(_builder) {
        if (_newCap < MINIMUM_CAP && !isERC20) revert BelowMinimumCap(_newCap, MINIMUM_CAP);
        if (_newCap < MINIMUM_ERC20_CAP && isERC20) revert BelowMinimumCap(_newCap, MINIMUM_ERC20_CAP);

        BuilderStreamInfo storage builderStream = streamingBuilders[_builder];

        builderStream.cap = _newCap;

        if (!isONETIME) {
            builderStream.last = block.timestamp - (cycle);
        }

        emit UpdateBuilder(_builder, _newCap);
    }

    /**
     * @dev Remove a builder's stream
     * @param _builder Builder address
     */
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
}
