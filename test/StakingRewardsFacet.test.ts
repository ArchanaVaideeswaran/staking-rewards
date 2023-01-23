import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Cupcake, Donut, StakingRewardsFacet } from "../typechain-types";
import { deploy } from "../scripts/deploy";
import { donutTokenDecimals, initialSupply } from "../scripts/donut-deploy";
import { cupcakeTokenDecimals } from "../scripts/cupcake-deploy";
import { BigNumber } from "ethers";

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
      .to.emit(stakingRewardsFacet, "Staked")
      .to.changeTokenBalance(stakingToken, stakingRewardsFacet, value);
  };

  const withdraw = async (amount: string, user: SignerWithAddress) => {
    let value = ethers.utils.parseUnits(amount, cupcakeTokenDecimals);

    let userRewards = await stakingRewardsFacet.getRewardBalance(user.address);

    let stake = parseFloat(amount);
    let reward = parseFloat(
      ethers.utils.formatUnits(userRewards, donutTokenDecimals)
    );

    // withdraw amount and rewards
    if (stake > 0 && reward == 0) {
      await expect(stakingRewardsFacet.connect(user).withdraw(value))
        .to.emit(stakingRewardsFacet, "RewardsPaid")
        .to.changeTokenBalance(stakingToken, user, value)
        // .to.changeTokenBalance(stakingToken, user, userRewards)
        .not.to.emit(stakingRewardsFacet, "Withdraw");
    } else if (stake == 0 && reward == 0) {
      await expect(stakingRewardsFacet.connect(user).withdraw(value))
        .not.to.emit(stakingRewardsFacet, "Withdraw")
        .not.to.emit(stakingRewardsFacet, "RewardsPaid").not.to.be.reverted;
    } else if (stake > 0 && reward > 0) {
      await expect(stakingRewardsFacet.connect(user).withdraw(value))
        .to.emit(stakingRewardsFacet, "Withdraw")
        .to.emit(stakingRewardsFacet, "RewardsPaid")
        .to.changeTokenBalance(stakingToken, user, value);
      // .to.changeTokenBalance(rewardToken, user, userRewards);
    }
  };

  const withdrawAll = async (user: SignerWithAddress) => {
    // withdraw amount and rewards
    let userStakeBalance = await stakingRewardsFacet.getBalance(user.address);
    let userRewards = await stakingRewardsFacet.getRewardBalance(user.address);

    let stake = parseFloat(
      ethers.utils.formatUnits(userStakeBalance, cupcakeTokenDecimals)
    );
    let reward = parseFloat(
      ethers.utils.formatUnits(userRewards, donutTokenDecimals)
    );

    if (stake > 0) {
      if (reward > 0) {
        await expect(stakingRewardsFacet.connect(user).withdrawAll())
          .to.emit(stakingRewardsFacet, "Withdraw")
          .to.emit(stakingRewardsFacet, "RewardsPaid")
          .to.changeTokenBalance(stakingToken, user, userStakeBalance);
        // .to.changeTokenBalance(rewardToken, user, userRewards);
      } else {
        await expect(stakingRewardsFacet.connect(user).withdrawAll())
          .to.emit(stakingRewardsFacet, "Withdraw")
          .to.changeTokenBalance(stakingToken, user, userStakeBalance)
          .not.to.emit(stakingRewardsFacet, "RewardsPaid");
      }
    } else {
      await expect(
        stakingRewardsFacet.connect(user).withdrawAll()
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAmount");
    }
  };

  const earned = async (user: SignerWithAddress) => {
    let userRewardsEarned = parseFloat(
      ethers.utils.formatUnits(
        await stakingRewardsFacet.earned(user.address),
        donutTokenDecimals
      )
    );
    return userRewardsEarned;
  };

  const getBalance = async (user: SignerWithAddress) => {
    let userStakeBalance = parseFloat(
      ethers.utils.formatUnits(
        await stakingRewardsFacet.getBalance(user.address),
        cupcakeTokenDecimals
      )
    );
    return userStakeBalance;
  };

  const getRewardBalance = async (user: SignerWithAddress) => {
    let userRewardsPending = parseFloat(
      ethers.utils.formatUnits(
        await stakingRewardsFacet.getRewardBalance(user.address),
        donutTokenDecimals
      )
    );
    return userRewardsPending;
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
    it("should revert if stake amount is 0", async () => {
      await expect(
        stakingRewardsFacet.connect(users[0]).stake(0)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAmount");
    });

    it("should  stake the given amount", async () => {
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

      // withdraw
      let user0RewardsActual = await getRewardBalance(users[0]);
      let user0RewardsExpected =
        ((((await getBalance(users[0])) * ONE_YEAR_IN_SECONDS) /
          ONE_YEAR_IN_SECONDS) *
          12) /
        100;
      // console.log(`
      // Actual: ${user0RewardsActual}
      // Expected: ${user0RewardsExpected}
      // `);
      expect(user0RewardsActual).to.approximately(user0RewardsExpected, 0.0001);
      await withdraw("0", users[0]);
    });

    it("should withdraw given amount regardless of reward balance", async () => {
      await withdraw("30", users[0]);
    });

    it("should withdraw given amount and distribute rewards", async () => {
      // wait one month
      await increaseTimeBy(ONE_MONTH_IN_SECONDS);

      // withdraw
      let user0RewardsActual = await getRewardBalance(users[0]);
      let user0RewardsExpected =
        ((((await getBalance(users[0])) * ONE_MONTH_IN_SECONDS) /
          ONE_YEAR_IN_SECONDS) *
          12) /
        100;
      // console.log(`
      //   Actual: ${user0RewardsActual}
      //   Expected: ${user0RewardsExpected}
      // `);
      expect(user0RewardsActual).to.approximately(user0RewardsExpected, 0.0001);
      await withdraw("20", users[0]);
    });
  });

  describe("withdrawAll", () => {
    let amount;
    it("should revert if withdrawn during lock-in period", async () => {
      //users[1]
      await stake("100", users[1]);

      await expect(
        stakingRewardsFacet.connect(users[1]).withdrawAll()
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "LockInPeriod");
    });

    it("should withdraw all balance of user regardless of reward balance", async () => {
      // wait one year
      await increaseTimeBy(ONE_YEAR_IN_SECONDS);

      let user0RewardsActual = await getRewardBalance(users[0]);
      // time was increased by 1 year in the pervious test case
      let user0RewardsExpected =
        ((((await getBalance(users[0])) * ONE_YEAR_IN_SECONDS) /
          ONE_YEAR_IN_SECONDS) *
          12) /
        100;

      // console.log(`
      //   Actual: ${user0RewardsActual}
      //   Expected: ${user0RewardsExpected}
      // `);
      expect(user0RewardsActual).to.approximately(user0RewardsExpected, 0.0001);

      await withdraw("0", users[1]);

      // withdrawAll amount and rewards
      await withdrawAll(users[1]);
    });

    it("should withdraw remaining balance of user", async () => {
      // withdrawAll
      let user0RewardsActual = await getRewardBalance(users[0]);
      // time was increased by 1 year in the pervious test case
      let user0RewardsExpected =
        ((((await getBalance(users[0])) * ONE_YEAR_IN_SECONDS) /
          ONE_YEAR_IN_SECONDS) *
          12) /
        100;

      // console.log(`
      //   Actual: ${user0RewardsActual}
      //   Expected: ${user0RewardsExpected}
      // `);
      expect(user0RewardsActual).to.approximately(user0RewardsExpected, 0.0001);
      await withdrawAll(users[0]);
    });

    it("should not revert if stake balance is 0", async () => {
      // withdrawAll
      await withdrawAll(users[0]);
      await withdrawAll(users[1]);
    });
  });

  describe("earned", () => {
    it("shoulde revert if account is zero address", async () => {
      await expect(
        stakingRewardsFacet.earned(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAddress");
    });

    it("should return zero for unstaked users", async () => {
      expect(await earned(users[2])).to.be.equal(0);
    });

    it("should return reward tokens earned by the user", async () => {
      //user[2]
      await stake("100", users[2]);
      await increaseTimeBy(ONE_MONTH_IN_SECONDS);

      let user2RewardsEarned: number = await earned(users[2]);
      let user2RewardsExpected: number =
        (((100 * ONE_MONTH_IN_SECONDS) / ONE_YEAR_IN_SECONDS) * 12) / 100;

      expect(user2RewardsEarned).to.approximately(user2RewardsExpected, 0.0001);
    });
  });
});
