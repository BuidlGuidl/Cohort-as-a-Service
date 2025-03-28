// SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    error StalePrice();

    /**
     * @dev Gets the latest ETH/USD price from Chainlink with staleness check
     * @param priceFeed Chainlink price feed interface
     * @param maxStalePeriod Maximum acceptable age of the price data in seconds
     * @return price Latest ETH/USD price with 18 decimals
     */
    function getPrice(AggregatorV3Interface priceFeed, uint256 maxStalePeriod) internal view returns (uint256) {
        (uint80 roundID, int256 price, , uint256 updatedAt, uint80 answeredInRound) = priceFeed.latestRoundData();

        // Check for stale data
        if (
            roundID == 0 ||
            price <= 0 ||
            updatedAt == 0 ||
            answeredInRound < roundID ||
            block.timestamp - updatedAt > maxStalePeriod
        ) {
            revert StalePrice();
        }

        return uint256(price * 1e10); // Convert to 18 decimals
    }

    /**
     * @dev Converts ETH amount to USD using Chainlink price feed
     * @param ethAmount Amount of ETH to convert
     * @param priceFeed Chainlink price feed interface
     * @param maxStalePeriod Maximum acceptable age of the price data in seconds
     * @return ethAmountInUsd Equivalent USD value with 18 decimals
     */
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed,
        uint256 maxStalePeriod
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed, maxStalePeriod);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
