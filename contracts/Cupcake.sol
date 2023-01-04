//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ERC20.sol";

contract Cupcake is ERC20 {
  constructor(uint256 totalSupply) ERC20("Cupcake", "CUPCAKE", 8) {
    _mint(msg.sender, totalSupply);
  }
}
