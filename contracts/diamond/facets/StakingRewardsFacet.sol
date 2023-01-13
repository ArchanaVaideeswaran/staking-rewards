//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../libraries/LibDiamond.sol";

contract StakingRewardsFacet is ReentrancyGuard, Pausable {
  using SafeERC20 for IERC20;

  error ZeroAmount();
  error ZeroAddress();
  error LockInPeriod();

  event Staked(address stakeHolder, uint256 amount);
  event Withdraw(address stakeHolder, uint256 amount);
  event RewardsPaid(address stakeHolder, uint256 amount);

  function stake(uint amount) external nonReentrant whenNotPaused {
    if (amount == 0) revert ZeroAmount();
    _updateReward(msg.sender);
    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];
    if (user.finishAt == 0)
      user.finishAt = uint32(block.timestamp) + LibDiamond.ONE_YEAR_IN_SECONDS;
    user.balance += amount;
    s.stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  function withdraw(uint amount) external nonReentrant whenNotPaused {
    _updateReward(msg.sender);
    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];
    if (uint32(block.timestamp) < user.finishAt) revert LockInPeriod();
    if (amount == 0) {
      distributeRewards();
      return;
    } else {
      user.balance -= amount;
      s.stakingToken.safeTransfer(address(msg.sender), amount);
      emit Withdraw(msg.sender, amount);
      distributeRewards();
    }
  }

  function earned(address account) public view returns (uint) {
    if (account == address(0)) revert ZeroAddress();
    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[account];

    if (user.updatedAt == 0) return 0;

    uint8 rewardTokenDecimal = IERC20Metadata(address(s.rewardToken))
      .decimals();
    uint8 stakingTokenDecimal = IERC20Metadata(address(s.stakingToken))
      .decimals();

    uint256 p = (user.balance * 10 ** rewardTokenDecimal) /
      10 ** stakingTokenDecimal;
    uint32 n = uint32(block.timestamp) - user.updatedAt;
    uint256 pn = (p * n) / LibDiamond.ONE_YEAR_IN_SECONDS;
    uint8 r = s.rewardRate;
    uint256 interest = (pn * r) / 100;

    return user.rewardsEarned + interest;
  }

  function distributeRewards() private {
    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];
    uint256 rewardsPending = user.rewardsEarned - user.rewardsPaid;
    if (rewardsPending > 0) {
      user.rewardsPaid = user.rewardsEarned;
      s.rewardToken.safeTransfer(address(msg.sender), rewardsPending);
      emit RewardsPaid(msg.sender, rewardsPending);
    }
  }

  function _updateReward(address account) private {
    if (account != address(0)) {
      LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
      LibDiamond.StakeHolder storage user = s.stakes[account];
      user.rewardsEarned = earned(account);
      user.updatedAt = uint32(block.timestamp);
    }
  }
}
