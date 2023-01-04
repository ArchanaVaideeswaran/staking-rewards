//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StakingReward is ReentrancyGuard, Pausable {
  using SafeERC20 for IERC20;

  struct StakeHolder {
    uint256 balance;
    uint256 rewardsEarned;
    uint256 rewardsPaid;
    uint32 updatedAt;
  }

  event Staked(address stakeHolder, uint256 amount);
  event Withdraw(address stakeHolder, uint256 amount);
  event RewardsPaid(address stakeHolder, uint256 amount);

  uint32 private constant ONE_YEAR_IN_SECONDS = 31536000;
  uint8 private immutable STAKING_TOKEN_DECIMALS;
  uint8 private immutable REWARD_TOKEN_DECIMALS;

  IERC20 private _stakingToken;
  IERC20 private _rewardToken;

  uint8 private _rewardRate = 12; // 12% APR
  mapping(address => StakeHolder) _stakes;
  address private _owner;

  constructor(address stakingToken, address rewardToken) {
    _stakingToken = IERC20(stakingToken);
    _rewardToken = IERC20(rewardToken);
    STAKING_TOKEN_DECIMALS = IERC20Metadata(stakingToken).decimals();
    REWARD_TOKEN_DECIMALS = IERC20Metadata(rewardToken).decimals();
  }

  function stake(uint amount) external nonReentrant whenNotPaused {
    updateReward(msg.sender);
    StakeHolder storage user = _stakes[msg.sender];
    user.balance += amount;
    _stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  function withdraw(uint amount) external nonReentrant whenNotPaused {
    updateReward(msg.sender);
    StakeHolder storage user = _stakes[msg.sender];
    user.balance -= amount;
    _stakingToken.safeTransfer(msg.sender, amount);
    emit Withdraw(msg.sender, amount);
  }

  function getRewards() external nonReentrant whenNotPaused {
    StakeHolder storage user = _stakes[msg.sender];
    if (user.rewardsEarned > 0) {
      user.rewardsPaid = user.rewardsEarned;
      _rewardToken.safeTransferFrom(
        address(this),
        msg.sender,
        user.rewardsPaid
      );
      emit RewardsPaid(msg.sender, user.rewardsPaid);
    }
  }

  function earned(address account) public view returns (uint) {
    StakeHolder memory user = _stakes[account];
    uint256 balance = (user.balance * 10 ** REWARD_TOKEN_DECIMALS) /
      10 ** STAKING_TOKEN_DECIMALS;
    if (user.updatedAt <= 0) return 0;
    return
      user.rewardsEarned +
      ((((balance * (uint32(block.timestamp) - user.updatedAt)) /
        ONE_YEAR_IN_SECONDS) * _rewardRate) / 100);
  }

  function updateReward(address account) private {
    if (account != address(0)) {
      StakeHolder storage user = _stakes[account];
      user.rewardsEarned = earned(account);
      user.updatedAt = uint32(block.timestamp);
    }
  }
}
