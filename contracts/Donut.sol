//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ERC20.sol";

contract Donut is ERC20 {
  constructor(uint256 initialSupply) ERC20("Donut", "DONUT", 12) {
    _mint(msg.sender, initialSupply);
  }

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
