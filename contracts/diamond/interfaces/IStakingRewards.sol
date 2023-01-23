// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @notice Interface to interace with the staking rewards facet of the Diamond.
 */
interface IStakingRewards {
  function stake(uint256 amount) external;

  function withdraw(uint256 amount) external;

  function withdrawAll() external;

  function earned(address account) external view returns (uint256);

  function getBalance(address account) external view returns (uint256);

  function getRewardBalance(address account) external view returns (uint256);
}
