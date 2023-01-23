import { deployCupcake } from "./cupcake-deploy";
import { deployDiamond } from "./diamond-deploy";
import { deployDonut } from "./donut-deploy";
import { deployStakingRewardsFacet } from "./staking-rewards-facet-deploy";

export async function deploy(): Promise<{
  diamond: string;
  stakingToken: string;
  rewardToken: string;
  stakingRewardsFacet: string;
}> {
  const diamond = await deployDiamond();
  const stakingToken = await deployCupcake();
  const rewardToken = await deployDonut();
  const stakingRewardsFacet = await deployStakingRewardsFacet();

  return { diamond, stakingToken, rewardToken, stakingRewardsFacet };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deploy()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
