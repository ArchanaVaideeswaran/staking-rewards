//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StakingReward is ReentrancyGuard, Pausable {
  using SafeERC20 for IERC20;

  uint32 private constant ONE_YEAR_IN_SECONDS = 31536000;

  IERC20 private _stakingToken;
  IERC20 private _rewardToken;

  uint8 private _rewardRate = 12; // 12% APR
  uint32 private _rewardDuration = 30 days;
  uint32 private _finishAt;
  uint32 private _updatedAt;

  uint256 private _totalSupply;
  uint256 private _rewardBalance;

  mapping(address => uint) private _userRewardPaid;
  mapping(address => uint) private _rewards;
  address private _owner;

  constructor(address stakingToken, address rewardToken) {
    _stakingToken = IERC20(stakingToken);
    _rewardToken = IERC20(rewardToken);
  }

  function stake(uint amount) external nonReentrant whenNotPaused {}

  function withdraw(uint amount) external nonReentrant whenNotPaused {}

  function getRewards() external nonReentrant whenNotPaused {}

  function earned(address account) public returns(uint) {}

  function updateReward(address account) private {}
}
