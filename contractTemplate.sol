// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeCoin is ERC20, Ownable {
    uint256 public constant TAX_RATE = 5; // 5% tax
    address public constant TAX_RECEIVER = 0xYourTaxWalletAddress;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        if (sender == owner() || recipient == owner()) {
            // No tax for owner transfers
            super._transfer(sender, recipient, amount);
        } else {
            uint256 taxAmount = (amount * TAX_RATE) / 100;
            uint256 transferAmount = amount - taxAmount;
            
            // Transfer tax
            super._transfer(sender, TAX_RECEIVER, taxAmount);
            // Transfer remaining amount
            super._transfer(sender, recipient, transferAmount);
        }
    }
}