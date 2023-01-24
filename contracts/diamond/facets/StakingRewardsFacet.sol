//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "../libraries/LibDiamond.sol";

/**
 * @notice StakingRewardsFacet is a contract that allows users to stake CUPCAKE tokens
 * and earn a constant 12% APR of DONUT tokens for a specified lock-in period.
 * This contract is deployed as a facet of the Diamond (Multi-facet Proxy).
 * All the state variable of this contract is stored in the LibDiamond library.
 * The storage structure follows the Diamond Storage structure.
 * The state variables are initialized using the DiamondInit contract.
 */
contract StakingRewardsFacet is ReentrancyGuard, Pausable {
  using SafeERC20 for IERC20;

  error ZeroAmount();
  error ZeroAddress();
  error LockInPeriod();

  event Staked(address stakeHolder, uint256 amount);
  event Withdraw(address stakeHolder, uint256 amount);
  event RewardsPaid(address stakeHolder, uint256 amount);

  /**
   * @dev stake
   * @param amount The amount of CUPCAKE tokens the user (msg.sender) is staking
   * The function transfers CUPCAKE tokens to the contract
   * and locks it for the set duration (1 year).
   */
  function stake(uint amount) external nonReentrant whenNotPaused {
    if (amount == 0) revert ZeroAmount();

    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];

    if (uint32(block.timestamp) < user.finishAt) revert LockInPeriod();

    _updateReward(msg.sender);

    if (user.finishAt == 0)
      user.finishAt = uint32(block.timestamp) + LibDiamond.ONE_YEAR_IN_SECONDS;

    user.balance += amount;
    s.stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  /**
   * @dev withdraw
   * @param amount The amount of CUPCAKE tokens the user (msg.sender) is withdrawing
   * The function allows users to withdraw specific amount of CUPCAKE tokens
   * after the lock-in period is reached.
   * The DONUT token rewards are distributed along with the withdrawal.
   */
  function withdraw(uint amount) external nonReentrant whenNotPaused {
    _updateReward(msg.sender);

    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];

    if (uint32(block.timestamp) < user.finishAt) revert LockInPeriod();

    if (amount == 0) {
      _distributeRewards();
      return;
    } else {
      user.balance -= amount;
      s.stakingToken.safeTransfer(address(msg.sender), amount);
      emit Withdraw(msg.sender, amount);
      _distributeRewards();
    }
  }

  /**
   * @dev withdrawAll
   * Transfers all of the remaining CUPCAKE tokens and DONUT rewards in the contract
   * applicabe for the user (msg.sender).
   */
  function withdrawAll() external nonReentrant whenNotPaused {
    _updateReward(msg.sender);

    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];

    if (uint32(block.timestamp) < user.finishAt) revert LockInPeriod();

    if (user.balance == 0) revert ZeroAmount();

    uint256 balance = user.balance;
    user.balance = 0;
    s.stakingToken.safeTransfer(address(msg.sender), balance);
    emit Withdraw(msg.sender, user.balance);
    _distributeRewards();
  }

  /**
   * @dev earned
   * @param account The address of the user for whome the interst is calculated.
   * The function return the total amount of interest earned by the user
   * up until the timestamp at which this function is called.
   */
  function earned(address account) public view returns (uint) {
    if (account == address(0)) revert ZeroAddress();

    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[account];

    if (user.updatedAt == 0) return 0;
    if (user.balance == 0) return user.rewardsEarned;

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

  /**
   * @dev getBalance
   * @param account The address of the user for whome the balance is returned.
   * The function return the CUPCAKE token balance of the user in the contract.
   */
  function getBalance(address account) public view returns (uint256) {
    return LibDiamond.stakingStorage().stakes[account].balance;
  }

  /**
   * @dev earned
   * @param account The address of the user for whome the balance is returned.
   * The function return the DONUT token balance
   * left in the contract to be paid to the user.
   */
  function getRewardBalance(address account) public view returns (uint256) {
    uint256 rewardsEarned = earned(account);

    uint256 rewardsPaid = LibDiamond
      .stakingStorage()
      .stakes[account]
      .rewardsPaid;

    return rewardsEarned - rewardsPaid;
  }

  /**
   * @dev private function _distributeRewards
   * The function is used to check pending rewards and distribute it to the user.
   */
  function _distributeRewards() private {
    LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
    LibDiamond.StakeHolder storage user = s.stakes[msg.sender];
    uint256 rewardsPending = user.rewardsEarned - user.rewardsPaid;
    if (rewardsPending > 0) {
      user.rewardsPaid = user.rewardsEarned;
      s.rewardToken.safeTransfer(address(msg.sender), rewardsPending);
      emit RewardsPaid(msg.sender, rewardsPending);
    }
  }

  /**
   * @dev private function _updateReward 
   * @param account The address of the user for whome the rewards is updated.
   * The function updates the rewards earnned by the user up until the current timesamp 
   * every time the user stakes and withdrads CUPCAKE tokens.
   */
  function _updateReward(address account) private {
    if (account != address(0)) {
      LibDiamond.StakingStorage storage s = LibDiamond.stakingStorage();
      LibDiamond.StakeHolder storage user = s.stakes[account];
      user.rewardsEarned = earned(account);
      user.updatedAt = uint32(block.timestamp);
    }
  }
}
