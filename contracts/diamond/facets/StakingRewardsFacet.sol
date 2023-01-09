//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../libraries/LibDiamond.sol";

contract StakingRewardsFacet is ReentrancyGuard, Pausable {
  error ZeroAmount();
  error ZeroAddress();

  event Staked(address stakeHolder, uint256 amount);
  event Withdraw(address stakeHolder, uint256 amount);
  event RewardsPaid(address stakeHolder, uint256 amount);

  bytes32 internal constant STAKING_REWARDS_NAMESPACE =
    keccak256("diamond.staking.rewards");

  fallback() external {}

  receive() external payable {}

  constructor(address stakingToken, address rewardToken, uint8 _rewardRate) {
    LibDiamond.StakingRewardsStorage storage s = LibDiamond
      .getStakingRewardsStorage(STAKING_REWARDS_NAMESPACE);
    s.stakingToken = IERC20(stakingToken);
    s.rewardToken = IERC20(rewardToken);
    s.rewardRate = _rewardRate;
    s.owner = msg.sender;
  }

  function stake(uint amount) external nonReentrant whenNotPaused {
    updateReward(msg.sender);
    if (amount == 0) revert ZeroAmount();
    LibDiamond.StakingRewardsStorage storage s = LibDiamond
      .getStakingRewardsStorage(STAKING_REWARDS_NAMESPACE);
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];
    user.balance += amount;
    s.stakingToken.transferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  function withdraw(uint amount) external nonReentrant whenNotPaused {
    updateReward(msg.sender);
    if (amount == 0) revert ZeroAmount();
    LibDiamond.StakingRewardsStorage storage s = LibDiamond
      .getStakingRewardsStorage(STAKING_REWARDS_NAMESPACE);
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];
    user.balance -= amount;
    s.stakingToken.transfer(address(msg.sender), amount);
    emit Withdraw(msg.sender, amount);
  }

  function getRewards() external nonReentrant whenNotPaused {
    LibDiamond.StakingRewardsStorage storage s = LibDiamond
      .getStakingRewardsStorage(STAKING_REWARDS_NAMESPACE);
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];
    if (user.rewardsEarned > 0) {
      user.rewardsPaid = user.rewardsEarned;
      s.rewardToken.transferFrom(
        address(this),
        address(msg.sender),
        user.rewardsPaid
      );
      emit RewardsPaid(msg.sender, user.rewardsPaid);
    }
  }

  function earned(address account) public view returns (uint) {
    if (account == address(0)) revert ZeroAddress();
    LibDiamond.StakingRewardsStorage storage s = LibDiamond
      .getStakingRewardsStorage(STAKING_REWARDS_NAMESPACE);
    LibDiamond.StakeHolder storage user = s.stakes[account];
    if (user.updatedAt == 0) return 0;

    uint8 rewardTokenDecimal = IERC20Metadata(address(s.rewardToken))
      .decimals();
    uint8 stakingTokenDecimal = IERC20Metadata(address(s.stakingToken))
      .decimals();
    uint256 balance = (user.balance * 10 ** rewardTokenDecimal) /
      10 ** stakingTokenDecimal;
    return
      user.rewardsEarned +
      ((((balance * (uint32(block.timestamp) - user.updatedAt)) /
        LibDiamond.ONE_YEAR_IN_SECONDS) * s.rewardRate) / 100);
  }

  function updateReward(address account) private {
    if (account != address(0)) {
      LibDiamond.StakingRewardsStorage storage s = LibDiamond
        .getStakingRewardsStorage(STAKING_REWARDS_NAMESPACE);
      LibDiamond.StakeHolder storage user = s.stakes[account];
      user.rewardsEarned = earned(account);
      user.updatedAt = uint32(block.timestamp);
    }
  }
}
