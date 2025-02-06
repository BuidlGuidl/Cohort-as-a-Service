// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock2 is ERC20 {
    uint256 public faucetAmount;

    constructor() ERC20("MOCK2", "MK2") {
        _mint(msg.sender, 200 * 10 ** 18);
        faucetAmount = 100 * 10 ** 18;
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
