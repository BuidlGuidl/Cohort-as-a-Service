// SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    /**
     * @dev Gets the latest ETH/USD price from Chainlink
     * @return price Latest ETH/USD price with 18 decimals
     */
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (
            ,
            /* uint80 roundID */ int256 price /* uint256 startedAt */ /* uint256 timeStamp */ /* uint80 answeredInRound */,
            ,
            ,

        ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
        // ETH in terms of USD
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
