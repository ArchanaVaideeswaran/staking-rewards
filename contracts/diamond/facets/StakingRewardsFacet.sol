//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StakingRewardsFacet is ReentrancyGuard, Pausable {
  using SafeERC20 for IERC20;
  error ZeroAmount();
  error ZeroAddress();

  event Staked(address stakeHolder, uint256 amount);
  event Withdraw(address stakeHolder, uint256 amount);
  event RewardsPaid(address stakeHolder, uint256 amount);

  bytes32 internal constant STAKING_REWARDS_NAMESPACE =
    keccak256("diamond.staking.rewards");
  uint32 private constant ONE_YEAR_IN_SECONDS = 31536000;
  uint8 private immutable STAKING_TOKEN_DECIMALS;
  uint8 private immutable REWARD_TOKEN_DECIMALS;

  struct StakeHolder {
    uint256 balance;
    uint256 rewardsEarned;
    uint256 rewardsPaid;
    uint32 updatedAt;
  }

  struct StakingRewardsStorage {
    IERC20 stakingToken;
    IERC20 rewardToken;
    uint8 rewardRate; // 12% APR
    mapping(address => StakeHolder) stakes;
    address owner;
  }

  constructor(address stakingToken, address rewardToken, uint8 _rewardRate) {
    StakingRewardsStorage storage s = getStorage();
    s.stakingToken = IERC20(stakingToken);
    s.rewardToken = IERC20(rewardToken);
    s.rewardRate = _rewardRate;
    STAKING_TOKEN_DECIMALS = IERC20Metadata(stakingToken).decimals();
    REWARD_TOKEN_DECIMALS = IERC20Metadata(rewardToken).decimals();
  }

  function stake(uint amount) external nonReentrant whenNotPaused {
    updateReward(msg.sender);
    if (amount == 0) revert ZeroAmount();
    StakingRewardsStorage storage s = getStorage();
    StakeHolder storage user = s.stakes[msg.sender];
    user.balance += amount;
    s.stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  function withdraw(uint amount) external nonReentrant whenNotPaused {
    updateReward(msg.sender);
    if (amount == 0) revert ZeroAmount();
    StakingRewardsStorage storage s = getStorage();
    StakeHolder storage user = s.stakes[msg.sender];
    user.balance -= amount;
    s.stakingToken.safeTransfer(msg.sender, amount);
    emit Withdraw(msg.sender, amount);
  }

  function getRewards() external nonReentrant whenNotPaused {
    StakingRewardsStorage storage s = getStorage();
    StakeHolder storage user = s.stakes[msg.sender];
    if (user.rewardsEarned > 0) {
      user.rewardsPaid = user.rewardsEarned;
      s.rewardToken.safeTransferFrom(
        address(this),
        msg.sender,
        user.rewardsPaid
      );
      emit RewardsPaid(msg.sender, user.rewardsPaid);
    }
  }

  function earned(address account) public view returns (uint) {
    if (account == address(0)) revert ZeroAddress();
    StakingRewardsStorage storage s = getStorage();
    StakeHolder memory user = s.stakes[account];
    uint256 balance = (user.balance * 10 ** REWARD_TOKEN_DECIMALS) /
      10 ** STAKING_TOKEN_DECIMALS;
    if (user.updatedAt <= 0) return 0;
    return
      user.rewardsEarned +
      ((((balance * (uint32(block.timestamp) - user.updatedAt)) /
        ONE_YEAR_IN_SECONDS) * s.rewardRate) / 100);
  }

  function updateReward(address account) private {
    if (account != address(0)) {
      StakingRewardsStorage storage s = getStorage();
      StakeHolder storage user = s.stakes[account];
      user.rewardsEarned = earned(account);
      user.updatedAt = uint32(block.timestamp);
    }
  }

  function getStorage()
    internal
    pure
    returns (StakingRewardsStorage storage s)
  {
    bytes32 slot = STAKING_REWARDS_NAMESPACE;
    assembly {
      s.slot := slot
    }
  }
}
