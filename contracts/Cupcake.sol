//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ERC20.sol";

/**
 * @notice Cupcake is the Staking token used in staking rewards contract.
 * It is deployed with a total supply of 1000000000 CUPCAKE and has 8 decimals
 * solmate ERC20 is for supplying the decimals
 */
contract Cupcake is ERC20 {
  
  /**
   * @dev Constructor
   * @param totalSupply The total supply of CUPCAKE tokens
   */
  constructor(uint256 totalSupply) ERC20("Cupcake", "CUPCAKE", 8) {
    _mint(msg.sender, totalSupply);
  }
}
