//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@solidstate/contracts/proxy/diamond/SolidStateDiamond.sol";

contract Diamond is SolidStateDiamond {
  function getImplementation() external view returns (address){
    return super._getImplementation();
  }
}