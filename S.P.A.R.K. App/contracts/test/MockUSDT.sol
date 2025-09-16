// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing purposes only
 * This is only used in local testing, not deployed to Kaia testnet
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("Mock USDT", "USDT") Ownable() {
        _decimals = 6; // USDT has 6 decimals
        _mint(msg.sender, 1000000 * 10**_decimals); // Mint 1M USDT to deployer
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
