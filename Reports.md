# Reports

## Coverage

```console
$ npx hardhat coverage --testfiles test/Diamond_StakingRewards.test.ts

Version
=======
> solidity-coverage: v0.8.2

Instrumenting for coverage...
=============================

> Cupcake.sol
> diamond\Diamond.sol
> diamond\facets\DiamondCutFacet.sol
> diamond\facets\DiamondLoupeFacet.sol
> diamond\facets\OwnershipFacet.sol
> diamond\facets\StakingRewardsFacet.sol
> diamond\interfaces\IDiamondCut.sol
> diamond\interfaces\IDiamondLoupe.sol
> diamond\interfaces\IERC165.sol
> diamond\interfaces\IERC173.sol
> diamond\interfaces\IStakingRewards.sol
> diamond\libraries\LibDiamond.sol
> diamond\updateInitializers\DiamondInit.sol
> Donut.sol
> ERC20.sol
> StakingRewards.sol

Compilation:
============

(node:21736) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time   
(Use `node --trace-warnings ...` to show where the warning was created)
Generating typings for: 24 artifacts in dir: typechain-types for target: ethers-v5
Successfully generated 72 typings!
Compiled 24 Solidity files successfully

Network Info
============
> HardhatEVM: v2.12.5
> network:    hardhat

Compiled 24 Solidity files successfully


  StakingRewardsFacet
DiamondCutFacet deployed: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Diamond deployed: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
DiamondInit deployed: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Cupcake deployed at: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Donut deployed at: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Staking Rewards Facet deployed at: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707

Diamond cut tx:  0x5b65be947de0c08f4e64ac397fea1d9b98756555230d57e2f24464963298fa47
    stake
      ✔ should revert if stake amount is 0
      ✔ should  stake the given amount (63ms)
      ✔ should revert if staked during lock in period
    withdraw
      ✔ should revert if withdrawn during lock-in period
      ✔ should distribute rewards if amount is 0 (55ms)
      ✔ should withdraw given amount regardless of reward balance (64ms)
      ✔ should withdraw given amount and distribute rewards (83ms)
    withdrawAll
      ✔ should revert if withdrawn during lock-in period (68ms)
      ✔ should withdraw all balance of user regardless of reward balance (109ms)
      ✔ should withdraw remaining balance of user (87ms)
      ✔ should not revert if stake balance is 0 (69ms)
    earned
      ✔ shoulde revert if account is zero address
      ✔ should return zero for unstaked users
      ✔ should return reward tokens earned by the user (59ms)


  14 passing (1s)

---------------------------------------|----------|----------|----------|----------|----------------|
File                                   |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
---------------------------------------|----------|----------|----------|----------|----------------|
 contracts\                            |    29.27 |     3.13 |    44.44 |    39.13 |                |
  Cupcake.sol                          |      100 |      100 |      100 |      100 |                |
  Donut.sol                            |       50 |      100 |       50 |       50 |             12 |
  ERC20.sol                            |     62.5 |     12.5 |    66.67 |    69.44 |... 200,201,204 |
  StakingRewards.sol                   |        0 |        0 |        0 |        0 |... 89,90,91,92 |
 contracts\diamond\                    |      100 |       50 |      100 |      100 |                |
  Diamond.sol                          |      100 |       50 |      100 |      100 |                |
 contracts\diamond\facets\             |    80.88 |    72.22 |    56.25 |       75 |                |
  DiamondCutFacet.sol                  |      100 |      100 |      100 |      100 |                |
  DiamondLoupeFacet.sol                |        0 |      100 |        0 |        0 |... 58,59,64,65 |
  OwnershipFacet.sol                   |        0 |      100 |        0 |        0 |        9,10,14 |
  StakingRewardsFacet.sol              |    96.36 |    72.22 |      100 |    96.67 |          49,50 |
 contracts\diamond\interfaces\         |      100 |      100 |      100 |      100 |                |
  IDiamondCut.sol                      |      100 |      100 |      100 |      100 |                |
  IDiamondLoupe.sol                    |      100 |      100 |      100 |      100 |                |
  IERC165.sol                          |      100 |      100 |      100 |      100 |                |
  IERC173.sol                          |      100 |      100 |      100 |      100 |                |
  IStakingRewards.sol                  |      100 |      100 |      100 |      100 |                |
 contracts\diamond\libraries\          |    46.48 |    21.74 |    71.43 |    47.13 |                |
  LibDiamond.sol                       |    46.48 |    21.74 |    71.43 |    47.13 |... 338,341,346 |
 contracts\diamond\updateInitializers\ |       50 |      100 |       50 |    44.44 |                |
  DiamondInit.sol                      |       50 |      100 |       50 |    44.44 | 27,28,29,30,31 |
---------------------------------------|----------|----------|----------|----------|----------------|
All files                              |    57.37 |    32.76 |    57.69 |    56.03 |                |
---------------------------------------|----------|----------|----------|----------|----------------|

> Istanbul reports written to ./coverage/ and ./coverage.json
```
## Contract Size

