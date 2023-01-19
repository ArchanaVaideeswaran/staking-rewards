import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Cupcake, Donut, StakingRewardsFacet } from "../typechain-types";
import { deploy } from "../scripts/deploy";
import { donutTokenDecimals, initialSupply } from "../scripts/donut-deploy";
import { cupcakeTokenDecimals } from "../scripts/cupcake-deploy";

describe("StakingRewardsFacet", () => {
  // constants
  const ONE_YEAR_IN_SECONDS = 31536000;
  const ONE_MONTH_IN_SECONDS = 2592000;

  // variables
  let currenTimestamp;
  let deployments;
  let stakingRewardsFacet: StakingRewardsFacet;
  let stakingToken: Cupcake;
  let rewardToken: Donut;
  let owner: SignerWithAddress;
  let users: SignerWithAddress[];
  let tx;

  // async functions
  const stake = async (amount: string, user: SignerWithAddress) => {
    let value = ethers.utils.parseUnits(amount, cupcakeTokenDecimals);
    await expect(
      stakingToken.connect(user).approve(stakingRewardsFacet.address, value)
    ).not.to.be.reverted;

    await expect(stakingRewardsFacet.connect(user).stake(value))
      .to.changeTokenBalance(stakingToken, stakingRewardsFacet, value)
      .to.emit(stakingRewardsFacet, "Staked");
  };

  const withdraw = async (amount: string, user: SignerWithAddress) => {
    let value = ethers.utils.parseUnits(amount, cupcakeTokenDecimals);

    let userRewards = await stakingRewardsFacet.getRewardBalance(user.address);

    // withdraw amount and rewards
    await expect(stakingRewardsFacet.connect(user).withdraw(value))
      .to.emit(stakingRewardsFacet, "RewardsPaid")
      .to.emit(stakingRewardsFacet, "Withdraw")
      .to.changeTokenBalance(stakingToken, user, value)
      .to.changeTokenBalance(rewardToken, user, userRewards);
  };

  const withdrawAll = async (user: SignerWithAddress) => {};

  const earned = async (user: SignerWithAddress) => {
    let userRewardsEarned = parseFloat(
      ethers.utils.formatUnits(
        await stakingRewardsFacet.earned(user.address),
        donutTokenDecimals
      )
    );
    return userRewardsEarned;
  };

  const increaseTimeBy = async (seconds: number) => {
    currenTimestamp = await time.latest();
    let increase = currenTimestamp + seconds;
    currenTimestamp = await time.increaseTo(increase);
  };

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

    it("should let user0 to stake the given amount", async () => {
      await stake("100", users[0]);
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

    it("should distribute rewards if amount is 0", async () => {
      await increaseTimeBy(ONE_YEAR_IN_SECONDS);

      let user0RewardBalance = await stakingRewardsFacet.getRewardBalance(
        users[0].address
      );

      await expect(stakingRewardsFacet.connect(users[0]).withdraw(0))
        .to.emit(stakingRewardsFacet, "RewardsPaid")
        .not.to.emit(stakingRewardsFacet, "Withdraw")
        .to.changeTokenBalance(stakingToken, users[0], user0RewardBalance);
    });

    it("should withdraw given amount and distribute rewards", async () => {
      // wait one month
      await increaseTimeBy(ONE_MONTH_IN_SECONDS);
      // withdraw
      await withdraw("50", users[0]);
    });
  });

  describe("earned", () => {
    it("shoulde revert if account is zero address", async () => {
      await expect(
        stakingRewardsFacet
          .connect(users[0])
          .earned(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAddress");
    });

    it("should return zero for unstaked users", async () => {
      expect(await earned(users[3])).to.be.equal(0);
    });

    it("should return the amount of reward tokens earned by the user", async () => {
      //user[2]
      await stake("100", users[2]);
      await increaseTimeBy(ONE_MONTH_IN_SECONDS);

      let user2RewardsEarned: number = await earned(users[2]);
      let user2RewardsExpected =
        (((100 * ONE_MONTH_IN_SECONDS) / ONE_YEAR_IN_SECONDS) * 12) / 100;

      expect(user2RewardsEarned).to.approximately(user2RewardsExpected, 0.0001);
    });
  });
});
