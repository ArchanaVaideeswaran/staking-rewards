import { ethers } from "hardhat";
import { getSelectors, FacetCutAction } from "./libraries/diamond";
import { storeContract } from "./store-contract";

export async function deployStakingRewardsFacet(): Promise<string> {
  let network = (await ethers.provider.getNetwork()).name;
  network = network == "unknown" ? "localhost" : network;

  const Diamond = require(`../build/${network}/Diamond.json`);

  const diamondCut = await ethers.getContractAt("IDiamondCut", Diamond.address);

  const DiamondInit = require(`../build/${network}/DiamondInit.json`);
  const diamondInit = await ethers.getContractAt(
    "DiamondInit",
    DiamondInit.address
  );

  const StakingRewardsFacet = await ethers.getContractFactory(
    "StakingRewardsFacet"
  );
  const stakingRewardsFacet = await StakingRewardsFacet.deploy();
  await stakingRewardsFacet.deployed();
  console.log(
    `Staking Rewards Facet deployed at: ${stakingRewardsFacet.address}`
  );
  await storeContract(
    Diamond.address,
    JSON.parse(String(stakingRewardsFacet.interface.format("json"))),
    "StakingRewardsFacet"
  );

  // upgrade diamond with facets
  console.log("");
  let tx;
  let receipt;

  const cut = [
    {
      facetAddress: stakingRewardsFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(stakingRewardsFacet),
    },
  ];
  // console.log("Diamond Cut:", cut);

  // call to init function
  let stakingToken = require(`../build/${network}/Cupcake.json`);
  let rewardToken = require(`../build/${network}/Donut.json`);
  let rewardRate = 12;
  let functionCall = diamondInit.interface.encodeFunctionData(
    "init_StakingRewardsFacet",
    [stakingToken.address, rewardToken.address, rewardRate]
  );

  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
  receipt = await tx.wait();

  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  
  console.log("Diamond cut tx: ", tx.hash);
  // console.log("Completed diamond cut");

  return Diamond.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployStakingRewardsFacet()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
