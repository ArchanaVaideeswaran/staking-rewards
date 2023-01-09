//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library LibDiamond {
  bytes32 internal constant DEFAULT_NAMESPACE =
    keccak256("diamond.standard.diamond.storage");

  uint32 internal constant ONE_YEAR_IN_SECONDS = 31536000;

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
    address wallet;
  }

  struct DiamondStorage {
    mapping(bytes4 => mapping(bytes32 => uint8)) allowedNamespaces;
  }

  function getStorage() internal pure returns (DiamondStorage storage s) {
    bytes32 slot = DEFAULT_NAMESPACE;
    assembly {
      s.slot := slot
    }
  }

  function getStakingRewardsStorage(
    bytes32 namespace
  ) internal pure returns (StakingRewardsStorage storage s) {
    bytes32 slot = namespace;
    assembly {
      s.slot := slot
    }
  }
}
