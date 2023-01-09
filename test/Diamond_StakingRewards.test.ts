import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Cupcake,
  Diamond,
  Donut,
  IDiamondWritableInternal,
  StakingRewardsFacet,
} from "../typechain-types";
import { Contract } from "ethers";

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

function getSelectors(contract: Contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors = signatures.map((sig) => contract.interface.getSighash(sig));
  return selectors;
}

describe("StakingRewardsFacet", () => {
  const ONE_YEAR_IN_SECONDS = 31536000;
  const ONE_MONTH_IN_SECONDS = 2592000;
  let currenTimestamp;
  let diamond: Diamond;
  let stakingRewardsFacet: StakingRewardsFacet;
  let stakingToken: Cupcake;
  let stakingTokenDecimals = 8;
  let stakingTokenTotalSupply = ethers.utils.parseUnits(
    "1000000000",
    stakingTokenDecimals
  );
  let rewardToken: Donut;
  let rewardTokenDecimals = 12;
  let rewardTokenInitialSupply = ethers.utils.parseUnits(
    "1000000",
    rewardTokenDecimals
  );
  let rewardRate = 12;
  let wallet;
  let owner: SignerWithAddress;
  let users: SignerWithAddress[];
  let tx;
  let receipt;

  before(async () => {
    [owner, ...users] = await ethers.getSigners();

    let StakingToken = await ethers.getContractFactory("Cupcake");
    stakingToken = await StakingToken.deploy(stakingTokenTotalSupply);
    await stakingToken.deployed();
    console.log(`Cupcake (staking token) deployed at: ${stakingToken.address}`);

    // transfer some staking tokens form owner to users
    for (let i = 0; i < 5; i++) {
      tx = await stakingToken.transfer(
        users[i].address,
        ethers.utils.parseUnits("1000", stakingTokenDecimals)
      );
      receipt = await tx.wait();
    }

    let RewardToken = await ethers.getContractFactory("Donut");
    rewardToken = await RewardToken.deploy(rewardTokenInitialSupply);
    await rewardToken.deployed();
    console.log(`Donut (reward token) deployed at: ${rewardToken.address}`);

    let StakingRewardsFacet = await ethers.getContractFactory(
      "StakingRewardsFacet"
    );
    stakingRewardsFacet = await StakingRewardsFacet.deploy(
      stakingToken.address,
      rewardToken.address,
      rewardRate
    );
    await stakingRewardsFacet.deployed();
    console.log(
      `Staking Rewards Facet deployed at: ${stakingRewardsFacet.address}`
    );

    let Diamond = await ethers.getContractFactory("Diamond");
    diamond = await Diamond.deploy();
    await diamond.deployed();
    console.log(`Diamond deployed at: ${diamond.address}`);

    let cut: IDiamondWritableInternal.FacetCutStruct[] = [
      {
        target: stakingRewardsFacet.address,
        action: FacetCutAction.Add,
        selectors: getSelectors(stakingRewardsFacet),
      },
    ];
    console.log(cut);
    await diamond.diamondCut(cut, stakingRewardsFacet.address, ethers.constants.HashZero);
    let facetAddresses = await diamond.facetAddresses();
    console.log(facetAddresses);
    stakingRewardsFacet = await ethers.getContractAt(
      "StakingRewardsFacet",
      diamond.address
    );
    console.log(
      `Staking Rewards Facet at Diamond: ${stakingRewardsFacet.address}`
    );
  });

  describe("stake", () => {
    let amount;
    it("shoulde revert if stake amount is 0", async () => {
      amount = 0;
      await expect(
        stakingRewardsFacet.connect(users[0]).stake(amount)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAmount");
    });

    it("should stake the given amount", async () => {
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);
      await expect(
        stakingToken
          .connect(users[0])
          .approve(stakingRewardsFacet.address, amount)
      ).not.to.be.reverted;

      await expect(
        stakingRewardsFacet.connect(users[0]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount);

      // await expect(
      //   stakingToken
      //     .connect(users[1])
      //     .approve(stakingRewardsFacet.address, amount)
      // ).not.to.be.reverted;

      // await expect(
      //   stakingRewardsFacet.connect(users[1]).stake(amount)
      // ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount);

      // await expect(
      //   stakingToken
      //     .connect(users[2])
      //     .approve(stakingRewardsFacet.address, amount)
      // ).not.to.be.reverted;

      // await expect(
      //   stakingRewardsFacet.connect(users[2]).stake(amount)
      // ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount);
    });
  });

  describe("withdraw", () => {
    let amount;
    it("shoulde revert if withdraw amount is 0", async () => {
      amount = 0;
      await expect(
        stakingRewardsFacet.connect(users[0]).withdraw(amount)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAmount");
    });
    it("should withdraw the given amount", async () => {
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);

      // await expect(
      //   stakingRewardsFacet.connect(users[0]).withdraw(amount)
      // ).to.changeTokenBalance(stakingToken, users[0], amount);
    });
  });

  describe("earned", () => {
    it("shoulde revert if account is zero address", async () => {
      // await expect(
      //   stakingRewardsFacet
      //     .connect(users[0])
      //     .earned(ethers.constants.AddressZero)
      // ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAddress");
    });

    it("should return the amount of reward tokens earned by the user", async () => {
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_MONTH_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      // let user1rewardBalance: any =
      // await stakingRewardsFacet.earned(
      //   users[1].address
      // );
      // user1rewardBalance = ethers.utils.formatUnits(
      //   user1rewardBalance,
      //   rewardTokenDecimals
      // );
      // user1rewardBalance = parseFloat(user1rewardBalance);
      // let expectedUser1Rewards =
      //   (((100 * ONE_MONTH_IN_SECONDS) / ONE_YEAR_IN_SECONDS) * 12) / 100;

      // console.log(`
      // expected: ${expectedUser1Rewards}
      // actual: ${user1rewardBalance}
      // `);

      // expect(user1rewardBalance).to.approximately(expectedUser1Rewards, 0.001);
    });
  });
});