```console
$ npx hardhat size-contracts
(node:4068) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Generating typings for: 24 artifacts in dir: typechain-types for target: ethers-v5
Successfully generated 72 typings!
Compiled 24 Solidity files successfully
 ·-----------------------|--------------|----------------·
 |  Contract Name        ·  Size (KiB)  ·  Change (KiB)  │
 ························|··············|·················
 |  Address              ·       0.084  ·                │
 ························|··············|·················
 |  Cupcake              ·       2.617  ·                │
 ························|··············|·················
 |  Diamond              ·       4.193  ·                │
 ························|··············|·················
 |  DiamondCutFacet      ·       4.890  ·                │
 ························|··············|·················
 |  DiamondInit          ·       0.577  ·                │
 ························|··············|·················
 |  DiamondLoupeFacet    ·       1.639  ·                │
 ························|··············|·················
 |  Donut                ·       2.807  ·                │
 ························|··············|·················
 |  LibDiamond           ·       0.084  ·                │
 ························|··············|·················
 |  OwnershipFacet       ·       0.570  ·                │
 ························|··············|·················
 |  SafeERC20            ·       0.084  ·                │
 ························|··············|·················
 |  StakingReward        ·       2.620  ·                │
 ························|··············|·················
 |  StakingRewardsFacet  ·       3.665  ·                │
 ·-----------------------|--------------|----------------·
```

## Slither Security Analysis

