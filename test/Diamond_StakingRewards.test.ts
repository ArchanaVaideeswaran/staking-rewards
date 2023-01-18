import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Cupcake, Donut, StakingRewardsFacet } from "../typechain-types";
import { deploy } from "../scripts/deploy";
import { donutTokenDecimals, initialSupply } from "../scripts/donut-deploy";
import { cupcakeTokenDecimals } from "../scripts/cupcake-deploy";

describe("StakingRewardsFacet", () => {
  const ONE_YEAR_IN_SECONDS = 31536000;
  const ONE_MONTH_IN_SECONDS = 2592000;
  let currenTimestamp;
  let deployments
  let stakingRewardsFacet: StakingRewardsFacet;
  let stakingToken: Cupcake;
  let rewardToken: Donut;
  let owner: SignerWithAddress;
  let users: SignerWithAddress[];
  let tx;

  before(async () => {
    [owner, ...users] = await ethers.getSigners();

    // deploy diamond, staking and reward token, stakingrewardsFacet
    deployments = await deploy();

    stakingToken = await ethers.getContractAt(
      "Cupcake",
      deployments.stakingToken
    );

    rewardToken = await ethers.getContractAt("Donut", deployments.rewardToken);
    
    stakingRewardsFacet = await ethers.getContractAt(
      "StakingRewardsFacet",
      deployments.stakingRewardsFacet
    );

    // transfer some staking tokens form owner to users
    for (let i = 0; i < 5; i++) {
      tx = await stakingToken.transfer(
        users[i].address,
        ethers.utils.parseUnits("1000", cupcakeTokenDecimals)
      );
      await tx.wait();
    }

    // Transfer reward tokens to Diamond
    tx = await rewardToken.transfer(deployments.diamond, initialSupply);
    await tx.wait();
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
      amount = ethers.utils.parseUnits("100", cupcakeTokenDecimals);
      await expect(
        stakingToken
          .connect(users[0])
          .approve(stakingRewardsFacet.address, amount)
      ).not.to.be.reverted;

      await expect(stakingRewardsFacet.connect(users[0]).stake(amount))
        .to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount)
        .to.emit(stakingRewardsFacet, "Staked");
    });

    it("should revert if staked during lock in period", async () => {
      amount = ethers.utils.parseUnits("100", cupcakeTokenDecimals);
      await expect(
        stakingRewardsFacet.connect(users[0]).stake(amount)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "LockInPeriod");
    });
  });

  describe("withdraw", () => {
    let amount;
    it("should revert if withdrawn during lock-in period", async () => {
      amount = ethers.utils.parseUnits("100", cupcakeTokenDecimals);

      await expect(
        stakingRewardsFacet.connect(users[0]).withdraw(amount)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "LockInPeriod");
    });

    it("should distribute rewards if withdraw amount is 0", async () => {
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_YEAR_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      let user0rewardBalance: any = await stakingRewardsFacet.earned(
        users[0].address
      );

      await expect(stakingRewardsFacet.connect(users[0]).withdraw(0))
        .to.emit(stakingRewardsFacet, "RewardsPaid")
        .not.to.emit(stakingRewardsFacet, "Withdraw")
        .to.changeTokenBalance(stakingToken, users[0], user0rewardBalance);
    });

    it("should withdraw given amount and distribute rewards", async () => {
      //user[1]
      amount = ethers.utils.parseUnits("100", cupcakeTokenDecimals);

      // approve
      await expect(
        stakingToken
          .connect(users[1])
          .approve(stakingRewardsFacet.address, amount)
      ).not.to.be.reverted;

      // stake
      await expect(
        stakingRewardsFacet.connect(users[1]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount);

      // wait lock-in period
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_YEAR_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      // withdraw amount and rewards
      await expect(stakingRewardsFacet.connect(users[1]).withdraw(amount))
        .to.emit(stakingRewardsFacet, "RewardsPaid")
        .to.emit(stakingRewardsFacet, "Withdraw")
        .to.changeTokenBalance(stakingToken, users[1], amount);
    });
  });

  describe("earned", () => {
    let amount;
    it("shoulde revert if account is zero address", async () => {
      await expect(
        stakingRewardsFacet
          .connect(users[0])
          .earned(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAddress");
    });

    it("should return zero for unstaked users", async () => {
      expect(
        await stakingRewardsFacet.connect(users[3]).earned(users[3].address)
      ).to.be.equal(0);
    });

    it("should return the amount of reward tokens earned by the user", async () => {
      //user[2]
      amount = ethers.utils.parseUnits("100", cupcakeTokenDecimals);

      // approve
      await expect(
        stakingToken
          .connect(users[2])
          .approve(stakingRewardsFacet.address, amount)
      ).not.to.be.reverted;

      // stake
      await expect(
        stakingRewardsFacet.connect(users[2]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount);

      // wait one month
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_MONTH_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      // get user[2] rewards earned
      let user2rewardBalance: any = await stakingRewardsFacet.earned(
        users[2].address
      );
      user2rewardBalance = ethers.utils.formatUnits(
        user2rewardBalance,
        donutTokenDecimals
      );
      user2rewardBalance = parseFloat(user2rewardBalance);

      let expectedUser2Rewards =
        (((100 * ONE_MONTH_IN_SECONDS) / ONE_YEAR_IN_SECONDS) * 12) / 100;

      console.log(`
        expected: ${expectedUser2Rewards}
        actual: ${user2rewardBalance}
      `);

      expect(user2rewardBalance).to.approximately(expectedUser2Rewards, 0.001);
    });
  });
});
