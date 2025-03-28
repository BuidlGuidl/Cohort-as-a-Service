// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title CohortFactory
 * @dev Mock ERC20 token with decimals set to 6
 */
contract ERC20Mock2 is ERC20 {
    uint256 public faucetAmount;

    constructor() ERC20("MOCK2", "MK2") {
        _mint(msg.sender, 200 * 10 ** 6);
        faucetAmount = 100 * 10 ** 6;
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }

    function faucet(address to) public {
        _mint(to, faucetAmount);
    }
}
