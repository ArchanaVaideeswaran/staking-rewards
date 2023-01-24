//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ERC20.sol";

/**
 * @notice Donut is the Reward token used in staking rewards contract.
 * It is deployed with a initial supply of 1000000 DONUT and has 12 decimals
 * solmate ERC20 is for supplying the decimals
 */
contract Donut is ERC20 {

  /**
   * @dev Constructor
   * @param initialSupply The initial supply of DONUT tokens
   */
  constructor(uint256 initialSupply) ERC20("Donut", "DONUT", 12) {
    _mint(msg.sender, initialSupply);
  }

  /**
   * @dev mint
   * @param to The address of DONUT token receiver
   * @param amount The amount of DONUT to be minted
   */
  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }
}