```console
$ slither .
'npx hardhat compile --force' running
Generating typings for: 24 artifacts in dir: typechain-types for target: ethers-v5
Successfully generated 72 typings!
Compiled 24 Solidity files successfully

(node:25472) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)


StakingReward.earned(address) (contracts/StakingRewards.sol#76-86) performs a multiplication on the result of a division:
        - user.rewardsEarned + ((((balance * (uint32(block.timestamp) - user.updatedAt)) / ONE_YEAR_IN_SECONDS) * _rewardRate) / 100) (contracts/StakingRewards.sol#82-85)
StakingRewardsFacet.earned(address) (contracts/diamond/facets/StakingRewardsFacet.sol#76-98) performs a multiplication on the result of a division:
        - p = (user.balance * 10 ** rewardTokenDecimal) / 10 ** stakingTokenDecimal (contracts/diamond/facets/StakingRewardsFacet.sol#90-91)
        - pn = (p * n) / LibDiamond.ONE_YEAR_IN_SECONDS (contracts/diamond/facets/StakingRewardsFacet.sol#93)
StakingRewardsFacet.earned(address) (contracts/diamond/facets/StakingRewardsFacet.sol#76-98) performs a multiplication on the result of a division:
        - pn = (p * n) / LibDiamond.ONE_YEAR_IN_SECONDS (contracts/diamond/facets/StakingRewardsFacet.sol#93)
        - interest = (pn * r) / 100 (contracts/diamond/facets/StakingRewardsFacet.sol#95)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#divide-before-multiply

LibDiamond.replaceFunctions(address,bytes4[]).selectorIndex (contracts/diamond/libraries/LibDiamond.sol#202) is a local variable never initialized
LibDiamond.addFunctions(address,bytes4[]).selectorIndex (contracts/diamond/libraries/LibDiamond.sol#164) is a local variable never initialized
LibDiamond.diamondCut(IDiamondCut.FacetCut[],address,bytes).facetIndex (contracts/diamond/libraries/LibDiamond.sol#118) is a local variable never initialized
DiamondLoupeFacet.facets().i (contracts/diamond/facets/DiamondLoupeFacet.sol#31) is a local variable never initialized
LibDiamond.removeFunctions(address,bytes4[]).selectorIndex (contracts/diamond/libraries/LibDiamond.sol#235) is a local variable never initialized
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#uninitialized-local-variables

Cupcake.constructor(uint256).totalSupply (contracts/Cupcake.sol#7) shadows:        
        - ERC20.totalSupply (contracts/ERC20.sol#31) (state variable)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#local-variable-shadowing

Reentrancy in StakingRewardsFacet.distributeRewards() (contracts/diamond/facets/StakingRewardsFacet.sol#115-124):
        External calls:
        - s.rewardToken.safeTransfer(address(msg.sender),rewardsPending) (contracts/diamond/facets/StakingRewardsFacet.sol#121)
        Event emitted after the call(s):
        - RewardsPaid(msg.sender,rewardsPending) (contracts/diamond/facets/StakingRewardsFacet.sol#122)
Reentrancy in StakingReward.getRewards() (contracts/StakingRewards.sol#63-74):     
        External calls:
        - _rewardToken.safeTransferFrom(address(this),msg.sender,user.rewardsPaid) (contracts/StakingRewards.sol#67-71)
        Event emitted after the call(s):
        - RewardsPaid(msg.sender,user.rewardsPaid) (contracts/StakingRewards.sol#72)
Reentrancy in StakingReward.stake(uint256) (contracts/StakingRewards.sol#45-52):   
        External calls:
        - _stakingToken.safeTransferFrom(msg.sender,address(this),amount) (contracts/StakingRewards.sol#50)
        Event emitted after the call(s):
        - Staked(msg.sender,amount) (contracts/StakingRewards.sol#51)
Reentrancy in StakingRewardsFacet.stake(uint256) (contracts/diamond/facets/StakingRewardsFacet.sol#22-38):
        External calls:
        - s.stakingToken.safeTransferFrom(msg.sender,address(this),amount) (contracts/diamond/facets/StakingRewardsFacet.sol#36)
        Event emitted after the call(s):
        - Staked(msg.sender,amount) (contracts/diamond/facets/StakingRewardsFacet.sol#37)
Reentrancy in StakingReward.withdraw(uint256) (contracts/StakingRewards.sol#54-61):
        External calls:
        - _stakingToken.safeTransfer(msg.sender,amount) (contracts/StakingRewards.sol#59)
        Event emitted after the call(s):
        - Withdraw(msg.sender,amount) (contracts/StakingRewards.sol#60)
Reentrancy in StakingRewardsFacet.withdraw(uint256) (contracts/diamond/facets/StakingRewardsFacet.sol#40-57):
        External calls:
        - s.stakingToken.safeTransfer(address(msg.sender),amount) (contracts/diamond/facets/StakingRewardsFacet.sol#53)
        Event emitted after the call(s):
        - Withdraw(msg.sender,amount) (contracts/diamond/facets/StakingRewardsFacet.sol#54)
Reentrancy in StakingRewardsFacet.withdraw(uint256) (contracts/diamond/facets/StakingRewardsFacet.sol#40-57):
        External calls:
        - s.stakingToken.safeTransfer(address(msg.sender),amount) (contracts/diamond/facets/StakingRewardsFacet.sol#53)
        - distributeRewards() (contracts/diamond/facets/StakingRewardsFacet.sol#55)
                - returndata = address(token).functionCall(data,SafeERC20: low-level call failed) (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#110)
                - (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#135)
                - s.rewardToken.safeTransfer(address(msg.sender),rewardsPending) (contracts/diamond/facets/StakingRewardsFacet.sol#121)
        External calls sending eth:
        - distributeRewards() (contracts/diamond/facets/StakingRewardsFacet.sol#55)
                - (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#135)
        Event emitted after the call(s):
        - RewardsPaid(msg.sender,rewardsPending) (contracts/diamond/facets/StakingRewardsFacet.sol#122)
                - distributeRewards() (contracts/diamond/facets/StakingRewardsFacet.sol#55)
Reentrancy in StakingRewardsFacet.withdrawAll() (contracts/diamond/facets/StakingRewardsFacet.sol#59-74):
        External calls:
        - s.stakingToken.safeTransfer(address(msg.sender),balance) (contracts/diamond/facets/StakingRewardsFacet.sol#71)
        Event emitted after the call(s):
        - Withdraw(msg.sender,user.balance) (contracts/diamond/facets/StakingRewardsFacet.sol#72)
Reentrancy in StakingRewardsFacet.withdrawAll() (contracts/diamond/facets/StakingRewardsFacet.sol#59-74):
        External calls:
        - s.stakingToken.safeTransfer(address(msg.sender),balance) (contracts/diamond/facets/StakingRewardsFacet.sol#71)
        - distributeRewards() (contracts/diamond/facets/StakingRewardsFacet.sol#73)
                - returndata = address(token).functionCall(data,SafeERC20: low-level call failed) (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#110)
                - (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#135)
                - s.rewardToken.safeTransfer(address(msg.sender),rewardsPending) (contracts/diamond/facets/StakingRewardsFacet.sol#121)
        External calls sending eth:
        - distributeRewards() (contracts/diamond/facets/StakingRewardsFacet.sol#73)
                - (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#135)
        Event emitted after the call(s):
        - RewardsPaid(msg.sender,rewardsPending) (contracts/diamond/facets/StakingRewardsFacet.sol#122)
                - distributeRewards() (contracts/diamond/facets/StakingRewardsFacet.sol#73)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-3

ERC20.permit(address,address,uint256,uint256,uint8,bytes32,bytes32) (contracts/ERC20.sol#116-160) uses timestamp for comparisons
        Dangerous comparisons:
        - require(bool,string)(deadline >= block.timestamp,PERMIT_DEADLINE_EXPIRED) (contracts/ERC20.sol#125)
StakingReward.earned(address) (contracts/StakingRewards.sol#76-86) uses timestamp for comparisons
        Dangerous comparisons:
        - user.updatedAt <= 0 (contracts/StakingRewards.sol#81)
StakingRewardsFacet.stake(uint256) (contracts/diamond/facets/StakingRewardsFacet.sol#22-38) uses timestamp for comparisons
        Dangerous comparisons:
        - uint32(block.timestamp) < user.finishAt (contracts/diamond/facets/StakingRewardsFacet.sol#28)
StakingRewardsFacet.withdraw(uint256) (contracts/diamond/facets/StakingRewardsFacet.sol#40-57) uses timestamp for comparisons
        Dangerous comparisons:
        - uint32(block.timestamp) < user.finishAt (contracts/diamond/facets/StakingRewardsFacet.sol#46)
StakingRewardsFacet.withdrawAll() (contracts/diamond/facets/StakingRewardsFacet.sol#59-74) uses timestamp for comparisons
        Dangerous comparisons:
        - uint32(block.timestamp) < user.finishAt (contracts/diamond/facets/StakingRewardsFacet.sol#65)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#block-timestamp

Address._revert(bytes,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#231-243) uses assembly
        - INLINE ASM (node_modules/@openzeppelin/contracts/utils/Address.sol#236-239)
Diamond.fallback() (contracts/diamond/Diamond.sol#33-60) uses assembly
        - INLINE ASM (contracts/diamond/Diamond.sol#37-39)
        - INLINE ASM (contracts/diamond/Diamond.sol#44-59)
LibDiamond.diamondStorage() (contracts/diamond/libraries/LibDiamond.sol#69-74) uses assembly
        - INLINE ASM (contracts/diamond/libraries/LibDiamond.sol#71-73)
LibDiamond.stakingStorage() (contracts/diamond/libraries/LibDiamond.sol#76-81) uses assembly
        - INLINE ASM (contracts/diamond/libraries/LibDiamond.sol#78-80)
LibDiamond.initializeDiamondCut(address,bytes) (contracts/diamond/libraries/LibDiamond.sol#328-349) uses assembly
        - INLINE ASM (contracts/diamond/libraries/LibDiamond.sol#341-344)
LibDiamond.enforceHasContractCode(address,string) (contracts/diamond/libraries/LibDiamond.sol#351-360) uses assembly
        - INLINE ASM (contracts/diamond/libraries/LibDiamond.sol#356-358)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#assembly-usage

Different versions of Solidity are used:
        - Version used: ['0.8.17', '^0.8.0', '^0.8.1']
        - ^0.8.0 (node_modules/@openzeppelin/contracts/security/Pausable.sol#4)    
        - ^0.8.0 (node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#4)
        - ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#4)   
        - ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#4)
        - ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#4)
        - ^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#4)
        - ^0.8.1 (node_modules/@openzeppelin/contracts/utils/Address.sol#4)        
        - ^0.8.0 (node_modules/@openzeppelin/contracts/utils/Context.sol#4)        
        - 0.8.17 (contracts/Cupcake.sol#2)
        - 0.8.17 (contracts/Donut.sol#2)
        - ^0.8.0 (contracts/ERC20.sol#2)
        - 0.8.17 (contracts/StakingRewards.sol#2)
        - 0.8.17 (contracts/diamond/Diamond.sol#2)
        - 0.8.17 (contracts/diamond/facets/DiamondCutFacet.sol#2)
        - 0.8.17 (contracts/diamond/facets/DiamondLoupeFacet.sol#2)
        - 0.8.17 (contracts/diamond/facets/OwnershipFacet.sol#2)
        - 0.8.17 (contracts/diamond/facets/StakingRewardsFacet.sol#2)
        - ^0.8.0 (contracts/diamond/interfaces/IDiamondCut.sol#2)
        - ^0.8.0 (contracts/diamond/interfaces/IDiamondLoupe.sol#2)
        - ^0.8.0 (contracts/diamond/interfaces/IERC165.sol#2)
        - ^0.8.0 (contracts/diamond/interfaces/IERC173.sol#2)
        - ^0.8.0 (contracts/diamond/interfaces/IStakingRewards.sol#2)
        - ^0.8.0 (contracts/diamond/libraries/LibDiamond.sol#2)
        - 0.8.17 (contracts/diamond/updateInitializers/DiamondInit.sol#2)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#different-pragma-directives-are-used

ERC20._burn(address,uint256) (contracts/ERC20.sol#195-205) is never used and should be removed
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#dead-code 

Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/security/Pausable.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol#4) allows old versions
Pragma version^0.8.1 (node_modules/@openzeppelin/contracts/utils/Address.sol#4) allows old versions
Pragma version^0.8.0 (node_modules/@openzeppelin/contracts/utils/Context.sol#4) allows old versions
Pragma version0.8.17 (contracts/Cupcake.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16
Pragma version0.8.17 (contracts/Donut.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16
Pragma version^0.8.0 (contracts/ERC20.sol#2) allows old versions
Pragma version0.8.17 (contracts/StakingRewards.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16
Pragma version0.8.17 (contracts/diamond/Diamond.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16
Pragma version0.8.17 (contracts/diamond/facets/DiamondCutFacet.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16    
Pragma version0.8.17 (contracts/diamond/facets/DiamondLoupeFacet.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16  
Pragma version0.8.17 (contracts/diamond/facets/OwnershipFacet.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16     
Pragma version0.8.17 (contracts/diamond/facets/StakingRewardsFacet.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16
Pragma version^0.8.0 (contracts/diamond/interfaces/IDiamondCut.sol#2) allows old versions
Pragma version^0.8.0 (contracts/diamond/interfaces/IDiamondLoupe.sol#2) allows old versions
Pragma version^0.8.0 (contracts/diamond/interfaces/IERC165.sol#2) allows old versions
Pragma version^0.8.0 (contracts/diamond/interfaces/IERC173.sol#2) allows old versions
Pragma version^0.8.0 (contracts/diamond/interfaces/IStakingRewards.sol#2) allows old versions
Pragma version^0.8.0 (contracts/diamond/libraries/LibDiamond.sol#2) allows old versions
Pragma version0.8.17 (contracts/diamond/updateInitializers/DiamondInit.sol#2) necessitates a version too recent to be trusted. Consider deploying with 0.6.12/0.7.6/0.8.16
solc-0.8.17 is not recommended for deployment
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#incorrect-versions-of-solidity

Low level call in Address.sendValue(address,uint256) (node_modules/@openzeppelin/contracts/utils/Address.sol#60-65):
        - (success) = recipient.call{value: amount}() (node_modules/@openzeppelin/contracts/utils/Address.sol#63)
Low level call in Address.functionCallWithValue(address,bytes,uint256,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#128-137):
        - (success,returndata) = target.call{value: value}(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#135)
Low level call in Address.functionStaticCall(address,bytes,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#155-162):
        - (success,returndata) = target.staticcall(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#160)
Low level call in Address.functionDelegateCall(address,bytes,string) (node_modules/@openzeppelin/contracts/utils/Address.sol#180-187):
        - (success,returndata) = target.delegatecall(data) (node_modules/@openzeppelin/contracts/utils/Address.sol#185)
Low level call in LibDiamond.initializeDiamondCut(address,bytes) (contracts/diamond/libraries/LibDiamond.sol#328-349):
        - (success,error) = _init.delegatecall(_calldata) (contracts/diamond/libraries/LibDiamond.sol#336)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#low-level-calls

StakingRewardsFacet (contracts/diamond/facets/StakingRewardsFacet.sol#11-134) should inherit from IStakingRewards (contracts/diamond/interfaces/IStakingRewards.sol#4-16)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#missing-inheritance

Function IERC20Permit.DOMAIN_SEPARATOR() (node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol#59) is not in mixedCase
Function ERC20.DOMAIN_SEPARATOR() (contracts/ERC20.sol#162-164) is not in mixedCase
Variable ERC20.INITIAL_CHAIN_ID (contracts/ERC20.sol#41) is not in mixedCase       
Variable ERC20.INITIAL_DOMAIN_SEPARATOR (contracts/ERC20.sol#43) is not in mixedCase
Variable StakingReward.STAKING_TOKEN_DECIMALS (contracts/StakingRewards.sol#28) is not in mixedCase
Variable StakingReward.REWARD_TOKEN_DECIMALS (contracts/StakingRewards.sol#29) is not in mixedCase
Variable StakingReward._stakes (contracts/StakingRewards.sol#35) is not in mixedCase
Parameter DiamondCutFacet.diamondCut(IDiamondCut.FacetCut[],address,bytes)._diamondCut (contracts/diamond/facets/DiamondCutFacet.sol#23) is not in mixedCase
Parameter DiamondCutFacet.diamondCut(IDiamondCut.FacetCut[],address,bytes)._init (contracts/diamond/facets/DiamondCutFacet.sol#24) is not in mixedCase
Parameter DiamondCutFacet.diamondCut(IDiamondCut.FacetCut[],address,bytes)._calldata (contracts/diamond/facets/DiamondCutFacet.sol#25) is not in mixedCase
Parameter DiamondLoupeFacet.facetFunctionSelectors(address)._facet (contracts/diamond/facets/DiamondLoupeFacet.sol#41) is not in mixedCase
Parameter DiamondLoupeFacet.facetAddress(bytes4)._functionSelector (contracts/diamond/facets/DiamondLoupeFacet.sol#57) is not in mixedCase
Parameter DiamondLoupeFacet.supportsInterface(bytes4)._interfaceId (contracts/diamond/facets/DiamondLoupeFacet.sol#63) is not in mixedCase
Parameter OwnershipFacet.transferOwnership(address)._newOwner (contracts/diamond/facets/OwnershipFacet.sol#8) is not in mixedCase
Parameter LibDiamond.setContractOwner(address)._newOwner (contracts/diamond/libraries/LibDiamond.sol#88) is not in mixedCase
Parameter LibDiamond.diamondCut(IDiamondCut.FacetCut[],address,bytes)._diamondCut (contracts/diamond/libraries/LibDiamond.sol#114) is not in mixedCase
Parameter LibDiamond.diamondCut(IDiamondCut.FacetCut[],address,bytes)._init (contracts/diamond/libraries/LibDiamond.sol#115) is not in mixedCase
Parameter LibDiamond.diamondCut(IDiamondCut.FacetCut[],address,bytes)._calldata (contracts/diamond/libraries/LibDiamond.sol#116) is not in mixedCase
Parameter LibDiamond.addFunctions(address,bytes4[])._facetAddress (contracts/diamond/libraries/LibDiamond.sol#144) is not in mixedCase
Parameter LibDiamond.addFunctions(address,bytes4[])._functionSelectors (contracts/diamond/libraries/LibDiamond.sol#145) is not in mixedCase
Parameter LibDiamond.replaceFunctions(address,bytes4[])._facetAddress (contracts/diamond/libraries/LibDiamond.sol#182) is not in mixedCase
Parameter LibDiamond.replaceFunctions(address,bytes4[])._functionSelectors (contracts/diamond/libraries/LibDiamond.sol#183) is not in mixedCase
Parameter LibDiamond.removeFunctions(address,bytes4[])._facetAddress (contracts/diamond/libraries/LibDiamond.sol#221) is not in mixedCase
Parameter LibDiamond.removeFunctions(address,bytes4[])._functionSelectors (contracts/diamond/libraries/LibDiamond.sol#222) is not in mixedCase
Parameter LibDiamond.addFacet(LibDiamond.DiamondStorage,address)._facetAddress (contracts/diamond/libraries/LibDiamond.sol#247) is not in mixedCase
Parameter LibDiamond.addFunction(LibDiamond.DiamondStorage,bytes4,uint96,address)._selector (contracts/diamond/libraries/LibDiamond.sol#260) is not in mixedCase      
Parameter LibDiamond.addFunction(LibDiamond.DiamondStorage,bytes4,uint96,address)._selectorPosition (contracts/diamond/libraries/LibDiamond.sol#261) is not in mixedCase
Parameter LibDiamond.addFunction(LibDiamond.DiamondStorage,bytes4,uint96,address)._facetAddress (contracts/diamond/libraries/LibDiamond.sol#262) is not in mixedCase  
Parameter LibDiamond.removeFunction(LibDiamond.DiamondStorage,address,bytes4)._facetAddress (contracts/diamond/libraries/LibDiamond.sol#273) is not in mixedCase      
Parameter LibDiamond.removeFunction(LibDiamond.DiamondStorage,address,bytes4)._selector (contracts/diamond/libraries/LibDiamond.sol#274) is not in mixedCase
Parameter LibDiamond.initializeDiamondCut(address,bytes)._init (contracts/diamond/libraries/LibDiamond.sol#329) is not in mixedCase
Parameter LibDiamond.initializeDiamondCut(address,bytes)._calldata (contracts/diamond/libraries/LibDiamond.sol#330) is not in mixedCase
Parameter LibDiamond.enforceHasContractCode(address,string)._contract (contracts/diamond/libraries/LibDiamond.sol#352) is not in mixedCase
Parameter LibDiamond.enforceHasContractCode(address,string)._errorMessage (contracts/diamond/libraries/LibDiamond.sol#353) is not in mixedCase
Function DiamondInit.init_StakingRewardsFacet(address,address,uint8) (contracts/diamond/updateInitializers/DiamondInit.sol#41-50) is not in mixedCase
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#conformance-to-solidity-naming-conventions

StakingReward._owner (contracts/StakingRewards.sol#36) is never used in StakingReward (contracts/StakingRewards.sol#10-95)
LibDiamond.ONE_YEAR_IN_SECONDS (contracts/diamond/libraries/LibDiamond.sol#26) is never used in LibDiamond (contracts/diamond/libraries/LibDiamond.sol#19-361)        
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unused-state-variable

StakingReward._owner (contracts/StakingRewards.sol#36) should be constant
StakingReward._rewardRate (contracts/StakingRewards.sol#34) should be constant     
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#state-variables-that-could-be-declared-constant
. analyzed (24 contracts with 81 detectors), 101 result(s) found
```

## Deployments

```console
$ npx hardhat run scripts/deploy.ts --network truffle
(node:26592) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
(node:1000) ExperimentalWarning: stream/web is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)

DiamondCutFacet deployed: 0xCD8e0ce7122e6b22d9cB03f96373BeDD29D2ad34
Diamond deployed: 0x28d7fa71867808cE69d78252F8B0A4a9EF668201
DiamondInit deployed: 0x619105B29d1e973a8a1ac869aa0dA0D0c28c97FD
Cupcake deployed at: 0xFEc5bcffa73617fe1470729417Ba575Bc297B759
Donut deployed at: 0xc4063e39f3659Fc7c267274b8490B32318162066
Staking Rewards Facet deployed at: 0x9284506b74e5900265e8810438d54f503DAFA59E

Diamond cut tx: 0x83819a5428c91088d561b93d8e3378e7fb295fd60ce0c65af80aecae60f057c7
```

